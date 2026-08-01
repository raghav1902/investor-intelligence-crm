import { NextRequest, NextResponse } from 'next/server';
import { exportToExcel } from '@/lib/excel-exporter';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    let workspaceId = '';

    if (session?.user && (session.user as any).id) {
      workspaceId = (session.user as any).id;
    } else {
      workspaceId =
        req.nextUrl.searchParams.get('workspaceId') ||
        req.headers.get('x-workspace-id') ||
        '';

      if (workspaceId) {
        await connectDB();
        // Check if the requested workspaceId belongs to a registered user
        const isRegisteredUser = await User.exists({ _id: workspaceId });
        if (isRegisteredUser) {
          return NextResponse.json({ error: 'Unauthorized workspace access' }, { status: 403 });
        }
      }
    }

    if (!workspaceId) return NextResponse.json({ error: 'Workspace ID required' }, { status: 400 });

    const buffer = await exportToExcel(workspaceId);
    
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
