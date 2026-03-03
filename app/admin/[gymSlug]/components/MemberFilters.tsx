'use client';

import { motion } from 'framer-motion';

interface MemberFiltersProps {
  filter: 'all' | 'pending' | 'processed' | 'failed';
  ptFilter: 'all' | 'yes' | 'maybe';
  onFilterChange: (f: 'all' | 'pending' | 'processed' | 'failed') => void;
  onPtFilterChange: (f: 'all' | 'yes' | 'maybe') => void;
  memberCount: number;
}

export function MemberFilters({
  filter,
  ptFilter,
  onFilterChange,
  onPtFilterChange,
  memberCount,
}: MemberFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex bg-white dark:bg-[#131316] border border-gray-200 dark:border-zinc-800/80 rounded-md p-1 relative w-fit">
          {(['all', 'pending', 'processed', 'failed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => onFilterChange(f)}
              className={`relative px-3 py-2 sm:py-1.5 rounded-sm text-xs font-medium capitalize transition-all touch-manipulation ${
                filter === f ? 'text-gray-900 dark:text-zinc-100' : 'text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200'
              }`}
            >
              {filter === f && (
                <motion.div
                  layoutId="filter-active-bg"
                  className="absolute inset-0 bg-gray-200 dark:bg-zinc-800 shadow-sm rounded-sm"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  style={{ zIndex: -1 }}
                />
              )}
              <span className="relative z-10">{f}</span>
            </button>
          ))}
        </div>

        <div className="w-full sm:w-px sm:h-4 bg-gray-200 dark:bg-zinc-800/80" />

        <div className="flex bg-white dark:bg-[#131316] border border-gray-200 dark:border-zinc-800/80 rounded-md p-1 relative w-fit">
          {(['all', 'yes', 'maybe'] as const).map((f) => (
            <button
              key={f}
              onClick={() => onPtFilterChange(f)}
              className={`relative px-3 py-2 sm:py-1.5 rounded-sm text-xs font-medium capitalize transition-all touch-manipulation ${
                ptFilter === f ? 'text-gray-900 dark:text-zinc-100' : 'text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200'
              }`}
            >
              {ptFilter === f && (
                <motion.div
                  layoutId="pt-active-bg"
                  className="absolute inset-0 bg-gray-200 dark:bg-zinc-800 shadow-sm rounded-sm"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  style={{ zIndex: -1 }}
                />
              )}
              <span className="relative z-10">
                {f === 'all' ? 'All PT Signals' : `PT: ${f}`}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="text-xs text-gray-500 dark:text-zinc-500 font-medium">
        Showing {memberCount} {memberCount === 1 ? 'member' : 'members'}
      </div>
    </div>
  );
}
