'use client';

import { Badge } from '@/components/ui/badge';
import { WarningIcon as AlertTriangle } from '@phosphor-icons/react';
import type { GymConfig } from '@/types';

interface SettingsPageProps {
  gymConfig: GymConfig;
}

const CONFIG_ITEMS: Array<{ label: string; key: keyof GymConfig }> = [
  { label: 'Name', key: 'name' },
  { label: 'Identifier', key: 'slug' },
  { label: 'Trainer', key: 'trainerName' },
  { label: 'Trainer Email', key: 'trainerEmail' },
  { label: 'Plan', key: 'plan' },
  { label: 'Status', key: 'isActive' },
];

export function SettingsPage({ gymConfig }: SettingsPageProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100 mb-1">Settings</h2>
        <p className="text-sm text-gray-500 dark:text-zinc-400">
          Gym configuration (read-only). Contact your administrator to change.
        </p>
      </div>

      <div className="bg-white dark:bg-[#131316] border border-gray-200 dark:border-zinc-800/60 rounded-xl p-4 sm:p-6 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-5">
          <h3 className="font-semibold text-gray-900 dark:text-zinc-100 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#5E6AD2]" />
            Gym Configuration
          </h3>
          <Badge
            variant="outline"
            className="bg-gray-100 dark:bg-zinc-800/50 text-gray-600 dark:text-zinc-400 border-gray-200 dark:border-zinc-700/50 rounded-sm font-normal"
          >
            Read Only
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-y-4 sm:gap-y-6 gap-x-4 text-sm">
          {CONFIG_ITEMS.map(({ label, key }) => {
            const value =
              key === 'isActive'
                ? gymConfig[key]
                  ? 'Active'
                  : 'Inactive'
                : key === 'plan'
                  ? String(gymConfig[key]).charAt(0).toUpperCase() + String(gymConfig[key]).slice(1)
                  : String(gymConfig[key]);
            return (
              <div key={label}>
                <p className="text-xs font-medium text-gray-500 dark:text-zinc-500 uppercase tracking-wider mb-1.5">
                  {label}
                </p>
                <p className="font-medium text-gray-700 dark:text-zinc-300 flex items-center gap-1.5">
                  {key === 'isActive' && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        gymConfig.isActive ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                    />
                  )}
                  {value}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-4 sm:mt-6 pt-4 sm:pt-5 border-t border-gray-200 dark:border-zinc-800/40">
          <p className="text-xs text-gray-500 dark:text-zinc-500 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 dark:text-zinc-500 shrink-0" />
            To update settings, contact your GymSync administrator or edit directly in the database.
          </p>
        </div>
      </div>
    </div>
  );
}
