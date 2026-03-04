'use client';

import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { FLEXIBILITY_OPTIONS, STEP_META } from '@/lib/onboarding-steps';
import {
  PersonArmsSpread,
  ArrowsDownUp,
  ArrowDown,
} from '@phosphor-icons/react';

interface Step6FitnessTestProps {
  primaryColor?: string;
}

const FLEXIBILITY_ICONS: Record<string, React.ElementType> = {
  touch_toes: PersonArmsSpread,
  almost: ArrowsDownUp,
  cant_reach: ArrowDown,
};

export default function Step6FitnessTest({ primaryColor = '#1A56DB' }: Step6FitnessTestProps) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const selectedFlexibility = watch('flexibilityTest');

  return (
    <div className="space-y-6">
      <div className="mb-4">
        {STEP_META[6].optional && (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 mb-3">
            Optional Step
          </div>
        )}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">{STEP_META[6].title}</h2>
        <p className="text-gray-500 dark:text-zinc-400 mt-1 text-sm">{STEP_META[6].subtitle}</p>
      </div>

      <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-100 dark:border-blue-900">
        <p className="text-sm text-blue-700 dark:text-blue-400 font-medium">Tip</p>
        <p className="text-sm text-blue-600 dark:text-blue-500 mt-1">
          Do these tests honestly. Your trainer uses this to customise your first week program.
        </p>
      </div>

      {/* Push-ups */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-gray-700 dark:text-zinc-300">
          Max Push-ups (in one set)
        </Label>
        <div className="relative">
          <Input
            type="number"
            {...register('pushUpCount')}
            placeholder="e.g. 15"
            min={0}
            max={500}
            className={cn(errors.pushUpCount && 'border-red-400')}
          />
        </div>
        <p className="text-xs text-gray-400 dark:text-zinc-500">Do as many as you can with good form</p>
        {errors.pushUpCount && (
          <p className="text-xs text-red-500">{String(errors.pushUpCount.message)}</p>
        )}
      </div>

      {/* Plank */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-gray-700 dark:text-zinc-300">Plank Hold (seconds)</Label>
        <Input
          type="number"
          {...register('plankHoldSeconds')}
          placeholder="e.g. 45"
          min={0}
          max={3600}
          className={cn(errors.plankHoldSeconds && 'border-red-400')}
        />
        <p className="text-xs text-gray-400 dark:text-zinc-500">Hold a forearm plank, flat back, as long as possible</p>
      </div>

      {/* Flexibility */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700 dark:text-zinc-300">
          Standing Toe Touch Test
        </Label>
        <div className="space-y-2">
          {FLEXIBILITY_OPTIONS.map((opt) => {
            const Icon = FLEXIBILITY_ICONS[opt.value];
            const isSelected = selectedFlexibility === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() =>
                  setValue('flexibilityTest', opt.value, { shouldValidate: true })
                }
                className={cn(
                  'w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all duration-200',
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
                    size={20}
                    weight="bold"
                    className="shrink-0"
                    style={{ color: isSelected ? primaryColor : '#6B7280' }}
                  />
                )}
                <div>
                  <div
                    className="text-sm font-semibold"
                    style={isSelected ? { color: primaryColor } : { color: '#111827' }}
                  >
                    {opt.label}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-zinc-500">{opt.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Resting Heart Rate */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-gray-700 dark:text-zinc-300">
          Resting Heart Rate (bpm)
        </Label>
        <Input
          type="number"
          {...register('restingHeartRate')}
          placeholder="e.g. 72"
          min={30}
          max={200}
        />
        <p className="text-xs text-gray-400 dark:text-zinc-500">
          Sit quietly for 1 min, then count your pulse for 30s × 2
        </p>
      </div>
    </div>
  );
}
