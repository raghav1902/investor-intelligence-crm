import { NextRequest, NextResponse } from 'next/server';
import { parseAndIndexPdf } from '@/lib/pdf-parser';
import { rateLimit, getClientIp } from '@/lib/rate-limiter';

// Tell Vercel to allow up to 120 seconds for this route (OCR is slow on large PDFs)
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  // ✅ Rate limit: 5 PDF uploads per IP per minute
  const ip = getClientIp(req);
  const { allowed, remaining, resetAt } = rateLimit(ip, 'upload-pdf', 5, 60_000);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests. You can upload up to 5 PDFs per minute. Please wait and try again.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((resetAt - Date.now()) / 1000)),
          'X-RateLimit-Remaining': '0',
        },
      }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No PDF file uploaded' }, { status: 400 });
    }

    const workspaceId = req.headers.get('x-workspace-id');
    if (!workspaceId) return NextResponse.json({ error: 'Workspace ID required' }, { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Save PDF to MongoDB instead of local disk for serverless support
    const { connectDB } = require('@/lib/db');
    const PdfDocument = require('@/models/PdfDocument').default;
    await connectDB();
    
    await PdfDocument.findOneAndUpdate(
      { workspaceId },
      { workspaceId, filename: file.name, fileData: buffer },
      { upsert: true, new: true }
    );

    const fileSize = (buffer.length / (1024 * 1024)).toFixed(1);
    console.log(`📄 Source-of-Truth PDF stored (${fileSize} MB). Starting Cloud Vision OCR...`);

    const customApiKey = req.headers.get('x-gemini-api-key') || undefined;

    // Run Google Cloud Vision OCR extraction
    const pdfResult = await parseAndIndexPdf(buffer, customApiKey, workspaceId);

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
