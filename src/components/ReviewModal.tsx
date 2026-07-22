'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, AlertTriangle, ShieldAlert, Ban, ExternalLink, Sparkles, FileText, ChevronLeft, ChevronRight, Loader2, Image as ImageIcon } from 'lucide-react';

interface ReviewModalProps {
  contact: any | null;
  onClose: () => void;
  onUpdate: (updated: any) => void;
}

export default function ReviewModal({ contact, onClose, onUpdate }: ReviewModalProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    fullName: '',
    title: '',
    sectorCoverage: 'UNCONFIRMED',
    company: '',
    email: '',
    reviewerComment: '',
  });
  const [saving, setSaving] = useState(false);
  const [pdfPage, setPdfPage] = useState(1);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [pdfTotalPages, setPdfTotalPages] = useState(0);
  const [pdfImageUrl, setPdfImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (contact) {
      setFormData({
        firstName: contact.firstName || '',
        lastName: contact.lastName || '',
        fullName: contact.fullName || '',
        title: contact.title || 'Unverified Role',
        sectorCoverage: contact.sectorCoverage || 'UNCONFIRMED',
        company: contact.company || '',
        email: contact.email || '',
        reviewerComment: contact.reviewerComment || '',
      });
      
      // Auto-calculate the likely PDF page based on Excel row number.
      // Assuming ~10,000 rows across ~365 pages = ~27.5 rows per page.
      if (contact.sourceRowNumber) {
        const estimatedPage = Math.max(1, Math.ceil(contact.sourceRowNumber / 27.5));
        setPdfPage(estimatedPage);
        setPdfImageUrl(null); // reset image when opening new contact
        setPdfError(null);
      }
    }
  }, [contact]);

  if (!contact) return null;

  const loadPdfPage = async (page: number) => {
    setPdfLoading(true);
    setPdfError(null);
    try {
      const res = await fetch(`/api/pdf/page/${page}`);
      if (!res.ok) {
        const data = await res.json();
        setPdfError(data.error || 'Failed to load PDF page');
        setPdfImageUrl(null);
      } else {
        const totalPages = parseInt(res.headers.get('X-Total-Pages') || '0', 10);
        if (totalPages > 0) setPdfTotalPages(totalPages);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setPdfImageUrl(url);
      }
    } catch (err: any) {
      setPdfError(err.message || 'Failed to load PDF page');
    } finally {
      setPdfLoading(false);
    }
  };

  const handleSave = async (newStatus: string, customComment?: string) => {
    setSaving(true);
    try {
      const payload = {
        ...formData,
        status: newStatus,
        reviewerComment: customComment !== undefined ? customComment : formData.reviewerComment,
      };

      const res = await fetch(`/api/contacts/${contact._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to save contact');
      const updated = await res.json();
      onUpdate(updated);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Error saving contact');
    } finally {
      setSaving(false);
    }
  };

  const handleNotTargetAudience = () => {
    const comment = 'Not target audience: sector coverage unverified or outside Energy/Power/Renewables/Industrials.';
    handleSave('FLAGGED_YELLOW', comment);
  };

  const searchLinkedIn = () => {
    const query = encodeURIComponent(`${formData.fullName} ${formData.company}`);
    window.open(`https://www.linkedin.com/search/results/all/?keywords=${query}`, '_blank');
  };

  const searchGoogle = () => {
    const query = encodeURIComponent(`"${formData.fullName}" "${formData.company}" email OR title`);
    window.open(`https://www.google.com/search?q=${query}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-5xl rounded-2xl border border-slate-200 bg-white shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50/50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-slate-200 px-2.5 py-1 text-xs font-mono font-bold text-slate-800">
              Row #{contact.sourceRowNumber}
            </span>
            <h2 className="text-lg font-bold text-slate-900">Review & Verify Contact</h2>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
              contact.status === 'RESOLVED_GREEN' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
              contact.status === 'FLAGGED_YELLOW' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
              contact.status === 'FLAGGED_RED' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
              'bg-slate-200 text-slate-700'
            }`}>
              {contact.status}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={searchLinkedIn}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition shadow-xs"
              title="Verify on LinkedIn"
            >
              <span>LinkedIn</span>
              <ExternalLink className="h-3 w-3" />
            </button>
            <button
              onClick={searchGoogle}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition shadow-xs"
              title="Verify on Google"
            >
              <span>Google</span>
              <ExternalLink className="h-3 w-3" />
            </button>
            <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 ml-2 transition">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Split Screen Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 overflow-y-auto flex-1">
          
          {/* Left Side: Editable Excel Row Data */}
          <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/70 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-emerald-700 flex items-center gap-2 border-b border-slate-200 pb-3">
              <Sparkles className="h-4 w-4" />
              1. Excel Record Data (Editable)
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">First Name</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Company / Asset Manager</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address (Check OCR artifacts like '1' vs '_')</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-mono font-semibold text-emerald-700 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Verified Title / Role</label>
                <input
                  type="text"
                  value={formData.title}
                  placeholder="e.g. Portfolio Manager"
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Sector Coverage</label>
                <select
                  value={formData.sectorCoverage}
                  onChange={(e) => setFormData({ ...formData, sectorCoverage: e.target.value as any })}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-xs font-medium"
                >
                  <option value="UNCONFIRMED">⏳ Unconfirmed / Pending</option>
                  <option value="ENERGY">⚡ Energy</option>
                  <option value="POWER">🔋 Power</option>
                  <option value="RENEWABLES">🌱 Renewables</option>
                  <option value="INDUSTRIALS">🏭 Industrials</option>
                  <option value="OTHER">🚫 Other (Not Target)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Reviewer Note (Will export as native Excel cell comment)</label>
              <textarea
                rows={2}
                value={formData.reviewerComment}
                placeholder="Add notes on career moves, missing emails, or sector confirmation..."
                onChange={(e) => setFormData({ ...formData, reviewerComment: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-xs"
              />
            </div>
          </div>

          {/* Right Side: Matched PDF Source & Duplicate Notice */}
          <div className="space-y-4 flex flex-col justify-between">
            
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-5 space-y-4 shadow-xs flex-1">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="text-sm font-bold text-blue-700 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  2. Source PDF — Visual Reference
                </h3>
                {pdfTotalPages > 0 && (
                  <span className="text-xs font-medium text-slate-500">
                    {pdfTotalPages} pages total
                  </span>
                )}
              </div>

              {/* PDF Page Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { const p = Math.max(1, pdfPage - 1); setPdfPage(p); loadPdfPage(p); }}
                  disabled={pdfPage <= 1 || pdfLoading}
                  className="rounded-lg border border-slate-300 bg-white p-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-40 shadow-xs"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-slate-600">Page</span>
                  <input
                    type="number"
                    min={1}
                    max={pdfTotalPages || 999}
                    value={pdfPage}
                    onChange={(e) => setPdfPage(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs text-center font-bold text-slate-900 focus:border-blue-500 focus:outline-none shadow-xs"
                  />
                  {pdfTotalPages > 0 && <span className="text-xs text-slate-500">/ {pdfTotalPages}</span>}
                </div>
                <button
                  onClick={() => { const p = pdfPage + 1; setPdfPage(p); loadPdfPage(p); }}
                  disabled={pdfTotalPages > 0 && pdfPage >= pdfTotalPages || pdfLoading}
                  className="rounded-lg border border-slate-300 bg-white p-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-40 shadow-xs"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => loadPdfPage(pdfPage)}
                  disabled={pdfLoading}
                  className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-500 disabled:opacity-50 transition shadow-xs"
                >
                  {pdfLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImageIcon className="h-3.5 w-3.5" />}
                  <span>{pdfLoading ? 'Rendering...' : 'Load Page'}</span>
                </button>
              </div>

              {/* PDF Page Image */}
              {pdfError && (
                <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200 font-medium">
                  {pdfError}
                </div>
              )}

              {pdfImageUrl ? (
                <div className="rounded-lg border border-blue-200 bg-white overflow-hidden shadow-xs max-h-[400px] overflow-y-auto">
                  <img src={pdfImageUrl} alt={`PDF Page ${pdfPage}`} className="w-full" />
                </div>
              ) : !pdfError && (
                <div className="rounded-lg bg-white p-8 text-center text-xs text-slate-500 border border-dashed border-slate-300">
                  <ImageIcon className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-medium">Click "Load Page" to view the source PDF</p>
                  <p className="mt-1 text-slate-400">Navigate to the page containing this contact&apos;s data and compare visually</p>
                </div>
              )}

              <div className="text-xs text-slate-600 space-y-1 bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
                <p className="font-bold text-slate-800">💡 Worked Example Rule (Client Guidance):</p>
                <p>If an email has a stray underscore or broken line (e.g., <code className="text-amber-700 bg-amber-50 px-1 py-0.5 rounded font-bold">gaurav._gupta@blackrock.com</code> vs <code className="text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded font-bold">gaurav.gupta1@blackrock.com</code>), verify against the PDF above. Discard OCR artifacts and keep the clean email.</p>
              </div>

              {contact.matchedPdfSnippet && (
                <div className="text-xs text-slate-600 space-y-1 bg-indigo-50 p-3.5 rounded-lg border border-indigo-200 shadow-xs mt-2">
                  <p className="font-bold text-indigo-900">🤖 Matched OCR Snippet (Similarity: {contact.ocrSimilarityScore}%)</p>
                  <p className="font-mono text-indigo-800 break-words">{contact.matchedPdfSnippet}</p>
                </div>
              )}
            </div>

            {/* Duplicate Notice Box */}
            {contact.isDuplicateOf && contact.isDuplicateOf.length > 0 && (
              <div className="rounded-xl border border-purple-300 bg-purple-50 p-4 space-y-2 shadow-xs">
                <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-2">
                  ⚡ Duplicate Cluster Detected ({contact.isDuplicateOf.length} linked record{contact.isDuplicateOf.length > 1 ? 's' : ''})
                </h4>
                <p className="text-xs text-purple-800">
                  Verify whether the contact has moved firms. Update title/email here, and flag the older duplicate record with a comment rather than deleting.
                </p>
              </div>
            )}

            {/* Target Audience Reminder */}
            <div className="rounded-xl border border-slate-200 bg-slate-100/80 p-4">
              <h4 className="text-xs font-bold text-slate-800 mb-1">🎯 Target Audience Criteria:</h4>
              <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                <li><strong className="text-slate-800">Buy-side only:</strong> Institutional asset managers (mutual/hedge funds, pensions). No sell-side or vendors.</li>
                <li><strong className="text-slate-800">Analysts & PMs:</strong> Active investment decision makers (no sales, IR, or operations).</li>
                <li><strong className="text-slate-800">Sector:</strong> Energy, Power, Renewables, or Industrials.</li>
              </ul>
            </div>

          </div>

        </div>

        {/* Action Bar */}
        <div className="flex flex-wrap items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4 rounded-b-2xl gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleNotTargetAudience}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800 hover:bg-amber-100 transition shadow-xs"
            >
              <Ban className="h-4 w-4 text-amber-600" />
              <span>Not Target Audience (Keep & Comment)</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleSave('FLAGGED_YELLOW')}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-100 px-4 py-2 text-xs font-bold text-amber-900 hover:bg-amber-200 transition shadow-xs"
            >
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <span>Flag Yellow (Need Info)</span>
            </button>

            <button
              onClick={() => handleSave('FLAGGED_RED')}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-300 bg-rose-100 px-4 py-2 text-xs font-bold text-rose-900 hover:bg-rose-200 transition shadow-xs"
            >
              <ShieldAlert className="h-4 w-4 text-rose-600" />
              <span>Flag Red (Error / Missing)</span>
            </button>

            <button
              onClick={() => handleSave('RESOLVED_GREEN')}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2 text-xs font-bold text-white hover:from-emerald-500 hover:to-teal-500 transition shadow-md shadow-emerald-600/20"
            >
              <Check className="h-4 w-4" />
              <span>Save & Mark Green (Resolved)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
