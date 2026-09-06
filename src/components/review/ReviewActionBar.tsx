'use client';

import React from 'react';
import { Check, AlertTriangle, ShieldAlert, Ban } from 'lucide-react';

interface ReviewActionBarProps {
  saving: boolean;
  onNotTargetAudience: () => void;
  onSave: (status: string) => void;
}

export default function ReviewActionBar({
  saving,
  onNotTargetAudience,
  onSave,
}: ReviewActionBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between border-t border-hairline bg-surface-200 px-6 py-4 rounded-b-2xl gap-3">
      <div className="flex items-center gap-2">
        <button
          onClick={onNotTargetAudience}
          disabled={saving}
          className="inline-flex items-center gap-1.5 rounded-lg border border-amber-700 bg-amber-900/20 px-3 py-2 text-xs font-bold text-amber-400 hover:bg-amber-900/40 transition shadow-xs"
        >
          <Ban className="h-4 w-4 text-amber-500" />
          <span>Not Target Audience (Keep &amp; Comment)</span>
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => onSave('FLAGGED_YELLOW')}
          disabled={saving}
          className="inline-flex items-center gap-1.5 rounded-lg border border-amber-700 bg-amber-900/40 px-4 py-2 text-xs font-bold text-amber-200 hover:bg-amber-800 transition shadow-xs"
        >
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <span>Flag Yellow (Need Info)</span>
        </button>

        <button
          onClick={() => onSave('FLAGGED_RED')}
          disabled={saving}
          className="inline-flex items-center gap-1.5 rounded-lg border border-rose-700 bg-rose-900/40 px-4 py-2 text-xs font-bold text-rose-200 hover:bg-rose-800 transition shadow-xs"
        >
          <ShieldAlert className="h-4 w-4 text-rose-500" />
          <span>Flag Red (Error / Missing)</span>
        </button>

        <button
          onClick={() => onSave('RESOLVED_GREEN')}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-2 text-xs font-bold text-[#010102] hover:bg-emerald-400 transition"
        >
          <Check className="h-4 w-4" />
          <span>Save &amp; Mark Green (Resolved)</span>
        </button>
      </div>
    </div>
  );
}
