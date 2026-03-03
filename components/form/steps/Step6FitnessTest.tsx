'use client';

import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { FLEXIBILITY_OPTIONS, STEP_META } from '@/lib/onboarding-steps';

interface Step6FitnessTestProps {
  primaryColor?: string;
}

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
        {STEP_META[5].optional && (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 mb-3">
            Optional Step
          </div>
        )}
        <h2 className="text-2xl font-bold text-gray-900">{STEP_META[5].title}</h2>
        <p className="text-gray-500 mt-1 text-sm">{STEP_META[5].subtitle}</p>
      </div>

      <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
        <p className="text-sm text-blue-700 font-medium">💡 Tip</p>
        <p className="text-sm text-blue-600 mt-1">
          Do these tests honestly. Your trainer uses this to customise your first week program.
        </p>
      </div>

      {/* Push-ups */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-gray-700">
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
        <p className="text-xs text-gray-400">Do as many as you can with good form</p>
        {errors.pushUpCount && (
          <p className="text-xs text-red-500">{String(errors.pushUpCount.message)}</p>
        )}
      </div>

      {/* Plank */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-gray-700">Plank Hold (seconds)</Label>
        <Input
          type="number"
          {...register('plankHoldSeconds')}
          placeholder="e.g. 45"
          min={0}
          max={3600}
          className={cn(errors.plankHoldSeconds && 'border-red-400')}
        />
        <p className="text-xs text-gray-400">Hold a forearm plank, flat back, as long as possible</p>
      </div>

      {/* Flexibility */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">
          Standing Toe Touch Test
        </Label>
        <div className="space-y-2">
          {FLEXIBILITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() =>
                setValue('flexibilityTest', opt.value, { shouldValidate: true })
              }
              className={cn(
                'w-full p-3 rounded-xl border-2 flex items-center gap-3 text-left transition-all',
                selectedFlexibility === opt.value ? 'border-current' : 'border-gray-200',
              )}
              style={
                selectedFlexibility === opt.value
                  ? { borderColor: primaryColor, backgroundColor: `${primaryColor}10` }
                  : {}
              }
            >
              <span className="text-2xl">{opt.icon}</span>
              <div>
                <div
                  className="text-sm font-semibold"
                  style={
                    selectedFlexibility === opt.value
                      ? { color: primaryColor }
                      : { color: '#111827' }
                  }
                >
                  {opt.label}
                </div>
                <div className="text-xs text-gray-400">{opt.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Resting Heart Rate */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-gray-700">
          Resting Heart Rate (bpm)
        </Label>
        <Input
          type="number"
          {...register('restingHeartRate')}
          placeholder="e.g. 72"
          min={30}
          max={200}
        />
        <p className="text-xs text-gray-400">
          Sit quietly for 1 min, then count your pulse for 30s × 2
        </p>
      </div>
    </div>
  );
}
