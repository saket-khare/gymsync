'use client';

import { signOut } from 'next-auth/react';
import { ArrowsClockwiseIcon as RefreshCw, SignOutIcon as LogOut } from '@phosphor-icons/react';
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
    <nav className="sticky top-0 z-50 bg-[#0E0E11]/80 backdrop-blur-md border-b border-zinc-800/60 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {gymConfig.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={gymConfig.logoUrl} alt={gymConfig.name} className="h-7 w-auto" />
        ) : (
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center text-white text-xs font-semibold shadow-inner"
            style={{ backgroundColor: primaryColor }}
          >
            {gymConfig.name.charAt(0)}
          </div>
        )}
        <div className="flex items-center gap-2">
          <h1 className="font-medium text-zinc-100 text-sm tracking-tight">{gymConfig.name}</h1>
          <span className="text-zinc-700">/</span>
          <p className="text-sm text-zinc-400">Dashboard</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <TestEmailButton trainerEmail={gymConfig.trainerEmail} />
        <div className="w-px h-4 bg-zinc-800" />
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="text-zinc-400 hover:text-zinc-200 transition-colors p-1"
          title="Refresh dashboard"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
        <button
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          className="text-zinc-400 hover:text-zinc-200 transition-colors p-1"
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
}
