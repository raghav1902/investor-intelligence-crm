'use client';

import React from 'react';
import { Users, AlertTriangle, AlertCircle, CheckCircle2, Copy, HelpCircle, ShieldCheck } from 'lucide-react';

interface StatsProps {
  stats: {
    total: number;
    unreviewed: number;
    yellow: number;
    red: number;
    green: number;
    duplicates: number;
  };
  activeFilter: string;
  onSelectFilter: (status: string) => void;
  onSelectDuplicates: () => void;
  isDuplicateFilter: boolean;
}

const cards = [
  {
    id: 'ALL',
    label: 'Total Contacts',
    icon: Users,
    iconBg: 'bg-surface-300 text-content-primary',
    textColor: 'text-content-primary',
    stat: (s: any) => s.total,
    sub: null,
  },
  {
    id: 'UNREVIEWED',
    label: 'Unreviewed Queue',
    icon: HelpCircle,
    iconBg: 'bg-surface-300 text-content-secondary',
    textColor: 'text-content-secondary',
    stat: (s: any) => s.unreviewed,
    sub: (s: any) => s.total > 0 ? `${Math.round((s.unreviewed / s.total) * 100)}%` : null,
  },
  {
    id: 'FLAGGED_YELLOW',
    label: 'Needs Verification',
    icon: AlertTriangle,
    iconBg: 'bg-amber-500/10 text-amber-500',
    textColor: 'text-amber-500',
    stat: (s: any) => s.yellow,
    sub: (s: any) => s.total > 0 ? `${Math.round((s.yellow / s.total) * 100)}%` : null,
  },
  {
    id: 'FLAGGED_RED',
    label: 'Critical Issues',
    icon: AlertCircle,
    iconBg: 'bg-red-500/10 text-red-500',
    textColor: 'text-red-500',
    stat: (s: any) => s.red,
    sub: (s: any) => s.total > 0 ? `${Math.round((s.red / s.total) * 100)}%` : null,
  },
  {
    id: 'RESOLVED_GREEN',
    label: 'Verified & Clean',
    icon: CheckCircle2,
    iconBg: 'bg-emerald-500/10 text-emerald-500',
    textColor: 'text-emerald-500',
    stat: (s: any) => s.green,
    sub: (s: any) => s.total > 0 ? `${Math.round((s.green / s.total) * 100)}%` : null,
  },
];

export default function StatsBar({ stats, activeFilter, onSelectFilter, onSelectDuplicates, isDuplicateFilter }: StatsProps) {
  const percentClean = stats.total > 0 ? Math.round((stats.green / stats.total) * 100) : 0;

  return (
    <div className="space-y-4 mb-6">
      {/* Visual Clean Progress Bar */}
      {stats.total > 0 && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-hairline bg-[#0f1011]/40 backdrop-blur-md px-5 py-4 transition-colors">
          <div className="flex items-center gap-4">
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center">
              {/* Circular SVG Progress Ring */}
              <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  className="stroke-surface-300 fill-none"
                  strokeWidth="3"
                />
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  className="stroke-emerald-500 fill-none transition-all duration-1000"
                  strokeWidth="3.5"
                  strokeDasharray="125.66"
                  strokeDashoffset={125.66 - (125.66 * percentClean) / 100}
                  strokeLinecap="round"
                  style={{ filter: 'drop-shadow(0 0 4px rgba(16,185,129,0.4))' }}
                />
              </svg>
              <ShieldCheck className="h-5 w-5 text-emerald-500 relative z-10" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-content-primary tracking-tight">Database Quality Score</span>
                <span className="text-xs font-mono font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  {percentClean}% Verified
                </span>
              </div>
              <p className="text-xs text-content-secondary font-normal mt-1 leading-normal">
                {stats.green} of {stats.total} contacts resolved and ready for CRM export
              </p>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {cards.map((card) => {
          const Icon = card.icon;
          const isActive = !isDuplicateFilter && activeFilter === card.id;
          const count = card.stat(stats);
          const sub = card.sub ? card.sub(stats) : null;

          const isZero = count === 0;

          // Compute colors dynamically if count is zero to mute them
          const displayIconBg = isZero ? 'bg-surface-300 text-content-muted' : card.iconBg;
          const displayInactiveBg = 'bg-[#0f1011]/40 backdrop-blur-md border-hairline';
          const displayActiveBg = 'bg-surface-200 border-emerald-500 ring-1 ring-emerald-500/50 scale-[1.02] shadow-[0_0_15px_rgba(16,185,129,0.06)]';
          const displayHoverBg = 'hover:scale-[1.02] hover:bg-surface-200 hover:border-emerald-500/20 hover:shadow-[0_0_15px_rgba(16,185,129,0.03)]';

          return (
            <button
              key={card.id}
              onClick={() => {
                if (isDuplicateFilter) onSelectDuplicates();
                onSelectFilter(card.id);
              }}
              className={`group flex flex-col rounded-xl border p-4 text-left transition-all duration-300 ${
                isActive
                  ? displayActiveBg
                  : `${displayInactiveBg} ${displayHoverBg}`
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${displayIconBg}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className={`text-[11px] font-medium tracking-widest uppercase leading-tight truncate ${isZero ? 'text-content-muted' : card.textColor}`}>{card.label}</span>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-medium text-content-primary tracking-tight tabular-nums">
                  {count.toLocaleString()}
                </span>
                {sub && (
                  <span className={`text-xs font-medium ${isActive ? 'text-content-secondary' : 'text-content-muted'}`}>
                    {sub}
                  </span>
                )}
              </div>
            </button>
          );
        })}

        {/* Duplicates Card */}
        {/* Duplicates Card */}
        {(() => {
          const isZero = stats.duplicates === 0;
          const displayIconBg = isZero ? 'bg-surface-300 text-content-muted' : 'bg-orange-500/10 text-orange-500';
          const displayActiveBg = 'bg-surface-200 border-emerald-500 ring-1 ring-emerald-500/50 scale-[1.02] shadow-[0_0_15px_rgba(16,185,129,0.06)]';
          const displayInactiveHover = 'bg-[#0f1011]/40 backdrop-blur-md border-hairline hover:scale-[1.02] hover:bg-surface-200 hover:border-orange-500/20 hover:shadow-[0_0_15px_rgba(249,115,22,0.03)]';

          return (
            <button
              onClick={onSelectDuplicates}
              className={`group flex flex-col rounded-xl border p-4 text-left transition-all duration-300 ${
                isDuplicateFilter ? displayActiveBg : displayInactiveHover
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${displayIconBg}`}>
                  <Copy className="h-4 w-4" />
                </div>
                <span className={`text-[11px] font-medium uppercase tracking-widest leading-tight truncate ${isZero ? 'text-content-muted' : 'text-orange-500'}`}>Duplicates Found</span>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-medium text-content-primary tracking-tight tabular-nums">
                  {stats.duplicates.toLocaleString()}
                </span>
                {stats.duplicates > 0 && (
                  <span className="text-[10px] font-medium bg-orange-500/10 text-orange-500 px-1.5 py-0.5 rounded animate-pulse">
                    Action Req
                  </span>
                )}
              </div>
            </button>
          );
        })()}
      </div>
    </div>
  );
}
