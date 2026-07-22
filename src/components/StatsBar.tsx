'use client';

import React from 'react';
import { Users, AlertTriangle, AlertCircle, CheckCircle2, Copy, HelpCircle } from 'lucide-react';

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

export default function StatsBar({ stats, activeFilter, onSelectFilter, onSelectDuplicates, isDuplicateFilter }: StatsProps) {
  const cards = [
    {
      id: 'ALL',
      label: 'Total Contacts',
      count: stats.total,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-white hover:bg-blue-50/40',
      border: 'border-slate-200',
      activeBorder: 'border-blue-500 bg-blue-50/50',
    },
    {
      id: 'UNREVIEWED',
      label: 'Unreviewed Queue',
      count: stats.unreviewed,
      icon: HelpCircle,
      color: 'text-slate-600',
      bg: 'bg-white hover:bg-slate-100/60',
      border: 'border-slate-200',
      activeBorder: 'border-slate-500 bg-slate-100',
    },
    {
      id: 'FLAGGED_YELLOW',
      label: 'Yellow Flagged (Verify)',
      count: stats.yellow,
      icon: AlertTriangle,
      color: 'text-amber-600',
      bg: 'bg-white hover:bg-amber-50/40',
      border: 'border-slate-200',
      activeBorder: 'border-amber-500 bg-amber-50/60',
    },
    {
      id: 'FLAGGED_RED',
      label: 'Red Flagged (Critical)',
      count: stats.red,
      icon: AlertCircle,
      color: 'text-rose-600',
      bg: 'bg-white hover:bg-rose-50/40',
      border: 'border-slate-200',
      activeBorder: 'border-rose-500 bg-rose-50/60',
    },
    {
      id: 'RESOLVED_GREEN',
      label: 'Green Resolved (Done)',
      count: stats.green,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-white hover:bg-emerald-50/40',
      border: 'border-slate-200',
      activeBorder: 'border-emerald-500 bg-emerald-50/60',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 mb-6">
      {cards.map((card) => {
        const Icon = card.icon;
        const isActive = !isDuplicateFilter && activeFilter === card.id;
        return (
          <button
            key={card.id}
            onClick={() => {
              if (isDuplicateFilter) onSelectDuplicates(); // turn off dedup
              onSelectFilter(card.id);
            }}
            className={`flex flex-col rounded-xl border p-4 text-left transition duration-150 shadow-xs hover:shadow-sm ${card.bg} ${
              isActive ? `${card.activeBorder} ring-2 ring-${card.color.replace('text-', '')}/20 shadow-sm` : card.border
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{card.label}</span>
              <Icon className={`h-4 w-4 ${card.color}`} />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-slate-900 tracking-tight">{card.count.toLocaleString()}</span>
              {stats.total > 0 && card.id !== 'ALL' && (
                <span className="text-xs font-semibold text-slate-500">
                  {Math.round((card.count / stats.total) * 100)}%
                </span>
              )}
            </div>
          </button>
        );
      })}

      {/* Duplicates Card */}
      <button
        onClick={onSelectDuplicates}
        className={`flex flex-col rounded-xl border p-4 text-left transition duration-150 shadow-xs hover:shadow-sm ${
          isDuplicateFilter 
            ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-500/20 shadow-sm' 
            : 'border-slate-200 bg-white hover:bg-purple-50/30'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">Duplicates Found</span>
          <Copy className="h-4 w-4 text-purple-600" />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-extrabold text-slate-900 tracking-tight">{stats.duplicates.toLocaleString()}</span>
          <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-1.5 py-0.5 rounded">Action Req</span>
        </div>
      </button>
    </div>
  );
}
