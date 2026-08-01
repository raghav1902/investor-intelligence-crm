import { NextRequest, NextResponse } from 'next/server';
import Contact from '@/models/Contact';
import PdfDocument from '@/models/PdfDocument';
import PdfText from '@/models/PdfText';
import { connectDB } from '@/lib/db';
import { getAuthorizedWorkspaceId } from '@/lib/auth-workspace';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const status = searchParams.get('status');
    const sector = searchParams.get('sector');
    const search = searchParams.get('search');
    const isDuplicate = searchParams.get('isDuplicate');

    const workspaceId = await getAuthorizedWorkspaceId(req);
    if (!workspaceId) {
      return NextResponse.json({ error: 'Workspace ID required' }, { status: 400 });
    }

    const query: any = { workspaceId };

    if (status && status !== 'ALL') {
      query.status = status;
    }
    if (sector && sector !== 'ALL') {
      query.sectorCoverage = sector;
    }
    if (isDuplicate === 'true') {
      query.isDuplicateOf = { $exists: true, $not: { $size: 0 } };
    }
    if (search && search.trim()) {
      // Leverage MongoDB Text Index for O(log N) search performance
      query.$text = { $search: search.trim() };
    }

    const skip = (page - 1) * limit;

    // Fetch contacts, filtered counts, workspace status distribution, total counts, and duplicates in parallel (1 DB roundtrip)
    const [contacts, total, stats, totalContacts, duplicatesCount] = await Promise.all([
      Contact.find(query)
        .sort({ sourceRowNumber: 1 })
        .skip(skip)
        .limit(limit)
        .populate('isDuplicateOf', 'sourceRowNumber fullName company email status'),
      Contact.countDocuments(query),
      Contact.aggregate([
        { $match: { workspaceId } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),
      Contact.countDocuments({ workspaceId }),
      Contact.countDocuments({
        workspaceId,
        isDuplicateOf: { $exists: true, $not: { $size: 0 } },
      }),
    ]);

    const summaryStats = {
      total: totalContacts,
      unreviewed: 0,
      yellow: 0,
      red: 0,
      green: 0,
      duplicates: duplicatesCount,
    };

    stats.forEach((s) => {
      if (s._id === 'UNREVIEWED') summaryStats.unreviewed = s.count;
      else if (s._id === 'FLAGGED_YELLOW') summaryStats.yellow = s.count;
      else if (s._id === 'FLAGGED_RED') summaryStats.red = s.count;
      else if (s._id === 'RESOLVED_GREEN') summaryStats.green = s.count;
    });

    console.log(`📊 GET /api/contacts - workspaceId: ${workspaceId}, contacts found: ${contacts.length}, total: ${totalContacts}`);

    return NextResponse.json({
      contacts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: summaryStats,
    });
  } catch (error: any) {
    console.error('GET /api/contacts error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch contacts' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const workspaceId = await getAuthorizedWorkspaceId(req);
    if (!workspaceId) {
      return NextResponse.json({ error: 'Workspace ID required' }, { status: 400 });
    }

    const body = await req.json();
    
    // Assign sourceRowNumber as next available
    const lastRow = await Contact.findOne({ workspaceId }).sort({ sourceRowNumber: -1 });
    const nextRow = lastRow ? lastRow.sourceRowNumber + 1 : 2;

    const newContact = await Contact.create({
      ...body,
      workspaceId,
      sourceRowNumber: nextRow,
    });

    return NextResponse.json(newContact, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/contacts error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create contact' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const workspaceId = await getAuthorizedWorkspaceId(req);
    if (!workspaceId) {
      return NextResponse.json({ error: 'Workspace ID required' }, { status: 400 });
    }

    // Static imports used instead of dynamic requires
    await Promise.all([
      Contact.deleteMany({ workspaceId }),
      PdfDocument.deleteMany({ workspaceId }),
      PdfText.deleteMany({ workspaceId }),
    ]);

    return NextResponse.json({ message: 'All workspace contacts & PDF data cleared successfully.' });
  } catch (error: any) {
    console.error('DELETE /api/contacts error:', error);
    return NextResponse.json({ error: error.message || 'Failed to clear workspace' }, { status: 500 });
  }
}
