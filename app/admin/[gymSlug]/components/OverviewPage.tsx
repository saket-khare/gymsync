'use client';

import { useState } from 'react';
import {
  UsersIcon as Users,
  CalendarBlankIcon as CalendarDays,
  EnvelopeIcon as Mail,
  ClipboardTextIcon as Clipboard,
  HourglassIcon as Hourglass,
  LightningIcon as Lightning,
  TrendUpIcon as TrendUp,
  CreditCardIcon as CreditCard,
  LinkIcon as LinkIcon,
  PaperPlaneTiltIcon as PaperPlaneTilt,
} from '@phosphor-icons/react';
import { goalLabel, experienceLabel, formatDateTime } from '@/lib/utils';
import type { SheetRow } from '@/types';
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

const STAT_ITEMS: { label: string; key: keyof OverviewStats; icon: typeof Users }[] = [
  { label: 'Total Members', key: 'total', icon: Users },
  { label: 'New This Month', key: 'thisMonth', icon: CalendarDays },
  { label: 'Pending', key: 'pending', icon: Hourglass },
  { label: 'Emails Sent', key: 'emailsSent', icon: Mail },
  { label: 'Meal Plans Generated', key: 'mealPlansGenerated', icon: Clipboard },
];

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
  highSignalMembers = [],
}: OverviewPageProps) {
  const [sendingPtOfferId, setSendingPtOfferId] = useState<string | null>(null);
  const goalCounts = getGoalCounts(members);
  const experienceCounts = getExperienceCounts(members);
  const maxGoal = Math.max(1, ...goalCounts.map((g) => g.count));
  const maxExp = Math.max(1, ...experienceCounts.map((e) => e.count));
  const recentSignups = [...members]
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    .slice(0, 5);

  async function handleSendPtOffer(memberId: string) {
    setSendingPtOfferId(memberId);
    try {
      const res = await fetch('/api/admin/send-pt-offer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId }),
      });
      const data = await res.json();
      if (!data.success) alert(data.error ?? 'Failed to send');
    } finally {
      setSendingPtOfferId(null);
    }
  }

  const intel = dashboardIntelligence;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100 mb-1">Overview</h2>
        <p className="text-sm text-gray-500 dark:text-zinc-400">
          Summary of your members and activity
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {STAT_ITEMS.map(({ label, key, icon: Icon }) => (
          <div
            key={label}
            className="bg-white dark:bg-[#131316] border border-gray-200 dark:border-zinc-800/60 rounded-xl p-4 sm:p-5 shadow-sm relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-3 sm:p-5 opacity-60 group-hover:opacity-90 transition-opacity">
              <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-gray-500 dark:text-zinc-400" />
            </div>
            <div className="flex flex-col relative z-10">
              <span className="text-xs font-medium text-gray-500 dark:text-zinc-500 uppercase tracking-wider mb-2">
                {label}
              </span>
              <span className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-zinc-100 tracking-tight">
                {stats[key]}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue intelligence widgets */}
      {intel && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <div className="bg-white dark:bg-[#131316] border border-amber-200 dark:border-amber-800/50 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Lightning className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-medium text-gray-500 dark:text-zinc-500 uppercase tracking-wider">
                Hot Leads (48h)
              </span>
            </div>
            <span className="text-2xl font-semibold text-gray-900 dark:text-zinc-100">
              {intel.hotLeads}
            </span>
          </div>
          <div className="bg-white dark:bg-[#131316] border border-gray-200 dark:border-zinc-800/60 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <TrendUp className="w-4 h-4 text-indigo-500" />
              <span className="text-xs font-medium text-gray-500 dark:text-zinc-500 uppercase tracking-wider">
                Conversion Rate
              </span>
            </div>
            <span className="text-2xl font-semibold text-gray-900 dark:text-zinc-100">
              {intel.conversionRate}%
            </span>
          </div>
          <div className="bg-white dark:bg-[#131316] border border-emerald-200 dark:border-emerald-800/50 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <CreditCard className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-medium text-gray-500 dark:text-zinc-500 uppercase tracking-wider">
                PT Pipeline
              </span>
            </div>
            <span className="text-2xl font-semibold text-gray-900 dark:text-zinc-100">
              {intel.ptPipelineCount}
            </span>
          </div>
          <div className="bg-white dark:bg-[#131316] border border-gray-200 dark:border-zinc-800/60 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <CalendarDays className="w-4 h-4 text-rose-500" />
              <span className="text-xs font-medium text-gray-500 dark:text-zinc-500 uppercase tracking-wider">
                Expiring in 30d
              </span>
            </div>
            <span className="text-2xl font-semibold text-gray-900 dark:text-zinc-100">
              {intel.expiringIn30Days}
            </span>
          </div>
          <div className="bg-white dark:bg-[#131316] border border-gray-200 dark:border-zinc-800/60 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <LinkIcon className="w-4 h-4 text-violet-500" />
              <span className="text-xs font-medium text-gray-500 dark:text-zinc-500 uppercase tracking-wider">
                Affiliate Clicks (mo)
              </span>
            </div>
            <span className="text-2xl font-semibold text-gray-900 dark:text-zinc-100">
              {intel.affiliateClicksThisMonth}
            </span>
          </div>
        </div>
      )}

      {/* PT Upsell Pipeline */}
      {highSignalMembers.length > 0 && (
        <div className="bg-white dark:bg-[#131316] border border-gray-200 dark:border-zinc-800/60 rounded-xl p-4 sm:p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-100 mb-4">
            PT Upsell Pipeline — HIGH signal
          </h3>
          <ul className="divide-y divide-gray-100 dark:divide-zinc-800/60">
            {highSignalMembers.map((m) => (
              <li
                key={m.memberId}
                className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div>
                  <span className="font-medium text-sm text-gray-900 dark:text-zinc-200">
                    {m.firstName} {m.lastName}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-zinc-500 ml-2">
                    {goalLabel(m.primaryGoal)}
                  </span>
                  <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1 line-clamp-1">
                    {m.upsellReasoning}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={!!sendingPtOfferId}
                  onClick={() => handleSendPtOffer(m.memberId)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {sendingPtOfferId === m.memberId ? (
                    'Sending…'
                  ) : (
                    <>
                      <PaperPlaneTilt className="w-3.5 h-3.5" />
                      Send PT Offer
                    </>
                  )}
                </button>
              </li>
            ))}
          </ul>
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
                      className={`h-full rounded-full ${BAR_COLORS[i % BAR_COLORS.length]}`}
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
                      className={`h-full rounded-full ${BAR_COLORS[i % BAR_COLORS.length]}`}
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
                <div>
                  <span className="font-medium text-sm text-gray-900 dark:text-zinc-200">
                    {m.firstName} {m.lastName}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-zinc-500 ml-2">
                    {goalLabel(m.primaryGoal)}
                  </span>
                </div>
                <span className="text-xs text-gray-500 dark:text-zinc-500 tabular-nums">
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
