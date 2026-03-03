'use client';

import { useState } from 'react';
import type { GymConfig, SheetRow } from '@/types';
import {
  AdminNav,
  StatsCards,
  MemberFilters,
  MembersTable,
  GymConfigCard,
} from './components';

interface AdminDashboardProps {
  gymConfig: GymConfig;
  members: SheetRow[];
  stats: {
    total: number;
    thisMonth: number;
    emailsSent: number;
    highPTLeads: number;
  };
}

export default function AdminDashboard({ gymConfig, members, stats }: AdminDashboardProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'processed' | 'failed'>('all');
  const [ptFilter, setPtFilter] = useState<'all' | 'yes' | 'maybe'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filtered = members.filter((m) => {
    if (filter !== 'all' && m.processingStatus !== filter) return false;
    if (ptFilter !== 'all' && m.interestedInPT !== ptFilter) return false;
    return true;
  });

  function handleExpandToggle(rowId: string) {
    setExpandedRow((prev) => (prev === rowId ? null : rowId));
  }

  function refresh() {
    setIsRefreshing(true);
    window.location.reload();
  }

  return (
    <div className="min-h-screen bg-[#0E0E11] text-zinc-100 font-sans selection:bg-indigo-500/30">
      <AdminNav gymConfig={gymConfig} isRefreshing={isRefreshing} onRefresh={refresh} />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <StatsCards stats={stats} />

        <MemberFilters
          filter={filter}
          ptFilter={ptFilter}
          onFilterChange={setFilter}
          onPtFilterChange={setPtFilter}
          memberCount={filtered.length}
        />

        <MembersTable
          members={filtered}
          gymConfig={gymConfig}
          expandedRow={expandedRow}
          onExpandToggle={handleExpandToggle}
        />

        <GymConfigCard gymConfig={gymConfig} />
      </div>
    </div>
  );
}
