'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import {
  ChartLineIcon as ChartLine,
  UsersIcon as Users,
  ClipboardTextIcon as MealPlans,
  CreditCardIcon as CreditCard,
  GearIcon as Gear,
  ListIcon as Menu,
  XIcon as Close,
  ArrowsClockwiseIcon as RefreshCw,
  SignOutIcon as LogOut,
  LinkIcon as LinkIcon,
} from '@phosphor-icons/react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { TestEmailButton } from './TestEmailButton';
import type { GymConfig } from '@/types';

export type AdminPage = 'overview' | 'members' | 'mealPlans' | 'subscriptions' | 'affiliates' | 'settings';

interface AdminSidebarProps {
  gymConfig: GymConfig;
  activePage: AdminPage;
  onPageChange: (page: AdminPage) => void;
  isRefreshing: boolean;
  onRefresh: () => void;
}

const NAV_ITEMS: { id: AdminPage; label: string; icon: typeof ChartLine }[] = [
  { id: 'overview', label: 'Overview', icon: ChartLine },
  { id: 'members', label: 'Leads & Members', icon: Users },
  { id: 'mealPlans', label: 'Meal Plans', icon: MealPlans },
  { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
  { id: 'affiliates', label: 'Affiliate Products', icon: LinkIcon },
  { id: 'settings', label: 'Settings', icon: Gear },
];

export function AdminSidebar({
  gymConfig,
  activePage,
  onPageChange,
  isRefreshing,
  onRefresh,
}: AdminSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const primaryColor =
    gymConfig.primaryColor === '#1A56DB' ? '#5E6AD2' : (gymConfig.primaryColor ?? '#5E6AD2');

  function handleNavClick(page: AdminPage) {
    onPageChange(page);
    setMobileOpen(false);
  }

  return (
    <>
      {/* Mobile menu button */}
      <button
        type="button"
        onClick={() => setMobileOpen((o) => !o)}
        className="md:hidden fixed top-4 left-4 z-[60] p-2 rounded-lg bg-white dark:bg-[#131316] border border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-[#18181b] touch-manipulation"
        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
      >
        {mobileOpen ? <Close className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Overlay when sidebar open on mobile */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/40"
          aria-hidden
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-[240px]
          bg-white dark:bg-[#0E0E11] border-r border-gray-200 dark:border-zinc-800/60
          flex flex-col
          transition-transform duration-200 ease-out md:translate-x-0
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Gym branding */}
          <div className="p-4 border-b border-gray-200 dark:border-zinc-800/60 shrink-0">
            <div className="flex items-center gap-3">
              {gymConfig.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={gymConfig.logoUrl}
                  alt={gymConfig.name}
                  className="h-8 w-auto shrink-0 rounded"
                />
              ) : (
                <div
                  className="w-8 h-8 rounded-md flex items-center justify-center text-white text-sm font-semibold shadow-inner shrink-0"
                  style={{ backgroundColor: primaryColor }}
                >
                  {gymConfig.name.charAt(0)}
                </div>
              )}
              <span className="font-medium text-gray-900 dark:text-zinc-100 text-sm truncate">
                {gymConfig.name}
              </span>
            </div>
          </div>

          {/* Nav items */}
          <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => handleNavClick(id)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-medium transition-colors touch-manipulation
                  ${
                    activePage === id
                      ? 'bg-gray-200 dark:bg-[#18181b] text-gray-900 dark:text-zinc-100'
                      : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-[#18181b]/60 hover:text-gray-900 dark:hover:text-zinc-200'
                  }
                `}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {label}
              </button>
            ))}
          </nav>

          {/* Bottom: theme, test email, refresh, sign out */}
          <div className="p-3 border-t border-gray-200 dark:border-zinc-800/60 space-y-2 shrink-0">
            <div className="flex items-center justify-between gap-2">
              <ThemeToggle />
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                className="text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200 transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#18181b] touch-manipulation"
                title="Refresh dashboard"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <TestEmailButton trainerEmail={gymConfig.trainerEmail} />
            <button
              onClick={() => signOut({ callbackUrl: '/admin/login' })}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-[#18181b] hover:text-gray-900 dark:hover:text-zinc-200 transition-colors touch-manipulation"
              title="Sign out"
            >
              <LogOut className="w-5 h-5 shrink-0" />
              Sign out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
