import { NextRequest, NextResponse } from 'next/server';
import Contact from '@/models/Contact';
import PdfText from '@/models/PdfText';
import { connectDB } from '@/lib/db';
import { runFuzzyMatchAndDedup } from '@/lib/matcher';
import { rateLimit, getClientIp } from '@/lib/rate-limiter';

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { allowed, resetAt } = rateLimit(ip, 'pdf-extract', 5, 60_000);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many extraction requests. Please wait a minute.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((resetAt - Date.now()) / 1000)) } }
    );
  }

  try {
    const workspaceId = req.headers.get('x-workspace-id');
    if (!workspaceId) return NextResponse.json({ error: 'Workspace ID required' }, { status: 400 });

    await connectDB();
    console.log(`🔄 Starting direct PDF to Contact extraction for workspace ${workspaceId}...`);

    // Get all PDF lines ordered by page and index
    const allLines = await PdfText.find({ workspaceId }).sort({ pageNumber: 1, lineIndex: 1 });
    
    if (allLines.length === 0) {
      return NextResponse.json({ error: 'No PDF text found. Please upload the PDF first.' }, { status: 400 });
    }

    const bulkOps: any[] = [];
    let extractedCount = 0;

    // New highly-accurate Pattern: "LastName, FirstName(s) CompanyName (Optional SYID) email@domain.com"
    const extractionRegex = /^([^,]+),\s*([A-Za-z\-]+(?:\s+[A-Za-z\-]+)?)\s+(.+?)\s+([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})$/i;

    for (const lineObj of allLines) {
      const line = lineObj.rawText;
      let match = line.match(extractionRegex);
      
      let lastName = '';
      let firstName = '';
      let company = '';
      let email = '';

      if (match) {
        lastName = match[1].trim();
        firstName = match[2].trim();
        // Remove trailing SYID tags if present, but keep the raw company name clean
        company = match[3].trim().replace(/\s+\(SYID[^)]+\)$/i, '');
        email = match[4].trim().toLowerCase();
      } else {
        // Fallback for missing emails or badly formatted lines
        const parts = line.split(/\s+/);
        const potentialEmail = parts[parts.length - 1];
        if (potentialEmail.includes('@')) {
          email = potentialEmail.toLowerCase();
          const restOfLine = line.replace(potentialEmail, '').trim();
          const commaIndex = restOfLine.indexOf(',');
          if (commaIndex !== -1) {
             lastName = restOfLine.substring(0, commaIndex).trim();
             const nameAndCompany = restOfLine.substring(commaIndex + 1).trim();
             const spaceIndex = nameAndCompany.indexOf(' ');
             if (spaceIndex !== -1) {
               firstName = nameAndCompany.substring(0, spaceIndex).trim();
               company = nameAndCompany.substring(spaceIndex + 1).trim().replace(/\s+\(SYID[^)]+\)$/i, '');
             }
          }
        }
      }

      if (email && lastName && firstName) {
        extractedCount++;
        const fullName = `${firstName} ${lastName}`;
        const emailDomain = email.split('@')[1] || '';

        bulkOps.push({
          insertOne: {
            document: {
              workspaceId,
              sourceRowNumber: extractedCount, // Synthetic row number
              firstName,
              lastName,
              fullName,
              company,
              email,
              emailDomain,
              title: 'Unverified Role',
              sectorCoverage: 'UNCONFIRMED',
              status: 'UNREVIEWED',
              originalHighlightColor: '',
              originalComments: [],
              reviewerComment: 'Directly extracted from PDF source.',
            }
          }
        });
      }
    }

    if (bulkOps.length > 0) {
      // Clear existing contacts FOR THIS WORKSPACE since we are bypassing the Excel
      await Contact.deleteMany({ workspaceId });
      
      const batchSize = 1000;
      for (let i = 0; i < bulkOps.length; i += batchSize) {
        await Contact.bulkWrite(bulkOps.slice(i, i + batchSize), { ordered: false });
      }
      
      // Run deduplication on the newly extracted contacts
      await runFuzzyMatchAndDedup(workspaceId);
    }

    return NextResponse.json({
      success: true,
      message: `Extracted ${extractedCount} contacts directly from PDF.`,
      count: extractedCount
    });
  } catch (error: any) {
    console.error('Extraction error:', error);
    return NextResponse.json({ error: error.message || 'Extraction failed' }, { status: 500 });
  }
}
