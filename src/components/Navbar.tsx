'use client';

import React, { useState } from 'react';
import { Upload, Download, RefreshCw, Loader2, Zap, Menu } from 'lucide-react';

interface NavbarProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onOpenUpload: () => void;
  onRefresh: () => void;
  onRunMatch: () => void;
  isRefreshing: boolean;
  isMatching: boolean;
}

export default function Navbar({
  isSidebarOpen,
  onToggleSidebar,
  onOpenUpload,
  onRefresh,
  onRunMatch,
  isRefreshing,
  isMatching,
}: NavbarProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    const workspaceId = localStorage.getItem('workspaceId') || '';
    if (!workspaceId) {
      alert('No workspace found. Please refresh the page and try again.');
      return;
    }
    setIsExporting(true);
    setTimeout(() => setIsExporting(false), 3000);
    window.location.href = `/api/export?workspaceId=${encodeURIComponent(workspaceId)}`;
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-xs transition-colors duration-300">
      <div className="mx-auto flex h-16 w-full max-w-[99%] items-center justify-between px-4 sm:px-6">
        {/* Left Section: Menu Toggle & Title */}
        <div className="flex items-center gap-3 min-w-0">
          {!isSidebarOpen && (
            <button
              onClick={onToggleSidebar}
              className="rounded-lg p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition border border-slate-200 dark:border-slate-700 shadow-xs shrink-0"
              title="Expand Left Sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}

          <button
            onClick={onToggleSidebar}
            className="rounded-lg p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition border border-slate-200 dark:border-slate-700 shadow-xs md:hidden shrink-0"
            title="Toggle Menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight truncate flex items-center gap-2">
              Investor Contacts Directory
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:block truncate">
              AI-powered OCR verification &amp; deduplication engine
            </p>
          </div>
        </div>

        {/* Right Section: Primary Actions */}
        <div className="flex items-center gap-2">
          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition disabled:opacity-60 shadow-xs"
            title="Refresh Data"
          >
            <RefreshCw className={`h-4 w-4 transition-transform ${isRefreshing ? 'animate-spin text-emerald-600 dark:text-emerald-400' : ''}`} />
          </button>

          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>

          {/* ⚡ Run Dedup Button */}
          <button
            onClick={onRunMatch}
            disabled={isMatching}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 px-3.5 py-2 text-xs sm:text-sm font-bold text-white shadow-md shadow-purple-600/25 hover:shadow-purple-600/40 hover:opacity-95 active:scale-95 transition-all disabled:opacity-50 border border-purple-400/30"
            title="Run Auto-Clean & Deduplication Engine on Database"
          >
            {isMatching ? (
              <Loader2 className="h-4 w-4 animate-spin text-white" />
            ) : (
              <Zap className="h-4 w-4 text-amber-300 fill-amber-300" />
            )}
            <span className="hidden sm:inline">{isMatching ? 'Processing Engine...' : 'Run Dedup Engine'}</span>
          </button>

          {/* Upload Button */}
          <button
            onClick={onOpenUpload}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 dark:bg-white px-3 py-2 text-xs sm:text-sm font-medium text-white dark:text-slate-900 shadow-xs hover:bg-slate-800 dark:hover:bg-slate-100 transition border border-slate-800 dark:border-white"
          >
            <Upload className="h-4 w-4 text-emerald-400 dark:text-emerald-600" />
            <span className="hidden sm:inline">Upload</span>
          </button>

          {/* Export Button */}
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white shadow-md shadow-emerald-600/20 hover:from-emerald-500 hover:to-teal-500 transition disabled:opacity-70"
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">{isExporting ? 'Exporting...' : 'Export'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
