'use client';

import React, { useState } from 'react';
import { X, Upload, FileSpreadsheet, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UploadModal({ isOpen, onClose, onSuccess }: UploadModalProps) {
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to upload Excel');
      setStatusMsg(`✅ ${data.message}`);
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadPdf = async () => {
    if (!pdfFile) return;
    setLoading(true);
    setStatusMsg('Storing source PDF for visual reference...');
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append('file', pdfFile);

      const res = await fetch('/api/upload/pdf', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to upload PDF');
      setStatusMsg(`✅ ${data.message}`);
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRunMatch = async () => {
    setLoading(true);
    setStatusMsg('Running auto-clean (OCR artifact detection) and deduplication...');
    setErrorMsg(null);

    try {
      const res = await fetch('/api/match', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to run match');
      setStatusMsg(`✅ ${data.message}`);
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Upload className="h-5 w-5 text-emerald-600" />
            Upload Source Documents
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 space-y-6">
          {/* Excel Upload Section */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-100 p-2 text-emerald-700 border border-emerald-200">
                <FileSpreadsheet className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-slate-900">1. Working Excel (.xlsx)</h3>
                <p className="text-xs text-slate-500">Upload Gosai_Investor_Contacts.xlsx (10k+ records)</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <input
                type="file"
                accept=".xlsx"
                onChange={(e) => setExcelFile(e.target.files?.[0] || null)}
                className="block w-full text-xs text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-200 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-slate-700 hover:file:bg-slate-300"
              />
              <button
                onClick={handleUploadExcel}
                disabled={!excelFile || loading}
                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-50 whitespace-nowrap shadow-xs"
              >
                Import Excel
              </button>
            </div>
          </div>

          {/* PDF Upload Section */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2 text-blue-700 border border-blue-200">
                <FileText className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-slate-900">2. Source of Truth PDF</h3>
                <p className="text-xs text-slate-500">Upload original scanned PDF for visual comparison</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                className="block w-full text-xs text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-200 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-slate-700 hover:file:bg-slate-300"
              />
              <button
                onClick={handleUploadPdf}
                disabled={!pdfFile || loading}
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-50 whitespace-nowrap shadow-xs"
              >
                Store PDF
              </button>
            </div>
          </div>

          {/* Re-run Match Button */}
          <div className="pt-2">
            <button
              onClick={handleRunMatch}
              disabled={loading}
              className="w-full rounded-xl border border-slate-300 bg-slate-900 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition shadow-sm"
            >
              ⚡ Run Auto-Clean & Dedup Engine
            </button>
          </div>

          {/* Feedback Messages */}
          {loading && (
            <div className="flex items-center gap-3 rounded-lg bg-blue-50 p-3 text-xs text-blue-800 border border-blue-200">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              <span className="font-medium">{statusMsg || 'Processing...'}</span>
            </div>
          )}

          {statusMsg && !loading && !errorMsg && (
            <div className="flex items-center gap-3 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800 border border-emerald-200">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span className="font-medium">{statusMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="flex items-center gap-3 rounded-lg bg-rose-50 p-3 text-xs text-rose-800 border border-rose-200">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
              <span className="font-medium">{errorMsg}</span>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end border-t border-slate-100 pt-4">
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
