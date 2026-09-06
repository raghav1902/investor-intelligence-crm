export interface ParsedContact {
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  company: string;
  status: string;
  title: string;
  ocrSimilarityScore: number;
  originalComments: string[];
}

// Preprocess Image: High Quality 2x Scale + Contrast Smoothing
export const preprocessImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(URL.createObjectURL(file));

      const scale = 2;
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => reject(new Error('Failed to load image for preprocessing.'));
    img.src = URL.createObjectURL(file);
  });
};

export const parseContactsFromOcr = (
  rawText: string,
  words: any[]
): ParsedContact[] => {
  const validWords = words.filter((w: any) => w.text && w.text.trim().length > 0);
  const parsedContacts: ParsedContact[] = [];
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i;
  const headerRegex = /^(row\s*#?|first\s*name|last\s*name|full\s*name|company|email|email\s*domain|status|dedup)/i;

  if (validWords.length > 0) {
    // Spatial Row Proximity Grouping (~20px Y-threshold for 2x upscaled canvas)
    validWords.sort((a: any, b: any) => a.bbox.y0 - b.bbox.y0);

    const rows: any[][] = [];
    let currentLine: any[] = [];
    let currentY = -1;

    for (const word of validWords) {
      if (currentY === -1 || Math.abs(word.bbox.y0 - currentY) < 20) {
        currentLine.push(word);
        currentY = word.bbox.y0;
      } else {
        currentLine.sort((a: any, b: any) => a.bbox.x0 - b.bbox.x0);
        rows.push(currentLine);
        currentLine = [word];
        currentY = word.bbox.y0;
      }
    }
    if (currentLine.length > 0) {
      currentLine.sort((a: any, b: any) => a.bbox.x0 - b.bbox.x0);
      rows.push(currentLine);
    }

    for (const row of rows) {
      const lineText = row.map((w: any) => w.text.trim()).join(' ');
      if (headerRegex.test(lineText.replace(/[^a-zA-Z\s]/g, '').trim())) continue;

      const emailMatch = lineText.match(emailRegex);
      if (emailMatch) {
        const emailWordIndex = row.findIndex((w: any) => emailRegex.test(w.text));
        const leftWords = row
          .slice(0, emailWordIndex > 0 ? emailWordIndex : row.length)
          .map((w: any) => w.text.trim())
          .filter((t: string) => t.length > 1 && !/^\d+$/.test(t));
          
        const rightWords = row
          .slice(emailWordIndex > 0 ? emailWordIndex + 1 : row.length)
          .map((w: any) => w.text.trim());

        const confidences = row.map((w: any) => w.confidence).filter((c: number) => typeof c === 'number');
        const avgConfidence = confidences.length ? confidences.reduce((a, b) => a + b, 0) / confidences.length : 100;

        let firstName = 'Scanned';
        let lastName = 'Contact';
        let company = 'Unspecified Firm';

        if (leftWords.length >= 3) {
          firstName = leftWords[0];
          lastName = leftWords[1];
          company = leftWords.slice(2).join(' ').replace(/^(the|a|an)\s+/i, '');
        } else if (leftWords.length === 2) {
          firstName = leftWords[0];
          lastName = leftWords[1];
        } else if (leftWords.length === 1) {
          firstName = leftWords[0];
          lastName = '';
        }

        firstName = firstName.replace(/[^a-zA-Z\s.'-]/g, '').trim();
        lastName = lastName.replace(/[^a-zA-Z\s.'-]/g, '').trim();
        company = company.replace(/[^a-zA-Z0-9\s&,.-]/g, '').trim() || 'Unspecified Firm';
        const fullName = `${firstName} ${lastName}`.trim() || 'Scanned Contact';

        let status = 'UNREVIEWED';
        if (/\b(green|resolved|clean)\b/i.test(lineText)) status = 'RESOLVED_GREEN';
        else if (/\b(yellow|warning|needs)\b/i.test(lineText)) status = 'FLAGGED_YELLOW';
        else if (/\b(red|critical|issue)\b/i.test(lineText)) status = 'FLAGGED_RED';

        const rightText = rightWords.join(' ');
        const notesText = rightText.replace(/\b(green|resolved|clean|yellow|warning|needs|red|critical|issue|unreviewed)\b/ig, '').trim();
        const originalComments: string[] = notesText.length > 2 ? [notesText] : [];

        parsedContacts.push({
          firstName,
          lastName,
          fullName,
          email: emailMatch[0].toLowerCase(),
          company,
          status,
          title: 'Extracted via Free Image OCR',
          ocrSimilarityScore: avgConfidence,
          originalComments
        });
      }
    }
  }

  // Fallback if spatial mapping yielded 0 contacts but text exists
  if (parsedContacts.length === 0 && rawText.trim().length > 0) {
    const textLines = rawText.split('\n').map((l: string) => l.trim()).filter(Boolean);
    for (const line of textLines) {
      if (headerRegex.test(line.replace(/[^a-zA-Z\s]/g, '').trim())) continue;

      const emailMatch = line.match(emailRegex);
      if (emailMatch) {
        const wordsInLine = line.split(/\s+/).filter((w) => w.length > 1 && !w.includes('@') && !/^\d+$/.test(w));
        let firstName = 'Scanned';
        let lastName = 'Contact';
        if (wordsInLine.length >= 2) {
          firstName = wordsInLine[0];
          lastName = wordsInLine[1];
        } else if (wordsInLine.length === 1) {
          firstName = wordsInLine[0];
          lastName = '';
        }

        let status = 'UNREVIEWED';
        if (/\b(green|resolved)\b/i.test(line)) status = 'RESOLVED_GREEN';
        else if (/\b(yellow|warning)\b/i.test(line)) status = 'FLAGGED_YELLOW';
        else if (/\b(red|critical)\b/i.test(line)) status = 'FLAGGED_RED';

        const rightText = line.substring(line.indexOf(emailMatch[0]) + emailMatch[0].length);
        const notesText = rightText.replace(/\b(green|resolved|clean|yellow|warning|needs|red|critical|issue|unreviewed)\b/ig, '').trim();
        const originalComments: string[] = notesText.length > 2 ? [notesText] : [];

        parsedContacts.push({
          firstName: firstName.replace(/[^a-zA-Z\s.'-]/g, '').trim(),
          lastName: lastName.replace(/[^a-zA-Z\s.'-]/g, '').trim(),
          fullName: `${firstName} ${lastName}`.trim(),
          email: emailMatch[0].toLowerCase(),
          company: wordsInLine.slice(2).join(' ') || 'Free Tier Image OCR',
          status,
          title: 'Extracted via Free Image OCR',
          ocrSimilarityScore: 50,
          originalComments
        });
      }
    }
  }

  return parsedContacts;
};
