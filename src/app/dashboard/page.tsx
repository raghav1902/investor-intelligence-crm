'use client';

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import StatsBar from '@/components/StatsBar';
import UploadModal from '@/components/UploadModal';
import ReviewModal from '@/components/ReviewModal';
import DedupModal from '@/components/DedupModal';
import GuideModal from '@/components/GuideModal';
import SourcesModal from '@/components/SourcesModal';
import { useToast } from '@/components/ToastProvider';
import { Search, Filter, Check, AlertTriangle, AlertCircle, Copy, ChevronLeft, ChevronRight, HelpCircle, Eye, FileText, Sparkles, Database, CheckSquare, Square, Trash2, CheckCircle2, Zap, Loader2, X } from 'lucide-react';
import { getWorkspaceId } from '@/lib/workspace';
import Link from 'next/link';
import UpgradeModal from '@/components/UpgradeModal';
import { useSession } from 'next-auth/react';

function DashboardContent() {
  const { data: session, status } = useSession();
  const { toast, confirm } = useToast();
  const searchParams = useSearchParams();
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

  // Demo Banner State
  const [showDemoBanner, setShowDemoBanner] = useState(false);

  useEffect(() => {
    // Show banner if unauthenticated and URL has ?demo=true, or exactly 16 contacts and no session
    if (!session && (searchParams?.get('demo') === 'true' || stats.total === 16)) {
      if (!sessionStorage.getItem('demoBannerDismissed')) {
        setShowDemoBanner(true);
      }
    } else if (session) {
      setShowDemoBanner(false);
    }
  }, [searchParams, stats.total, session]);

  // Filters
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [sectorFilter, setSectorFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDuplicateFilter, setIsDuplicateFilter] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isMatching, setIsMatching] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  // Subscription Status
  const [subStatus, setSubStatus] = useState<{ plan: string, scansUsed: number, scansLimit: number | null }>({ plan: 'free', scansUsed: 0, scansLimit: 5 });
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeTrigger, setUpgradeTrigger] = useState<'limit_reached' | 'premium_feature' | 'export_nudge'>('export_nudge');

  useEffect(() => {
    fetch('/api/subscription/status', {
      headers: { 'x-workspace-id': getWorkspaceId() }
    })
    .then(res => res.json())
    .then(data => {
      if (data && data.plan) {
        setSubStatus(data);
      }
    })
    .catch(console.error);
  }, []);

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

  const executeExport = () => {
    const workspaceId = getWorkspaceId();
    if (!workspaceId) {
      alert('No workspace found. Please refresh the page and try again.');
      return;
    }
    setIsExporting(true);
    setTimeout(() => setIsExporting(false), 3000);
    window.location.href = `/api/export?workspaceId=${encodeURIComponent(workspaceId)}`;
  };

  const handleExport = () => {
    if (stats.total === 0) {
      toast('error', 'Workspace Empty', 'There is no data to export.');
      return;
    }
    if (subStatus.plan === 'free') {
      setUpgradeTrigger('export_nudge');
      setUpgradeModalOpen(true);
    } else {
      executeExport();
    }
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
    if (stats.total === 0) {
      toast('error', 'Workspace Empty', 'There is no data to deduplicate.');
      return;
    }
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
    <>
    <UpgradeModal 
      isOpen={upgradeModalOpen} 
      onClose={() => setUpgradeModalOpen(false)} 
      onContinue={() => {
        setUpgradeModalOpen(false);
        executeExport();
      }}
      triggerType={upgradeTrigger} 
    />
    <div className="min-h-screen flex bg-surface-base text-content-primary transition-colors duration-300 relative overflow-x-hidden">
      
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
          onExport={handleExport}
        />

        <main className="flex-1 mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 pb-24">
        
        {/* Demo Banner */}
        {showDemoBanner && (
          <div className="mb-6 flex items-center justify-between gap-4 rounded-lg border border-hairline border-l-[3px] border-l-emerald-500 bg-surface-100 p-4 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-3 text-content-primary">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 text-emerald-500" />
              <p className="text-sm font-medium">
                You're viewing demo data —{' '}
                <Link href="/register" className="font-bold underline text-content-primary hover:text-white transition-colors">
                  Sign up
                </Link>{' '}
                to save your own workspace
              </p>
            </div>
            <button
              onClick={() => {
                setShowDemoBanner(false);
                sessionStorage.setItem('demoBannerDismissed', 'true');
              }}
              className="p-1 rounded-lg text-content-secondary hover:bg-surface-200 hover:text-content-primary transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

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
        <div className="mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 rounded-lg border border-hairline bg-surface-100 p-4 transition-colors duration-300">
          <div className="flex flex-1 items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-content-muted" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search by name, company, email, or title... (Press '/' to focus)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-hairline bg-surface-base pl-9 pr-16 py-2 text-sm text-content-primary placeholder-content-muted focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium transition-colors"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-block rounded border border-hairline bg-surface-200 px-1.5 py-0.5 text-[10px] font-bold text-content-secondary font-mono">
                ⌘K / /
              </kbd>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-content-secondary" />
              <span className="text-xs font-medium text-content-secondary">Sector:</span>
            </div>
            <select
              value={sectorFilter}
              onChange={(e) => {
                setSectorFilter(e.target.value);
                setPagination((p) => ({ ...p, page: 1 }));
              }}
              className="rounded-md border border-hairline bg-surface-base px-3 py-2 text-xs font-medium text-content-primary focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
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
        )}

        {/* Data-Dense Contacts Table */}
        <div className="rounded-lg border border-hairline bg-surface-100 overflow-hidden transition-colors duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap min-w-[1000px]">
              <thead className="border-b border-hairline bg-surface-200 tracking-tight text-content-secondary font-medium transition-colors">
                <tr>
                  <th className="px-3 py-3.5 w-10 text-center">
                    <button onClick={toggleSelectAll} className="text-content-secondary hover:text-content-primary transition">
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
                    <td colSpan={11} className="px-4 py-12 text-center text-content-secondary font-semibold">
                      Loading contacts from MongoDB...
                    </td>
                  </tr>
                ) : contacts.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-4 py-0 whitespace-normal">
                      <div className="flex flex-col items-center justify-center py-20 text-center whitespace-normal">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-surface-200 border border-hairline">
                            <Sparkles className="h-6 w-6 text-emerald-500" />
                          </div>
                        </div>
                        <h3 className="text-lg font-medium text-content-primary mb-2 tracking-tight">Ready to import your investor list</h3>
                        <p className="text-sm text-content-secondary mb-10 max-w-md">
                          Upload your Excel workbook and source PDF, or load sample demo data for an instant demonstration.
                        </p>
                        
                        {/* Action buttons in empty state */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                          <button
                            onClick={handleLoadDemoData}
                            className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-6 py-2.5 text-xs font-medium text-[#010102] hover:bg-emerald-400 transition-colors"
                          >
                            <Database className="h-4 w-4" />
                            Load Sample Demo Data (16 Records)
                          </button>
                          <button
                            onClick={() => setIsUploadOpen(true)}
                            className="inline-flex items-center gap-2 rounded-lg bg-transparent px-6 py-2.5 text-xs font-medium text-content-primary border border-hairline hover:bg-surface-200 transition-colors"
                          >
                            <FileText className="h-4 w-4 text-emerald-500" />
                            Upload Your Own Files
                          </button>
                        </div>

                        {/* Step-by-step workflow */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl text-left mt-4">
                          <div className="rounded-lg border border-hairline bg-surface-100 hover:bg-surface-200 p-5 transition-colors duration-300">
                            <div className="flex items-center gap-3 mb-3">
                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-surface-300 text-content-primary text-[10px] font-bold">1</span>
                              <span className="text-xs font-medium text-content-primary tracking-tight">Upload Sources</span>
                            </div>
                            <p className="text-xs text-content-secondary leading-relaxed whitespace-normal break-words">Import your contact list (Excel) or scan source files (PDF / Images).</p>
                          </div>
                          <div className="rounded-lg border border-hairline bg-surface-100 hover:bg-surface-200 p-5 transition-colors duration-300">
                            <div className="flex items-center gap-3 mb-3">
                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-surface-300 text-content-primary text-[10px] font-bold">2</span>
                              <span className="text-xs font-medium text-content-primary tracking-tight">OCR &amp; AI Match</span>
                            </div>
                            <p className="text-xs text-content-secondary leading-relaxed whitespace-normal break-words">Tesseract (Free Image) or Gemini Vision (Premium PDF) auto-flags duplicate clusters.</p>
                          </div>
                          <div className="rounded-lg border border-hairline bg-surface-100 hover:bg-surface-200 p-5 transition-colors duration-300">
                            <div className="flex items-center gap-3 mb-3">
                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-surface-300 text-content-primary text-[10px] font-bold">3</span>
                              <span className="text-xs font-medium text-content-primary tracking-tight">Review &amp; Export</span>
                            </div>
                            <p className="text-xs text-content-secondary leading-relaxed whitespace-normal break-words">Review flagged contacts and export clean formatted .xlsx workbooks.</p>
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
                        className={`cursor-pointer transition-colors duration-200 group border-b border-hairline last:border-0 ${
                          isChecked ? 'bg-surface-300' :
                          'hover:bg-surface-200'
                        }`}
                      >
                        <td className="px-3 py-3 text-center">
                          <button
                            onClick={(e) => toggleSelectOne(contact._id, e)}
                            className="text-content-muted hover:text-content-primary transition"
                          >
                            {isChecked ? (
                              <CheckSquare className="h-4 w-4 text-emerald-500" />
                            ) : (
                              <Square className="h-4 w-4 opacity-50 group-hover:opacity-100" />
                            )}
                          </button>
                        </td>

                        <td className="px-3 py-3 font-mono text-content-muted">
                          #{contact.sourceRowNumber}
                        </td>
                        
                        <td className="px-4 py-3 font-medium text-content-primary">
                          {contact.firstName}
                        </td>

                        <td className="px-4 py-3 font-medium text-content-primary">
                          {contact.lastName}
                        </td>
                        
                        <td className="px-4 py-3 font-medium text-content-primary">
                          {contact.fullName}
                        </td>
                        
                        <td className="px-4 py-3 text-content-primary font-medium">
                          {contact.company}
                        </td>
                        
                        <td className="px-4 py-3 font-medium text-content-secondary">
                          {contact.email || <span className="text-content-muted italic">No email</span>}
                        </td>
                        
                        <td className="px-4 py-3 font-medium text-content-secondary">
                          {contact.emailDomain ? (
                            <a href={`http://${contact.emailDomain}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="hover:text-content-primary transition-colors">
                              {contact.emailDomain}
                            </a>
                          ) : (
                            <span className="text-content-muted italic">N/A</span>
                          )}
                        </td>
                        
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${
                            contact.status === 'RESOLVED_GREEN' ? 'bg-emerald-500/10 text-emerald-500' :
                            contact.status === 'FLAGGED_YELLOW' ? 'bg-amber-500/10 text-amber-500' :
                            contact.status === 'FLAGGED_RED' ? 'bg-red-500/10 text-red-500' :
                            'bg-surface-200 text-content-secondary'
                          }`}>
                            {contact.status === 'RESOLVED_GREEN' && <Check className="h-3 w-3" />}
                            {contact.status === 'FLAGGED_YELLOW' && <AlertTriangle className="h-3 w-3" />}
                            {contact.status === 'FLAGGED_RED' && <AlertCircle className="h-3 w-3" />}
                            {contact.status === 'UNREVIEWED' && <HelpCircle className="h-3 w-3" />}
                            <span>{contact.status.replace('FLAGGED_', '').replace('RESOLVED_', '')}</span>
                          </span>
                        </td>

                        <td className="px-4 py-3 max-w-[180px] truncate text-content-secondary font-normal">
                          {contact.isDuplicateOf && contact.isDuplicateOf.length > 0 && (
                            <button
                              onClick={(e) => { e.stopPropagation(); setSelectedDedup(contact); }}
                              className="inline-flex items-center gap-1 rounded bg-surface-300 px-2 py-0.5 text-[10px] font-medium text-content-primary border border-hairline mr-2 transition-colors hover:bg-[#23252a]"
                            >
                              <Copy className="h-3 w-3" />
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
                            className="inline-flex items-center gap-1 rounded bg-surface-200 px-3 py-1 font-medium text-content-primary hover:bg-surface-300 transition border border-hairline opacity-0 group-hover:opacity-100"
                          >
                            <Eye className="h-3 w-3" />
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
          <div className="flex items-center justify-between border-t border-hairline bg-surface-base px-6 py-4 transition-colors">
            <span className="text-xs text-content-secondary font-medium">
              {loading ? (
                <span className="text-content-muted">Loading...</span>
              ) : pagination.total === 0 ? (
                <span className="text-content-muted">No records</span>
              ) : (
                <>
                  Showing{' '}
                  <span className="font-medium text-content-primary">{(pagination.page - 1) * pagination.limit + 1}</span>{' '}
                  to{' '}
                  <span className="font-medium text-content-primary">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>{' '}
                  of <span className="font-medium text-content-primary">{pagination.total.toLocaleString()}</span> records
                </>
              )}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPagination((p) => ({ ...p, page: Math.max(1, p.page - 1) }))}
                disabled={pagination.page <= 1 || loading}
                className="inline-flex items-center gap-1 rounded border border-hairline bg-surface-100 px-3 py-1 text-xs font-medium text-content-primary hover:bg-surface-200 disabled:opacity-50 transition-colors"
              >
                <ChevronLeft className="h-4 w-4 text-content-secondary" />
                <span>Prev</span>
              </button>
              <span className="text-xs font-medium text-content-secondary px-2">
                Page {pagination.page} of {pagination.totalPages || 1}
              </span>
              <button
                onClick={() => setPagination((p) => ({ ...p, page: Math.min(p.totalPages, p.page + 1) }))}
                disabled={pagination.page >= pagination.totalPages || loading}
                className="inline-flex items-center gap-1 rounded border border-hairline bg-surface-100 px-3 py-1 text-xs font-medium text-content-primary hover:bg-surface-200 disabled:opacity-50 transition-colors"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4 text-content-secondary" />
              </button>
            </div>
          </div>
        </div>

      </main>

      {/* Floating Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4 rounded-lg border border-hairline bg-surface-100 px-6 py-3 shadow-md animate-in slide-in-from-bottom-8 duration-300">
          <span className="text-xs font-medium text-content-primary">
            <span className="text-emerald-500 font-medium">{selectedIds.size}</span> selected
          </span>
          <div className="h-4 w-px bg-[#23252a]" />
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkStatusUpdate('RESOLVED_GREEN')}
              className="inline-flex items-center gap-1.5 rounded bg-emerald-500 px-3 py-1.5 text-xs font-medium text-[#010102] hover:bg-emerald-400 transition-colors"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Mark Verified (Green)</span>
            </button>
            <button
              onClick={() => handleBulkStatusUpdate('FLAGGED_YELLOW')}
              className="inline-flex items-center gap-1.5 rounded bg-transparent border border-hairline px-3 py-1.5 text-xs font-medium text-content-primary hover:bg-surface-200 transition-colors"
            >
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
              <span>Mark Flagged (Yellow)</span>
            </button>
            <button
              onClick={handleBulkDelete}
              className="inline-flex items-center gap-1.5 rounded bg-transparent border border-hairline px-3 py-1.5 text-xs font-medium text-content-primary hover:bg-surface-200 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5 text-red-500" />
              <span>Delete</span>
            </button>
          </div>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="text-xs text-content-secondary hover:text-content-primary underline font-medium ml-2"
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
    </>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-surface-base text-content-muted"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <DashboardContent />
    </Suspense>
  );
}
