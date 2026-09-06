import React from 'react';
import Link from 'next/link';
import { AlertTriangle, X } from 'lucide-react';

interface DemoBannerProps {
  showDemoBanner: boolean;
  setShowDemoBanner: (show: boolean) => void;
}

export default function DemoBanner({ showDemoBanner, setShowDemoBanner }: DemoBannerProps) {
  if (!showDemoBanner) return null;

  return (
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
  );
}
