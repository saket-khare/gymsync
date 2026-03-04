'use client';

import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  OCCUPATION_OPTIONS,
  STRESS_LABELS,
  STEP_META,
} from '@/lib/onboarding-steps';
import {
  Desktop,
  Wrench,
  Student,
  Briefcase,
  DotsThreeCircle,
} from '@phosphor-icons/react';

interface Step4LifestyleProps {
  primaryColor?: string;
}

const OCCUPATION_ICONS: Record<string, React.ElementType> = {
  desk_job: Desktop,
  active_job: Wrench,
  student: Student,
  freelance: Briefcase,
  other: DotsThreeCircle,
};

export default function Step4Lifestyle({ primaryColor = '#1A56DB' }: Step4LifestyleProps) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const [showHealthFields, setShowHealthFields] = useState(false);
  const selectedOccupation = watch('occupationType');
  const sleepVal = watch('sleepHoursPerNight') ?? 7;
  const stressVal = watch('stressLevel') ?? 3;

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">{STEP_META[3].title}</h2>
        <p className="text-gray-500 dark:text-zinc-400 mt-1 text-sm">{STEP_META[3].subtitle}</p>
      </div>

      {/* Occupation */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700 dark:text-zinc-300">Occupation Type</Label>
        <div className="grid grid-cols-3 gap-2">
          {OCCUPATION_OPTIONS.map((opt) => {
            const Icon = OCCUPATION_ICONS[opt.value];
            const isSelected = selectedOccupation === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setValue('occupationType', opt.value, { shouldValidate: true })}
                className={cn(
                  'flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-center transition-all duration-200',
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
                    style={{ color: isSelected ? primaryColor : '#6B7280' }}
                  />
                )}
                <div
                  className="text-xs font-medium"
                  style={isSelected ? { color: primaryColor } : { color: '#374151' }}
                >
                  {opt.label}
                </div>
              </button>
            );
          })}
        </div>
        {errors.occupationType && (
          <p className="text-xs text-red-500">{String(errors.occupationType.message)}</p>
        )}
      </div>

      {/* Sleep */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700 dark:text-zinc-300">
          Sleep per night:{' '}
          <span style={{ color: primaryColor }} className="font-bold">
            {sleepVal} hours
          </span>
        </Label>
        <input
          type="range"
          min={4}
          max={10}
          step={0.5}
          value={sleepVal}
          onChange={(e) =>
            setValue('sleepHoursPerNight', parseFloat(e.target.value), { shouldValidate: true })
          }
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{ accentColor: primaryColor }}
        />
        <div className="flex justify-between text-xs text-gray-400 dark:text-zinc-500">
          <span>4h (poor)</span>
          <span>7h (good)</span>
          <span>10h (great)</span>
        </div>
      </div>

      {/* Stress */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700 dark:text-zinc-300">
          Daily stress level:{' '}
          <span style={{ color: primaryColor }} className="font-bold">
            {STRESS_LABELS[(stressVal ?? 3) - 1] ?? 'Moderate'}
          </span>
        </Label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setValue('stressLevel', n, { shouldValidate: true })}
              className={cn(
                'flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-all',
                stressVal === n ? 'text-white' : 'border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-zinc-400',
              )}
              style={
                stressVal === n
                  ? { borderColor: primaryColor, backgroundColor: primaryColor }
                  : {}
              }
            >
              {n}
            </button>
          ))}
        </div>
        {errors.stressLevel && (
          <p className="text-xs text-red-500">{String(errors.stressLevel.message)}</p>
        )}
      </div>

      {/* Food Allergies */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-gray-700 dark:text-zinc-300">
          Food Allergies <span className="text-gray-400">(optional)</span>
        </Label>
        <Input {...register('foodAllergies')} placeholder="e.g. nuts, lactose, gluten..." />
      </div>

      {/* Health Toggle */}
      <button
        type="button"
        onClick={() => setShowHealthFields(!showHealthFields)}
        className="flex items-center gap-2 text-sm text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200 transition-colors"
      >
        <div
          className={cn(
            'w-5 h-5 rounded border-2 flex items-center justify-center transition-all',
            showHealthFields ? 'border-current bg-current' : 'border-gray-300 dark:border-zinc-600',
          )}
          style={showHealthFields ? { borderColor: primaryColor, backgroundColor: primaryColor } : {}}
        >
          {showHealthFields && <span className="text-white text-xs">✓</span>}
        </div>
        I have injuries or medical conditions to declare
      </button>

      {showHealthFields && (
        <div className="space-y-3 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-800">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700 dark:text-zinc-300">Injuries</Label>
            <Textarea
              {...register('injuries')}
              placeholder="Describe any current or past injuries..."
              rows={2}
              className="resize-none bg-white dark:bg-zinc-900"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700 dark:text-zinc-300">Medical Conditions</Label>
            <Textarea
              {...register('medicalConditions')}
              placeholder="e.g. diabetes, hypertension, asthma..."
              rows={2}
              className="resize-none bg-white dark:bg-zinc-900"
            />
          </div>
        </div>
      )}
    </div>
  );
}
