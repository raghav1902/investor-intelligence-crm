import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { parseAndIndexPdf } from '@/lib/pdf-parser';

const PDF_STORAGE_DIR = path.join(process.cwd(), '.pdf-storage');

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No PDF file uploaded' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Ensure storage directory exists
    await fs.mkdir(PDF_STORAGE_DIR, { recursive: true });

    // Save PDF to disk for on-demand page rendering
    const pdfPath = path.join(PDF_STORAGE_DIR, 'source-of-truth.pdf');
    await fs.writeFile(pdfPath, buffer);

    const fileSize = (buffer.length / (1024 * 1024)).toFixed(1);
    console.log(`📄 Source-of-Truth PDF stored (${fileSize} MB). Starting Cloud Vision OCR...`);

    // Run Google Cloud Vision OCR extraction
    const pdfResult = await parseAndIndexPdf(buffer);

    return NextResponse.json({
      success: true,
      message: `Google Vision OCR Complete! Indexed ${pdfResult.indexedLines} lines across ${pdfResult.pages} PDF pages.`,
      pages: pdfResult.pages,
      indexedLines: pdfResult.indexedLines,
    });
  } catch (error: any) {
    console.error('PDF upload error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process PDF file' }, { status: 500 });
  }
}
