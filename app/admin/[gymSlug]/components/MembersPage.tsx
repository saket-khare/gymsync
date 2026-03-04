'use client';

import { useState, useMemo } from 'react';
import { MagnifyingGlassIcon as SearchIcon } from '@phosphor-icons/react';
import { goalLabel, dietLabel } from '@/lib/utils';
import type { GymConfig, SheetRow } from '@/types';
import type { StatusFilter, GoalFilter, ExperienceFilter } from './MemberFilters';
import { MemberFilters } from './MemberFilters';
import { MembersTable, type SortKey, type SortDir } from './MembersTable';
import { SubscriptionModal } from './SubscriptionModal';

type LeadsMembersView = 'leads' | 'members';

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
  const [view, setView] = useState<LeadsMembersView>('members');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [goalFilter, setGoalFilter] = useState<GoalFilter>('all');
  const [experienceFilter, setExperienceFilter] = useState<ExperienceFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('submitted');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [subscriptionModalFor, setSubscriptionModalFor] = useState<SheetRow | null>(null);
  const [convertingId, setConvertingId] = useState<string | null>(null);

  const byStatus = useMemo(() => {
    const statusFilter = view === 'leads' ? 'lead' : 'converted';
    return members.filter((m) => (m.memberStatus ?? 'converted') === statusFilter);
  }, [members, view]);

  const filteredByFilters = useMemo(() => {
    return byStatus.filter((m) => {
      if (filter !== 'all' && m.processingStatus !== filter) return false;
      if (goalFilter !== 'all' && m.primaryGoal !== goalFilter) return false;
      if (experienceFilter !== 'all' && m.gymExperience !== experienceFilter) return false;
      return true;
    });
  }, [byStatus, filter, goalFilter, experienceFilter]);

  const filteredAndSorted = useMemo(
    () => filterAndSortMembers(filteredByFilters, searchQuery, sortKey, sortDir),
    [filteredByFilters, searchQuery, sortKey, sortDir],
  );

  function handleSort(key: SortKey) {
    setSortKey(key);
    setSortDir((d) => (sortKey === key && d === 'desc' ? 'asc' : 'desc'));
  }

  async function handleConvertToMember(member: SheetRow) {
    if (!member.id) return;
    setConvertingId(member.id);
    try {
      const res = await fetch('/api/admin/leads/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: member.id }),
      });
      const data = await res.json();
      if (data.success) {
        setSubscriptionModalFor(member);
      } else {
        alert(data.error ?? 'Failed to convert lead');
      }
    } catch {
      alert('Network error. Please try again.');
    } finally {
      setConvertingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100 mb-1">
            Leads &amp; Members
          </h2>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            View leads and converted members. Convert leads to add their first subscription.
          </p>
        </div>
        <div className="flex rounded-lg border border-gray-200 dark:border-zinc-700 p-0.5 bg-gray-100 dark:bg-zinc-800/60">
          <button
            type="button"
            onClick={() => setView('leads')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              view === 'leads'
                ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-zinc-100 shadow-sm'
                : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200'
            }`}
          >
            Leads
          </button>
          <button
            type="button"
            onClick={() => setView('members')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              view === 'members'
                ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-zinc-100 shadow-sm'
                : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200'
            }`}
          >
            Members
          </button>
        </div>
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
        showConvertButton={view === 'leads'}
        onConvertToMember={handleConvertToMember}
        convertingId={convertingId}
      />

      {subscriptionModalFor && (
        <SubscriptionModal
          members={members}
          gymSlug={gymConfig.slug}
          preselectedMemberDbId={subscriptionModalFor.id}
          onClose={() => setSubscriptionModalFor(null)}
          onSuccess={() => {
            setSubscriptionModalFor(null);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}
