'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Trash2, X, FileSpreadsheet, Image as ImageIcon, Loader2, Database, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';
import { getWorkspaceId } from '@/lib/workspace';

interface SourceItem {
  fileName: string;
  count: number;
  lastUpload: string;
}

interface SourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshContacts: () => void;
}

export default function SourcesModal({ isOpen, onClose, onRefreshContacts }: SourcesModalProps) {
  const { toast, confirm } = useToast();
  const [sources, setSources] = useState<SourceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingFile, setDeletingFile] = useState<string | null>(null);

  const fetchSources = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/sources', {
        headers: { 'x-workspace-id': getWorkspaceId() },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load uploaded sources');
      setSources(data.sources || []);
    } catch (err: any) {
      toast('error', 'Sources Error', err.message);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (isOpen) {
      fetchSources();
    }
  }, [isOpen, fetchSources]);

  const handleDeleteSource = (fileName: string) => {
    confirm(`Are you sure you want to delete "${fileName}"? This will PERMANENTLY REMOVE all extracted contacts from this file from your database.`, async () => {
      setDeletingFile(fileName);
      try {
        const res = await fetch(`/api/sources?fileName=${encodeURIComponent(fileName)}`, {
          method: 'DELETE',
          headers: { 'x-workspace-id': getWorkspaceId() },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to delete source file');

        toast('success', 'Source Deleted', data.message);
        fetchSources();
        onRefreshContacts();
      } catch (err: any) {
        toast('error', 'Delete Failed', err.message);
      } finally {
        setDeletingFile(null);
      }
    });
  };

  const getFileIcon = (fileName: string) => {
    const lower = fileName.toLowerCase();
    if (lower.endsWith('.pdf')) {
      return <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />;
    } else if (lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.webp')) {
      return <ImageIcon className="h-5 w-5 text-teal-600 dark:text-teal-400" />;
    }
    return <FileSpreadsheet className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl transition-colors max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Uploaded Sources Library
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Manage your imported Excel workbooks, PDF booklets, and image cards
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600 dark:text-emerald-400 mb-2" />
              <p className="text-xs font-semibold">Loading uploaded source files...</p>
            </div>
          ) : sources.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/50">
              <AlertCircle className="h-10 w-10 text-slate-300 dark:text-slate-600 mb-3" />
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No Uploaded Sources Found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Upload your Excel files, PDFs, or Image cards to track and manage source lineage here.
              </p>
            </div>
          ) : (
            sources.map((src) => (
              <div
                key={src.fileName}
                className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-4 transition hover:bg-slate-100/60 dark:hover:bg-slate-800/80"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xs shrink-0">
                    {getFileIcon(src.fileName)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {src.fileName}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200/50 dark:border-emerald-800/50">
                        {src.count} Contact{src.count === 1 ? '' : 's'} Extracted
                      </span>
                      <span>•</span>
                      <span>{new Date(src.lastUpload).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteSource(src.fileName)}
                  disabled={deletingFile === src.fileName}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 px-3 py-1.5 text-xs font-semibold text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition disabled:opacity-50 shrink-0"
                  title="Delete this file and all its extracted contacts"
                >
                  {deletingFile === src.fileName ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                  <span>Delete Source</span>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex items-center justify-between">
          <p className="text-[11px] text-slate-400">
            💡 Deleting a source automatically cascades and purges its extracted records from your workspace.
          </p>
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-900 dark:bg-white px-4 py-2 text-xs font-bold text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
