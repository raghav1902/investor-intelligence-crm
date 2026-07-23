'use client';

import React from 'react';
import { X, Check, Copy } from 'lucide-react';
import { getWorkspaceId } from '@/lib/workspace';
import { useToast } from '@/components/ToastProvider';

interface DedupModalProps {
  primaryContact: any | null;
  onClose: () => void;
  onUpdate: () => void;
}

export default function DedupModal({ primaryContact, onClose, onUpdate }: DedupModalProps) {
  const { toast } = useToast();
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
        headers: { 
          'Content-Type': 'application/json',
          'x-workspace-id': getWorkspaceId() 
        },
        body: JSON.stringify({ status, reviewerComment: comment }),
      });

      toast('success', 'Resolution Saved', action === 'KEEP_CURRENT' ? 'Primary record confirmed.' : 'Flagged as career move.');
      onUpdate();
      onClose();
    } catch (err: any) {
      console.error(err);
      toast('error', 'Update Failed', err.message || 'Error updating duplicate');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-6xl rounded-2xl border border-hairline bg-surface-100 shadow-2xl flex flex-col max-h-[90vh] transition-colors duration-300">
        
        <div className="flex items-center justify-between border-b border-hairline px-6 py-4 bg-surface-200 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-surface-300 p-2 text-content-secondary border border-hairline">
              <Copy className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-content-primary">Duplicate Resolution Studio</h2>
              <p className="text-xs text-content-secondary">Compare records side-by-side without deleting any rows</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-content-secondary hover:bg-surface-200 hover:text-content-primary transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 bg-surface-100">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Primary Record */}
            <div className="rounded-xl border-2 border-emerald-600 bg-surface-100 p-5 space-y-4 relative shadow-md">
              <div className="absolute -top-3 left-4 bg-emerald-600 text-white font-bold text-xs px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                Primary Record (Row #{primaryContact.sourceRowNumber})
              </div>

              <div className="pt-2 space-y-2">
                <h3 className="text-lg font-extrabold text-content-primary">{primaryContact.fullName}</h3>
                <p className="text-sm font-bold text-emerald-400">{primaryContact.company}</p>
                <p className="text-xs font-mono font-semibold text-content-muted">{primaryContact.email || 'No email'}</p>
              </div>

              <div className="border-t border-hairline pt-3 space-y-1.5 text-xs text-content-muted">
                <p><strong className="text-content-primary">Title:</strong> {primaryContact.title || 'Unverified Role'}</p>
                <p><strong className="text-content-primary">Sector:</strong> {primaryContact.sectorCoverage || 'UNCONFIRMED'}</p>
                <p><strong className="text-content-primary">Status:</strong> <span className="text-amber-500 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded">{primaryContact.status}</span></p>
              </div>

              <div className="pt-4 flex flex-col gap-2">
                <button
                  onClick={() => handleMergeOrResolve(primaryContact._id, 'KEEP_CURRENT')}
                  className="w-full min-h-[44px] rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition shadow-xs"
                >
                  ✅ Confirm as Active Primary (Mark Green)
                </button>
              </div>
            </div>

            {/* Linked Duplicates */}
            {duplicates.map((dup: any) => (
              <div key={dup._id} className="rounded-xl border border-hairline bg-surface-100 p-5 space-y-4 relative shadow-xs">
                <div className="absolute -top-3 left-4 bg-orange-500/10 border border-orange-500/20 text-orange-500 font-bold text-xs px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                  Duplicate Candidate (Row #{dup.sourceRowNumber})
                </div>

                <div className="pt-2 space-y-2">
                  <h3 className="text-lg font-extrabold text-content-primary">{dup.fullName}</h3>
                  <p className="text-sm font-bold text-content-primary">{dup.company}</p>
                  <p className="text-xs font-mono font-semibold text-content-muted">{dup.email || 'No email'}</p>
                </div>

                <div className="border-t border-hairline pt-3 space-y-1.5 text-xs text-content-muted">
                  <p><strong className="text-content-primary">Title:</strong> {dup.title || 'Unverified Role'}</p>
                  <p><strong className="text-content-primary">Status:</strong> <span className="text-content-primary font-semibold">{dup.status}</span></p>
                  {dup.reviewerComment && <p className="text-amber-300 bg-amber-900/20 p-2 rounded italic font-mono border border-amber-800/50">Note: {dup.reviewerComment}</p>}
                </div>

                <div className="pt-4 flex flex-col gap-2">
                  <button
                    onClick={() => handleMergeOrResolve(dup._id, 'FLAG_MOVED')}
                    className="w-full min-h-[44px] rounded-lg border border-amber-700 bg-amber-900/20 px-3 py-2 text-xs font-bold text-amber-300 hover:bg-amber-900/40 transition shadow-xs"
                  >
                    ⚠️ Mark as Old Firm / Career Move (Keep Row)
                  </button>
                  <button
                    onClick={() => handleMergeOrResolve(dup._id, 'DELETE_DUPLICATE')}
                    className="w-full min-h-[44px] rounded-lg border border-rose-800 bg-rose-900/20 px-3 py-2 text-xs font-bold text-rose-300 hover:bg-rose-900/40 transition shadow-xs"
                  >
                    🗑️ Flag for Deletion (Duplicate)
                  </button>
                </div>
              </div>
            ))}

          </div>
        </div>

        <div className="flex justify-end border-t border-hairline bg-surface-200 px-6 py-4 rounded-b-2xl">
          <button
            onClick={onClose}
            className="w-full min-h-[44px] rounded-lg border border-hairline bg-surface-200 px-3 py-2 text-xs font-bold text-content-primary hover:bg-surface-300 transition shadow-xs"
          >
            Close Studio
          </button>
        </div>

      </div>
    </div>
  );
}
