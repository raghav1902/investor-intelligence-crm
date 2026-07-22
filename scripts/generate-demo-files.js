const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

async function generateSampleExcel() {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Gosai Investor Contacts');

  // Define Columns matching the app's excel-parser logic
  worksheet.columns = [
    { header: 'Row #', key: 'sourceRowNumber', width: 10 },
    { header: 'First Name', key: 'firstName', width: 16 },
    { header: 'Last Name', key: 'lastName', width: 16 },
    { header: 'Full Name', key: 'fullName', width: 24 },
    { header: 'Company', key: 'company', width: 32 },
    { header: 'Email', key: 'email', width: 32 },
    { header: 'Email Domain', key: 'emailDomain', width: 22 },
    { header: 'Original Comment / Notes', key: 'comment1', width: 35 },
  ];

  // Style Header Row
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1F2937' },
  };

  // Sample Data Rows
  const sampleData = [
    { row: 2, first: 'Sarah', last: 'Jenkins', full: 'Sarah Jenkins', comp: 'BlackRock', email: 's.jenkins@blackrock.com', domain: 'blackrock.com', note: 'Verified Q2 2026', fill: 'FFD4EDDA' }, // Soft Green
    { row: 3, first: 'Marcus', last: 'Vance', full: 'Marcus Vance', comp: 'Citadel', email: 'marcus.vance@citadel.com', domain: 'citadel.com', note: 'OCR Discrepancy: check underscore vs dot', fill: 'FFFFF3CD' }, // Soft Yellow
    { row: 4, first: 'Marcus', last: 'Vance', full: 'Marcus Vance', comp: 'Point72 Asset Management', email: 'mvance@point72.com', domain: 'point72.com', note: 'Duplicate Name - potential career move', fill: 'FFFFF3CD' }, // Soft Yellow
    { row: 5, first: 'Elena', last: 'Rostova', full: 'Elena Rostova', comp: 'Brookfield Asset Management', email: 'elena.rostova@brookfield.com', domain: 'brookfield.com', note: 'Industrials PM', fill: 'FFD4EDDA' },
    { row: 6, first: 'David', last: 'Chen', full: 'David Chen', comp: 'Fidelity Investments', email: 'david.chen@fidelity.com', domain: 'fidelity.com', note: 'Energy Sector Specialist', fill: '' },
    { row: 7, first: 'David', last: 'Chen', full: 'David Chen', comp: 'Fidelity Management', email: 'david.chen@fidelity.com', domain: 'fidelity.com', note: 'Exact Email Duplicate of Row 6', fill: 'FFFFF3CD' },
    { row: 8, first: 'Amanda', last: 'Sloan', full: 'Amanda Sloan', comp: 'KKR & Co.', email: 'amanda.sloan@kkr.com', domain: 'kkr.com', note: 'Renewables Lead', fill: 'FFD4EDDA' },
    { row: 9, first: 'Robert', last: 'Gallagher', full: 'Robert Gallagher', comp: 'Vanguard Group', email: '', domain: 'vanguard.com', note: 'Missing Email - Critical Discrepancy', fill: 'FFF8D7DA' }, // Soft Red
    { row: 10, first: 'Priya', last: 'Sharma', full: 'Priya Sharma', comp: 'Millennium Management', email: 'psharma@mlp.com', domain: 'mlp.com', note: 'Power Grid Portfolio Manager', fill: 'FFD4EDDA' },
    { row: 11, first: 'Jonathan', last: 'Hayes', full: 'Jonathan Hayes', comp: 'Blackstone', email: 'j.hayes@blackstone.com', domain: 'blackstone.com', note: 'Energy Transition Director', fill: '' },
    { row: 12, first: 'Samantha', last: 'Wright', full: 'Samantha Wright', comp: 'Apollo Global Management', email: 'swright@apollo.com', domain: 'apollo.com', note: 'Partner, Natural Resources', fill: 'FFD4EDDA' },
    { row: 13, first: 'Thomas', last: 'Kovacs', full: 'Thomas Kovacs', comp: 'Wellington Management', email: 'tkovacs@wellington.com', domain: 'wellington.com', note: 'Check coverage - Consumer Retail', fill: 'FFFFF3CD' },
    { row: 14, first: 'Rachel', last: 'Kim', full: 'Rachel Kim', comp: 'GIP (Global Infrastructure)', email: 'rachel.kim@globalinfra.com', domain: 'globalinfra.com', note: 'Energy Storage Associate', fill: '' },
    { row: 15, first: 'Alexander', last: 'Novak', full: 'Alexander Novak', comp: 'Capital Group', email: 'a.novak@capgroup.com', domain: 'capgroup.com', note: 'Utilities VP', fill: 'FFD4EDDA' },
    { row: 16, first: 'Claire', last: 'Dupont', full: 'Claire Dupont', comp: 'Macquarie Asset Management', email: 'claire.dupont@macquarie.com', domain: 'macquarie.com', note: 'Offshore Wind Lead', fill: 'FFD4EDDA' },
    { row: 17, first: 'Victor', last: 'Morales', full: 'Victor Morales', comp: 'T. Rowe Price', email: 'victor.morales@troweprice.com', domain: 'troweprice.com', note: 'Senior Energy Analyst', fill: '' },
  ];

  sampleData.forEach((d) => {
    const row = worksheet.addRow({
      sourceRowNumber: d.row,
      firstName: d.first,
      lastName: d.last,
      fullName: d.full,
      company: d.comp,
      email: d.email,
      emailDomain: d.domain,
      comment1: d.note,
    });

    if (d.fill) {
      row.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: d.fill },
        };
      });
    }
  });

  const publicDir = path.join(__dirname, '..', 'public');
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

  const filePath = path.join(publicDir, 'Gosai_Investor_Contacts.xlsx');
  await workbook.xlsx.writeFile(filePath);
  console.log(`✅ Sample Excel generated at: ${filePath}`);
}

generateSampleExcel().catch(console.error);
