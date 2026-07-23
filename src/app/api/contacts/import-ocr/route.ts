import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Contact from '@/models/Contact';

export async function POST(req: NextRequest) {
  try {
    const workspaceId = req.headers.get('x-workspace-id');
    if (!workspaceId) {
      return NextResponse.json({ error: 'Workspace ID required' }, { status: 400 });
    }

    const { checkAndIncrementScanLimit } = require('@/lib/subscription');
    const { allowed } = await checkAndIncrementScanLimit(workspaceId, false);
    if (!allowed) {
      return NextResponse.json({ error: 'Usage limit reached. Please upgrade to continue.' }, { status: 403 });
    }

    const body = await req.json();
    const { contacts, sourceFileName } = body;

    if (!Array.isArray(contacts) || contacts.length === 0) {
      return NextResponse.json({ error: 'No valid contacts provided' }, { status: 400 });
    }

    await connectDB();

    // Get current max sourceRowNumber for this workspace
    const maxRowContact = await Contact.findOne({ workspaceId }).sort({ sourceRowNumber: -1 });
    let startRow = maxRowContact ? maxRowContact.sourceRowNumber + 1 : 1;

    const fileName = sourceFileName || 'Scanned_Image_OCR.png';

    const insertedDocs = [];
    for (const c of contacts) {
      const emailDomain = c.email && c.email.includes('@') ? c.email.split('@')[1].toLowerCase() : '';
      const fullName = c.fullName || `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Unknown Contact';

      let firstName = c.firstName || '';
      let lastName = c.lastName || '';

      if (!firstName && fullName && fullName !== 'Unknown Contact' && fullName !== 'Scanned Contact') {
        const parts = fullName.trim().split(/\s+/);
        if (parts.length >= 2) {
          firstName = parts[0];
          lastName = parts.slice(1).join(' ');
        } else {
          firstName = fullName;
          lastName = '';
        }
      }

      // Valid status assignment from image OCR
      const validStatuses = ['UNREVIEWED', 'FLAGGED_YELLOW', 'FLAGGED_RED', 'RESOLVED_GREEN'];
      let status = validStatuses.includes(c.status) ? c.status : 'UNREVIEWED';
      
      const confidence = typeof c.ocrSimilarityScore === 'number' ? c.ocrSimilarityScore : 100;
      if (confidence < 60) {
        status = 'FLAGGED_RED';
      }
      
      const comments = c.originalComments && Array.isArray(c.originalComments) ? [...c.originalComments] : [];
      comments.push(`Extracted via Free Tier Tesseract Image OCR. Confidence: ${confidence.toFixed(1)}%`);

      const doc = await Contact.create({
        workspaceId,
        sourceRowNumber: startRow++,
        sourceFileName: fileName,
        firstName,
        lastName,
        fullName,
        company: c.company || 'Unspecified Firm',
        email: c.email || '',
        emailDomain,
        title: c.title || 'Extracted via Free Tesseract OCR',
        status,
        originalComments: comments,
        ocrSimilarityScore: confidence,
      });

      insertedDocs.push(doc);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${insertedDocs.length} contact(s) via Free Tier Image OCR!`,
      count: insertedDocs.length,
    });
  } catch (error: any) {
    console.error('Error importing OCR contacts:', error);
    return NextResponse.json({ error: error.message || 'Failed to import OCR contacts' }, { status: 500 });
  }
}
