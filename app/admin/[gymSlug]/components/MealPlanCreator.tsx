'use client';

import { useState } from 'react';
import {
  SparkleIcon as Sparkle,
  CopyIcon as TemplateIcon,
  PencilSimpleIcon as Pencil,
  XIcon as Close,
  CheckCircleIcon as CheckCircle,
} from '@phosphor-icons/react';
import { goalLabel, dietLabel } from '@/lib/utils';
import type { GymConfig, SheetRow } from '@/types';
import type { GeneratedMealPlan } from '@/types';
import { BUILT_IN_TEMPLATES, getTemplatesForMember } from '@/lib/meal-plan-templates';

interface MealPlanCreatorProps {
  member: SheetRow;
  gymConfig: GymConfig;
  onClose: () => void;
  onSuccess: () => void;
}

type Mode = 'choose' | 'ai' | 'template' | 'custom' | 'preview';

export function MealPlanCreator({ member, gymConfig, onClose, onSuccess }: MealPlanCreatorProps) {
  const [mode, setMode] = useState<Mode>('choose');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<GeneratedMealPlan | null>(null);
  const [saving, setSaving] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);

  const suggestedTemplates = getTemplatesForMember(member.primaryGoal, member.dietType);
  const templatesToShow = suggestedTemplates.length > 0 ? suggestedTemplates : BUILT_IN_TEMPLATES;

  async function handleAIGenerate() {
    setMode('ai');
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch('/api/admin/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rowId: member.rowId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAiError(data.error ?? 'Generation failed');
        return;
      }
      onSuccess();
      onClose();
    } catch {
      setAiError('Network error');
    } finally {
      setAiLoading(false);
    }
  }

  function handleSelectTemplate(template: (typeof BUILT_IN_TEMPLATES)[0]) {
    setAiError(null);
    const memberName = `${member.firstName} ${member.lastName}`;
    const generatedAt = new Date().toISOString();
    const plan: GeneratedMealPlan = {
      memberId: '', // set by API
      memberName,
      goal: template.goal,
      weeklyCalorieTarget: template.weeklyCalorieTarget,
      days: template.days,
      generalGuidelines: template.generalGuidelines,
      foodsToAvoid: template.foodsToAvoid,
      generatedAt,
    };
    setSelectedPlan(plan);
    setMode('preview');
  }

  async function handleSave(sendEmail: boolean) {
    if (!selectedPlan) return;
    setSaving(true);
    setAiError(null);
    try {
      const res = await fetch('/api/admin/meal-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rowId: member.rowId,
          plan: {
            goal: selectedPlan.goal,
            weeklyCalorieTarget: selectedPlan.weeklyCalorieTarget,
            days: selectedPlan.days,
            generalGuidelines: selectedPlan.generalGuidelines,
            foodsToAvoid: selectedPlan.foodsToAvoid,
            supplementSuggestions: selectedPlan.supplementSuggestions,
          },
          sendEmail,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? 'Failed to save');
      }
      onSuccess();
      onClose();
    } catch (e) {
      setAiError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveAsTemplate() {
    if (!selectedPlan) return;
    setSavingTemplate(true);
    setAiError(null);
    try {
      const res = await fetch('/api/meal-plan-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${selectedPlan.goal} - ${selectedPlan.memberName}`,
          goal: selectedPlan.goal,
          weeklyCalorieTarget: selectedPlan.weeklyCalorieTarget,
          days: selectedPlan.days,
          generalGuidelines: selectedPlan.generalGuidelines,
          foodsToAvoid: selectedPlan.foodsToAvoid,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? 'Failed to save template');
      }
      setAiError(null);
      onClose();
    } catch (e) {
      setAiError(e instanceof Error ? e.message : 'Failed to save template');
    } finally {
      setSavingTemplate(false);
    }
  }

  const memberLabel = `${member.firstName} ${member.lastName} · ${goalLabel(member.primaryGoal)} · ${dietLabel(member.dietType)}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
      role="dialog"
      aria-modal
      aria-label="Create meal plan"
    >
      <div
        className="bg-white dark:bg-[#131316] border border-gray-200 dark:border-zinc-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-800 shrink-0">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-zinc-100">
              Create meal plan
            </h3>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">{memberLabel}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            <Close className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1">
          {mode === 'choose' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={handleAIGenerate}
                className="p-4 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-200 dark:hover:border-indigo-800 text-left transition-colors"
              >
                <Sparkle className="w-8 h-8 text-indigo-500 mb-2" />
                <div className="font-medium text-gray-900 dark:text-zinc-100">AI Generate</div>
                <div className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
                  Generate a personalised plan from member data and send email.
                </div>
              </button>
              <button
                type="button"
                onClick={() => setMode('template')}
                className="p-4 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/50 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:border-amber-200 dark:hover:border-amber-800 text-left transition-colors"
              >
                <TemplateIcon className="w-8 h-8 text-amber-500 mb-2" />
                <div className="font-medium text-gray-900 dark:text-zinc-100">Use template</div>
                <div className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
                  Pick a built-in plan and assign to this member.
                </div>
              </button>
              <button
                type="button"
                onClick={() => setMode('custom')}
                className="p-4 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-200 dark:hover:border-emerald-800 text-left transition-colors"
              >
                <Pencil className="w-8 h-8 text-emerald-500 mb-2" />
                <div className="font-medium text-gray-900 dark:text-zinc-100">Custom</div>
                <div className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
                  Build a plan manually (coming soon).
                </div>
              </button>
            </div>
          )}

          {mode === 'ai' && (
            <div className="py-8 text-center">
              {aiLoading ? (
                <>
                  <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-sm text-gray-600 dark:text-zinc-400">
                    Generating meal plan and trainer brief…
                  </p>
                </>
              ) : aiError ? (
                <>
                  <p className="text-sm text-rose-600 dark:text-rose-400 mb-4">{aiError}</p>
                  <button
                    type="button"
                    onClick={() => setMode('choose')}
                    className="text-sm font-medium text-indigo-600 dark:text-indigo-400"
                  >
                    Back
                  </button>
                </>
              ) : null}
            </div>
          )}

          {mode === 'template' && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-zinc-400">
                Suggested for this member (goal + diet):
              </p>
              <ul className="space-y-2">
                {templatesToShow.map((t) => (
                  <li key={t.id}>
                    <button
                      type="button"
                      onClick={() => handleSelectTemplate(t)}
                      className="w-full p-3 rounded-lg border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800/50 text-left"
                    >
                      <span className="font-medium text-gray-900 dark:text-zinc-100">
                        {t.name}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-zinc-400 block mt-0.5">
                        {goalLabel(t.goal)} · {t.weeklyCalorieTarget.toLocaleString()} kcal/week
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => setMode('choose')}
                className="text-sm font-medium text-gray-500 dark:text-zinc-400"
              >
                Back
              </button>
            </div>
          )}

          {mode === 'preview' && selectedPlan && (
            <MealPlanPreview
              plan={selectedPlan}
              saving={saving}
              error={aiError}
              onSaveAndSend={() => handleSave(true)}
              onSaveDraft={() => handleSave(false)}
              onSaveAsTemplate={handleSaveAsTemplate}
              onBack={() => {
                setSelectedPlan(null);
                setMode('template');
              }}
            />
          )}

          {mode === 'custom' && (
            <div className="py-4 text-center text-sm text-gray-500 dark:text-zinc-400">
              Custom builder coming soon. Use a template or AI generate for now.
              <button
                type="button"
                onClick={() => setMode('choose')}
                className="block mt-2 text-indigo-600 dark:text-indigo-400 font-medium"
              >
                Back
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MealPlanPreview({
  plan,
  saving,
  error,
  onSaveAndSend,
  onSaveDraft,
  onSaveAsTemplate,
  onBack,
}: {
  plan: GeneratedMealPlan;
  saving: boolean;
  error: string | null;
  onSaveAndSend: () => void;
  onSaveDraft: () => void;
  onSaveAsTemplate: () => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="p-3 rounded-lg bg-gray-50 dark:bg-zinc-800/50 text-sm">
        <p className="font-medium text-gray-900 dark:text-zinc-100">{plan.memberName}</p>
        <p className="text-gray-500 dark:text-zinc-400">
          {plan.goal} · {plan.weeklyCalorieTarget.toLocaleString()} kcal/week · {plan.days.length}{' '}
          days
        </p>
      </div>
      {plan.generalGuidelines.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-zinc-500 uppercase mb-1">
            Guidelines
          </p>
          <ul className="list-disc list-inside text-sm text-gray-600 dark:text-zinc-400 space-y-0.5">
            {plan.generalGuidelines.slice(0, 3).map((g, i) => (
              <li key={i}>{g}</li>
            ))}
          </ul>
        </div>
      )}
      {error && (
        <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
      )}
      <div className="flex flex-wrap gap-2 pt-2">
        <button
          type="button"
          onClick={onSaveAndSend}
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          {saving ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <CheckCircle className="w-4 h-4" />
          )}
          Save &amp; Send
        </button>
        <button
          type="button"
          onClick={onSaveDraft}
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-zinc-800 disabled:opacity-50"
        >
          Save as draft
        </button>
        <button
          type="button"
          onClick={onSaveAsTemplate}
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-zinc-400 text-sm font-medium hover:bg-gray-50 dark:hover:bg-zinc-800 disabled:opacity-50"
        >
          Save as template
        </button>
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-medium text-gray-500 dark:text-zinc-400"
        >
          Back
        </button>
      </div>
    </div>
  );
}
