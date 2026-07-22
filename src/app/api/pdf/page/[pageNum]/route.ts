import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ pageNum: string }> }
) {
  try {
    const { pageNum } = await params;
    const page = parseInt(pageNum, 10);

    if (isNaN(page) || page < 1) {
      return NextResponse.json({ error: 'Invalid page number' }, { status: 400 });
    }

    const workspaceId = req.headers.get('x-workspace-id');
    if (!workspaceId) {
      return NextResponse.json({ error: 'Workspace ID required' }, { status: 400 });
    }

    const { connectDB } = require('@/lib/db');
    const PdfDocument = require('@/models/PdfDocument').default;
    await connectDB();

    const pdfDoc = await PdfDocument.findOne({ workspaceId });
    if (!pdfDoc || !pdfDoc.fileData) {
      return NextResponse.json({ error: 'No source PDF uploaded yet. Please upload the PDF first.' }, { status: 404 });
    }

    const pdfBuffer = pdfDoc.fileData;

    // Use eval('require') to avoid Turbopack static analysis
    const _require = eval('require');

    // Setup DOM polyfills for pdf.js
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
      // We intentionally DO NOT polyfill `window` because if `window` is present,
      // pdf.js assumes it's running in a browser and tries to load the worker via script tags.
    }

    const { createCanvas } = _require('@napi-rs/canvas');
    const workerSrc = _require('pdf-parse/lib/pdf.js/v1.10.100/build/pdf.worker.js');
    (global as any).pdfjsDistBuildPdfWorker = workerSrc;

    const PDFJS = _require('pdf-parse/lib/pdf.js/v1.10.100/build/pdf.js');
    PDFJS.disableWorker = true;
    PDFJS.workerSrc = 'fake.worker.js';

    const doc = await PDFJS.getDocument({ data: pdfBuffer, disableWorker: true });
    const numPages = doc.numPages || 1;

    if (page > numPages) {
      return NextResponse.json({ error: `Page ${page} does not exist. PDF has ${numPages} pages.` }, { status: 404 });
    }

    const pdfPage = await doc.getPage(page);
    const scale = 1.5; // Good quality for viewing
    const viewport = pdfPage.getViewport(scale);
    const canvas = createCanvas(viewport.width, viewport.height);
    const ctx = canvas.getContext('2d');

    await pdfPage.render({ canvasContext: ctx, viewport });
    const pngBuffer = canvas.toBuffer('image/png');

    return new NextResponse(pngBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600',
        'X-Total-Pages': numPages.toString(),
      },
    });
  } catch (error: any) {
    console.error('PDF page render error:', error);
    return NextResponse.json({ error: error.message || 'Failed to render PDF page' }, { status: 500 });
  }
}
