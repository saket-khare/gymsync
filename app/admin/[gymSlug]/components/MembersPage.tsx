'use client';

import { useState, useMemo } from 'react';
import { MagnifyingGlassIcon as SearchIcon } from '@phosphor-icons/react';
import { goalLabel, dietLabel } from '@/lib/utils';
import type { GymConfig, SheetRow } from '@/types';
import type { StatusFilter, GoalFilter, ExperienceFilter } from './MemberFilters';
import { MemberFilters } from './MemberFilters';
import { MembersTable, type SortKey, type SortDir } from './MembersTable';

interface MembersPageProps {
  members: SheetRow[];
  gymConfig: GymConfig;
}

function filterAndSortMembers(
  members: SheetRow[],
  searchQuery: string,
  sortKey: SortKey,
  sortDir: SortDir,
): SheetRow[] {
  const q = searchQuery.trim().toLowerCase();
  const filtered = q
    ? members.filter(
        (m) =>
          m.firstName?.toLowerCase().includes(q) ||
          m.lastName?.toLowerCase().includes(q) ||
          m.email?.toLowerCase().includes(q),
      )
    : [...members];

  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    switch (sortKey) {
      case 'name':
        cmp = `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
        break;
      case 'goal':
        cmp = goalLabel(a.primaryGoal).localeCompare(goalLabel(b.primaryGoal));
        break;
      case 'diet':
        cmp = dietLabel(a.dietType).localeCompare(dietLabel(b.dietType));
        break;
      case 'submitted':
        cmp =
          new Date(a.submittedAt || 0).getTime() - new Date(b.submittedAt || 0).getTime();
        break;
      default:
        return 0;
    }
    return sortDir === 'asc' ? cmp : -cmp;
  });
  return sorted;
}

export function MembersPage({ members, gymConfig }: MembersPageProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [goalFilter, setGoalFilter] = useState<GoalFilter>('all');
  const [experienceFilter, setExperienceFilter] = useState<ExperienceFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('submitted');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const filteredByFilters = useMemo(() => {
    return members.filter((m) => {
      if (filter !== 'all' && m.processingStatus !== filter) return false;
      if (goalFilter !== 'all' && m.primaryGoal !== goalFilter) return false;
      if (experienceFilter !== 'all' && m.gymExperience !== experienceFilter) return false;
      return true;
    });
  }, [members, filter, goalFilter, experienceFilter]);

  const filteredAndSorted = useMemo(
    () => filterAndSortMembers(filteredByFilters, searchQuery, sortKey, sortDir),
    [filteredByFilters, searchQuery, sortKey, sortDir],
  );

  function handleSort(key: SortKey) {
    setSortKey(key);
    setSortDir((d) => (sortKey === key && d === 'desc' ? 'asc' : 'desc'));
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100 mb-1">Members</h2>
        <p className="text-sm text-gray-500 dark:text-zinc-400">
          View and manage member profiles
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-zinc-500" />
        <input
          type="search"
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-[#131316] text-sm text-gray-900 dark:text-zinc-100 placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
        />
      </div>

      <MemberFilters
        filter={filter}
        goalFilter={goalFilter}
        experienceFilter={experienceFilter}
        onFilterChange={setFilter}
        onGoalFilterChange={setGoalFilter}
        onExperienceFilterChange={setExperienceFilter}
        memberCount={filteredAndSorted.length}
      />

      <MembersTable
        members={filteredAndSorted}
        gymConfig={gymConfig}
        expandedRow={expandedRow}
        onExpandToggle={(id) => setExpandedRow((prev) => (prev === id ? null : id))}
        sortKey={sortKey}
        sortDir={sortDir}
        onSort={handleSort}
      />
    </div>
  );
}
