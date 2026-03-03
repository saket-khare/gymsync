'use client';

import {
  UsersIcon as Users,
  CalendarBlankIcon as CalendarDays,
  EnvelopeIcon as Mail,
  CrosshairIcon as Target,
} from '@phosphor-icons/react';

interface StatsCardsProps {
  stats: {
    total: number;
    thisMonth: number;
    emailsSent: number;
    highPTLeads: number;
  };
}

const STAT_ITEMS = [
  { label: 'Total Members', key: 'total', icon: Users },
  { label: 'This Month', key: 'thisMonth', icon: CalendarDays },
  { label: 'Emails Sent', key: 'emailsSent', icon: Mail },
  { label: 'High PT Leads', key: 'highPTLeads', icon: Target },
] as const;

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
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
  );
}
