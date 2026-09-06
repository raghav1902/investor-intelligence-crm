import React from 'react';
import { FileText, Sparkles } from 'lucide-react';
import { getWorkspaceId } from '@/lib/workspace';

interface DirectPdfBannerProps {
  statsTotal: number;
  isExtracting: boolean;
  setIsExtracting: (val: boolean) => void;
  setLoading: (val: boolean) => void;
  toast: (type: 'success' | 'error' | 'info', title: string, desc?: string) => void;
  confirm: (msg: string, onConfirm: () => void) => void;
  setActiveFilter: (val: string) => void;
  setSectorFilter: (val: string) => void;
  setSearchQuery: (val: string) => void;
  setIsDuplicateFilter: (val: boolean) => void;
  setContacts: (val: any[]) => void;
  setStats: (val: any) => void;
  setPagination: (val: any) => void;
  stats: any;
  pagination: any;
}

export default function DirectPdfBanner({
  statsTotal,
  isExtracting,
  setIsExtracting,
  setLoading,
  toast,
  confirm,
  setActiveFilter,
  setSectorFilter,
  setSearchQuery,
  setIsDuplicateFilter,
  setContacts,
  setStats,
  setPagination,
  stats,
  pagination
}: DirectPdfBannerProps) {
  if (statsTotal !== 0) return null;

  return (
    <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-lg border-l-[3px] border-l-emerald-500 bg-surface-100 border border-hairline p-4 transition-all duration-300">
      <div>
        <h3 className="text-sm font-medium text-content-primary flex items-center gap-2">
          <FileText className="h-4 w-4 text-emerald-500" />
          Alternative Workflow: Direct PDF Extraction
        </h3>
        <p className="text-xs text-[#8a8f98] mt-1">
          Skip the Excel upload. Select your Source PDF, and Gemini Vision OCR will extract Name, Company, and Email directly into this dashboard.
        </p>
      </div>
      <div className="shrink-0">
        <input
          type="file"
          id="directPdfUpload"
          accept=".pdf"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            if (file.size > 50 * 1024 * 1024) {
              toast('error', 'File too large', `PDF is ${(file.size / 1024 / 1024).toFixed(0)}MB. Max is 50MB.`);
              e.target.value = '';
              return;
            }

            confirm(
              'This will clear all current contacts and replace them with data extracted directly from this PDF.',
              async () => {
                setLoading(true);
                setIsExtracting(true);
                try {
                  const formData = new FormData();
                  formData.append('file', file);
                  
                  const apiKey = localStorage.getItem('geminiApiKey') || '';
                  const headers: any = { 'x-workspace-id': getWorkspaceId() };
                  if (apiKey) headers['x-gemini-api-key'] = apiKey;

                  const uploadRes = await fetch('/api/upload/pdf', {
                    method: 'POST',
                    headers,
                    body: formData,
                  });
                  const uploadData = await uploadRes.json();
                  
                  if (!uploadRes.ok) {
                    toast('error', 'Upload Failed', uploadData.error || 'Failed to upload PDF.');
                    return;
                  }

                  const extractRes = await fetch('/api/pdf/extract', { 
                    method: 'POST',
                    headers: { 'x-workspace-id': getWorkspaceId() }
                  });
                  const extractData = await extractRes.json();
                  
                  if (extractRes.ok) {
                    toast('success', `Extracted ${extractData.count} contacts`, 'Contacts imported directly from PDF.');
                    setActiveFilter('ALL');
                    setSectorFilter('ALL');
                    setSearchQuery('');
                    setIsDuplicateFilter(false);
                    const fetchRes = await fetch('/api/contacts?page=1&limit=50&status=ALL&sector=ALL', {
                      headers: { 'x-workspace-id': getWorkspaceId() },
                    });
                    const fetchData = await fetchRes.json();
                    if (fetchRes.ok) {
                      setContacts(fetchData.contacts || []);
                      setStats(fetchData.stats || stats);
                      setPagination(fetchData.pagination || pagination);
                    }
                  } else {
                    toast('error', 'Extraction Failed', extractData.error || 'Extraction failed.');
                  }
                } catch (err) {
                  toast('error', 'Unexpected Error', 'Something went wrong during direct extraction.');
                } finally {
                  setLoading(false);
                  setIsExtracting(false);
                  e.target.value = '';
                }
              }
            );
          }}
        />
        <label
          htmlFor="directPdfUpload"
          className={`whitespace-nowrap cursor-pointer inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-medium text-[#010102] hover:bg-emerald-400 transition-colors ${isExtracting ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <Sparkles className="h-4 w-4" />
          <span>{isExtracting ? 'Processing PDF...' : 'Select PDF & Extract'}</span>
        </label>
      </div>
    </div>
  );
}
