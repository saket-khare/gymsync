'use client';

import { motion } from 'framer-motion';
import { GOALS, EXPERIENCE_OPTIONS } from '@/lib/onboarding-steps';
import { goalLabel, experienceLabel } from '@/lib/utils';

export type StatusFilter = 'all' | 'pending' | 'processed' | 'failed';
export type GoalFilter = string;
export type ExperienceFilter = string;

interface MemberFiltersProps {
  filter: StatusFilter;
  goalFilter: GoalFilter;
  experienceFilter: ExperienceFilter;
  onFilterChange: (f: StatusFilter) => void;
  onGoalFilterChange: (g: GoalFilter) => void;
  onExperienceFilterChange: (e: ExperienceFilter) => void;
  memberCount: number;
}

export function MemberFilters({
  filter,
  goalFilter,
  experienceFilter,
  onFilterChange,
  onGoalFilterChange,
  onExperienceFilterChange,
  memberCount,
}: MemberFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-wrap">
        {/* Status pills */}
        <div className="flex bg-white dark:bg-[#131316] border border-gray-200 dark:border-zinc-800/80 rounded-md p-1 relative w-fit">
          {(['all', 'pending', 'processed', 'failed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => onFilterChange(f)}
              className={`relative px-3 py-2 sm:py-1.5 rounded-sm text-xs font-medium capitalize transition-all touch-manipulation ${
                filter === f
                  ? 'text-gray-900 dark:text-zinc-100'
                  : 'text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200'
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

        {/* Goal dropdown */}
        <select
          value={goalFilter}
          onChange={(e) => onGoalFilterChange(e.target.value)}
          className="h-8 min-w-[140px] px-3 rounded-md border border-gray-200 dark:border-zinc-700 bg-white dark:bg-[#131316] text-sm text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
        >
          <option value="all">All goals</option>
          {GOALS.map((g) => (
            <option key={g.value} value={g.value}>
              {goalLabel(g.value)}
            </option>
          ))}
        </select>

        {/* Experience dropdown */}
        <select
          value={experienceFilter}
          onChange={(e) => onExperienceFilterChange(e.target.value)}
          className="h-8 min-w-[140px] px-3 rounded-md border border-gray-200 dark:border-zinc-700 bg-white dark:bg-[#131316] text-sm text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
        >
          <option value="all">All experience</option>
          {EXPERIENCE_OPTIONS.map((e) => (
            <option key={e.value} value={e.value}>
              {experienceLabel(e.value)}
            </option>
          ))}
        </select>
      </div>

      <div className="text-xs text-gray-500 dark:text-zinc-500 font-medium">
        Showing {memberCount} {memberCount === 1 ? 'member' : 'members'}
      </div>
    </div>
  );
}
