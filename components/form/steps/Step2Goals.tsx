'use client';

import { useFormContext } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { GOALS, BODY_GOALS, URGENCIES, TRIED_FIT_BEFORE, TIMELINE_OPTIONS, STEP_META } from '@/lib/onboarding-steps';
import {
  Fire,
  Barbell,
  Scissors,
  Heartbeat,
  Trophy,
  Heart,
  PersonSimpleBike,
  PersonSimpleRun,
  ArrowFatLinesUp,
  Coffee,
  TrendUp,
  Lightning,
} from '@phosphor-icons/react';

interface Step2GoalsProps {
  primaryColor?: string;
}

const GOAL_ICONS: Record<string, React.ElementType> = {
  weight_loss: Fire,
  muscle_gain: Barbell,
  aesthetic: Scissors,
  general_fitness: Heartbeat,
  athletic_performance: Trophy,
  competition_prep: Heart,
};

const URGENCY_ICONS: Record<string, React.ElementType> = {
  casual: Coffee,
  moderate: TrendUp,
  aggressive: Lightning,
};

const BODY_GOAL_ICONS: Record<string, React.ElementType> = {
  slim_lean: PersonSimpleBike,
  athletic_toned: PersonSimpleRun,
  bigger_muscular: ArrowFatLinesUp,
};

