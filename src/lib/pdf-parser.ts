import PdfText from '@/models/PdfText';
import { connectDB } from '@/lib/db';

const CHUNK_SIZE = 5; // Process 5 pages per API call

export async function parseAndIndexPdf(fileBuffer: Buffer, customApiKey?: string, workspaceId?: string): Promise<{ pages: number; indexedLines: number; isScannedOcr?: boolean }> {
  // Check API Key
  const apiKey = customApiKey || process.env.API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.startsWith('sk-')) {
    throw new Error('❌ Server API key missing. Please set GEMINI_API_KEY in your environment variables.');
  }

  if (!workspaceId) throw new Error('Workspace ID is required for OCR indexing.');

  console.log(`🔄 Starting OCR pipeline for workspace ${workspaceId} using Gemini API...`);

  try {
    await connectDB();

    // Resume logic for current workspace
    const lastDoc = await PdfText.findOne({ workspaceId }).sort({ pageNumber: -1 });
    const lastProcessedPage = lastDoc ? lastDoc.pageNumber : 0;

    if (lastProcessedPage > 0) {
      console.log(`🔄 Found existing OCR data up to page ${lastProcessedPage}. Resuming from page ${lastProcessedPage + 1}...`);
    } else {
      await PdfText.deleteMany({ workspaceId });
    }

  const _require = eval('require');
  
  if (!(global as any)._canvasPolyfillsLoaded) {
    (global as any)._canvasPolyfillsLoaded = true;
    (global as any).Element = class Element { remove() {} };
    (global as any).HTMLElement = class HTMLElement extends (global as any).Element {};
    (global as any).HTMLCanvasElement = class HTMLCanvasElement extends (global as any).HTMLElement {};
    (global as any).requestAnimationFrame = (cb: any) => setTimeout(cb, 0);
    (global as any).cancelAnimationFrame = (id: any) => clearTimeout(id);
    (global as any).document = {
      createElement: (tag: string) => {
        if (tag === 'canvas') {
          try {
            const { createCanvas } = _require('@napi-rs/canvas');
            return createCanvas(1, 1);
          } catch (e) {
            return { getContext: () => null };
          }
        }
        return { src: '', setAttribute: () => {} };
      },
      getElementsByTagName: () => [{ appendChild: (s: any) => { if (s && s.onload) s.onload(); } }],
      head: { appendChild: () => {} },
    };
  }

  const { createCanvas } = _require('@napi-rs/canvas');
  const PDFJS = _require('pdf-parse/lib/pdf.js/v1.10.100/build/pdf.js');
  PDFJS.disableWorker = true;
  PDFJS.workerSrc = 'fake.worker.js';

  const doc = await PDFJS.getDocument({ data: fileBuffer, disableWorker: true });
  const numPages = doc.numPages;
  // Process ALL pages — no demo limit
  const pagesToProcess = numPages;
  console.log(`📄 PDF loaded (${numPages} pages). Processing all ${pagesToProcess} pages...`);

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Initialize Gemini Client
  const { GoogleGenerativeAI } = _require('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(apiKey);
  // Using gemini-2.0-flash as it is the most capable recent model for fast vision tasks
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  let totalLinesIndexed = 0;
  
  for (let i = 1; i <= pagesToProcess; i += CHUNK_SIZE) {
    const endPage = Math.min(i + CHUNK_SIZE - 1, pagesToProcess);

    if (endPage <= lastProcessedPage) {
      console.log(`⏭️ Skipping pages ${i}-${endPage} (already processed)`);
      continue;
    }

    console.log(`⏳ Processing pages ${i} to ${endPage}...`);
    
    const pageImages: { base64: string; mimeType: string; pageNum: number }[] = [];

    for (let p = i; p <= endPage; p++) {
      if (p <= lastProcessedPage) continue;
      const page = await doc.getPage(p);
      const scale = 2.0;
      const viewport = page.getViewport(scale);
      const canvas = createCanvas(viewport.width, viewport.height);
      const ctx = canvas.getContext('2d');
      await page.render({ canvasContext: ctx, viewport });
      const buffer = canvas.toBuffer('image/jpeg', { quality: 85 });
      pageImages.push({ 
        base64: buffer.toString('base64'), 
        mimeType: 'image/jpeg',
        pageNum: p 
      });
    }

    if (pageImages.length === 0) continue;

    let extractedPages: { pageNum: number; text: string }[] = [];

    // Retry loop for Gemini API (handles 429/503 errors)
    for (let attempt = 1; attempt <= 4; attempt++) {
      try {
        const prompt = "Extract ALL text from these document pages exactly as they appear. Preserve original lines and tabular structure (LastName,FirstName Company Email). Do not add any commentary, markdown, or headers. Output ONLY raw extracted text. Separate pages with: ---PAGE_SEPARATOR---";
        
        const imageParts = pageImages.map(img => ({
          inlineData: {
            data: img.base64,
            mimeType: img.mimeType
          }
        }));

        // CRITICAL FIX: The Gemini SDK thinks it's in a browser if `global.document` exists.
        // We temporarily hide it so the SDK works correctly in Node/Next.js edge.
        const tempDoc = (global as any).document;
        delete (global as any).document;
        const tempWindow = (global as any).window;
        delete (global as any).window;

        const result = await model.generateContent([prompt, ...imageParts]);
        
        // Restore for the next pdf.js iteration
        (global as any).document = tempDoc;
        if (tempWindow) (global as any).window = tempWindow;

        const responseText = result.response.text() || '';
        
        const pagesText = responseText.split('---PAGE_SEPARATOR---').map((t: string) => t.trim());
        
        extractedPages = pageImages.map((img, idx) => ({
          pageNum: img.pageNum,
          text: pagesText[idx] || ''
        }));
        
        break; // Success
      } catch (retryErr: any) {
        if (attempt < 4 && (retryErr.message.includes('429') || retryErr.message.includes('503'))) {
          const waitTime = attempt * 10; // 10s, 20s, 30s backoff for Gemini
          console.warn(`⚠️ Gemini API overloaded/rate-limited. Retrying in ${waitTime}s... (${attempt}/4)`);
          await sleep(waitTime * 1000);
          continue;
        }
        throw retryErr;
      }
    }

    const bulkOps = [];
    for (const page of extractedPages) {
      if (!page.text) continue;
      const lines = page.text.split('\n').map((l: string) => l.trim()).filter((l: string) => l.length > 0);
      for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
        const rawText = lines[lineIdx];
        const normalizedText = rawText.toLowerCase().replace(/[^a-z0-9@.]/g, '');
        if (normalizedText.length > 2) {
          bulkOps.push({
            insertOne: {
              document: { workspaceId, pageNumber: page.pageNum, lineIndex: lineIdx, rawText, normalizedText }
            }
          });
        }
      }
    }

    if (bulkOps.length > 0) {
      await PdfText.bulkWrite(bulkOps, { ordered: false });
      totalLinesIndexed += bulkOps.length;
    }
    console.log(`✅ Pages ${i}-${endPage} done (${bulkOps.length} lines indexed via Gemini)`);
  }

  console.log(`🎯 Gemini OCR Complete! ${totalLinesIndexed} lines from ${pagesToProcess} pages.`);
  return { pages: pagesToProcess, indexedLines: totalLinesIndexed, isScannedOcr: true };
  } catch (err: any) {
    console.error('CRITICAL ERROR IN OCR PIPELINE:', err.stack || err.message || err);
    throw new Error('OCR Pipeline failed: ' + (err.message || 'Unknown error'));
  }
}
