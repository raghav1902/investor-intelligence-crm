import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Trash2, X } from 'lucide-react';

interface BulkActionsBarProps {
  selectedIds: Set<string>;
  setSelectedIds: (val: Set<string>) => void;
  handleBulkStatusUpdate: (status: string) => void;
  handleBulkDelete: () => void;
}

export default function BulkActionsBar({
  selectedIds,
  setSelectedIds,
  handleBulkStatusUpdate,
  handleBulkDelete,
}: BulkActionsBarProps) {
  return (
    <AnimatePresence>
      {selectedIds.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 50, x: '-50%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="fixed bottom-6 left-1/2 z-40 flex items-center gap-4 rounded-full border border-emerald-500/30 bg-[#0f1011]/85 backdrop-blur-md px-6 py-3.5 shadow-[0_10px_30px_rgba(0,0,0,0.5),0_0_20px_rgba(16,185,129,0.05)] transition-all"
        >
          <span className="text-xs font-semibold text-content-primary whitespace-nowrap">
            <span className="text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded font-mono mr-1.5 border border-emerald-500/20">{selectedIds.size}</span>
            selected
          </span>
          <div className="h-4 w-px bg-hairline" />
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkStatusUpdate('RESOLVED_GREEN')}
              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-4 py-1.5 text-xs font-bold text-[#010102] hover:bg-emerald-400 hover:scale-105 transition-all shadow-md active:scale-95"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Verify</span>
            </button>
            <button
              onClick={() => handleBulkStatusUpdate('FLAGGED_YELLOW')}
              className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 px-4 py-1.5 text-xs font-bold text-amber-400 hover:bg-amber-500/20 hover:scale-105 transition-all active:scale-95"
            >
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
              <span>Flag Yellow</span>
            </button>
            <button
              onClick={handleBulkDelete}
              className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 border border-red-500/30 px-4 py-1.5 text-xs font-bold text-red-400 hover:bg-red-500/20 hover:scale-105 transition-all active:scale-95"
            >
              <Trash2 className="h-3.5 w-3.5 text-red-500" />
              <span>Delete</span>
            </button>
          </div>
          <div className="h-4 w-px bg-hairline" />
          <button
            onClick={() => setSelectedIds(new Set())}
            className="p-1 rounded-full text-content-secondary hover:bg-surface-200 hover:text-content-primary transition"
            title="Clear selection"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
