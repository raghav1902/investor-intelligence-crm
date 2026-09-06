'use client';

import React, { useRef } from 'react';
import { Upload, FileSpreadsheet } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';

interface ExcelUploadSectionProps {
  excelFile: File | null;
  setExcelFile: (f: File | null) => void;
  loading: boolean;
  subPlan: string;
  onUpload: () => void;
}

export default function ExcelUploadSection({
  excelFile,
  setExcelFile,
  loading,
  subPlan,
  onUpload,
}: ExcelUploadSectionProps) {
  const { toast } = useToast();
  const excelInputRef = useRef<HTMLInputElement>(null);
  const [dragExcel, setDragExcel] = React.useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragExcel(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
  };

  return (
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
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => {
          if (subPlan !== 'free') excelInputRef.current?.click();
        }}
        className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-300 ${
          subPlan === 'free' ? 'opacity-50 cursor-not-allowed border-hairline bg-surface-300' :
          dragExcel ? 'border-emerald-500 bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.05)]' :
          excelFile ? 'border-emerald-500 bg-emerald-500/5' : 'border-hairline bg-surface-100 hover:border-emerald-500/20'
        }`}
      >
        <input
          ref={excelInputRef}
          type="file"
          accept=".xlsx"
          className="hidden"
          disabled={subPlan === 'free'}
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
            onClick={onUpload}
            disabled={loading}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 disabled:opacity-50 shadow-xs"
          >
            Import Excel
          </button>
        </div>
      )}
    </div>
  );
}
