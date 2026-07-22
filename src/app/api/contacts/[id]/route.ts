import { NextRequest, NextResponse } from 'next/server';
import Contact from '@/models/Contact';
import { connectDB } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const workspaceId = req.headers.get('x-workspace-id');
    if (!workspaceId) return NextResponse.json({ error: 'Workspace ID required' }, { status: 400 });

    const contact = await Contact.findOne({ _id: id, workspaceId }).populate('isDuplicateOf', 'sourceRowNumber fullName company email title status reviewerComment');
    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }
    return NextResponse.json(contact);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const workspaceId = req.headers.get('x-workspace-id');
    if (!workspaceId) return NextResponse.json({ error: 'Workspace ID required' }, { status: 400 });
    
    const body = await req.json();
    
    const updated = await Contact.findOneAndUpdate(
      { _id: id, workspaceId },
      {
        ...body,
        lastVerifiedDate: body.status === 'RESOLVED_GREEN' ? new Date() : undefined,
      },
      { new: true, runValidators: true }
    ).populate('isDuplicateOf', 'sourceRowNumber fullName company email title status');

    if (!updated) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const workspaceId = req.headers.get('x-workspace-id');
    if (!workspaceId) return NextResponse.json({ error: 'Workspace ID required' }, { status: 400 });

    const deleted = await Contact.findOneAndDelete({ _id: id, workspaceId });
    if (!deleted) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Contact deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
