import ExcelJS from 'exceljs';
import Contact from '@/models/Contact';
import { connectDB } from '@/lib/db';

export async function exportToExcel(workspaceId: string): Promise<Buffer> {
  await connectDB();
  
  const contacts = await Contact.find({ workspaceId }).sort({ sourceRowNumber: 1 });
  
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Validated Investor Contacts');

  // Define Headers (Preserve original structure + Add Title and Sector Coverage)
  worksheet.columns = [
    { header: 'Row #', key: 'sourceRowNumber', width: 8 },
    { header: 'First Name', key: 'firstName', width: 16 },
    { header: 'Last Name', key: 'lastName', width: 16 },
    { header: 'Full Name', key: 'fullName', width: 24 },
    { header: 'Title (Verified)', key: 'title', width: 26 },
    { header: 'Sector Coverage', key: 'sectorCoverage', width: 22 },
    { header: 'Company', key: 'company', width: 32 },
    { header: 'Email', key: 'email', width: 32 },
    { header: 'Email Domain', key: 'emailDomain', width: 20 },
    { header: 'Status', key: 'status', width: 18 },
    { header: 'Original Comment 1', key: 'comm1', width: 28 },
    { header: 'Original Comment 2', key: 'comm2', width: 28 },
  ];

  // Style Header Row
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1F2937' }, // Dark slate header
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  headerRow.height = 24;

  // Add Data Rows
  contacts.forEach((contact) => {
    const row = worksheet.addRow({
      sourceRowNumber: contact.sourceRowNumber,
      firstName: contact.firstName,
      lastName: contact.lastName,
      fullName: contact.fullName,
      title: contact.title || 'Unverified Role',
      sectorCoverage: contact.sectorCoverage || 'UNCONFIRMED',
      company: contact.company,
      email: contact.email,
      emailDomain: contact.emailDomain,
      status: contact.status,
      comm1: contact.originalComments && contact.originalComments[0] ? contact.originalComments[0] : '',
      comm2: contact.originalComments && contact.originalComments[1] ? contact.originalComments[1] : '',
    });

    row.height = 20;
    row.alignment = { vertical: 'middle' };

    // Apply Highlighting based on status
    let fillColor = 'FFFFFFFF'; // White default
    if (contact.status === 'RESOLVED_GREEN') {
      fillColor = 'FFD4EDDA'; // Soft Excel Green
    } else if (contact.status === 'FLAGGED_YELLOW') {
      fillColor = 'FFFFF3CD'; // Soft Excel Yellow
    } else if (contact.status === 'FLAGGED_RED') {
      fillColor = 'FFF8D7DA'; // Soft Excel Red
    } else if (contact.originalHighlightColor) {
      // Retain original highlight if unreviewed
      fillColor = `FF${contact.originalHighlightColor.replace('#', '').toUpperCase()}`;
    }

    if (fillColor !== 'FFFFFFFF') {
      row.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: fillColor },
        };
      });
    }

    // Format Email Domain as a Hyperlink
    if (contact.emailDomain) {
      const domainCell = row.getCell('emailDomain');
      domainCell.value = {
        text: contact.emailDomain,
        hyperlink: `http://${contact.emailDomain}`
      };
      domainCell.font = {
        color: { argb: 'FF0563C1' }, // Standard Excel hyperlink blue
        underline: true
      };
    }

    // Add Native Excel Cell Comment if reviewer Comment exists
    if (contact.reviewerComment) {
      const companyCell = row.getCell('company');
      companyCell.note = {
        texts: [
          { font: { bold: true, color: { argb: 'FF000000' } }, text: 'Reviewer Note:\n' },
          { font: { color: { argb: 'FF333333' } }, text: contact.reviewerComment },
        ],
      };
    }
  });

  // Enable AutoFilter
  worksheet.autoFilter = {
    from: 'A1',
    to: `L${contacts.length + 1}`,
  };

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
