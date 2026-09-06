'use client';

import React, { useRef } from 'react';
import { Upload, FileText, Sparkles } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';

interface PdfUploadSectionProps {
  pdfFile: File | null;
  setPdfFile: (f: File | null) => void;
  loading: boolean;
  subPlan: string;
  onUpload: () => void;
}

export default function PdfUploadSection({
  pdfFile,
  setPdfFile,
  loading,
  subPlan,
  onUpload,
}: PdfUploadSectionProps) {
  const { toast } = useToast();
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const [dragPdf, setDragPdf] = React.useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragPdf(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
  };

  return (
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
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrop}
        onDrop={handleDrop}
        onClick={() => {
          if (subPlan !== 'free') pdfInputRef.current?.click();
        }}
        className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-300 ${
          subPlan === 'free'
            ? 'opacity-50 cursor-not-allowed border-hairline bg-surface-300'
            : dragPdf
            ? 'border-emerald-500 bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.05)]'
            : pdfFile
            ? 'border-emerald-500 bg-emerald-500/5'
            : 'border-hairline bg-surface-100 hover:border-emerald-500/20'
        }`}
      >
        <input
          ref={pdfInputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          disabled={subPlan === 'free'}
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
            onClick={onUpload}
            disabled={loading}
            className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-bold text-[#010102] hover:bg-emerald-400 disabled:opacity-50 shadow-xs"
          >
            Store PDF
          </button>
        </div>
      )}
    </div>
  );
}
