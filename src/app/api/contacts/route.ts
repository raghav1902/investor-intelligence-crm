import { NextRequest, NextResponse } from 'next/server';
import Contact from '@/models/Contact';
import { connectDB } from '@/lib/db';

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

    const query: any = {};

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
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { fullName: regex },
        { company: regex },
        { email: regex },
        { title: regex },
      ];
    }

    const skip = (page - 1) * limit;

    // Fetch contacts and stats in parallel
    const [contacts, total, stats] = await Promise.all([
      Contact.find(query)
        .sort({ sourceRowNumber: 1 })
        .skip(skip)
        .limit(limit)
        .populate('isDuplicateOf', 'sourceRowNumber fullName company email status'),
      Contact.countDocuments(query),
      Contact.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const totalContacts = await Contact.countDocuments({});
    const duplicatesCount = await Contact.countDocuments({
      isDuplicateOf: { $exists: true, $not: { $size: 0 } },
    });

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
    const body = await req.json();
    
    // Assign sourceRowNumber as next available
    const lastRow = await Contact.findOne().sort({ sourceRowNumber: -1 });
    const nextRow = lastRow ? lastRow.sourceRowNumber + 1 : 2;

    const newContact = await Contact.create({
      ...body,
      sourceRowNumber: nextRow,
    });

    return NextResponse.json(newContact, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/contacts error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create contact' }, { status: 500 });
  }
}
