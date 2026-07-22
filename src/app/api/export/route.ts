import { NextRequest, NextResponse } from 'next/server';
import { exportToExcel } from '@/lib/excel-exporter';

export async function GET(req: NextRequest) {
  try {
    const buffer = await exportToExcel();
    
    const headers = new Headers();
    headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    headers.set('Content-Disposition', 'attachment; filename="Validated_Investor_Contacts.xlsx"');

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers,
    });
  } catch (error: any) {
    console.error('Export error:', error);
    return NextResponse.json({ error: error.message || 'Failed to export Excel file' }, { status: 500 });
  }
}
