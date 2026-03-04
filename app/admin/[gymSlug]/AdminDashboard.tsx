'use client';

import { useState } from 'react';
import type { GymConfig, SheetRow } from '@/types';
import type { DashboardIntelligence } from '@/lib/db';
import type { AdminPage } from './components/AdminSidebar';
import { AdminSidebar } from './components/AdminSidebar';
import { OverviewPage, type OverviewStats } from './components/OverviewPage';
import { MembersPage } from './components/MembersPage';
import { MealPlansPage } from './components/MealPlansPage';
import { SubscriptionsPage } from './components/SubscriptionsPage';
import { AffiliateProductsPage } from './components/AffiliateProductsPage';
import { SettingsPage } from './components/SettingsPage';

export interface MealPlanByRowId {
  [rowId: string]: { generatedAt: string };
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

interface AdminDashboardProps {
  gymConfig: GymConfig;
  members: SheetRow[];
  stats: OverviewStats;
  mealPlanByRowId?: MealPlanByRowId;
  dashboardIntelligence?: DashboardIntelligence | null;
  highSignalMembers?: HighSignalMember[];
}

export default function AdminDashboard({
  gymConfig,
  members,
  stats,
  mealPlanByRowId = {},
  dashboardIntelligence = null,
  highSignalMembers = [],
}: AdminDashboardProps) {
  const [activePage, setActivePage] = useState<AdminPage>('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);

  function refresh() {
    setIsRefreshing(true);
    window.location.reload();
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0E0E11] text-gray-900 dark:text-zinc-100 font-sans selection:bg-indigo-500/30">
      <AdminSidebar
        gymConfig={gymConfig}
        activePage={activePage}
        onPageChange={setActivePage}
        isRefreshing={isRefreshing}
        onRefresh={refresh}
      />

      <main className="pt-14 md:pt-6 md:pl-[240px] min-h-screen">
        <div className="max-w-8xl mx-auto px-4 py-6 sm:px-6 sm:py-8">
          {activePage === 'overview' && (
            <OverviewPage
              stats={stats}
              members={members}
              dashboardIntelligence={dashboardIntelligence}
              highSignalMembers={highSignalMembers}
            />
          )}
          {activePage === 'members' && (
            <MembersPage members={members} gymConfig={gymConfig} />
          )}
          {activePage === 'mealPlans' && (
            <MealPlansPage
              members={members}
              gymConfig={gymConfig}
              mealPlanByRowId={mealPlanByRowId}
            />
          )}
          {activePage === 'subscriptions' && (
            <SubscriptionsPage members={members} gymConfig={gymConfig} />
          )}
          {activePage === 'affiliates' && (
            <AffiliateProductsPage gymSlug={gymConfig.slug} />
          )}
          {activePage === 'settings' && (
            <SettingsPage gymConfig={gymConfig} />
          )}
        </div>
      </main>
    </div>
  );
}
