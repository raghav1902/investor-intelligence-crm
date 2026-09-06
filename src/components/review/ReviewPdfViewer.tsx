'use client';

import React from 'react';
import { FileText, ChevronLeft, ChevronRight, Loader2, Image as ImageIcon } from 'lucide-react';

interface ReviewPdfViewerProps {
  pdfPage: number;
  setPdfPage: (updater: number | ((p: number) => number)) => void;
  pdfTotalPages: number;
  pdfLoading: boolean;
  pdfError: string | null;
  pdfImageUrl: string | null;
  loadPdfPage: (p: number) => void;
  matchedPdfSnippet?: string;
  ocrSimilarityScore?: number;
  renderHighlightedSnippet: (snippet: string) => React.ReactNode;
  duplicateRecordsCount?: number;
}

export default function ReviewPdfViewer({
  pdfPage,
  setPdfPage,
  pdfTotalPages,
  pdfLoading,
  pdfError,
  pdfImageUrl,
  loadPdfPage,
  matchedPdfSnippet,
  ocrSimilarityScore,
  renderHighlightedSnippet,
  duplicateRecordsCount = 0,
}: ReviewPdfViewerProps) {
  return (
    <div className="space-y-4 flex flex-col justify-between">
      <div className="rounded-xl border border-hairline bg-surface-200 p-5 space-y-4 shadow-xs flex-1 transition-colors">
        <div className="flex items-center justify-between border-b border-hairline pb-3">
          <h3 className="text-sm font-bold text-content-primary flex items-center gap-2">
            <FileText className="h-4 w-4" />
            2. Source PDF — Visual Reference
          </h3>
          {pdfTotalPages > 0 && (
            <span className="text-xs font-medium text-content-secondary">
              {pdfTotalPages} pages total
            </span>
          )}
        </div>

        {/* PDF Page Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const p = Math.max(1, pdfPage - 1);
              setPdfPage(p);
              loadPdfPage(p);
            }}
            disabled={pdfPage <= 1 || pdfLoading}
            className="rounded-lg border border-hairline bg-surface-200 p-1.5 text-content-muted hover:bg-surface-300 disabled:opacity-40 shadow-xs"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-content-muted">Page</span>
            <input
              type="number"
              min={1}
              max={pdfTotalPages || 999}
              value={pdfPage}
              onChange={(e) => setPdfPage(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-16 rounded-lg border border-hairline bg-surface-100 px-2 py-1 text-xs text-center font-bold text-content-primary focus:border-emerald-500 focus:outline-none shadow-xs"
            />
            {pdfTotalPages > 0 && <span className="text-xs text-content-secondary">/ {pdfTotalPages}</span>}
          </div>
          <button
            onClick={() => {
              const p = pdfPage + 1;
              setPdfPage(p);
              loadPdfPage(p);
            }}
            disabled={(pdfTotalPages > 0 && pdfPage >= pdfTotalPages) || pdfLoading}
            className="rounded-lg border border-hairline bg-surface-200 p-1.5 text-content-muted hover:bg-surface-300 disabled:opacity-40 shadow-xs"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => loadPdfPage(pdfPage)}
            disabled={pdfLoading}
            className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-surface-300 border border-hairline px-3 py-1.5 text-xs font-bold text-content-primary hover:bg-surface-200 disabled:opacity-50 transition shadow-xs"
          >
            {pdfLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImageIcon className="h-3.5 w-3.5" />}
            <span>{pdfLoading ? 'Rendering...' : 'Load Page'}</span>
          </button>
        </div>

        {/* PDF Page Image */}
        {pdfError && (
          <div className="rounded-lg bg-rose-900/20 p-3 text-xs text-rose-400 border border-rose-800/50 font-medium">
            {pdfError}
          </div>
        )}

        {pdfImageUrl ? (
          <div className="rounded-lg border border-blue-800/50 bg-surface-100 overflow-hidden shadow-xs max-h-[400px] overflow-y-auto">
            <img src={pdfImageUrl} alt={`PDF Page ${pdfPage}`} className="w-full" />
          </div>
        ) : !pdfError && (
          <div className="rounded-lg bg-surface-100 p-8 text-center text-xs text-content-secondary border border-dashed border-hairline">
            <ImageIcon className="h-8 w-8 text-content-muted mx-auto mb-2" />
            <p className="font-medium">Click &quot;Load Page&quot; to view the source PDF</p>
            <p className="mt-1 text-content-secondary">
              Navigate to the page containing this contact&apos;s data and compare visually
            </p>
          </div>
        )}

        <div className="text-xs text-content-muted space-y-1 bg-surface-100 p-3.5 rounded-lg border border-hairline shadow-xs">
          <p className="font-bold text-content-primary">💡 Worked Example Rule (Client Guidance):</p>
          <p>
            If an email has a stray underscore or broken line (e.g.,{' '}
            <code className="text-content-primary bg-surface-200 px-1 py-0.5 rounded font-bold">
              gaurav._gupta@blackrock.com
            </code>{' '}
            vs{' '}
            <code className="text-content-primary bg-surface-200 px-1 py-0.5 rounded font-bold">
              gaurav.gupta1@blackrock.com
            </code>
            ), verify against the PDF above. Discard OCR artifacts and keep the clean email.
          </p>
        </div>

        {matchedPdfSnippet && (
          <div className="text-xs text-content-muted space-y-1 bg-emerald-500/5 p-3.5 rounded-lg border border-emerald-500/20 shadow-xs mt-2">
            <p className="font-bold text-emerald-500">
              🤖 Matched OCR Snippet (Similarity: {ocrSimilarityScore}%)
            </p>
            <p className="font-mono text-emerald-500/80 break-words leading-relaxed">
              {renderHighlightedSnippet(matchedPdfSnippet)}
            </p>
          </div>
        )}
      </div>

      {duplicateRecordsCount > 0 && (
        <div className="rounded-xl border border-orange-500/30 bg-orange-500/10 p-4 space-y-2 shadow-xs">
          <h4 className="text-xs font-bold text-orange-500 uppercase tracking-wider flex items-center gap-2">
            ⚡ Duplicate Cluster Detected ({duplicateRecordsCount} linked record{duplicateRecordsCount > 1 ? 's' : ''})
          </h4>
          <p className="text-xs text-orange-500/80">
            Verify whether the contact has moved firms. Update title/email here, and flag the older duplicate record with a comment rather than deleting.
          </p>
        </div>
      )}

      <div className="rounded-xl border border-hairline bg-surface-200 p-4">
        <h4 className="text-xs font-bold text-content-primary mb-1">🎯 Target Audience Criteria:</h4>
        <ul className="text-xs text-content-secondary space-y-1 list-disc list-inside">
          <li>
            <strong className="text-content-primary">Buy-side only:</strong> Institutional asset managers (mutual/hedge funds, pensions). No sell-side or vendors.
          </li>
          <li>
            <strong className="text-content-primary">Analysts &amp; PMs:</strong> Active investment decision makers (no sales, IR, or operations).
          </li>
          <li>
            <strong className="text-content-primary">Sector:</strong> Energy, Power, Renewables, or Industrials.
          </li>
        </ul>
      </div>
    </div>
  );
}
