'use client';

import React, { useState, useEffect } from 'react';
import { X, Upload, FileSpreadsheet, FileText, CheckCircle2, AlertCircle, Loader2, Image as ImageIcon, Zap, Lock, Sparkles } from 'lucide-react';
import { getWorkspaceId } from '@/lib/workspace';
import { useToast } from '@/components/ToastProvider';
import Tesseract from 'tesseract.js';
import UpgradeModal from '@/components/UpgradeModal';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const MAX_FREE_SCANS = 5;

export default function UploadModal({ isOpen, onClose, onSuccess }: UploadModalProps) {
  const { toast } = useToast();
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [subStatus, setSubStatus] = useState<{ plan: string, scansUsed: number, scansLimit: number | null }>({ plan: 'free', scansUsed: 0, scansLimit: 5 });
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeTrigger, setUpgradeTrigger] = useState<'limit_reached' | 'premium_feature' | 'export_nudge'>('limit_reached');

  const excelInputRef = React.useRef<HTMLInputElement>(null);
  const imageInputRef = React.useRef<HTMLInputElement>(null);
  const pdfInputRef = React.useRef<HTMLInputElement>(null);

  const [dragExcel, setDragExcel] = useState(false);
  const [dragImage, setDragImage] = useState(false);
  const [dragPdf, setDragPdf] = useState(false);

  const handleDrag = (e: React.DragEvent, type: 'excel' | 'image' | 'pdf') => {
    e.preventDefault();
    e.stopPropagation();
    const isOver = e.type === "dragenter" || e.type === "dragover";
    if (type === 'excel') setDragExcel(isOver);
    if (type === 'image') setDragImage(isOver);
    if (type === 'pdf') setDragPdf(isOver);
  };

  const handleDrop = (e: React.DragEvent, type: 'excel' | 'image' | 'pdf') => {
    e.preventDefault();
    e.stopPropagation();
    if (type === 'excel') {
      setDragExcel(false);
      const file = e.dataTransfer.files?.[0];
      if (file && file.name.endsWith('.xlsx')) {
        if (file.size > 10 * 1024 * 1024) {
          toast('error', 'File too large', `Excel file is ${(file.size / 1024 / 1024).toFixed(0)}MB. Max is 10MB.`);
        } else {
          setExcelFile(file);
        }
      } else {
        toast('error', 'Invalid File Type', 'Please upload a valid Excel workbook (.xlsx).');
      }
    }
    if (type === 'image') {
      setDragImage(false);
      const file = e.dataTransfer.files?.[0];
      if (file && (file.type.startsWith('image/') || /\.(png|jpe?g|webp)$/i.test(file.name))) {
        setImageFile(file);
      } else {
        toast('error', 'Invalid File Type', 'Please upload a valid image file.');
      }
    }
    if (type === 'pdf') {
      setDragPdf(false);
      const file = e.dataTransfer.files?.[0];
      if (file && file.name.endsWith('.pdf')) {
        if (file.size > 10 * 1024 * 1024) {
          toast('error', 'File too large', `PDF file is ${(file.size / 1024 / 1024).toFixed(0)}MB. Max is 10MB.`);
        } else {
          setPdfFile(file);
        }
      } else {
        toast('error', 'Invalid File Type', 'Please upload a valid PDF document.');
      }
    }
  };

  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      fetch('/api/subscription/status', {
        headers: { 'x-workspace-id': getWorkspaceId() }
      })
      .then(res => res.json())
      .then(data => {
        if (data && data.plan) {
          setSubStatus(data);
        }
      })
      .catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUploadExcel = async () => {
    if (!excelFile) return;
    setLoading(true);
    setStatusMsg('Parsing and importing Excel workbook (10,000+ rows)...');
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append('file', excelFile);

      const res = await fetch('/api/upload/excel', {
        method: 'POST',
        headers: { 'x-workspace-id': getWorkspaceId() },
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to upload Excel');
      setStatusMsg(`✅ ${data.message}`);
      toast('success', 'Excel Imported!', data.message);
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🎨 Image Preprocessing: High Quality 2x Scale + Contrast Adjustment (No harsh thresholding)
  const preprocessImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(URL.createObjectURL(file));

        // 1. Resize x2 for high resolution OCR DPI
        const scale = 2;
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        // Use high-quality image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => reject(new Error('Failed to load image for preprocessing.'));
      img.src = URL.createObjectURL(file);
    });
  };

  const handleUploadImageFreeOcr = async () => {
    if (!imageFile) return;
    
    if (subStatus.plan === 'free' && subStatus.scansLimit && subStatus.scansUsed >= subStatus.scansLimit) {
      setUpgradeTrigger('limit_reached');
      setUpgradeModalOpen(true);
      return;
    }

    setLoading(true);
    setStatusMsg('1/3 Preprocessing image (2x High-DPI Upscale)...');
    setErrorMsg(null);

    try {
      // Step 1: Preprocess Image Canvas
      const processedImageUrl = await preprocessImage(imageFile);

      setStatusMsg('2/3 Running Tesseract OCR engine...');

      // Step 2: Run Tesseract on high resolution image
      const result = await Tesseract.recognize(processedImageUrl, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setStatusMsg(`Scanning image with Tesseract.js: ${Math.round(m.progress * 100)}%`);
          }
        },
      });

      setStatusMsg('3/3 Parsing contacts & extracting tables...');

      const rawText = result.data.text || '';
      const words: any[] = (result.data as any).words || [];
      const lines: any[] = (result.data as any).lines || [];

      // Filter non-empty words (remove strict confidence requirement so digital table screenshots are not lost)
      const validWords = words.filter((w: any) => w.text && w.text.trim().length > 0);

      const parsedContacts: any[] = [];
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i;

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

        const headerRegex = /^(row\s*#?|first\s*name|last\s*name|full\s*name|company|email|email\s*domain|status|dedup)/i;

        for (const row of rows) {
          const lineText = row.map((w: any) => w.text.trim()).join(' ');

          // 1. Skip Table Header Row
          if (headerRegex.test(lineText.replace(/[^a-zA-Z\s]/g, '').trim())) {
            continue;
          }

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

            // Average Confidence Score
            const confidences = row.map((w: any) => w.confidence).filter((c: number) => typeof c === 'number');
            const avgConfidence = confidences.length ? confidences.reduce((a, b) => a + b, 0) / confidences.length : 100;

            let firstName = '';
            let lastName = '';
            let company = '';

            // 2. Name Splitting & Company Parsing
            if (leftWords.length >= 3) {
              firstName = leftWords[0];
              lastName = leftWords[1];
              company = leftWords.slice(2).join(' ');
              company = company.replace(/^(the|a|an)\s+/i, '');
            } else if (leftWords.length === 2) {
              firstName = leftWords[0];
              lastName = leftWords[1];
              company = 'Unspecified Firm';
            } else if (leftWords.length === 1) {
              firstName = leftWords[0];
              lastName = '';
              company = 'Unspecified Firm';
            } else {
              firstName = 'Scanned';
              lastName = 'Contact';
              company = 'Unspecified Firm';
            }

            // Clean non-alphanumeric noise
            firstName = firstName.replace(/[^a-zA-Z\s.'-]/g, '').trim();
            lastName = lastName.replace(/[^a-zA-Z\s.'-]/g, '').trim();
            company = company.replace(/[^a-zA-Z0-9\s&,.-]/g, '').trim() || 'Unspecified Firm';
            const fullName = `${firstName} ${lastName}`.trim() || 'Scanned Contact';

            // 3. Status Detection (Green / Yellow / Red / Unreviewed)
            let status = 'UNREVIEWED';
            const rightText = rightWords.join(' ');
            
            if (/\b(green|resolved|clean)\b/i.test(lineText)) {
              status = 'RESOLVED_GREEN';
            } else if (/\b(yellow|warning|needs)\b/i.test(lineText)) {
              status = 'FLAGGED_YELLOW';
            } else if (/\b(red|critical|issue)\b/i.test(lineText)) {
              status = 'FLAGGED_RED';
            }
            
            // 4. Notes / Dedup Separation
            let originalComments: string[] = [];
            const notesText = rightText.replace(/\b(green|resolved|clean|yellow|warning|needs|red|critical|issue|unreviewed)\b/ig, '').trim();
            if (notesText.length > 2) {
              originalComments.push(notesText);
            }

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


      // Fallback if spatial word mapping yielded 0 contacts but text/lines exist
      if (parsedContacts.length === 0 && rawText.trim().length > 0) {
        const textLines = rawText.split('\n').map((l: string) => l.trim()).filter(Boolean);
        const headerRegex = /^(row\s*#?|first\s*name|last\s*name|full\s*name|company|email|email\s*domain|status|dedup)/i;

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
            let originalComments: string[] = [];
            const notesText = rightText.replace(/\b(green|resolved|clean|yellow|warning|needs|red|critical|issue|unreviewed)\b/ig, '').trim();
            if (notesText.length > 2) {
              originalComments.push(notesText);
            }

            parsedContacts.push({
              firstName: firstName.replace(/[^a-zA-Z\s.'-]/g, '').trim(),
              lastName: lastName.replace(/[^a-zA-Z\s.'-]/g, '').trim(),
              fullName: `${firstName} ${lastName}`.trim(),
              email: emailMatch[0].toLowerCase(),
              company: wordsInLine.slice(2).join(' ') || 'Free Tier Image OCR',
              status,
              title: 'Extracted via Free Image OCR',
              ocrSimilarityScore: 50, // default fallback confidence
              originalComments
            });
          }
        }
      }

      if (parsedContacts.length === 0) {
        throw new Error('No contact emails found in the image. Please make sure the image contains a table or list with valid email addresses.');
      }

      // Step 5: Save Extracted Contacts to MongoDB
      const res = await fetch('/api/contacts/import-ocr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-workspace-id': getWorkspaceId(),
        },
        body: JSON.stringify({ contacts: parsedContacts }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save scanned contacts.');

      // Fetch latest subStatus directly from backend to ensure accurate UI sync
      fetch('/api/subscription/status', {
        headers: { 'x-workspace-id': getWorkspaceId() }
      })
      .then(res => res.json())
      .then(data => {
        if (data && data.plan) setSubStatus(data);
      })
      .catch(console.error);

      setStatusMsg(`✅ ${data.message}`);
      toast('success', 'Free Image OCR Complete', data.message);
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Client-side OCR processing failed');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadPdf = async () => {
    if (!pdfFile) return;

    if (subStatus.plan === 'free') {
      setUpgradeTrigger('premium_feature');
      setUpgradeModalOpen(true);
      return;
    }
    setLoading(true);
    setStatusMsg('Storing source PDF for Gemini Vision OCR...');
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append('file', pdfFile);

      const res = await fetch('/api/upload/pdf', {
        method: 'POST',
        headers: { 'x-workspace-id': getWorkspaceId() },
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to upload PDF');
      setStatusMsg(`✅ ${data.message}`);
      toast('success', 'PDF Stored & OCR Complete', data.message);
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <UpgradeModal 
      isOpen={upgradeModalOpen} 
      onClose={() => setUpgradeModalOpen(false)} 
      triggerType={upgradeTrigger} 
    />
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-xl rounded-2xl border border-hairline bg-surface-100 p-6 shadow-2xl transition-colors max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-hairline pb-4">
          <h2 className="text-lg font-bold text-content-primary flex items-center gap-2">
            <Upload className="h-5 w-5 text-emerald-500" />
            Upload Sources &amp; OCR Engine
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-content-secondary hover:bg-surface-200 hover:text-content-primary transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 space-y-5">
          {/* Section 1: Excel Import */}
          <div className="rounded-xl border border-hairline bg-surface-200 p-4 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="rounded-lg bg-emerald-900/40 p-2 text-emerald-400 border border-emerald-800/50">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-content-primary">1. Bulk Contact List (.xlsx)</h3>
                <p className="text-xs text-content-secondary">Import a structured Excel workbook (supports 10,000+ rows)</p>
              </div>
            </div>
            
            <div
              onDragEnter={(e) => handleDrag(e, 'excel')}
              onDragOver={(e) => handleDrag(e, 'excel')}
              onDragLeave={(e) => handleDrag(e, 'excel')}
              onDrop={(e) => handleDrop(e, 'excel')}
              onClick={() => {
                if (subStatus.plan !== 'free') excelInputRef.current?.click();
              }}
              className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-300 ${
                subStatus.plan === 'free' ? 'opacity-50 cursor-not-allowed border-hairline bg-surface-300' :
                dragExcel ? 'border-emerald-500 bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.05)]' :
                excelFile ? 'border-emerald-500 bg-emerald-500/5' : 'border-hairline bg-surface-100 hover:border-emerald-500/20'
              }`}
            >
              <input
                ref={excelInputRef}
                type="file"
                accept=".xlsx"
                className="hidden"
                disabled={subStatus.plan === 'free'}
                onChange={(e) => {
                  const f = e.target.files?.[0] || null;
                  if (f && f.size > 10 * 1024 * 1024) {
                    toast('error', 'File too large', `Excel file is ${(f.size / 1024 / 1024).toFixed(0)}MB. Max is 10MB.`);
                    e.target.value = '';
                    return;
                  }
                  setExcelFile(f);
                }}
              />
              <div className="flex flex-col items-center justify-center gap-1">
                <Upload className={`h-6 w-6 mb-1 ${excelFile ? 'text-emerald-500' : 'text-content-muted'}`} />
                <p className="text-xs font-semibold text-content-primary">
                  {excelFile ? excelFile.name : 'Drag & drop Excel file here, or click to browse'}
                </p>
                <p className="text-[10px] text-content-secondary">
                  {excelFile ? `${(excelFile.size / 1024).toFixed(1)} KB` : 'Maximum file size: 10MB'}
                </p>
              </div>
            </div>

            {excelFile && (
              <div className="mt-3 flex justify-end">
                <button
                  onClick={handleUploadExcel}
                  disabled={loading}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 disabled:opacity-50 shadow-xs"
                >
                  Import Excel
                </button>
              </div>
            )}
          </div>

          {/* Section 2: FREE TIER - Client Side Image OCR */}
          <div className="rounded-xl border border-teal-800/60 bg-teal-950/30 p-4 transition-colors">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-teal-900/50 p-2 text-teal-400 border border-teal-800">
                  <ImageIcon className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-content-primary">Free Tier: Image OCR</h3>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-900/60 text-teal-300 uppercase">
                      Client-side Tesseract.js
                    </span>
                  </div>
                  <p className="text-xs text-content-secondary">Scan single image cards (.png, .jpg, .webp)</p>
                </div>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-md ${subStatus.plan === 'free' && subStatus.scansLimit && subStatus.scansUsed >= subStatus.scansLimit ? 'bg-rose-900/40 text-rose-300' : 'bg-teal-900/40 text-teal-300'}`}>
                {subStatus.plan === 'premium' ? 'Unlimited' : `${subStatus.scansUsed}/${subStatus.scansLimit} Used`}
              </span>
            </div>

            <div
              onDragEnter={(e) => handleDrag(e, 'image')}
              onDragOver={(e) => handleDrag(e, 'image')}
              onDragLeave={(e) => handleDrag(e, 'image')}
              onDrop={(e) => handleDrop(e, 'image')}
              onClick={() => {
                if (!(subStatus.plan === 'free' && subStatus.scansLimit !== null && subStatus.scansUsed >= subStatus.scansLimit)) {
                  imageInputRef.current?.click();
                }
              }}
              className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-300 ${
                subStatus.plan === 'free' && subStatus.scansLimit !== null && subStatus.scansUsed >= subStatus.scansLimit ? 'opacity-50 cursor-not-allowed border-hairline bg-surface-300' :
                dragImage ? 'border-teal-500 bg-teal-500/5 shadow-[0_0_15px_rgba(20,184,166,0.05)]' :
                imageFile ? 'border-teal-500 bg-teal-500/5' : 'border-hairline bg-surface-100 hover:border-teal-500/20'
              }`}
            >
              <input
                ref={imageInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
                disabled={subStatus.plan === 'free' && subStatus.scansLimit !== null && subStatus.scansUsed >= subStatus.scansLimit}
                onChange={(e) => {
                  const f = e.target.files?.[0] || null;
                  setImageFile(f);
                }}
              />
              <div className="flex flex-col items-center justify-center gap-1">
                <Upload className={`h-6 w-6 mb-1 ${imageFile ? 'text-teal-500' : 'text-content-muted'}`} />
                <p className="text-xs font-semibold text-content-primary">
                  {imageFile ? imageFile.name : 'Drag & drop image here, or click to browse'}
                </p>
                <p className="text-[10px] text-content-secondary">
                  {imageFile ? `${(imageFile.size / 1024).toFixed(1)} KB` : 'Supports PNG, JPG, WEBP'}
                </p>
              </div>
            </div>

            {imageFile && (
              <div className="mt-3 flex justify-end">
                <button
                  onClick={handleUploadImageFreeOcr}
                  disabled={loading}
                  className="rounded-lg bg-teal-600 px-4 py-2 text-xs font-bold text-white hover:bg-teal-500 disabled:opacity-50 shadow-xs"
                >
                  Scan Image
                </button>
              </div>
            )}
          </div>

          {/* Section 3: PREMIUM TIER - Gemini Vision PDF OCR */}
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 transition-colors">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-surface-200 p-2 text-emerald-500 border border-hairline">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-content-primary">Premium Tier: PDF OCR</h3>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 uppercase flex items-center gap-1">
                      <Sparkles className="h-3 w-3" /> Gemini AI Engine
                    </span>
                  </div>
                  <p className="text-xs text-content-secondary">High-accuracy indexing for multi-page scanned PDFs</p>
                </div>
              </div>
            </div>

            <div
              onDragEnter={(e) => handleDrag(e, 'pdf')}
              onDragOver={(e) => handleDrag(e, 'pdf')}
              onDragLeave={(e) => handleDrag(e, 'pdf')}
              onDrop={(e) => handleDrop(e, 'pdf')}
              onClick={() => {
                if (subStatus.plan !== 'free') pdfInputRef.current?.click();
              }}
              className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-300 ${
                subStatus.plan === 'free' ? 'opacity-50 cursor-not-allowed border-hairline bg-surface-300' :
                dragPdf ? 'border-emerald-500 bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.05)]' :
                pdfFile ? 'border-emerald-500 bg-emerald-500/5' : 'border-hairline bg-surface-100 hover:border-emerald-500/20'
              }`}
            >
              <input
                ref={pdfInputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                disabled={subStatus.plan === 'free'}
                onChange={(e) => {
                  const f = e.target.files?.[0] || null;
                  if (f && f.size > 10 * 1024 * 1024) {
                    toast('error', 'File too large', `PDF file is ${(f.size / 1024 / 1024).toFixed(0)}MB. Max is 10MB.`);
                    e.target.value = '';
                    return;
                  }
                  setPdfFile(f);
                }}
              />
              <div className="flex flex-col items-center justify-center gap-1">
                <Upload className={`h-6 w-6 mb-1 ${pdfFile ? 'text-emerald-500' : 'text-content-muted'}`} />
                <p className="text-xs font-semibold text-content-primary">
                  {pdfFile ? pdfFile.name : 'Drag & drop PDF here, or click to browse'}
                </p>
                <p className="text-[10px] text-content-secondary">
                  {pdfFile ? `${(pdfFile.size / 1024).toFixed(1)} KB` : 'Maximum file size: 10MB'}
                </p>
              </div>
            </div>

            {pdfFile && (
              <div className="mt-3 flex justify-end">
                <button
                  onClick={handleUploadPdf}
                  disabled={loading}
                  className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-bold text-[#010102] hover:bg-emerald-400 disabled:opacity-50 shadow-xs"
                >
                  Store PDF
                </button>
              </div>
            )}
          </div>

          {/* Feedback Messages */}
          {loading && (
            <div className="flex items-center gap-3 rounded-lg bg-surface-200 p-3 text-xs text-content-primary border border-hairline">
              <Loader2 className="h-4 w-4 animate-spin text-emerald-500 shrink-0" />
              <span className="font-medium">{statusMsg || 'Processing...'}</span>
            </div>
          )}

          {statusMsg && !loading && !errorMsg && (
            <div className="flex items-center gap-3 rounded-lg bg-emerald-900/20 p-3 text-xs text-emerald-300 border border-emerald-800/50">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span className="font-medium">{statusMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="flex items-center gap-3 rounded-lg bg-rose-900/20 p-3 text-xs text-rose-300 border border-rose-800/50">
              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
              <span className="font-medium">{errorMsg}</span>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end border-t border-hairline pt-4">
          <button
            onClick={onClose}
            className="rounded-lg bg-surface-200 px-4 py-2 text-sm font-semibold text-content-primary hover:bg-surface-300 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
    </>
  );
}
