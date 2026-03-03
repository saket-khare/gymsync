'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ClipboardTextIcon as Clipboard,
  PlusIcon as Plus,
  EyeIcon as Eye,
  PaperPlaneTiltIcon as Resend,
  PencilSimpleIcon as Pencil,
} from '@phosphor-icons/react';
import { goalLabel } from '@/lib/utils';
import { formatDateTime } from '@/lib/utils';
import type { GymConfig, SheetRow } from '@/types';
import { MealPlanCreator } from './MealPlanCreator';

export interface MealPlanInfo {
  generatedAt: string;
}

interface MealPlansPageProps {
  members: SheetRow[];
  gymConfig: GymConfig;
  mealPlanByRowId: Record<string, MealPlanInfo>;
}

export function MealPlansPage({
  members,
  gymConfig,
  mealPlanByRowId,
}: MealPlansPageProps) {
  const router = useRouter();
  const [viewingRowId, setViewingRowId] = useState<string | null>(null);
  const [createPlanForMember, setCreatePlanForMember] = useState<SheetRow | null>(null);

  if (members.length === 0) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100 mb-1">
            Meal Plans
          </h2>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            Create and manage meal plans for members
          </p>
        </div>
        <div className="bg-white dark:bg-[#131316] border border-gray-200 dark:border-zinc-800/60 rounded-xl shadow-sm overflow-hidden">
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-12 h-12 bg-gray-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-4 border border-gray-200 dark:border-zinc-800">
              <Clipboard className="w-6 h-6 text-gray-400 dark:text-zinc-500" />
            </div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-zinc-200">
              No members yet
            </h3>
            <p className="text-gray-500 dark:text-zinc-500 text-sm mt-1 max-w-sm">
              Members will appear here once they complete the onboarding form.
            </p>
            <Link
              href={`/${gymConfig.slug}`}
              className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Share onboarding link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100 mb-1">
          Meal Plans
        </h2>
        <p className="text-sm text-gray-500 dark:text-zinc-400">
          Create and manage meal plans for members. Use templates or generate with AI.
        </p>
      </div>

      <div className="bg-white dark:bg-[#131316] border border-gray-200 dark:border-zinc-800/60 rounded-xl shadow-sm overflow-hidden">
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-zinc-800/60 text-xs text-gray-500 dark:text-zinc-500 uppercase tracking-wider bg-gray-50 dark:bg-[#18181b]/50">
                <th className="px-6 py-3 font-medium">Member</th>
                <th className="px-6 py-3 font-medium">Goal</th>
                <th className="px-6 py-3 font-medium">Plan status</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-zinc-800/40">
              {members.map((member) => {
                const planInfo = mealPlanByRowId[member.rowId];
                const hasPlan = member.mealPlanGenerated && planInfo;
                return (
                  <tr
                    key={member.rowId}
                    className="hover:bg-gray-50 dark:hover:bg-[#18181b]/60 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-zinc-800/80 flex items-center justify-center text-xs font-medium text-gray-700 dark:text-zinc-300 border border-gray-300 dark:border-zinc-700/50">
                          {member.firstName.charAt(0)}
                          {member.lastName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-sm text-gray-900 dark:text-zinc-200">
                            {member.firstName} {member.lastName}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-zinc-500">
                            {member.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-zinc-400">
                      {goalLabel(member.primaryGoal)}
                    </td>
                    <td className="px-6 py-4">
                      {hasPlan ? (
                        <span className="text-xs text-gray-600 dark:text-zinc-400">
                          Generated {formatDateTime(planInfo.generatedAt)}
                        </span>
                      ) : (
                        <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                          No plan
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {hasPlan ? (
                          <>
                            <button
                              type="button"
                              onClick={() => setViewingRowId(member.rowId)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-gray-700 dark:text-zinc-300 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              View
                            </button>
                            <button
                              type="button"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200 transition-colors"
                              title="Resend (coming soon)"
                            >
                              <Resend className="w-3.5 h-3.5" />
                              Resend
                            </button>
                            <button
                              type="button"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200 transition-colors"
                              title="Edit (coming soon)"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              Edit
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setCreatePlanForMember(member)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Create Plan
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-gray-200 dark:divide-zinc-800/40">
          {members.map((member) => {
            const planInfo = mealPlanByRowId[member.rowId];
            const hasPlan = member.mealPlanGenerated && planInfo;
            return (
              <div
                key={member.rowId}
                className="p-4 flex flex-col gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-zinc-800/80 flex items-center justify-center text-sm font-medium text-gray-700 dark:text-zinc-300 border border-gray-300 dark:border-zinc-700/50 shrink-0">
                    {member.firstName.charAt(0)}
                    {member.lastName.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm text-gray-900 dark:text-zinc-200">
                      {member.firstName} {member.lastName}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-zinc-500 truncate">
                      {member.email}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-zinc-400 mt-0.5">
                      {goalLabel(member.primaryGoal)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2">
                  {hasPlan ? (
                    <span className="text-xs text-gray-600 dark:text-zinc-400">
                      {formatDateTime(planInfo.generatedAt)}
                    </span>
                  ) : (
                    <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                      No plan
                    </span>
                  )}
                  {hasPlan ? (
                    <button
                      type="button"
                      onClick={() => setViewingRowId(member.rowId)}
                      className="inline-flex items-center gap-1 px-2 py-1.5 rounded-md text-xs font-medium text-gray-700 dark:text-zinc-300 bg-gray-100 dark:bg-zinc-800"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setCreatePlanForMember(member)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium text-white bg-indigo-600"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Create Plan
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {viewingRowId && (
        <MealPlanViewModal
          rowId={viewingRowId}
          gymSlug={gymConfig.slug}
          onClose={() => setViewingRowId(null)}
        />
      )}

      {createPlanForMember && (
        <MealPlanCreator
          member={createPlanForMember}
          gymConfig={gymConfig}
          onClose={() => setCreatePlanForMember(null)}
          onSuccess={() => {
            setCreatePlanForMember(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

function MealPlanViewModal({
  rowId,
  gymSlug,
  onClose,
}: {
  rowId: string;
  gymSlug: string;
  onClose: () => void;
}) {
  const [plan, setPlan] = useState<{
    memberName: string;
    goal: string;
    weeklyCalorieTarget: number;
    days: unknown;
    generalGuidelines: string[];
    generatedAt: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(
      `/api/admin/meal-plan?rowId=${encodeURIComponent(rowId)}&gymSlug=${encodeURIComponent(gymSlug)}`
    )
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load plan');
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setPlan(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message ?? 'Failed to load');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [rowId, gymSlug]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
      role="dialog"
      aria-modal
      aria-label="View meal plan"
    >
      <div
        className="bg-white dark:bg-[#131316] border border-gray-200 dark:border-zinc-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-800">
          <h3 className="font-semibold text-gray-900 dark:text-zinc-100">
            Meal Plan
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            ×
          </button>
        </div>
        <div className="p-4 overflow-y-auto flex-1">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {error && (
            <p className="text-sm text-rose-600 dark:text-rose-400 py-4">
              {error}
            </p>
          )}
          {plan && !loading && (
            <div className="space-y-4 text-sm">
              <p className="font-medium text-gray-900 dark:text-zinc-100">
                {plan.memberName} · {plan.goal}
              </p>
              <p className="text-gray-500 dark:text-zinc-400">
                Weekly target: {plan.weeklyCalorieTarget} kcal · Generated{' '}
                {formatDateTime(plan.generatedAt)}
              </p>
              {Array.isArray(plan.generalGuidelines) &&
                plan.generalGuidelines.length > 0 && (
                  <div>
                    <p className="font-medium text-gray-700 dark:text-zinc-300 mb-1">
                      Guidelines
                    </p>
                    <ul className="list-disc list-inside text-gray-600 dark:text-zinc-400 space-y-0.5">
                      {plan.generalGuidelines.map((g, i) => (
                        <li key={i}>{g}</li>
                      ))}
                    </ul>
                  </div>
                )}
              <p className="text-gray-500 dark:text-zinc-500 text-xs">
                Full plan (all days) can be shown here or linked to PDF.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
