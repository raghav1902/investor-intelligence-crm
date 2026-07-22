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
    gradient: 'from-blue-500 to-indigo-600',
    shadow: 'shadow-blue-500/20',
    activeBg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-400 dark:border-blue-600 ring-2 ring-blue-300/40 dark:ring-blue-600/40',
    hoverBg: 'hover:bg-blue-50/50 dark:hover:bg-blue-900/10 hover:border-blue-300 dark:hover:border-blue-700',
    textColor: 'text-blue-700 dark:text-blue-400',
    stat: (s: any) => s.total,
    sub: null,
  },
  {
    id: 'UNREVIEWED',
    label: 'Unreviewed Queue',
    icon: HelpCircle,
    gradient: 'from-slate-500 to-slate-700',
    shadow: 'shadow-slate-500/20',
    activeBg: 'bg-slate-100 dark:bg-slate-800 border-slate-500 dark:border-slate-600 ring-2 ring-slate-300/40 dark:ring-slate-600/40',
    hoverBg: 'hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-700',
    textColor: 'text-slate-700 dark:text-slate-300',
    stat: (s: any) => s.unreviewed,
    sub: (s: any) => s.total > 0 ? `${Math.round((s.unreviewed / s.total) * 100)}%` : null,
  },
  {
    id: 'FLAGGED_YELLOW',
    label: 'Needs Verification',
    icon: AlertTriangle,
    gradient: 'from-amber-400 to-orange-500',
    shadow: 'shadow-amber-500/20',
    activeBg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-400 dark:border-amber-600 ring-2 ring-amber-300/40 dark:ring-amber-600/40',
    hoverBg: 'hover:bg-amber-50/50 dark:hover:bg-amber-900/10 hover:border-amber-300 dark:hover:border-amber-700',
    textColor: 'text-amber-700 dark:text-amber-400',
    stat: (s: any) => s.yellow,
    sub: (s: any) => s.total > 0 ? `${Math.round((s.yellow / s.total) * 100)}%` : null,
  },
  {
    id: 'FLAGGED_RED',
    label: 'Critical Issues',
    icon: AlertCircle,
    gradient: 'from-rose-500 to-red-600',
    shadow: 'shadow-rose-500/20',
    activeBg: 'bg-rose-50 dark:bg-rose-900/20 border-rose-400 dark:border-rose-600 ring-2 ring-rose-300/40 dark:ring-rose-600/40',
    hoverBg: 'hover:bg-rose-50/50 dark:hover:bg-rose-900/10 hover:border-rose-300 dark:hover:border-rose-700',
    textColor: 'text-rose-700 dark:text-rose-400',
    stat: (s: any) => s.red,
    sub: (s: any) => s.total > 0 ? `${Math.round((s.red / s.total) * 100)}%` : null,
  },
  {
    id: 'RESOLVED_GREEN',
    label: 'Verified & Clean',
    icon: CheckCircle2,
    gradient: 'from-emerald-500 to-teal-600',
    shadow: 'shadow-emerald-500/20',
    activeBg: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-400 dark:border-emerald-600 ring-2 ring-emerald-300/40 dark:ring-emerald-600/40',
    hoverBg: 'hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 hover:border-emerald-300 dark:hover:border-emerald-700',
    textColor: 'text-emerald-700 dark:text-emerald-400',
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 shadow-xs transition-colors">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Database Quality Score</span>
                <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/50 px-1.5 py-0.5 rounded">
                  {percentClean}% Verified
                </span>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                {stats.green} of {stats.total} contacts resolved and ready for CRM export
              </p>
            </div>
          </div>

          <div className="flex-1 max-w-xs w-full">
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                style={{ width: `${percentClean}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {cards.map((card) => {
          const Icon = card.icon;
          const isActive = !isDuplicateFilter && activeFilter === card.id;
          const count = card.stat(stats);
          const sub = card.sub ? card.sub(stats) : null;

          return (
            <button
              key={card.id}
              onClick={() => {
                if (isDuplicateFilter) onSelectDuplicates();
                onSelectFilter(card.id);
              }}
              className={`group flex flex-col rounded-xl border p-4 text-left transition-all duration-150 ${
                isActive
                  ? card.activeBg
                  : `bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 ${card.hoverBg}`
              } shadow-xs hover:shadow-sm`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${card.gradient} shadow-md ${card.shadow}`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider leading-tight truncate">{card.label}</span>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight tabular-nums">
                  {count.toLocaleString()}
                </span>
                {sub && (
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${isActive ? card.textColor : 'text-slate-400 dark:text-slate-500'}`}>
                    {sub}
                  </span>
                )}
              </div>
            </button>
          );
        })}

        {/* Duplicates Card */}
        <button
          onClick={onSelectDuplicates}
          className={`group flex flex-col rounded-xl border p-4 text-left transition-all duration-150 shadow-xs hover:shadow-sm ${
            isDuplicateFilter
              ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-400 dark:border-purple-600 ring-2 ring-purple-300/40 dark:ring-purple-600/40'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-purple-50/50 dark:hover:bg-purple-900/10 hover:border-purple-300 dark:hover:border-purple-700'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 shadow-md shadow-purple-500/20">
              <Copy className="h-4 w-4 text-white" />
            </div>
            <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider leading-tight truncate">Duplicates Found</span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight tabular-nums">
              {stats.duplicates.toLocaleString()}
            </span>
            {stats.duplicates > 0 && (
              <span className="text-[10px] font-bold bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 px-1.5 py-0.5 rounded animate-pulse">
                Action Req
              </span>
            )}
          </div>
        </button>
      </div>
    </div>
  );
}
