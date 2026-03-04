'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ClipboardTextIcon as Clipboard,
  CreditCardIcon as CreditCard,
  ChartLineUpIcon as ChartLine,
  SignOutIcon as LogOut,
  ArrowsClockwiseIcon as Refresh,
  WarningCircleIcon as Warning,
  ShoppingBagIcon as ShoppingBag,
} from '@phosphor-icons/react';
import Link from 'next/link';
import { calculateBmi } from '@/lib/utils';
import { goalLabel, dietLabel } from '@/lib/utils';
import type { MealPlanDay } from '@/types';

interface Sub {
  id: string;
  typeId: string | null;
  typeName: string | null;
  typeColor: string | null;
  planType: string;
  startDate: string;
  endDate: string;
  amountPaid: number;
  paymentMethod: string;
  status: 'active' | 'expired' | 'cancelled' | 'paused';
  notes: string | null;
}

interface MealPlan {
  weeklyCalorieTarget: number;
  goal: string;
  days: MealPlanDay[];
  generalGuidelines: string[];
  foodsToAvoid: string[];
  supplementSuggestions?: string[];
  generatedAt: string;
}

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  weightKg: number;
  heightCm: number;
  primaryGoal: string;
  dietType: string;
  gymSlug: string;
}

interface PortalData {
  member: Member;
  mealPlan: MealPlan | null;
  subscriptions: Sub[];
}

const PLAN_LABEL: Record<string, string> = {
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  half_yearly: '6 Months',
  annual: 'Annual',
};

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20',
  expired: 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20',
  cancelled: 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 border border-gray-200 dark:border-zinc-700',
  paused: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20',
};

