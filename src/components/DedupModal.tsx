'use client';

import React from 'react';
import { X, Check, Copy } from 'lucide-react';

interface DedupModalProps {
  primaryContact: any | null;
  onClose: () => void;
  onUpdate: () => void;
}

export default function DedupModal({ primaryContact, onClose, onUpdate }: DedupModalProps) {
  if (!primaryContact || !primaryContact.isDuplicateOf || primaryContact.isDuplicateOf.length === 0) return null;

  const duplicates = primaryContact.isDuplicateOf;

  const handleMergeOrResolve = async (contactId: string, action: 'KEEP_CURRENT' | 'FLAG_MOVED') => {
    try {
      const status = action === 'KEEP_CURRENT' ? 'RESOLVED_GREEN' : 'FLAGGED_YELLOW';
      const comment = action === 'KEEP_CURRENT' 
        ? 'Confirmed current primary record. Duplicate cluster resolved.'
        : 'Contact has moved firms or changed roles. Older record kept per zero-deletion rule.';

      await fetch(`/api/contacts/${contactId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, reviewerComment: comment }),
      });

      onUpdate();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Error updating duplicate');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-6xl rounded-2xl border border-slate-200 bg-white shadow-2xl flex flex-col max-h-[90vh]">
        
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50/50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-100 p-2 text-purple-700 border border-purple-200">
              <Copy className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Duplicate Resolution Studio</h2>
              <p className="text-xs text-slate-500">Compare records side-by-side without deleting any rows</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 bg-slate-50/30">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Primary Record */}
            <div className="rounded-xl border-2 border-emerald-500 bg-white p-5 space-y-4 relative shadow-md">
              <div className="absolute -top-3 left-4 bg-emerald-600 text-white font-bold text-xs px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                Primary Record (Row #{primaryContact.sourceRowNumber})
              </div>

              <div className="pt-2 space-y-2">
                <h3 className="text-lg font-extrabold text-slate-900">{primaryContact.fullName}</h3>
                <p className="text-sm font-bold text-emerald-700">{primaryContact.company}</p>
                <p className="text-xs font-mono font-semibold text-slate-600">{primaryContact.email || 'No email'}</p>
              </div>

              <div className="border-t border-slate-100 pt-3 space-y-1.5 text-xs text-slate-600">
                <p><strong className="text-slate-800">Title:</strong> {primaryContact.title || 'Unverified Role'}</p>
                <p><strong className="text-slate-800">Sector:</strong> {primaryContact.sectorCoverage || 'UNCONFIRMED'}</p>
                <p><strong className="text-slate-800">Status:</strong> <span className="text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded">{primaryContact.status}</span></p>
              </div>

              <div className="pt-4 flex flex-col gap-2">
                <button
                  onClick={() => handleMergeOrResolve(primaryContact._id, 'KEEP_CURRENT')}
                  className="w-full rounded-lg bg-emerald-600 px-3 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 transition shadow-xs"
                >
                  ✅ Confirm as Active Primary (Mark Green)
                </button>
              </div>
            </div>

            {/* Linked Duplicates */}
            {duplicates.map((dup: any) => (
              <div key={dup._id} className="rounded-xl border border-slate-200 bg-white p-5 space-y-4 relative shadow-xs">
                <div className="absolute -top-3 left-4 bg-purple-100 border border-purple-300 text-purple-800 font-bold text-xs px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                  Duplicate Candidate (Row #{dup.sourceRowNumber})
                </div>

                <div className="pt-2 space-y-2">
                  <h3 className="text-lg font-extrabold text-slate-900">{dup.fullName}</h3>
                  <p className="text-sm font-bold text-purple-700">{dup.company}</p>
                  <p className="text-xs font-mono font-semibold text-slate-600">{dup.email || 'No email'}</p>
                </div>

                <div className="border-t border-slate-100 pt-3 space-y-1.5 text-xs text-slate-600">
                  <p><strong className="text-slate-800">Title:</strong> {dup.title || 'Unverified Role'}</p>
                  <p><strong className="text-slate-800">Status:</strong> <span className="text-slate-700 font-semibold">{dup.status}</span></p>
                  {dup.reviewerComment && <p className="text-amber-800 bg-amber-50 p-2 rounded italic font-mono border border-amber-200">Note: {dup.reviewerComment}</p>}
                </div>

                <div className="pt-4 flex flex-col gap-2">
                  <button
                    onClick={() => handleMergeOrResolve(dup._id, 'FLAG_MOVED')}
                    className="w-full rounded-lg border border-amber-300 bg-amber-50 px-3 py-2.5 text-xs font-bold text-amber-900 hover:bg-amber-100 transition shadow-xs"
                  >
                    ⚠️ Mark as Old Firm / Career Move (Keep Row)
                  </button>
                </div>
              </div>
            ))}

          </div>
        </div>

        <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-6 py-4 rounded-b-2xl">
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-300 transition"
          >
            Close Studio
          </button>
        </div>

      </div>
    </div>
  );
}
