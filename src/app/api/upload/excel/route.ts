import { NextRequest, NextResponse } from 'next/server';
import { parseAndImportExcel } from '@/lib/excel-parser';
import { runFuzzyMatchAndDedup } from '@/lib/matcher';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await parseAndImportExcel(buffer);
    
    return NextResponse.json({
      success: true,
      message: `Successfully imported ${result.imported} contacts out of ${result.total} rows.`,
      ...result,
    });
  } catch (error: any) {
    console.error('Excel upload error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process Excel file' }, { status: 500 });
  }
}
