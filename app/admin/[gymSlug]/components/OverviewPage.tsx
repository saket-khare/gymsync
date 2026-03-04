'use client';

import {
  UsersIcon as Users,
  UserPlusIcon as UserPlus,
  ArrowRightIcon as ArrowRight,
  TrendUpIcon as TrendUp,
  CalendarBlankIcon as CalendarDays,
  LightningIcon as Lightning,
} from '@phosphor-icons/react';
import { goalLabel, experienceLabel, formatDateTime } from '@/lib/utils';
import type { SheetRow, LeadSubstatus } from '@/types';
import type { DashboardIntelligence } from '@/lib/db';

export interface OverviewStats {
  total: number;
  thisMonth: number;
  pending: number;
  emailsSent: number;
  mealPlansGenerated: number;
}

interface HighSignalMember {
  memberId: string;
  firstName: string;
  lastName: string;
  email: string;
  primaryGoal: string;
  upsellSignal: string;
  upsellReasoning: string;
}

interface OverviewPageProps {
  stats: OverviewStats;
  members: SheetRow[];
  dashboardIntelligence?: DashboardIntelligence | null;
  highSignalMembers?: HighSignalMember[];
}

function getGoalCounts(members: SheetRow[]): { goal: string; count: number }[] {
  const map = new Map<string, number>();
  for (const m of members) {
    const g = m.primaryGoal ?? 'general_fitness';
    map.set(g, (map.get(g) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([goal, count]) => ({ goal, count }))
    .sort((a, b) => b.count - a.count);
}

function getExperienceCounts(members: SheetRow[]): { experience: string; count: number }[] {
  const map = new Map<string, number>();
  for (const m of members) {
    const e = m.gymExperience ?? 'beginner';
    map.set(e, (map.get(e) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([experience, count]) => ({ experience, count }))
    .sort((a, b) => b.count - a.count);
}

function getLeadFunnel(members: SheetRow[]): Record<LeadSubstatus, number> {
  const leads = members.filter((m) => m.memberStatus === 'lead');
  const counts: Record<LeadSubstatus, number> = { new: 0, contacted: 0, visited: 0, converted: 0 };
  for (const m of leads) {
    const s = (m.leadSubstatus ?? 'new') as LeadSubstatus;
    counts[s] = (counts[s] ?? 0) + 1;
  }
  return counts;
}

const FUNNEL_STEPS: { key: LeadSubstatus; label: string; color: string; bg: string }[] = [
  { key: 'new', label: 'New', color: 'text-gray-600 dark:text-zinc-400', bg: 'bg-gray-100 dark:bg-zinc-800' },
  { key: 'contacted', label: 'Contacted', color: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30' },
  { key: 'visited', label: 'Visited', color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/30' },
  { key: 'converted', label: 'Converted', color: 'text-green-700 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/30' },
];

const BAR_COLORS = [
  'bg-indigo-500 dark:bg-indigo-400',
  'bg-emerald-500 dark:bg-emerald-400',
  'bg-amber-500 dark:bg-amber-400',
  'bg-rose-500 dark:bg-rose-400',
  'bg-violet-500 dark:bg-violet-400',
  'bg-cyan-500 dark:bg-cyan-400',
];

export function OverviewPage({
  stats,
  members,
  dashboardIntelligence = null,
}: OverviewPageProps) {
  const goalCounts = getGoalCounts(members);
  const experienceCounts = getExperienceCounts(members);
  const maxGoal = Math.max(1, ...goalCounts.map((g) => g.count));
  const maxExp = Math.max(1, ...experienceCounts.map((e) => e.count));
  const recentSignups = [...members]
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    .slice(0, 5);

  const intel = dashboardIntelligence;
  const totalLeads = members.filter((m) => m.memberStatus === 'lead').length;
  const totalConverted = members.filter((m) => m.memberStatus === 'converted').length;
  const funnel = getLeadFunnel(members);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100 mb-1">Overview</h2>
        <p className="text-sm text-gray-500 dark:text-zinc-400">
          Summary of your gym's activity
        </p>
      </div>

      {/* Key metrics — single clean row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-[#131316] border border-gray-200 dark:border-zinc-800/60 rounded-xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-gray-400 dark:text-zinc-500" />
            <span className="text-xs font-medium text-gray-500 dark:text-zinc-500 uppercase tracking-wider">Total</span>
          </div>
          <span className="text-3xl font-semibold text-gray-900 dark:text-zinc-100 tracking-tight">{stats.total}</span>
        </div>

        <div className="bg-white dark:bg-[#131316] border border-gray-200 dark:border-zinc-800/60 rounded-xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <UserPlus className="w-4 h-4 text-indigo-500" />
            <span className="text-xs font-medium text-gray-500 dark:text-zinc-500 uppercase tracking-wider">Leads</span>
          </div>
          <span className="text-3xl font-semibold text-gray-900 dark:text-zinc-100 tracking-tight">{totalLeads}</span>
        </div>

        <div className="bg-white dark:bg-[#131316] border border-gray-200 dark:border-zinc-800/60 rounded-xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <TrendUp className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-medium text-gray-500 dark:text-zinc-500 uppercase tracking-wider">Converted</span>
          </div>
          <span className="text-3xl font-semibold text-gray-900 dark:text-zinc-100 tracking-tight">{totalConverted}</span>
        </div>

        {intel ? (
          <div className="bg-white dark:bg-[#131316] border border-amber-200 dark:border-amber-800/50 rounded-xl p-4 sm:p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Lightning className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-medium text-gray-500 dark:text-zinc-500 uppercase tracking-wider">Hot (48h)</span>
            </div>
            <span className="text-3xl font-semibold text-gray-900 dark:text-zinc-100 tracking-tight">{intel.hotLeads}</span>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#131316] border border-gray-200 dark:border-zinc-800/60 rounded-xl p-4 sm:p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <CalendarDays className="w-4 h-4 text-violet-500" />
              <span className="text-xs font-medium text-gray-500 dark:text-zinc-500 uppercase tracking-wider">This Month</span>
            </div>
            <span className="text-3xl font-semibold text-gray-900 dark:text-zinc-100 tracking-tight">{stats.thisMonth}</span>
          </div>
        )}
      </div>

      {/* Lead Funnel */}
      {totalLeads > 0 && (
        <div className="bg-white dark:bg-[#131316] border border-gray-200 dark:border-zinc-800/60 rounded-xl p-4 sm:p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-100 mb-5">Lead Funnel</h3>
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-1">
            {FUNNEL_STEPS.map((step, i) => {
              const count = funnel[step.key];
              const pct = totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0;
              return (
                <div key={step.key} className="flex items-center gap-2 sm:gap-3 shrink-0">
                  <div className={`rounded-xl px-4 py-3 sm:px-5 sm:py-4 text-center min-w-[80px] sm:min-w-[96px] ${step.bg}`}>
                    <div className={`text-2xl font-semibold ${step.color}`}>{count}</div>
                    <div className={`text-xs font-medium mt-0.5 ${step.color}`}>{step.label}</div>
                    <div className="text-[11px] text-gray-400 dark:text-zinc-500 mt-0.5">{pct}%</div>
                  </div>
                  {i < FUNNEL_STEPS.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-gray-300 dark:text-zinc-600 shrink-0" />
                  )}
                </div>
              );
            })}
            {intel && (
              <div className="ml-auto pl-4 border-l border-gray-200 dark:border-zinc-800 shrink-0 hidden sm:block">
                <div className="text-right">
                  <div className="text-2xl font-semibold text-gray-900 dark:text-zinc-100">{intel.conversionRate}%</div>
                  <div className="text-xs text-gray-500 dark:text-zinc-500 mt-0.5">Conversion this month</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Goal distribution */}
        <div className="bg-white dark:bg-[#131316] border border-gray-200 dark:border-zinc-800/60 rounded-xl p-4 sm:p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-100 mb-4">
            Goal Distribution
          </h3>
          {goalCounts.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-zinc-500">No data yet</p>
          ) : (
            <div className="space-y-3">
              {goalCounts.map(({ goal, count }, i) => (
                <div key={goal} className="flex items-center gap-3">
                  <span className="text-sm text-gray-700 dark:text-zinc-300 w-36 shrink-0 truncate">
                    {goalLabel(goal)}
                  </span>
                  <div className="flex-1 h-2 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${BAR_COLORS[i % BAR_COLORS.length]}`}
                      style={{ width: `${(count / maxGoal) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-500 dark:text-zinc-500 tabular-nums w-6 text-right">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Experience breakdown */}
        <div className="bg-white dark:bg-[#131316] border border-gray-200 dark:border-zinc-800/60 rounded-xl p-4 sm:p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-100 mb-4">
            Experience Breakdown
          </h3>
          {experienceCounts.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-zinc-500">No data yet</p>
          ) : (
            <div className="space-y-3">
              {experienceCounts.map(({ experience, count }, i) => (
                <div key={experience} className="flex items-center gap-3">
                  <span className="text-sm text-gray-700 dark:text-zinc-300 w-36 shrink-0 truncate">
                    {experienceLabel(experience)}
                  </span>
                  <div className="flex-1 h-2 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${BAR_COLORS[i % BAR_COLORS.length]}`}
                      style={{ width: `${(count / maxExp) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-500 dark:text-zinc-500 tabular-nums w-6 text-right">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent signups */}
      <div className="bg-white dark:bg-[#131316] border border-gray-200 dark:border-zinc-800/60 rounded-xl p-4 sm:p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-100 mb-4">
          Recent Signups
        </h3>
        {recentSignups.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-zinc-500">No signups yet</p>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-zinc-800/60">
            {recentSignups.map((m) => (
              <li
                key={m.rowId}
                className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-zinc-400 border border-gray-200 dark:border-zinc-700 shrink-0">
                    {m.firstName.charAt(0)}{m.lastName.charAt(0)}
                  </div>
                  <div>
                    <span className="font-medium text-sm text-gray-900 dark:text-zinc-200">
                      {m.firstName} {m.lastName}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-zinc-500 ml-2">
                      {goalLabel(m.primaryGoal)}
                    </span>
                  </div>
                </div>
                <span className="text-xs text-gray-400 dark:text-zinc-500 tabular-nums">
                  {m.submittedAt ? formatDateTime(m.submittedAt) : '—'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
