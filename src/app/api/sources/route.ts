import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Contact from '@/models/Contact';

export async function GET(req: NextRequest) {
  try {
    const workspaceId = req.headers.get('x-workspace-id');
    if (!workspaceId) {
      return NextResponse.json({ error: 'Workspace ID required' }, { status: 400 });
    }

    await connectDB();

    // Aggregate sources for current workspace
    const sources = await Contact.aggregate([
      { $match: { workspaceId } },
      {
        $group: {
          _id: { $ifNull: ['$sourceFileName', 'Uploaded Contact File'] },
          count: { $sum: 1 },
          lastUpload: { $max: '$createdAt' },
        },
      },
      { $sort: { lastUpload: -1 } },
    ]);

    const formattedSources = sources.map((s) => ({
      fileName: s._id,
      count: s.count,
      lastUpload: s.lastUpload,
    }));

    return NextResponse.json({ sources: formattedSources });
  } catch (error: any) {
    console.error('Error fetching sources:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch sources' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const workspaceId = req.headers.get('x-workspace-id');
    if (!workspaceId) {
      return NextResponse.json({ error: 'Workspace ID required' }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const fileName = searchParams.get('fileName');

    if (!fileName) {
      return NextResponse.json({ error: 'Source file name is required' }, { status: 400 });
    }

    await connectDB();

    const deleteQuery: any = { workspaceId };
    
    if (fileName === 'Uploaded Contact File') {
      deleteQuery.$or = [
        { sourceFileName: fileName },
        { sourceFileName: null },
        { sourceFileName: { $exists: false } }
      ];
    } else {
      deleteQuery.sourceFileName = fileName;
    }

    const deleteResult = await Contact.deleteMany(deleteQuery);

    return NextResponse.json({
      success: true,
      message: `Deleted ${deleteResult.deletedCount} contact(s) extracted from ${fileName}`,
      deletedCount: deleteResult.deletedCount,
    });
  } catch (error: any) {
    console.error('Error deleting source:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete source file' }, { status: 500 });
  }
}
