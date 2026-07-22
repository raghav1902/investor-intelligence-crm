'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Users, 
  Database, 
  BookOpen, 
  Trash2, 
  Moon, 
  Sun, 
  Laptop, 
  X, 
  ShieldCheck,
  ChevronRight,
  FolderOpen
} from 'lucide-react';
import { useTheme } from 'next-themes';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenGuide: () => void;
  onOpenSources: () => void;
  onLoadDemoData: () => void;
  onClearData: () => void;
  totalContacts: number;
}

export default function Sidebar({
  isOpen,
  onClose,
  onOpenGuide,
  onOpenSources,
  onLoadDemoData,
  onClearData,
  totalContacts,
}: SidebarProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-white dark:bg-slate-900 transition-all duration-300 ease-in-out md:static shrink-0 ${
          isOpen
            ? 'w-64 translate-x-0 border-r border-slate-200 dark:border-slate-800 opacity-100'
            : 'w-0 -translate-x-full md:translate-x-0 md:opacity-0 overflow-hidden border-none pointer-events-none'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-100 dark:border-slate-800 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-md shadow-emerald-500/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                InvestorIQ
              </span>
              <span className="ml-1.5 rounded bg-emerald-100 dark:bg-emerald-900/50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                CRM
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition"
            title="Close / Collapse Sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Main Navigation Links */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div>
            <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Workspace Views
            </div>
            <nav className="space-y-1">
              <button
                className="w-full flex items-center justify-between rounded-xl bg-emerald-50 dark:bg-emerald-950/40 px-3.5 py-2.5 text-xs font-bold text-emerald-900 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40 transition"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Contacts Directory</span>
                </div>
                <span className="rounded-full bg-emerald-600 text-white px-2 py-0.5 text-[10px] font-bold">
                  {totalContacts}
                </span>
              </button>
            </nav>
          </div>

          {/* Quick Utility Tools */}
          <div>
            <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Data Management
            </div>
            <div className="space-y-1">
              <button
                onClick={onOpenSources}
                className="w-full flex items-center gap-2.5 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition"
              >
                <FolderOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span>Uploaded Sources Library</span>
              </button>

              <button
                onClick={onLoadDemoData}
                className="w-full flex items-center gap-2.5 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition"
              >
                <Database className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>Load Sample Data</span>
              </button>

              <button
                onClick={onOpenGuide}
                className="w-full flex items-center gap-2.5 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition"
              >
                <BookOpen className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span>System Guide</span>
              </button>

              <button
                onClick={onClearData}
                className="w-full flex items-center gap-2.5 rounded-xl px-3.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
              >
                <Trash2 className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                <span>Clear Workspace</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Settings & Theme Switcher */}
        <div className="border-t border-slate-100 dark:border-slate-800 p-4 space-y-3">
          {/* Theme Selector Pill */}
          {mounted && (
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setTheme('light')}
                className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-bold transition ${
                  theme === 'light'
                    ? 'bg-white text-amber-600 shadow-xs'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                <Sun className="h-3.5 w-3.5" />
                <span>Light</span>
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-bold transition ${
                  theme === 'dark'
                    ? 'bg-slate-700 text-indigo-400 shadow-xs'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                <Moon className="h-3.5 w-3.5" />
                <span>Dark</span>
              </button>
              <button
                onClick={() => setTheme('system')}
                className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-bold transition ${
                  theme === 'system'
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                <Laptop className="h-3.5 w-3.5" />
                <span>System</span>
              </button>
            </div>
          )}

          {/* System Status Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-[11px] text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-800">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="truncate font-medium">Multi-tenant Isolation</span>
          </div>
        </div>
      </aside>
    </>
  );
}
