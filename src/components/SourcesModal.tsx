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
      return <FileText className="h-5 w-5 text-emerald-500" />;
    } else if (lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.webp')) {
      return <ImageIcon className="h-5 w-5 text-emerald-500" />;
    }
    return <FileSpreadsheet className="h-5 w-5 text-emerald-500" />;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-hairline bg-surface-100 p-6 shadow-2xl transition-colors max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-hairline pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-200 text-content-secondary border border-hairline">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-content-primary tracking-tight">
                Uploaded Sources Library
              </h2>
              <p className="text-xs text-content-secondary font-medium">
                Manage your imported Excel workbooks, PDF booklets, and image cards
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1 text-content-secondary hover:bg-surface-200 hover:text-content-primary transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-content-muted">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-500 mb-2" />
              <p className="text-xs font-semibold">Loading uploaded source files...</p>
            </div>
          ) : sources.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-hairline rounded-xl bg-surface-200">
              <AlertCircle className="h-10 w-10 text-content-muted mb-3" />
              <h3 className="text-sm font-bold text-content-primary">No Uploaded Sources Found</h3>
              <p className="text-xs text-content-secondary mt-1 max-w-sm">
                Upload your Excel files, PDFs, or Image cards to track and manage source lineage here.
              </p>
            </div>
          ) : (
            sources.map((src) => (
              <div
                key={src.fileName}
                className="flex items-center justify-between rounded-xl border border-hairline bg-surface-200 p-4 transition hover:bg-surface-300"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-100 border border-hairline shadow-xs shrink-0">
                    {getFileIcon(src.fileName)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-content-primary truncate">
                      {src.fileName}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-content-secondary mt-0.5">
                      <span className="font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-transparent">
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
                  className="inline-flex items-center gap-1.5 rounded-lg border border-hairline bg-surface-100 px-3 py-1.5 text-xs font-semibold text-rose-500 hover:bg-surface-300 transition disabled:opacity-50 shrink-0"
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
        <div className="border-t border-hairline pt-4 flex items-center justify-between">
          <p className="text-[11px] text-content-muted">
            💡 Deleting a source automatically cascades and purges its extracted records from your workspace.
          </p>
          <button
            onClick={onClose}
            className="rounded-lg bg-surface-200 border border-hairline px-4 py-2 text-xs font-medium text-content-primary hover:bg-surface-300 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
