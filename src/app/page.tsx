'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import StatsBar from '@/components/StatsBar';
import UploadModal from '@/components/UploadModal';
import ReviewModal from '@/components/ReviewModal';
import DedupModal from '@/components/DedupModal';
import GuideModal from '@/components/GuideModal';
import SourcesModal from '@/components/SourcesModal';
import { useToast } from '@/components/ToastProvider';
import { Search, Filter, Check, AlertTriangle, AlertCircle, Copy, ChevronLeft, ChevronRight, HelpCircle, Eye, FileText, Sparkles, Database, CheckSquare, Square, Trash2, CheckCircle2, Zap, Loader2 } from 'lucide-react';
import { getWorkspaceId } from '@/lib/workspace';

export default function Home() {
  const { toast, confirm } = useToast();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [contacts, setContacts] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    unreviewed: 0,
    yellow: 0,
    red: 0,
    green: 0,
    duplicates: 0,
  });
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 1 });
  
  // Layout & Modals
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isSourcesOpen, setIsSourcesOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<any | null>(null);
  const [selectedDedup, setSelectedDedup] = useState<any | null>(null);

  // Filters
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [sectorFilter, setSectorFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDuplicateFilter, setIsDuplicateFilter] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isMatching, setIsMatching] = useState(false);

  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Bulk Actions Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        status: activeFilter,
        sector: sectorFilter,
        search: debouncedSearch,
      });

      if (isDuplicateFilter) {
        params.set('isDuplicate', 'true');
      }

      const res = await fetch(`/api/contacts?${params.toString()}`, {
        headers: { 'x-workspace-id': getWorkspaceId() },
      });
      const data = await res.json();

      if (res.ok) {
        setContacts(data.contacts || []);
        setStats(data.stats || stats);
        setPagination(data.pagination || pagination);
        setSelectedIds(new Set()); // Reset selections on refetch
      }
    } catch (err) {
      console.error('Error fetching contacts:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, activeFilter, sectorFilter, debouncedSearch, isDuplicateFilter]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPagination((p) => ({ ...p, page: 1 }));
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  // Keyboard Shortcuts: Ctrl+K or '/' focuses search; Esc closes modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.key === 'k') || (e.key === '/' && document.activeElement !== searchInputRef.current && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA')) {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'Escape') {
        setIsUploadOpen(false);
        setIsGuideOpen(false);
        setSelectedContact(null);
        setSelectedDedup(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleUpdateContact = (updated: any) => {
    setContacts((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
    fetchContacts();
  };

  // Seed Demo Data
  const handleLoadDemoData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/demo-data', {
        method: 'POST',
        headers: { 'x-workspace-id': getWorkspaceId() },
      });
      const data = await res.json();
      if (res.ok) {
        toast('success', 'Demo Data Loaded!', data.message);
        
        // Reset filter states
        setActiveFilter('ALL');
        setSectorFilter('ALL');
        setSearchQuery('');
        setIsDuplicateFilter(false);

        // Directly fetch and populate contacts immediately
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
        toast('error', 'Failed to Load Demo Data', data.error);
      }
    } catch (err: any) {
      toast('error', 'Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Clear Workspace Data
  const handleClearData = () => {
    confirm('Clear all contacts and PDF data for this workspace? This action will reset the app to zero records.', async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/contacts', {
          method: 'DELETE',
          headers: { 'x-workspace-id': getWorkspaceId() },
        });
        const data = await res.json();
        if (res.ok) {
          toast('success', 'Workspace Cleared', data.message);
          setContacts([]);
          setStats({ total: 0, unreviewed: 0, yellow: 0, red: 0, green: 0, duplicates: 0 });
          setPagination({ page: 1, limit: 50, total: 0, totalPages: 1 });
          setSelectedIds(new Set());
        } else {
          toast('error', 'Clear Failed', data.error);
        }
      } catch (err: any) {
        toast('error', 'Error', err.message);
      } finally {
        setLoading(false);
      }
    });
  };

  // Bulk Selection Logic
  const toggleSelectAll = () => {
    if (selectedIds.size === contacts.length && contacts.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(contacts.map((c) => c._id)));
    }
  };

  const toggleSelectOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Bulk Status Update
  const handleBulkStatusUpdate = async (status: string) => {
    if (selectedIds.size === 0) return;
    try {
      const promises = Array.from(selectedIds).map((id) =>
        fetch(`/api/contacts/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-workspace-id': getWorkspaceId(),
          },
          body: JSON.stringify({ status, reviewerComment: `Bulk verified as ${status}` }),
        })
      );
      await Promise.all(promises);
      toast('success', `Updated ${selectedIds.size} Records`, `Marked contacts as ${status.replace('FLAGGED_', '').replace('RESOLVED_', '')}.`);
      fetchContacts();
    } catch (err: any) {
      toast('error', 'Bulk Update Failed', err.message);
    }
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    confirm(`Delete ${selectedIds.size} selected contacts? This action cannot be undone.`, async () => {
      try {
        const promises = Array.from(selectedIds).map((id) =>
          fetch(`/api/contacts/${id}`, {
            method: 'DELETE',
            headers: { 'x-workspace-id': getWorkspaceId() },
          })
        );
        await Promise.all(promises);
        toast('success', `Deleted ${selectedIds.size} Records`, 'Selected contacts removed.');
        fetchContacts();
      } catch (err: any) {
        toast('error', 'Bulk Delete Failed', err.message);
      }
    });
  };

  // Run Dedup Engine
  const handleRunMatch = async () => {
    setIsMatching(true);
    try {
      const res = await fetch('/api/match', {
        method: 'POST',
        headers: { 'x-workspace-id': getWorkspaceId() },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to run deduplication');
      toast('success', 'Dedup Engine Complete', data.message);
      fetchContacts();
    } catch (err: any) {
      toast('error', 'Dedup Engine Failed', err.message);
    } finally {
      setIsMatching(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Left Navigation Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenSources={() => setIsSourcesOpen(true)}
        onLoadDemoData={handleLoadDemoData}
        onClearData={handleClearData}
        totalContacts={stats.total}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Top Header */}
        <Navbar
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          onOpenUpload={() => setIsUploadOpen(true)}
          onRefresh={fetchContacts}
          onRunMatch={handleRunMatch}
          isRefreshing={loading}
          isMatching={isMatching}
        />

        <main className="flex-1 mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 pb-24">
        
        {/* KPI Stats Bar */}
        <StatsBar
          stats={stats}
          activeFilter={activeFilter}
          onSelectFilter={(status) => {
            setIsDuplicateFilter(false);
            setActiveFilter(status);
            setPagination((p) => ({ ...p, page: 1 }));
          }}
          onSelectDuplicates={() => {
            setIsDuplicateFilter((prev) => !prev);
            setPagination((p) => ({ ...p, page: 1 }));
          }}
          isDuplicateFilter={isDuplicateFilter}
        />

        {/* Filter & Search Bar */}
        <div className="mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs transition-colors duration-300">
          <div className="flex flex-1 items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search by name, company, email, or title... (Press '/' to focus)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-9 pr-16 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium transition-colors"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-block rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-1.5 py-0.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 font-mono">
                ⌘K / /
              </kbd>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-500" />
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Sector:</span>
            </div>
            <select
              value={sectorFilter}
              onChange={(e) => {
                setSectorFilter(e.target.value);
                setPagination((p) => ({ ...p, page: 1 }));
              }}
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
            >
              <option value="ALL">All Sectors</option>
              <option value="ENERGY">⚡ Energy</option>
              <option value="POWER">🔋 Power</option>
              <option value="RENEWABLES">🌱 Renewables</option>
              <option value="INDUSTRIALS">🏭 Industrials</option>
              <option value="UNCONFIRMED">⏳ Unconfirmed</option>
            </select>
          </div>
        </div>

        {/* Alternative Workflow Banner — only show when no contacts loaded yet */}
        {stats.total === 0 && (
          <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-indigo-200 bg-indigo-50/50 p-4 shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-indigo-900 flex items-center gap-2">
                <FileText className="h-4 w-4 text-indigo-600" />
                Alternative Workflow: Direct PDF Extraction
              </h3>
              <p className="text-xs text-indigo-700 mt-0.5">
                Skip the Excel upload. Select your Source PDF, and Gemini Vision OCR will extract Name, Company, and Email directly into this dashboard.
              </p>
            </div>
            <div>
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
                        e.target.value = '';
                      }
                    }
                  );
                }}
              />
              <label
                htmlFor="directPdfUpload"
                className={`whitespace-nowrap cursor-pointer inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 transition shadow-md shadow-indigo-600/20 ${loading ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <Sparkles className="h-4 w-4" />
                <span>{loading ? 'Processing PDF...' : 'Select PDF & Extract'}</span>
              </label>
            </div>
          </div>
        )}

        {/* Data-Dense Contacts Table */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden transition-colors duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap min-w-[1000px]">
              <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-800/50 uppercase tracking-wider text-slate-600 dark:text-slate-400 font-bold transition-colors">
                <tr>
                  <th className="px-3 py-3.5 w-10 text-center">
                    <button onClick={toggleSelectAll} className="text-slate-500 hover:text-slate-900 transition">
                      {selectedIds.size > 0 && selectedIds.size === contacts.length ? (
                        <CheckSquare className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </button>
                  </th>
                  <th className="px-3 py-3.5 w-16">Row #</th>
                  <th className="px-4 py-3.5">First Name</th>
                  <th className="px-4 py-3.5">Last Name</th>
                  <th className="px-4 py-3.5">Full Name</th>
                  <th className="px-4 py-3.5">Company</th>
                  <th className="px-4 py-3.5">Email</th>
                  <th className="px-4 py-3.5">Email Domain</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Dedup / Notes</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={11} className="px-4 py-12 text-center text-slate-500 font-semibold">
                      Loading contacts from MongoDB...
                    </td>
                  </tr>
                ) : contacts.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-4 py-0 whitespace-normal">
                      <div className="flex flex-col items-center justify-center py-16 text-center whitespace-normal">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30">
                            <Sparkles className="h-7 w-7 text-white" />
                          </div>
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-1">Ready to import your investor list</h3>
                        <p className="text-sm text-slate-500 mb-8 max-w-md">
                          Upload your Excel workbook and source PDF, or load sample demo data for an instant demonstration.
                        </p>
                        
                        {/* Action buttons in empty state */}
                        <div className="flex items-center justify-center gap-3 mb-8">
                          <button
                            onClick={handleLoadDemoData}
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-500 transition"
                          >
                            <Database className="h-4 w-4" />
                            Load Sample Demo Data (16 Records)
                          </button>
                          <button
                            onClick={() => setIsUploadOpen(true)}
                            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-slate-800 transition"
                          >
                            <FileText className="h-4 w-4 text-emerald-400" />
                            Upload Your Own Files
                          </button>
                        </div>

                        {/* Step-by-step workflow */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl text-left mt-2">
                          <div className="rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/70 dark:bg-emerald-950/40 p-4 transition-colors">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white text-xs font-bold">1</span>
                              <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider">Upload Sources</span>
                            </div>
                            <p className="text-xs text-emerald-700 dark:text-emerald-400/90 leading-relaxed whitespace-normal break-words">Import your contact list (Excel) or scan source files (PDF / Images).</p>
                          </div>
                          <div className="rounded-xl border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50/70 dark:bg-indigo-950/40 p-4 transition-colors">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white text-xs font-bold">2</span>
                              <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider">OCR &amp; AI Match</span>
                            </div>
                            <p className="text-xs text-indigo-700 dark:text-indigo-400/90 leading-relaxed whitespace-normal break-words">Tesseract (Free Image) or Gemini Vision (Premium PDF) auto-flags duplicate clusters.</p>
                          </div>
                          <div className="rounded-xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/70 dark:bg-amber-950/40 p-4 transition-colors">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-600 text-white text-xs font-bold">3</span>
                              <span className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider">Review &amp; Export</span>
                            </div>
                            <p className="text-xs text-amber-700 dark:text-amber-400/90 leading-relaxed whitespace-normal break-words">Review flagged contacts and export clean formatted .xlsx workbooks.</p>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  contacts.map((contact) => {
                    const isChecked = selectedIds.has(contact._id);
                    return (
                      <tr
                        key={contact._id}
                        onClick={() => setSelectedContact(contact)}
                        className={`cursor-pointer transition group ${
                          isChecked ? 'bg-indigo-50/70 dark:bg-indigo-900/30 hover:bg-indigo-100/70 dark:hover:bg-indigo-900/50' :
                          contact.status === 'RESOLVED_GREEN' ? 'bg-emerald-50/60 dark:bg-emerald-900/20 hover:bg-emerald-50 dark:hover:bg-emerald-900/30' :
                          contact.status === 'FLAGGED_YELLOW' ? 'bg-amber-50/60 dark:bg-amber-900/20 hover:bg-amber-50 dark:hover:bg-amber-900/30' :
                          contact.status === 'FLAGGED_RED' ? 'bg-rose-50/60 dark:bg-rose-900/20 hover:bg-rose-50 dark:hover:bg-rose-900/30' :
                          'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        <td className="px-3 py-3 text-center">
                          <button
                            onClick={(e) => toggleSelectOne(contact._id, e)}
                            className="text-slate-400 hover:text-slate-800 transition"
                          >
                            {isChecked ? (
                              <CheckSquare className="h-4 w-4 text-indigo-600" />
                            ) : (
                              <Square className="h-4 w-4 opacity-50 group-hover:opacity-100" />
                            )}
                          </button>
                        </td>

                        <td className="px-3 py-3 font-mono font-bold text-slate-500 dark:text-slate-400">
                          #{contact.sourceRowNumber}
                        </td>
                        
                        <td className="px-4 py-3 font-bold text-slate-900 dark:text-slate-100">
                          {contact.firstName}
                        </td>

                        <td className="px-4 py-3 font-bold text-slate-900 dark:text-slate-100">
                          {contact.lastName}
                        </td>
                        
                        <td className="px-4 py-3 font-bold text-indigo-700 dark:text-indigo-400">
                          {contact.fullName}
                        </td>
                        
                        <td className="px-4 py-3 text-slate-800 dark:text-slate-200 font-semibold">
                          {contact.company}
                        </td>
                        
                        <td className="px-4 py-3 font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                          {contact.email || <span className="text-slate-400 dark:text-slate-500 font-sans italic">No email</span>}
                        </td>
                        
                        <td className="px-4 py-3 font-medium text-blue-600 dark:text-blue-400 underline">
                          {contact.emailDomain ? (
                            <a href={`http://${contact.emailDomain}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                              {contact.emailDomain}
                            </a>
                          ) : (
                            <span className="text-slate-400 dark:text-slate-500 italic no-underline">N/A</span>
                          )}
                        </td>
                        
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold shadow-2xs ${
                            contact.status === 'RESOLVED_GREEN' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800' :
                            contact.status === 'FLAGGED_YELLOW' ? 'bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800' :
                            contact.status === 'FLAGGED_RED' ? 'bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-900/40 dark:text-rose-300 dark:border-rose-800' :
                            'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                          }`}>
                            {contact.status === 'RESOLVED_GREEN' && <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />}
                            {contact.status === 'FLAGGED_YELLOW' && <AlertTriangle className="h-3 w-3 text-amber-600 dark:text-amber-400" />}
                            {contact.status === 'FLAGGED_RED' && <AlertCircle className="h-3 w-3 text-rose-600 dark:text-rose-400" />}
                            {contact.status === 'UNREVIEWED' && <HelpCircle className="h-3 w-3 text-slate-500 dark:text-slate-400" />}
                            <span>{contact.status.replace('FLAGGED_', '').replace('RESOLVED_', '')}</span>
                          </span>
                        </td>

                        <td className="px-4 py-3 max-w-[180px] truncate text-slate-600 dark:text-slate-300 font-medium">
                          {contact.isDuplicateOf && contact.isDuplicateOf.length > 0 && (
                            <button
                              onClick={(e) => { e.stopPropagation(); setSelectedDedup(contact); }}
                              className="inline-flex items-center gap-1 rounded bg-purple-100 px-2 py-0.5 text-[11px] font-bold text-purple-800 hover:bg-purple-200 border border-purple-300 mr-1 shadow-2xs"
                            >
                              <Copy className="h-3 w-3 text-purple-600" />
                              <span>Dedup ({contact.isDuplicateOf.length})</span>
                            </button>
                          )}
                          <span className="truncate" title={contact.reviewerComment}>
                            {contact.reviewerComment || contact.originalComments?.join(' ')}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedContact(contact); }}
                            className="inline-flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-1.5 font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition border border-slate-300 dark:border-slate-700 shadow-xs opacity-0 group-hover:opacity-100"
                          >
                            <Eye className="h-3.5 w-3.5 text-emerald-600" />
                            <span>Review</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-6 py-4 transition-colors">
            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              {pagination.total === 0 ? (
                <span className="text-slate-400 dark:text-slate-500">No records</span>
              ) : (
                <>
                  Showing{' '}
                  <span className="font-bold text-slate-900 dark:text-slate-100">{(pagination.page - 1) * pagination.limit + 1}</span>{' '}
                  to{' '}
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>{' '}
                  of <span className="font-bold text-slate-900 dark:text-slate-100">{pagination.total.toLocaleString()}</span> records
                </>
              )}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPagination((p) => ({ ...p, page: Math.max(1, p.page - 1) }))}
                disabled={pagination.page <= 1 || loading}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 shadow-xs transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Prev</span>
              </button>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 px-2">
                Page {pagination.page} of {pagination.totalPages || 1}
              </span>
              <button
                onClick={() => setPagination((p) => ({ ...p, page: Math.min(p.totalPages, p.page + 1) }))}
                disabled={pagination.page >= pagination.totalPages || loading}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 shadow-xs transition-colors"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

      </main>

      {/* Floating Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900 px-6 py-3 text-white shadow-2xl animate-in slide-in-from-bottom-8 duration-300">
          <span className="text-xs font-bold text-slate-300">
            <span className="text-emerald-400 font-extrabold">{selectedIds.size}</span> selected
          </span>
          <div className="h-4 w-px bg-slate-700" />
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkStatusUpdate('RESOLVED_GREEN')}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 transition"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Mark Verified (Green)</span>
            </button>
            <button
              onClick={() => handleBulkStatusUpdate('FLAGGED_YELLOW')}
              className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-500 transition"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>Mark Flagged (Yellow)</span>
            </button>
            <button
              onClick={handleBulkDelete}
              className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-600 px-3 py-1.5 text-xs font-bold text-white transition"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete</span>
            </button>
          </div>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="text-xs text-slate-400 hover:text-white underline font-semibold ml-2"
          >
            Deselect All
          </button>
        </div>
      )}

      {/* Modals */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={async () => {
          setIsUploadOpen(false);
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
        }}
      />

      <ReviewModal
        contact={selectedContact}
        onClose={() => setSelectedContact(null)}
        onUpdate={handleUpdateContact}
      />

      <DedupModal
        primaryContact={selectedDedup}
        onClose={() => setSelectedDedup(null)}
        onUpdate={async () => {
          const fetchRes = await fetch('/api/contacts?page=1&limit=50&status=ALL&sector=ALL', {
            headers: { 'x-workspace-id': getWorkspaceId() },
          });
          const fetchData = await fetchRes.json();
          if (fetchRes.ok) {
            setContacts(fetchData.contacts || []);
            setStats(fetchData.stats || stats);
            setPagination(fetchData.pagination || pagination);
          }
        }}
      />

      <GuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      <SourcesModal
        isOpen={isSourcesOpen}
        onClose={() => setIsSourcesOpen(false)}
        onRefreshContacts={fetchContacts}
      />
      </div>
    </div>
  );
}
