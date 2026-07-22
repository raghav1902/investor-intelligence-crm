'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import StatsBar from '@/components/StatsBar';
import UploadModal from '@/components/UploadModal';
import ReviewModal from '@/components/ReviewModal';
import DedupModal from '@/components/DedupModal';
import { Search, Filter, Check, AlertTriangle, AlertCircle, Copy, ChevronLeft, ChevronRight, HelpCircle, Eye, FileText, Sparkles } from 'lucide-react';

export default function Home() {
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
  
  // Filters
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [sectorFilter, setSectorFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDuplicateFilter, setIsDuplicateFilter] = useState(false);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<any | null>(null);
  const [selectedDedup, setSelectedDedup] = useState<any | null>(null);

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        status: activeFilter,
        sector: sectorFilter,
        search: searchQuery,
      });

      if (isDuplicateFilter) {
        params.set('isDuplicate', 'true');
      }

      const res = await fetch(`/api/contacts?${params.toString()}`);
      const data = await res.json();

      if (res.ok) {
        setContacts(data.contacts || []);
        setStats(data.stats || stats);
        setPagination(data.pagination || pagination);
      }
    } catch (err) {
      console.error('Error fetching contacts:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, activeFilter, sectorFilter, searchQuery, isDuplicateFilter]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleUpdateContact = (updated: any) => {
    setContacts((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
    fetchContacts();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar
        onOpenUpload={() => setIsUploadOpen(true)}
        onRefresh={fetchContacts}
        isRefreshing={loading}
      />

      <main className="flex-1 mx-auto w-full max-w-[99%] px-4 sm:px-6 lg:px-8 py-6">
        
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
        <div className="mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex flex-1 items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, company, email, or title..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-500" />
              <span className="text-xs font-bold text-slate-600">Sector:</span>
            </div>
            <select
              value={sectorFilter}
              onChange={(e) => {
                setSectorFilter(e.target.value);
                setPagination((p) => ({ ...p, page: 1 }));
              }}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 focus:border-emerald-500 focus:outline-none"
            >
              <option value="ALL">All Sectors</option>
              <option value="UNCONFIRMED">⏳ Unconfirmed / Pending</option>
              <option value="ENERGY">⚡ Energy</option>
              <option value="POWER">🔋 Power</option>
              <option value="RENEWABLES">🌱 Renewables</option>
              <option value="INDUSTRIALS">🏭 Industrials</option>
              <option value="OTHER">🚫 Other (Not Target)</option>
            </select>
          </div>
        </div>

        {/* Alternative Workflow Banner */}
        <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-indigo-200 bg-indigo-50/50 p-4 shadow-xs">
          <div>
            <h3 className="text-sm font-bold text-indigo-900 flex items-center gap-2">
              <FileText className="h-4 w-4 text-indigo-600" />
              Alternative Workflow: Direct PDF Extraction
            </h3>
            <p className="text-xs text-indigo-700 mt-0.5">
              Skip the Excel upload entirely. Select your Source PDF, and we will extract Contact Name, Client, and Email directly into this dashboard.
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

                if (!confirm('This will CLEAR all current contacts and replace them with data extracted directly from this PDF. Proceed?')) {
                  e.target.value = '';
                  return;
                }

                setLoading(true);
                try {
                  // 1. Upload PDF & run Google Vision OCR
                  const formData = new FormData();
                  formData.append('file', file);
                  
                  const uploadRes = await fetch('/api/upload/pdf', {
                    method: 'POST',
                    body: formData,
                  });
                  const uploadData = await uploadRes.json();
                  
                  if (!uploadRes.ok) {
                    alert(uploadData.error || 'Failed to upload and process PDF via Google Vision.');
                    return;
                  }

                  // 2. Extract Data from OCR text to Contacts
                  const extractRes = await fetch('/api/pdf/extract', { method: 'POST' });
                  const extractData = await extractRes.json();
                  
                  if (extractRes.ok) {
                    alert(`Success! Extracted ${extractData.count} contacts directly from the PDF.`);
                    fetchContacts();
                  } else {
                    alert(extractData.error || 'Extraction from OCR text failed.');
                  }
                } catch (err) {
                  alert('An error occurred during the direct extraction process.');
                } finally {
                  setLoading(false);
                  e.target.value = ''; // Reset input
                }
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

        {/* Data-Dense Contacts Table */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-100/80 uppercase tracking-wider text-slate-600 font-bold">
                <tr>
                  <th className="px-4 py-3.5 w-16">Row #</th>
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
                    <td colSpan={9} className="px-4 py-12 text-center text-slate-500 font-semibold">
                      Loading contacts from MongoDB...
                    </td>
                  </tr>
                ) : contacts.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-12 text-center text-slate-500 font-medium">
                      No contacts found matching criteria. Upload Excel/PDF documents to start!
                    </td>
                  </tr>
                ) : (
                  contacts.map((contact) => (
                    <tr
                      key={contact._id}
                      className={`hover:bg-slate-50 transition group ${
                        contact.status === 'RESOLVED_GREEN' ? 'bg-emerald-50/60 hover:bg-emerald-50' :
                        contact.status === 'FLAGGED_YELLOW' ? 'bg-amber-50/60 hover:bg-amber-50' :
                        contact.status === 'FLAGGED_RED' ? 'bg-rose-50/60 hover:bg-rose-50' : ''
                      }`}
                    >
                      <td className="px-4 py-3 font-mono font-bold text-slate-500">
                        #{contact.sourceRowNumber}
                      </td>
                      
                      <td className="px-4 py-3 font-bold text-slate-900">
                        {contact.firstName}
                      </td>

                      <td className="px-4 py-3 font-bold text-slate-900">
                        {contact.lastName}
                      </td>
                      
                      <td className="px-4 py-3 font-bold text-indigo-700">
                        {contact.fullName}
                      </td>
                      
                      <td className="px-4 py-3 text-slate-800 font-semibold">
                        {contact.company}
                      </td>
                      
                      <td className="px-4 py-3 font-mono font-semibold text-emerald-700">
                        {contact.email || <span className="text-slate-400 font-sans italic">No email</span>}
                      </td>
                      
                      <td className="px-4 py-3 font-medium text-blue-600 underline">
                        {contact.emailDomain ? (
                          <a href={`http://${contact.emailDomain}`} target="_blank" rel="noopener noreferrer">
                            {contact.emailDomain}
                          </a>
                        ) : (
                          <span className="text-slate-400 italic no-underline">N/A</span>
                        )}
                      </td>
                      
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold shadow-2xs ${
                          contact.status === 'RESOLVED_GREEN' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                          contact.status === 'FLAGGED_YELLOW' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                          contact.status === 'FLAGGED_RED' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                          'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {contact.status === 'RESOLVED_GREEN' && <Check className="h-3 w-3 text-emerald-600" />}
                          {contact.status === 'FLAGGED_YELLOW' && <AlertTriangle className="h-3 w-3 text-amber-600" />}
                          {contact.status === 'FLAGGED_RED' && <AlertCircle className="h-3 w-3 text-rose-600" />}
                          {contact.status === 'UNREVIEWED' && <HelpCircle className="h-3 w-3 text-slate-500" />}
                          <span>{contact.status.replace('FLAGGED_', '').replace('RESOLVED_', '')}</span>
                        </span>
                      </td>

                      <td className="px-4 py-3 max-w-[180px] truncate text-slate-600 font-medium">
                        {contact.isDuplicateOf && contact.isDuplicateOf.length > 0 && (
                          <button
                            onClick={() => setSelectedDedup(contact)}
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
                          onClick={() => setSelectedContact(contact)}
                          className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 font-bold text-slate-800 hover:bg-slate-200 transition border border-slate-300 shadow-xs"
                        >
                          <Eye className="h-3.5 w-3.5 text-emerald-600" />
                          <span>Review</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4">
            <span className="text-xs text-slate-600 font-medium">
              Showing <span className="font-bold text-slate-900">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
              <span className="font-bold text-slate-900">
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>{' '}
              of <span className="font-bold text-slate-900">{pagination.total}</span> records
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPagination((p) => ({ ...p, page: Math.max(1, p.page - 1) }))}
                disabled={pagination.page <= 1 || loading}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50 shadow-xs"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Prev</span>
              </button>
              <span className="text-xs font-bold text-slate-700 px-2">
                Page {pagination.page} of {pagination.totalPages || 1}
              </span>
              <button
                onClick={() => setPagination((p) => ({ ...p, page: Math.min(p.totalPages, p.page + 1) }))}
                disabled={pagination.page >= pagination.totalPages || loading}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50 shadow-xs"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

      </main>

      {/* Modals */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={() => {
          setIsUploadOpen(false);
          fetchContacts();
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
        onUpdate={fetchContacts}
      />
    </div>
  );
}
