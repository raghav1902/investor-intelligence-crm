import React from 'react';
import { Search, Filter } from 'lucide-react';

interface DashboardFiltersProps {
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  sectorFilter: string;
  setSectorFilter: (val: string) => void;
  setPagination: (updater: (prev: any) => any) => void;
}

export default function DashboardFilters({
  searchInputRef,
  searchQuery,
  setSearchQuery,
  sectorFilter,
  setSectorFilter,
  setPagination,
}: DashboardFiltersProps) {
  return (
    <div className="mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 rounded-lg border border-hairline bg-surface-100 p-4 transition-colors duration-300">
      <div className="flex flex-1 items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-content-muted" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search by name, company, email, or title... (Press '/' to focus)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-hairline bg-surface-base pl-9 pr-16 py-2 text-sm text-content-primary placeholder-content-muted focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium transition-colors"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-block rounded border border-hairline bg-surface-200 px-1.5 py-0.5 text-[10px] font-bold text-content-secondary font-mono">
            ⌘K / /
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-content-secondary" />
          <span className="text-xs font-medium text-content-secondary">Sector:</span>
        </div>
        <select
          value={sectorFilter}
          onChange={(e) => {
            setSectorFilter(e.target.value);
            setPagination((p) => ({ ...p, page: 1 }));
          }}
          className="rounded-md border border-hairline bg-surface-base px-3 py-2 text-xs font-medium text-content-primary focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
        >
          <option value="ALL">All Sectors</option>
          <option value="ENERGY">⚡ Energy</option>
          <option value="POWER">🔋 Power</option>
          <option value="RENEWABLES">🌱 Renewables</option>
          <option value="INDUSTRIALS">🏭 Industrials</option>
          <option value="UNCONFIRMED">⏳ Unconfirmed</option>
        </select>
      </div>
    </div>
  );
}