function daysUntil(dateStr: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const end = new Date(dateStr);
  return Math.round((end.getTime() - now.getTime()) / 86400000);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

type Tab = 'overview' | 'meal-plan' | 'subscriptions' | 'stats';

export default function PortalDashboard() {
  const { gymSlug } = useParams<{ gymSlug: string }>();
  const router = useRouter();
  const [data, setData] = useState<PortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('overview');

  useEffect(() => {
    fetch('/api/portal/me')
      .then(async (r) => {
        if (r.status === 401) {
          router.push(`/portal/${gymSlug}/login`);
          return;
        }
        if (!r.ok) throw new Error('Failed to load');
        setData(await r.json());
      })
      .catch(() => setError('Failed to load your data. Please try refreshing.'))
      .finally(() => setLoading(false));
  }, [gymSlug, router]);

  async function handleLogout() {
    await fetch('/api/portal/me', { method: 'DELETE' });
    router.push(`/portal/${gymSlug}/login`);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0E0E11] flex items-center justify-center">
        <Refresh className="w-6 h-6 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0E0E11] flex flex-col items-center justify-center gap-3">
        <Warning className="w-8 h-8 text-red-400" />
        <p className="text-sm text-gray-500 dark:text-zinc-400">{error ?? 'Something went wrong'}</p>
        <button onClick={() => window.location.reload()} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
          Retry
        </button>
      </div>
    );
  }

  const { member, mealPlan, subscriptions } = data;
  const activeSubs = subscriptions.filter((s) => s.status === 'active');
  const bmi = member.weightKg && member.heightCm ? calculateBmi(member.weightKg, member.heightCm) : null;

  const NAV: { id: Tab; label: string; icon: typeof Clipboard }[] = [
    { id: 'overview', label: 'Overview', icon: ChartLine },
    { id: 'meal-plan', label: 'Meal Plan', icon: Clipboard },
    { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
    { id: 'stats', label: 'My Stats', icon: ChartLine },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0E0E11] font-sans">
      {/* Header */}
      <header className="bg-white dark:bg-[#131316] border-b border-gray-200 dark:border-zinc-800/60 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-gray-500 dark:text-zinc-400">Member Portal</p>
            <h1 className="text-base font-semibold text-gray-900 dark:text-zinc-100">
              {member.firstName} {member.lastName}
            </h1>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>

        {/* Tab nav */}
        <div className="max-w-3xl mx-auto px-4 flex gap-1 overflow-x-auto pb-0 scrollbar-none">
          {NAV.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`px-3 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                tab === id
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                  : 'border-transparent text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {/* Overview tab */}
        {tab === 'overview' && (
          <div className="space-y-4">
            {/* Welcome card */}
            <div className="bg-linear-to-br from-indigo-600 to-indigo-700 rounded-2xl p-6 text-white">
              <p className="text-indigo-200 text-sm mb-1">Welcome back</p>
              <h2 className="text-2xl font-bold mb-3">
                {member.firstName} {member.lastName}
              </h2>
              <div className="flex flex-wrap gap-2">
                <span className="bg-white/20 rounded-full px-3 py-1 text-xs font-medium">
                  {goalLabel(member.primaryGoal)}
                </span>
                <span className="bg-white/20 rounded-full px-3 py-1 text-xs font-medium">
                  {dietLabel(member.dietType)}
                </span>
                {bmi && (
                  <span className="bg-white/20 rounded-full px-3 py-1 text-xs font-medium">
                    BMI {bmi.value} · {bmi.category}
                  </span>
                )}
              </div>
            </div>

            {/* Active subscriptions */}
            {activeSubs.length > 0 ? (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700 dark:text-zinc-300">Active Plans</h3>
                {activeSubs.map((s) => {
                  const days = daysUntil(s.endDate);
                  return (
                    <div
                      key={s.id}
                      className="bg-white dark:bg-[#131316] border border-gray-200 dark:border-zinc-800/60 rounded-xl p-4 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {s.typeName && s.typeColor && (
                          <span
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: s.typeColor }}
                          />
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-zinc-100">
                            {s.typeName ?? 'Subscription'} · {PLAN_LABEL[s.planType] ?? s.planType}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-zinc-400">
                            Expires {formatDate(s.endDate)}
                            {days >= 0 && days <= 7 && (
                              <span className="ml-1 text-amber-600 dark:text-amber-400 font-medium">
                                · {days === 0 ? 'today!' : `${days}d left`}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize shrink-0 ${STATUS_STYLES[s.status]}`}>
                        {s.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white dark:bg-[#131316] border border-gray-200 dark:border-zinc-800/60 rounded-xl p-6 text-center">
                <CreditCard className="w-8 h-8 text-gray-300 dark:text-zinc-700 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-zinc-400">No active subscriptions</p>
                <p className="text-xs text-gray-400 dark:text-zinc-600 mt-1">Contact your gym to get started</p>
              </div>
            )}

            {/* Quick links */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTab('meal-plan')}
                className="bg-white dark:bg-[#131316] border border-gray-200 dark:border-zinc-800/60 rounded-xl p-4 text-left hover:border-indigo-300 dark:hover:border-indigo-500/40 transition-colors"
              >
                <Clipboard className="w-5 h-5 text-indigo-500 mb-2" />
                <p className="text-sm font-medium text-gray-900 dark:text-zinc-100">Meal Plan</p>
                <p className="text-xs text-gray-500 dark:text-zinc-400">
                  {mealPlan ? `${mealPlan.weeklyCalorieTarget} kcal/day avg` : 'Not generated yet'}
                </p>
              </button>
              <button
                type="button"
                onClick={() => setTab('stats')}
                className="bg-white dark:bg-[#131316] border border-gray-200 dark:border-zinc-800/60 rounded-xl p-4 text-left hover:border-indigo-300 dark:hover:border-indigo-500/40 transition-colors"
              >
                <ChartLine className="w-5 h-5 text-emerald-500 mb-2" />
                <p className="text-sm font-medium text-gray-900 dark:text-zinc-100">My Stats</p>
                <p className="text-xs text-gray-500 dark:text-zinc-400">
                  {bmi ? `BMI ${bmi.value} · ${bmi.category}` : 'View body metrics'}
                </p>
              </button>
              <Link
                href={`/portal/${gymSlug}/shop`}
                className="col-span-2 bg-white dark:bg-[#131316] border border-gray-200 dark:border-zinc-800/60 rounded-xl p-4 text-left hover:border-indigo-300 dark:hover:border-indigo-500/40 transition-colors flex items-center gap-3"
              >
                <ShoppingBag className="w-5 h-5 text-violet-500 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-zinc-100">Shop</p>
                  <p className="text-xs text-gray-500 dark:text-zinc-400">Recommended products for your goals</p>
                </div>
              </Link>
            </div>
          </div>
        )}

        {/* Meal Plan tab */}
        {tab === 'meal-plan' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">My Meal Plan</h2>
              <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">
                Personalised for your goal and diet type
              </p>
            </div>

            {!mealPlan ? (
              <div className="bg-white dark:bg-[#131316] border border-gray-200 dark:border-zinc-800/60 rounded-xl p-8 text-center">
                <Clipboard className="w-10 h-10 text-gray-300 dark:text-zinc-700 mx-auto mb-3" />
                <h3 className="text-sm font-medium text-gray-900 dark:text-zinc-200">Meal plan not ready yet</h3>
                <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
                  Your trainer is preparing your personalised plan. Check back shortly.
                </p>
              </div>
            ) : (
              <>
                {/* Summary */}
                <div className="bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-xl p-4">
                  <p className="text-sm font-medium text-indigo-800 dark:text-indigo-300">
                    Daily target: ~{Math.round(mealPlan.weeklyCalorieTarget / 7).toLocaleString()} kcal
                  </p>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-0.5">
                    Goal: {goalLabel(mealPlan.goal)}
                  </p>
                </div>

                {/* Days */}
                {(mealPlan.days as MealPlanDay[]).map((day) => (
                  <div
                    key={day.day}
                    className="bg-white dark:bg-[#131316] border border-gray-200 dark:border-zinc-800/60 rounded-xl overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-zinc-800/60 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-100">{day.day}</h3>
                      <span className="text-xs text-gray-500 dark:text-zinc-400 tabular-nums">
                        {day.calories} kcal · {day.proteinG}g protein
                      </span>
                    </div>
                    <div className="p-4 space-y-3">
                      {[
                        { label: 'Breakfast', meal: day.breakfast },
                        day.midMorningSnack && { label: 'Morning Snack', meal: day.midMorningSnack },
                        { label: 'Lunch', meal: day.lunch },
                        day.eveningSnack && { label: 'Evening Snack', meal: day.eveningSnack },
                        { label: 'Dinner', meal: day.dinner },
                      ]
                        .filter(Boolean)
                        .map((entry) => {
                          if (!entry) return null;
                          const { label, meal } = entry as { label: string; meal: { name: string; description: string; portionSize: string } };
                          return (
                            <div key={label} className="flex gap-3">
                              <span className="text-xs text-gray-400 dark:text-zinc-500 w-24 shrink-0 pt-0.5">{label}</span>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-zinc-100">{meal.name}</p>
                                <p className="text-xs text-gray-500 dark:text-zinc-400">{meal.portionSize}</p>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                    <div className="px-4 py-2 bg-gray-50 dark:bg-zinc-900/50 text-xs text-gray-400 dark:text-zinc-500">
                      {day.carbsG}g carbs · {day.fatsG}g fats · {day.waterLitres}L water
                    </div>
                  </div>
                ))}

                {/* Guidelines */}
                {mealPlan.generalGuidelines?.length > 0 && (
                  <div className="bg-white dark:bg-[#131316] border border-gray-200 dark:border-zinc-800/60 rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-100 mb-3">General Guidelines</h3>
                    <ul className="space-y-1.5">
                      {mealPlan.generalGuidelines.map((g, i) => (
                        <li key={i} className="text-sm text-gray-600 dark:text-zinc-400 flex gap-2">
                          <span className="text-indigo-400 shrink-0">·</span>
                          {g}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Foods to avoid */}
                {mealPlan.foodsToAvoid?.length > 0 && (
                  <div className="bg-red-50 dark:bg-red-500/5 border border-red-100 dark:border-red-500/20 rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-red-800 dark:text-red-300 mb-2">Foods to Avoid</h3>
                    <div className="flex flex-wrap gap-2">
                      {mealPlan.foodsToAvoid.map((f, i) => (
                        <span key={i} className="text-xs bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 px-2 py-0.5 rounded-full">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Subscriptions tab */}
        {tab === 'subscriptions' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">My Subscriptions</h2>
              <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">All your plans and payment history</p>
            </div>

            {subscriptions.length === 0 ? (
              <div className="bg-white dark:bg-[#131316] border border-gray-200 dark:border-zinc-800/60 rounded-xl p-8 text-center">
                <CreditCard className="w-10 h-10 text-gray-300 dark:text-zinc-700 mx-auto mb-3" />
                <h3 className="text-sm font-medium text-gray-900 dark:text-zinc-200">No subscriptions yet</h3>
                <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">Contact your gym to add a subscription.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {subscriptions.map((s) => {
                  const days = daysUntil(s.endDate);
                  const isExpiringSoon = s.status === 'active' && days >= 0 && days <= 7;
                  return (
                    <div
                      key={s.id}
                      className="bg-white dark:bg-[#131316] border border-gray-200 dark:border-zinc-800/60 rounded-xl p-4"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          {s.typeName && s.typeColor && (
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.typeColor }} />
                          )}
                          <p className="text-sm font-medium text-gray-900 dark:text-zinc-100">
                            {s.typeName ?? 'Subscription'} · {PLAN_LABEL[s.planType] ?? s.planType}
                          </p>
                        </div>
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize shrink-0 ${STATUS_STYLES[s.status]}`}>
                          {s.status}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-zinc-400 space-y-1">
                        <p>{formatDate(s.startDate)} → {formatDate(s.endDate)}</p>
                        <p>₹{s.amountPaid.toLocaleString('en-IN')} via {s.paymentMethod.replace('_', ' ')}</p>
                        {isExpiringSoon && (
                          <p className="text-amber-600 dark:text-amber-400 font-medium">
                            {days === 0 ? 'Expires today — contact gym to renew' : `Expires in ${days} days — contact gym to renew`}
                          </p>
                        )}
                        {s.notes && <p className="italic">{s.notes}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Stats tab */}
        {tab === 'stats' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">My Stats</h2>
              <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">Body metrics from your onboarding</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white dark:bg-[#131316] border border-gray-200 dark:border-zinc-800/60 rounded-xl p-4">
                <p className="text-xs text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Weight</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-zinc-100">{member.weightKg}</p>
                <p className="text-xs text-gray-400 dark:text-zinc-500">kg</p>
              </div>
              <div className="bg-white dark:bg-[#131316] border border-gray-200 dark:border-zinc-800/60 rounded-xl p-4">
                <p className="text-xs text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Height</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-zinc-100">{member.heightCm}</p>
                <p className="text-xs text-gray-400 dark:text-zinc-500">cm</p>
              </div>
            </div>

            {bmi && (
              <div className="bg-white dark:bg-[#131316] border border-gray-200 dark:border-zinc-800/60 rounded-xl p-4">
                <p className="text-xs text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-3">BMI</p>
                <div className="flex items-end gap-3 mb-3">
                  <span className="text-4xl font-bold text-gray-900 dark:text-zinc-100 tabular-nums">{bmi.value}</span>
                  <span className={`inline-flex px-2.5 py-1 rounded-lg text-sm font-medium mb-1 ${bmi.color}`}>
                    {bmi.category}
                  </span>
                </div>
                {/* BMI scale visual */}
                <div className="h-2 rounded-full overflow-hidden flex gap-0.5">
                  <div className="flex-1 bg-blue-300 dark:bg-blue-500 rounded-l-full" title="Underweight" />
                  <div className="flex-2 bg-emerald-300 dark:bg-emerald-500" title="Normal" />
                  <div className="flex-1 bg-amber-300 dark:bg-amber-500" title="Overweight" />
                  <div className="flex-1 bg-red-300 dark:bg-red-500 rounded-r-full" title="Obese" />
                </div>
                <div className="flex justify-between text-xs text-gray-400 dark:text-zinc-600 mt-1">
                  <span>18.5</span>
                  <span>25</span>
                  <span>30</span>
                </div>
                <div className="mt-3 text-xs text-gray-500 dark:text-zinc-400">
                  {bmi.category === 'Normal' && 'Great — your BMI is in the healthy range.'}
                  {bmi.category === 'Underweight' && 'Your BMI is below the healthy range. Focus on building muscle mass.'}
                  {bmi.category === 'Overweight' && 'Your BMI is slightly above the healthy range. Your meal plan is calibrated to help.'}
                  {bmi.category === 'Obese' && 'Your trainer has factored your BMI into your plan. Stay consistent!'}
                </div>
              </div>
            )}

            <div className="bg-white dark:bg-[#131316] border border-gray-200 dark:border-zinc-800/60 rounded-xl p-4">
              <p className="text-xs text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-3">Goal</p>
              <p className="text-sm font-medium text-gray-900 dark:text-zinc-100">{goalLabel(member.primaryGoal)}</p>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">{dietLabel(member.dietType)} diet</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
