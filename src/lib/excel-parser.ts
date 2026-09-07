import ExcelJS from 'exceljs';
import Contact, { IContact } from '@/models/Contact';
import { connectDB } from '@/lib/db';

export async function parseAndImportExcel(fileBuffer: Buffer, workspaceId: string, fileName?: string, isPremium: boolean = false): Promise<{ total: number; imported: number }> {
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
  const customColMap: Record<string, number> = {};
  
  headerRow.eachCell((cell, colNumber) => {
    const rawVal = cell.value ? cell.value.toString().trim() : '';
    const val = rawVal.toLowerCase();
    let isStandard = true;
    
    if (val.includes('first')) colMap['firstName'] = colNumber;
    else if (val.includes('last')) colMap['lastName'] = colNumber;
    else if (val.includes('full') || val.includes('name')) colMap['fullName'] = colNumber;
    else if (val.includes('company') || val.includes('client')) colMap['company'] = colNumber;
    else if (val.includes('domain')) colMap['emailDomain'] = colNumber;
    else if (val.includes('email') || val.includes('e-mail')) colMap['email'] = colNumber;
    else if (val.includes('comment') || val.includes('notes') || val.includes('mr cor')) {
      if (!colMap['commentPrimary']) colMap['commentPrimary'] = colNumber;
      else colMap['commentSecondary'] = colNumber;
    } else {
      isStandard = false;
    }
    
    if (!isStandard && isPremium && rawVal) {
      // Clean up header string slightly (remove dots which cause issues in MongoDB keys)
      const cleanHeader = rawVal.replace(/\./g, '');
      customColMap[cleanHeader] = colNumber;
    }
  });

  // Default fallbacks if header names differ slightly
  const firstCol = colMap['firstName'] || 2;
  const lastCol = colMap['lastName'] || 3;
  const fullCol = colMap['fullName'] || 4;
  const compCol = colMap['company'] || 5;
  const emailCol = colMap['email'] || 6;
  const domainCol = colMap['emailDomain'] || 7;
  const commentColPrimary = colMap['commentPrimary'] || 8;
  const commentColSecondary = colMap['commentSecondary'] || 9;

  let rowCount = 0;

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // Skip header
    
    rowCount++;
    const sanitizeCellValue = (col: number) => {
      const cell = row.getCell(col);
      if (!cell || cell.value === null || cell.value === undefined) return '';
      if (typeof cell.value === 'object' && 'text' in (cell.value as any)) {
        return (cell.value as any).text.toString().trim();
      }
      return cell.value.toString().trim();
    };

    const firstName = sanitizeCellValue(firstCol);
    const lastName = sanitizeCellValue(lastCol);
    let fullName = sanitizeCellValue(fullCol);
    if (!fullName && (firstName || lastName)) {
      fullName = `${firstName} ${lastName}`.trim();
    }
    const company = sanitizeCellValue(compCol);
    const email = sanitizeCellValue(emailCol);
    const emailDomain = sanitizeCellValue(domainCol) || (email.includes('@') ? email.split('@')[1] : '');
    
    const originalComments: string[] = [];
    const commentFieldPrimary = sanitizeCellValue(commentColPrimary);
    const commentFieldSecondary = sanitizeCellValue(commentColSecondary);
    if (commentFieldPrimary) originalComments.push(commentFieldPrimary);
    if (commentFieldSecondary) originalComments.push(commentFieldSecondary);

    const customFields: Record<string, string> = {};
    if (isPremium) {
      for (const [header, colNumber] of Object.entries(customColMap)) {
        const val = sanitizeCellValue(colNumber);
        if (val) customFields[header] = val;
      }
    }

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
      workspaceId,
      sourceRowNumber: rowNumber,
      sourceFileName: fileName || 'Uploaded_Excel_Workbook.xlsx',
      firstName,
      lastName,
      fullName,
      company,
      email,
      emailDomain,
      originalComments,
      customFields,
      originalHighlightColor: originalHighlightColor || undefined,
      status,
      reviewerComment,
      title: 'Unverified Role',
      sectorCoverage: 'UNCONFIRMED',
      ocrSimilarityScore: 0,
    });
  });

  // Clear existing FOR THIS WORKSPACE ONLY and batch insert
  await Contact.deleteMany({ workspaceId });
  
  const batchSize = 1000;
  let insertedCount = 0;
  
  for (let i = 0; i < contactsToInsert.length; i += batchSize) {
    const batch = contactsToInsert.slice(i, i + batchSize);
    await Contact.insertMany(batch, { ordered: false });
    insertedCount += batch.length;
  }

  return { total: rowCount, imported: insertedCount };
}
