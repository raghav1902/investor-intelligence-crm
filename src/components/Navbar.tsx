'use client';

import React from 'react';
import { Upload, Download, RefreshCw, Sparkles } from 'lucide-react';

interface NavbarProps {
  onOpenUpload: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export default function Navbar({ onOpenUpload, onRefresh, isRefreshing }: NavbarProps) {
  const handleExport = () => {
    window.location.href = '/api/export';
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md shadow-xs">
      <div className="mx-auto flex h-16 w-full max-w-[99%] items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-md shadow-emerald-500/20">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Antigravity <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">Review Tool</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium">Investor Contact List OCR Cleaner & Dedup Studio</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition disabled:opacity-50 shadow-xs"
            title="Refresh Data"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={onOpenUpload}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 transition border border-slate-800"
          >
            <Upload className="h-4 w-4 text-emerald-400" />
            <span>Upload Sources</span>
          </button>

          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-emerald-600/20 hover:from-emerald-500 hover:to-teal-500 transition"
          >
            <Download className="h-4 w-4" />
            <span>Export Clean .xlsx</span>
          </button>
        </div>
      </div>
    </header>
  );
}
