'use client';

import React, { useState, useEffect } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { getWorkspaceId } from '@/lib/workspace';
import { useToast } from '@/components/ToastProvider';

import ReviewFormFields, { ReviewFormData } from '@/components/review/ReviewFormFields';
import ReviewPdfViewer from '@/components/review/ReviewPdfViewer';
import ReviewActionBar from '@/components/review/ReviewActionBar';

interface ReviewModalProps {
  contact: any | null;
  onClose: () => void;
  onUpdate: (updated: any) => void;
}

export default function ReviewModal({ contact, onClose, onUpdate }: ReviewModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<ReviewFormData>({
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

  const loadPdfPage = async (page: number) => {
    setPdfLoading(true);
    setPdfError(null);
    try {
      const res = await fetch(`/api/pdf/page/${page}`, {
        headers: { 'x-workspace-id': getWorkspaceId() },
      });
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

      if (contact.sourceRowNumber) {
        const estimatedPage = Math.max(1, Math.ceil(contact.sourceRowNumber / 27.5));
        setPdfPage(estimatedPage);
        setPdfImageUrl(null);
        setPdfError(null);
        loadPdfPage(estimatedPage);
      }
    }
  }, [contact]);

  if (!contact) return null;

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
        headers: {
          'Content-Type': 'application/json',
          'x-workspace-id': getWorkspaceId(),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to save contact');
      const updated = await res.json();
      toast(
        'success',
        'Contact Verified',
        `Saved ${updated.fullName} as ${updated.status.replace('FLAGGED_', '').replace('RESOLVED_', '')}`
      );
      onUpdate(updated);
      onClose();
    } catch (err: any) {
      console.error(err);
      toast('error', 'Save Failed', err.message || 'Error saving contact');
    } finally {
      setSaving(false);
    }
  };

  const handleNotTargetAudience = () => {
    const comment =
      'Not target audience: sector coverage unverified or outside Energy/Power/Renewables/Industrials.';
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

  const renderHighlightedSnippet = (snippet: string) => {
    if (!snippet) return null;

    const clean = (str: string) => (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const emailClean = clean(formData.email);
    const companyClean = clean(formData.company);
    const firstNameClean = clean(formData.firstName);
    const lastNameClean = clean(formData.lastName);

    const words = snippet.split(/(\s+)/);

    return words.map((word, idx) => {
      const trimmed = word.trim();
      if (!trimmed) return <React.Fragment key={idx}>{word}</React.Fragment>;

      const cleanWord = clean(trimmed);
      if (!cleanWord) return <React.Fragment key={idx}>{word}</React.Fragment>;

      if (trimmed.includes('@') || cleanWord.includes('@')) {
        if (cleanWord === emailClean) {
          return (
            <span
              key={idx}
              className="bg-emerald-500/20 text-emerald-400 px-1 py-0.5 rounded font-mono font-bold border border-emerald-500/30"
            >
              {word}
            </span>
          );
        } else {
          return (
            <span
              key={idx}
              className="bg-rose-500/20 text-rose-400 px-1 py-0.5 rounded font-mono font-bold border border-rose-500/30"
              title="Email mismatch/typo detected"
            >
              {word}
            </span>
          );
        }
      }

      if (companyClean.length > 2 && cleanWord === companyClean) {
        return (
          <span
            key={idx}
            className="bg-emerald-500/10 text-emerald-400 px-1 py-0.5 rounded font-semibold border border-emerald-500/20"
          >
            {word}
          </span>
        );
      }

      if (
        (firstNameClean.length > 1 && cleanWord === firstNameClean) ||
        (lastNameClean.length > 1 && cleanWord === lastNameClean)
      ) {
        return (
          <span
            key={idx}
            className="bg-emerald-500/10 text-emerald-400 px-1 py-0.5 rounded font-semibold border border-emerald-500/20"
          >
            {word}
          </span>
        );
      }

      return (
        <span key={idx} className="text-slate-400">
          {word}
        </span>
      );
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-5xl rounded-2xl border border-hairline bg-surface-100 shadow-2xl flex flex-col max-h-[90vh] transition-colors duration-300">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-hairline px-6 py-4 bg-surface-200 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-surface-300 border border-hairline px-2.5 py-1 text-xs font-mono font-bold text-content-secondary">
              Row #{contact.sourceRowNumber}
            </span>
            <h2 className="text-lg font-bold text-content-primary">Review &amp; Verify Contact</h2>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                contact.status === 'RESOLVED_GREEN'
                  ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                  : contact.status === 'FLAGGED_YELLOW'
                  ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                  : contact.status === 'FLAGGED_RED'
                  ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                  : 'bg-surface-300 text-content-secondary border border-hairline'
              }`}
            >
              {contact.status}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={searchLinkedIn}
              className="inline-flex items-center gap-1.5 rounded-lg bg-surface-200 border border-hairline px-3 py-1.5 text-xs font-semibold text-content-primary hover:bg-surface-300 transition shadow-xs"
              title="Verify on LinkedIn"
            >
              <span>LinkedIn</span>
              <ExternalLink className="h-3 w-3" />
            </button>
            <button
              onClick={searchGoogle}
              className="inline-flex items-center gap-1.5 rounded-lg bg-surface-200 border border-hairline px-3 py-1.5 text-xs font-semibold text-content-primary hover:bg-surface-300 transition shadow-xs"
              title="Verify on Google"
            >
              <span>Google</span>
              <ExternalLink className="h-3 w-3" />
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-content-secondary hover:bg-surface-200 hover:text-content-primary ml-2 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Split Screen Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 overflow-y-auto flex-1">
          <ReviewFormFields formData={formData} setFormData={setFormData} />

          <ReviewPdfViewer
            pdfPage={pdfPage}
            setPdfPage={setPdfPage}
            pdfTotalPages={pdfTotalPages}
            pdfLoading={pdfLoading}
            pdfError={pdfError}
            pdfImageUrl={pdfImageUrl}
            loadPdfPage={loadPdfPage}
            matchedPdfSnippet={contact.matchedPdfSnippet}
            ocrSimilarityScore={contact.ocrSimilarityScore}
            renderHighlightedSnippet={renderHighlightedSnippet}
            duplicateRecordsCount={contact.isDuplicateOf?.length || 0}
          />
        </div>

        {/* Action Bar */}
        <ReviewActionBar
          saving={saving}
          onNotTargetAudience={handleNotTargetAudience}
          onSave={handleSave}
        />
      </div>
    </div>
  );
}
