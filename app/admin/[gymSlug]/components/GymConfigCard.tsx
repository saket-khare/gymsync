'use client';

import { Badge } from '@/components/ui/badge';
import { WarningIcon as AlertTriangle } from '@phosphor-icons/react';
import type { GymConfig } from '@/types';

interface GymConfigCardProps {
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

export function GymConfigCard({ gymConfig }: GymConfigCardProps) {
  return (
    <div className="mt-8 bg-[#131316] border border-zinc-800/60 rounded-xl p-6 shadow-sm relative overflow-hidden">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-semibold text-zinc-100 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#5E6AD2]" />
          Gym Configuration
        </h2>
        <Badge
          variant="outline"
          className="bg-zinc-800/50 text-zinc-400 border-zinc-700/50 rounded-sm font-normal"
        >
          Read Only
        </Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-y-6 gap-x-4 text-sm">
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
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5">
                {label}
              </p>
              <p className="font-medium text-zinc-300 flex items-center gap-1.5">
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

      <div className="mt-6 pt-5 border-t border-zinc-800/40">
        <p className="text-xs text-zinc-500 flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5" />
          To update settings, contact your GymSync administrator or edit directly in the database.
        </p>
      </div>
    </div>
  );
}
