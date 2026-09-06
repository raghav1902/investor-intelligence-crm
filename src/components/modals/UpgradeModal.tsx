'use client';

import React from 'react';
import { X, Check, Lock, Zap } from 'lucide-react';
import Link from 'next/link';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue?: () => void;
  triggerType: 'limit_reached' | 'premium_feature' | 'export_nudge';
}

export default function UpgradeModal({ isOpen, onClose, onContinue, triggerType }: UpgradeModalProps) {
  if (!isOpen) return null;

  const getHeaderContent = () => {
    switch (triggerType) {
      case 'limit_reached':
        return {
          title: "You've reached your free limit",
          description: "Upgrade to Premium to continue scanning and extracting investor contacts without limits."
        };
      case 'premium_feature':
        return {
          title: "Premium Feature",
          description: "Gemini Vision OCR and multi-page PDF processing are available exclusively on the Premium plan."
        };
      case 'export_nudge':
        return {
          title: "Export Ready",
          description: "Your data is ready to export. Did you know Premium users get unlimited scans and AI deduplication?"
        };
      default:
        return {
          title: "Upgrade to Premium",
          description: "Unlock the full power of InvestorIQ."
        };
    }
  };

  const { title, description } = getHeaderContent();
  const isSoftNudge = triggerType === 'export_nudge';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div 
        className="w-full max-w-2xl bg-[#0f1011] border border-[#23252a] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between p-6 border-b border-[#23252a]">
          <div>
            <h2 className="text-xl font-medium text-[#d0d6e0] flex items-center gap-2">
              <Lock className="w-5 h-5 text-emerald-500" />
              {title}
            </h2>
            <p className="text-sm text-[#8a8f98] mt-1.5">{description}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 -m-2 text-[#8a8f98] hover:text-[#d0d6e0] transition-colors rounded-lg hover:bg-[#141516]"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid md:grid-cols-2 bg-[#0a0a0c]">
          {/* Free Column */}
          <div className="p-6 border-b md:border-b-0 md:border-r border-[#23252a]">
            <h3 className="text-sm font-medium text-[#8a8f98] mb-4 uppercase tracking-widest">Free Plan</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-[#8a8f98]">
                <Check className="w-4 h-4 text-[#62666d] shrink-0 mt-0.5" />
                <span>5 scans total</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-[#8a8f98]">
                <Check className="w-4 h-4 text-[#62666d] shrink-0 mt-0.5" />
                <span>Basic OCR (Tesseract.js)</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-[#8a8f98]">
                <Check className="w-4 h-4 text-[#62666d] shrink-0 mt-0.5" />
                <span>Basic Deduplication</span>
              </li>
            </ul>
          </div>

          {/* Premium Column */}
          <div className="p-6 bg-[#141516] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl" />
            <h3 className="text-sm font-medium text-emerald-500 mb-4 uppercase tracking-widest flex items-center gap-2">
              Premium
              <Zap className="w-3.5 h-3.5" fill="currentColor" />
            </h3>
            <ul className="space-y-4 relative z-10">
              <li className="flex items-start gap-3 text-sm text-[#d0d6e0]">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Unlimited scans (PDF, Image, Excel)</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-[#d0d6e0]">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Gemini 2.0 Flash Vision OCR</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-[#d0d6e0]">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Advanced AI-flagged clusters</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-[#d0d6e0]">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Unlimited Excel exports</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-[#23252a] bg-[#0f1011]">
          <button
            onClick={isSoftNudge && onContinue ? onContinue : onClose}
            className="px-4 py-2 text-sm font-medium text-[#d0d6e0] bg-[#141516] border border-[#23252a] rounded-lg hover:bg-[#23252a] transition-colors"
          >
            {isSoftNudge ? 'Continue Export' : 'Maybe Later'}
          </button>
          <Link
            href="/pricing"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-[#010102] bg-emerald-500 rounded-lg hover:bg-emerald-400 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]"
          >
            Upgrade Now
          </Link>
        </div>
      </div>
    </div>
  );
}
