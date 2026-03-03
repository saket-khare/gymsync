'use client';

import { signOut } from 'next-auth/react';
import { ArrowsClockwiseIcon as RefreshCw, SignOutIcon as LogOut } from '@phosphor-icons/react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { TestEmailButton } from './TestEmailButton';
import type { GymConfig } from '@/types';

interface AdminNavProps {
  gymConfig: GymConfig;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export function AdminNav({ gymConfig, isRefreshing, onRefresh }: AdminNavProps) {
  const primaryColor =
    gymConfig.primaryColor === '#1A56DB' ? '#5E6AD2' : (gymConfig.primaryColor ?? '#5E6AD2');

  return (
    <nav className="sticky top-0 z-50 bg-white/95 dark:bg-[#0E0E11]/95 backdrop-blur-md border-b border-gray-200 dark:border-zinc-800/60 px-4 py-2.5 md:px-6 md:py-3 flex items-center justify-between gap-2 min-h-[52px]">
      <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
        {gymConfig.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={gymConfig.logoUrl} alt={gymConfig.name} className="h-6 w-auto md:h-7 shrink-0" />
        ) : (
          <div
            className="w-6 h-6 md:w-7 md:h-7 rounded-md flex items-center justify-center text-white text-[10px] md:text-xs font-semibold shadow-inner shrink-0"
            style={{ backgroundColor: primaryColor }}
          >
            {gymConfig.name.charAt(0)}
          </div>
        )}
        <div className="flex items-center gap-1.5 md:gap-2 min-w-0">
          <h1 className="font-medium text-gray-900 dark:text-zinc-100 text-xs md:text-sm tracking-tight truncate">
            {gymConfig.name}
          </h1>
          <span className="text-gray-400 dark:text-zinc-700 hidden sm:inline">/</span>
          <p className="text-xs md:text-sm text-gray-500 dark:text-zinc-400 hidden sm:inline">Dashboard</p>
        </div>
      </div>
      <div className="flex items-center gap-1.5 md:gap-4 shrink-0">
        <ThemeToggle />
        <TestEmailButton trainerEmail={gymConfig.trainerEmail} />
        <div className="w-px h-4 bg-gray-200 dark:bg-zinc-800 hidden sm:block" />
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200 transition-colors p-2 -m-2 md:p-1 touch-manipulation"
          title="Refresh dashboard"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
        <button
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          className="text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200 transition-colors p-2 -m-2 md:p-1 touch-manipulation"
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
}
