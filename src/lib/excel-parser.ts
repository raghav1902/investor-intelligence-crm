import ExcelJS from 'exceljs';
import Contact, { IContact } from '@/models/Contact';
import { connectDB } from '@/lib/db';

export async function parseAndImportExcel(fileBuffer: Buffer): Promise<{ total: number; imported: number }> {
  await connectDB();
  
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(fileBuffer as any);
  
  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    throw new Error('No worksheet found in Excel file');
  }

  const contactsToInsert: Partial<IContact>[] = [];
  
  // Find column headers
  const headerRow = worksheet.getRow(1);
  const colMap: Record<string, number> = {};
  
  headerRow.eachCell((cell, colNumber) => {
    const val = cell.value ? cell.value.toString().trim().toLowerCase() : '';
    if (val.includes('first')) colMap['firstName'] = colNumber;
    else if (val.includes('last')) colMap['lastName'] = colNumber;
    else if (val.includes('full') || val.includes('name')) colMap['fullName'] = colNumber;
    else if (val.includes('company') || val.includes('client')) colMap['company'] = colNumber;
    else if (val.includes('domain')) colMap['emailDomain'] = colNumber;
    else if (val.includes('email') || val.includes('e-mail')) colMap['email'] = colNumber;
    else if (val.includes('comment') || val.includes('notes') || val.includes('mr cor')) {
      if (!colMap['comment1']) colMap['comment1'] = colNumber;
      else colMap['comment2'] = colNumber;
    }
  });

  // Default fallbacks if header names differ slightly
  const firstCol = colMap['firstName'] || 2;
  const lastCol = colMap['lastName'] || 3;
  const fullCol = colMap['fullName'] || 4;
  const compCol = colMap['company'] || 5;
  const emailCol = colMap['email'] || 6;
  const domainCol = colMap['emailDomain'] || 7;
  const comm1Col = colMap['comment1'] || 8;
  const comm2Col = colMap['comment2'] || 9;

  let rowCount = 0;

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // Skip header
    
    rowCount++;
    const getVal = (col: number) => {
      const cell = row.getCell(col);
      if (!cell || cell.value === null || cell.value === undefined) return '';
      if (typeof cell.value === 'object' && 'text' in (cell.value as any)) {
        return (cell.value as any).text.toString().trim();
      }
      return cell.value.toString().trim();
    };

    const firstName = getVal(firstCol);
    const lastName = getVal(lastCol);
    let fullName = getVal(fullCol);
    if (!fullName && (firstName || lastName)) {
      fullName = `${firstName} ${lastName}`.trim();
    }
    const company = getVal(compCol);
    const email = getVal(emailCol);
    const emailDomain = getVal(domainCol) || (email.includes('@') ? email.split('@')[1] : '');
    
    const originalComments: string[] = [];
    const c1 = getVal(comm1Col);
    const c2 = getVal(comm2Col);
    if (c1) originalComments.push(c1);
    if (c2) originalComments.push(c2);

    // Extract cell background highlight if any
    let originalHighlightColor: string | null = null;
    let status: 'UNREVIEWED' | 'FLAGGED_YELLOW' | 'FLAGGED_RED' | 'RESOLVED_GREEN' = 'UNREVIEWED';
    
    const companyCell = row.getCell(compCol);
    if (companyCell && companyCell.fill && companyCell.fill.type === 'pattern') {
      const patternFill = companyCell.fill as ExcelJS.FillPattern;
      if (patternFill.fgColor && patternFill.fgColor.argb) {
        originalHighlightColor = `#${patternFill.fgColor.argb.slice(2)}`;
        const hex = originalHighlightColor.toLowerCase();
        if (hex.includes('ff00') || hex.includes('ffff00') || hex.includes('ffee') || hex.includes('fcf8e3') || hex === '#ffff00') {
          status = 'FLAGGED_YELLOW';
        } else if (hex.includes('00ff') || hex.includes('d4edda') || hex === '#00ff00') {
          status = 'RESOLVED_GREEN';
        } else if (hex.includes('ff0000') || hex.includes('f8d7da')) {
          status = 'FLAGGED_RED';
        }
      }
    }

    // Extract cell comment if any
    let reviewerComment = '';
    if (companyCell && companyCell.note) {
      if (typeof companyCell.note === 'string') {
        reviewerComment = companyCell.note;
      } else if ('texts' in companyCell.note && Array.isArray(companyCell.note.texts)) {
        reviewerComment = companyCell.note.texts.map(t => t.text || '').join(' ');
      } else if ('text' in companyCell.note) {
        reviewerComment = (companyCell.note as any).text || '';
      }
    }

    // Auto-flag as YELLOW if notes contain keywords like Discrepancy, Duplicate, Inconsistency, or Check
    const notesContent = `${originalComments.join(' ')} ${reviewerComment}`.toLowerCase();
    if (status === 'UNREVIEWED' && (
      notesContent.includes('discrepancy') ||
      notesContent.includes('duplicate') ||
      notesContent.includes('inconsistency') ||
      notesContent.includes('mismatch') ||
      notesContent.includes('verify') ||
      notesContent.includes('check')
    )) {
      status = 'FLAGGED_YELLOW';
    }

    if (!fullName && !company && !email) return; // Skip empty rows

    contactsToInsert.push({
      sourceRowNumber: rowNumber,
      firstName,
      lastName,
      fullName,
      company,
      email,
      emailDomain,
      originalComments,
      originalHighlightColor: originalHighlightColor || undefined,
      status,
      reviewerComment,
      title: 'Unverified Role',
      sectorCoverage: 'UNCONFIRMED',
      ocrSimilarityScore: 0,
    });
  });

  // Clear existing and batch insert
  await Contact.deleteMany({});
  
  const batchSize = 1000;
  let insertedCount = 0;
  
  for (let i = 0; i < contactsToInsert.length; i += batchSize) {
    const batch = contactsToInsert.slice(i, i + batchSize);
    await Contact.insertMany(batch, { ordered: false });
    insertedCount += batch.length;
  }

  return { total: rowCount, imported: insertedCount };
}
