'use client';

import React from 'react';
import { X, BookOpen, Sparkles, FileSpreadsheet, FileText, Cpu, CheckCircle2, ShieldCheck, Database, Zap } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GuideModal({ isOpen, onClose }: GuideModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl max-h-[90vh] flex flex-col transition-colors duration-300">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">InvestorIQ — System Guide & Architecture</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">How the AI-powered Contact Intelligence & Dedup Studio works under the hood</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300 transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="mt-6 space-y-6 overflow-y-auto pr-2 flex-1 text-slate-700 dark:text-slate-300">
          
          {/* Section 1: 3-Step Demo Workflow */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
              Demo Workflow (Step-by-Step)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/60 dark:bg-emerald-900/20 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white text-xs font-bold">1</div>
                  <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-400">Upload Sources</h4>
                </div>
                <p className="text-xs text-emerald-800 dark:text-emerald-300/80 leading-relaxed">
                  Import your working contact spreadsheet (.xlsx) and the original source-of-truth PDF document.
                </p>
              </div>

              <div className="rounded-xl border border-indigo-200 dark:border-indigo-800/50 bg-indigo-50/60 dark:bg-indigo-900/20 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white text-xs font-bold">2</div>
                  <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-400">AI OCR & Dedup</h4>
                </div>
                <p className="text-xs text-indigo-800 dark:text-indigo-300/80 leading-relaxed">
                  <strong>Gemini 2.0 Flash Vision OCR</strong> indexes the document pages, while the fuzzy-matching engine cross-references names and emails to flag duplicates.
                </p>
              </div>

              <div className="rounded-xl border border-amber-200 dark:border-amber-800/50 bg-amber-50/60 dark:bg-amber-900/20 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-600 text-white text-xs font-bold">3</div>
                  <h4 className="text-sm font-bold text-amber-900 dark:text-amber-400">Verify & Export</h4>
                </div>
                <p className="text-xs text-amber-800 dark:text-amber-300/80 leading-relaxed">
                  Review flagged contacts side-by-side with the original PDF snippets, confirm active roles, and export a clean, validated .xlsx file.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Technical Highlights / Architecture */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-2">
              <Cpu className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              Technical Stack & Key Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4 space-y-2">
                <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-bold text-sm">
                  <Database className="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
                  MongoDB Multi-Tenant Isolation
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Data is compartmentalized per session via client-generated workspace IDs (x-workspace-id), ensuring zero cross-tenant data leakage.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4 space-y-2">
                <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-bold text-sm">
                  <Zap className="h-4 w-4 text-amber-600 dark:text-amber-500" />
                  Hash-Bucket Deduplication Engine
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Uses exact-email hash indexing, exact-name clustering, and the Levenshtein string-distance algorithm (string-similarity) for O(N) speed.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4 space-y-2">
                <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-bold text-sm">
                  <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-500" />
                  Secure Backend Environment
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Processes extractions securely using backend environment variables, without ever exposing API keys to client devices.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4 space-y-2">
                <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-bold text-sm">
                  <FileSpreadsheet className="h-4 w-4 text-purple-600 dark:text-purple-500" />
                  Native Excel Generation with Metadata
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Exports clean Excel workbooks using ExcelJS, complete with color-coded rows, auto-filters, clickable domain links, and embedded cell comments.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Status Legend */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">Contact Status Legend</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 font-medium">
                <span className="font-bold text-slate-900 dark:text-slate-100 block mb-1">Unreviewed</span>
                Initial raw state, imported from Excel.
              </div>
              <div className="p-3 rounded-lg border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-900/20 text-amber-900 dark:text-amber-300 font-medium">
                <span className="font-bold text-amber-700 dark:text-amber-400 block mb-1">Yellow Flagged</span>
                Discrepancy found between Excel and PDF OCR.
              </div>
              <div className="p-3 rounded-lg border border-rose-200 dark:border-rose-800/50 bg-rose-50 dark:bg-rose-900/20 text-rose-900 dark:text-rose-300 font-medium">
                <span className="font-bold text-rose-700 dark:text-rose-400 block mb-1">Red Flagged</span>
                Critical missing email or invalid data.
              </div>
              <div className="p-3 rounded-lg border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-900 dark:text-emerald-300 font-medium">
                <span className="font-bold text-emerald-700 dark:text-emerald-400 block mb-1">Green Resolved</span>
                Manually verified and ready for export.
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end border-t border-slate-100 dark:border-slate-800 pt-4">
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-900 dark:bg-white px-5 py-2 text-sm font-semibold text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 transition shadow-sm"
          >
            Got it, return to app
          </button>
        </div>
      </div>
    </div>
  );
}