export default function Step2Goals({ primaryColor = '#1A56DB' }: Step2GoalsProps) {
  const {
    watch,
    setValue,
    register,
    formState: { errors },
  } = useFormContext();

  const selectedGoal = watch('primaryGoal');
  const selectedBodyGoal = watch('bodyGoal');
  const selectedUrgency = watch('goalUrgency');
  const selectedTimeline = watch('timelineMonths');
  const selectedTriedFit = watch('triedFitBefore');

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">{STEP_META[1].title}</h2>
        <p className="text-gray-500 dark:text-zinc-400 mt-1 text-sm">{STEP_META[1].subtitle}</p>
      </div>

      {/* Primary Goal */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700 dark:text-zinc-300">Primary Goal</Label>
        <div className="grid grid-cols-2 gap-2.5">
          {GOALS.map((goal) => {
            const Icon = GOAL_ICONS[goal.value];
            const isSelected = selectedGoal === goal.value;
            return (
              <button
                key={goal.value}
                type="button"
                onClick={() => setValue('primaryGoal', goal.value, { shouldValidate: true })}
                className={cn(
                  'w-full flex items-start gap-3 p-3.5 rounded-xl border-2 text-left transition-all duration-200',
                  isSelected
                    ? 'shadow-sm'
                    : 'border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600 bg-white dark:bg-zinc-900/50',
                )}
                style={
                  isSelected
                    ? { borderColor: primaryColor, backgroundColor: `${primaryColor}10` }
                    : {}
                }
              >
                {Icon && (
                  <Icon
                    size={18}
                    weight="bold"
                    className="mt-0.5 shrink-0"
                    style={{ color: isSelected ? primaryColor : '#6B7280' }}
                  />
                )}
                <div>
                  <div
                    className="text-sm font-semibold"
                    style={isSelected ? { color: primaryColor } : { color: '#111827' }}
                  >
                    {goal.label}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5">{goal.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
        {errors.primaryGoal && (
          <p className="text-xs text-red-500">{String(errors.primaryGoal.message)}</p>
        )}
      </div>

      {/* Body Goal */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700 dark:text-zinc-300">
          What kind of body are you going for?
        </Label>
        <div className="grid grid-cols-3 gap-2">
          {BODY_GOALS.map((goal) => {
            const Icon = BODY_GOAL_ICONS[goal.value];
            const isSelected = selectedBodyGoal === goal.value;
            return (
              <button
                key={goal.value}
                type="button"
                onClick={() => setValue('bodyGoal', goal.value, { shouldValidate: true })}
                className={cn(
                  'w-full flex flex-col items-center gap-2 p-3 rounded-xl border-2 text-center transition-all duration-200',
                  isSelected
                    ? 'shadow-sm'
                    : 'border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600 bg-white dark:bg-zinc-900/50',
                )}
                style={
                  isSelected
                    ? { borderColor: primaryColor, backgroundColor: `${primaryColor}10` }
                    : {}
                }
              >
                {Icon && (
                  <Icon
                    size={22}
                    weight="bold"
                    style={{ color: isSelected ? primaryColor : '#6B7280' }}
                  />
                )}
                <div>
                  <div
                    className="text-xs font-semibold"
                    style={isSelected ? { color: primaryColor } : { color: '#111827' }}
                  >
                    {goal.label}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5">{goal.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* How urgent */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700 dark:text-zinc-300">How urgent is this for you?</Label>
        <div className="space-y-2">
          {URGENCIES.map((u) => {
            const Icon = URGENCY_ICONS[u.value];
            const isSelected = selectedUrgency === u.value;
            return (
              <button
                key={u.value}
                type="button"
                onClick={() => setValue('goalUrgency', u.value, { shouldValidate: true })}
                className={cn(
                  'w-full flex items-start gap-3 p-3.5 rounded-xl border-2 text-left transition-all duration-200',
                  isSelected
                    ? ''
                    : 'border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600 bg-white dark:bg-zinc-900/50',
                )}
                style={
                  isSelected
                    ? { borderColor: primaryColor, backgroundColor: `${primaryColor}10` }
                    : {}
                }
              >
                {Icon && (
                  <Icon
                    size={18}
                    weight="bold"
                    className="mt-0.5 shrink-0"
                    style={{ color: isSelected ? primaryColor : '#6B7280' }}
                  />
                )}
                <div>
                  <div
                    className="text-sm font-semibold"
                    style={isSelected ? { color: primaryColor } : { color: '#111827' }}
                  >
                    {u.label}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-zinc-500">{u.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
        {errors.goalUrgency && (
          <p className="text-xs text-red-500">{String(errors.goalUrgency.message)}</p>
        )}
      </div>

      {/* Tried fit before */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700 dark:text-zinc-300">
          Have you tried getting fit before?
        </Label>
        <div className="space-y-2">
          {TRIED_FIT_BEFORE.map((opt) => {
            const isSelected = selectedTriedFit === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setValue('triedFitBefore', opt.value, { shouldValidate: true })}
                className={cn(
                  'w-full p-3 rounded-xl border-2 text-left text-sm transition-all duration-200',
                  isSelected
                    ? ''
                    : 'border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600 bg-white dark:bg-zinc-900/50',
                )}
                style={
                  isSelected
                    ? { borderColor: primaryColor, backgroundColor: `${primaryColor}10`, color: primaryColor }
                    : { color: '#374151' }
                }
              >
                <span className="font-medium">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700 dark:text-zinc-300">Timeline</Label>
        <div className="grid grid-cols-2 gap-2">
          {TIMELINE_OPTIONS.map((opt) => {
            const isSelected = selectedTimeline === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setValue('timelineMonths', opt.value, { shouldValidate: true })}
                className={cn(
                  'p-3 rounded-xl border-2 text-left transition-all duration-200',
                  isSelected
                    ? ''
                    : 'border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600 bg-white dark:bg-zinc-900/50',
                )}
                style={
                  isSelected
                    ? { borderColor: primaryColor, backgroundColor: `${primaryColor}10` }
                    : {}
                }
              >
                <div
                  className="text-sm font-semibold"
                  style={isSelected ? { color: primaryColor } : { color: '#111827' }}
                >
                  {opt.label}
                </div>
              </button>
            );
          })}
        </div>
        {errors.timelineMonths && (
          <p className="text-xs text-red-500">{String(errors.timelineMonths.message)}</p>
        )}
      </div>

      {/* Optional notes */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-gray-700 dark:text-zinc-300">
          Anything specific to share? <span className="text-gray-400">(optional)</span>
        </Label>
        <Textarea
          {...register('goalDetails')}
          placeholder="E.g. I want to lose 10kg before my wedding in June..."
          rows={3}
          className="resize-none"
        />
      </div>
    </div>
  );
}
