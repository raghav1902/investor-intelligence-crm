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
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-surface-base transition-all duration-300 ease-in-out md:static shrink-0 ${
          isOpen
            ? 'w-64 translate-x-0 border-r border-hairline opacity-100'
            : 'w-0 -translate-x-full md:translate-x-0 md:opacity-0 overflow-hidden border-none pointer-events-none'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-hairline px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-200 border border-hairline">
              <Sparkles className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <span className="text-base font-extrabold text-content-primary tracking-tight">
                InvestorIQ
              </span>
              <span className="ml-1.5 rounded bg-surface-200 px-1.5 py-0.5 text-[10px] font-bold text-content-secondary border border-hairline">
                CRM
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-content-secondary hover:bg-surface-200 hover:text-content-primary transition"
            title="Close / Collapse Sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Main Navigation Links */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div>
            <div className="px-3 mb-2 text-[11px] font-medium uppercase tracking-widest text-content-muted">
              Workspace Views
            </div>
            <nav className="space-y-1">
              <button
                className="w-full flex items-center justify-between rounded-lg bg-surface-200 px-3.5 py-2.5 text-xs font-medium text-content-primary border-l-[3px] border-emerald-500 transition-colors duration-200"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="h-4 w-4 text-emerald-500" />
                  <span>Contacts Directory</span>
                </div>
                <span className="rounded bg-surface-300 text-content-secondary px-1.5 py-0.5 text-[10px] font-medium border border-hairline">
                  {totalContacts}
                </span>
              </button>
            </nav>
          </div>

          {/* Quick Utility Tools */}
          <div>
            <div className="px-3 mb-2 text-[11px] font-medium uppercase tracking-widest text-content-muted">
              Data Management
            </div>
            <div className="space-y-1">
              <button
                onClick={onOpenSources}
                className="w-full flex items-center gap-2.5 rounded-lg px-3.5 py-2 text-xs font-medium text-content-secondary hover:bg-surface-200 hover:text-content-primary transition-colors duration-200"
              >
                <FolderOpen className="h-4 w-4 shrink-0" />
                <span>Uploaded Sources Library</span>
              </button>

              <button
                onClick={onLoadDemoData}
                className="w-full flex items-center gap-2.5 rounded-lg px-3.5 py-2 text-xs font-medium text-content-secondary hover:bg-surface-200 hover:text-content-primary transition-colors duration-200"
              >
                <Database className="h-4 w-4 shrink-0" />
                <span>Load Sample Data</span>
              </button>

              <button
                onClick={onOpenGuide}
                className="w-full flex items-center gap-2.5 rounded-lg px-3.5 py-2 text-xs font-medium text-content-secondary hover:bg-surface-200 hover:text-content-primary transition-colors duration-200"
              >
                <BookOpen className="h-4 w-4 shrink-0" />
                <span>System Guide</span>
              </button>

              <button
                onClick={onClearData}
                className="w-full flex items-center gap-2.5 rounded-lg px-3.5 py-2 text-xs font-medium text-content-secondary hover:bg-surface-200 hover:text-content-primary transition-colors duration-200"
              >
                <Trash2 className="h-4 w-4 shrink-0" />
                <span>Clear Workspace</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Settings & Theme Switcher */}
        <div className="border-t border-hairline p-4 space-y-3">
          {/* System Status Pill */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-100 text-[11px] text-content-secondary border border-hairline">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            <span className="truncate font-medium">Multi-tenant Isolation</span>
          </div>
        </div>
      </aside>
    </>
  );
}
