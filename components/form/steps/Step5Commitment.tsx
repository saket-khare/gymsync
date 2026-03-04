'use client';

import { useFormContext } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
  DAYS,
  DAY_COUNT_MAP,
  DURATION_OPTIONS,
  PT_OPTIONS,
  HOME_EQUIPMENT_LEVEL,
  TRAINED_PT_BEFORE,
  STEP_META,
} from '@/lib/onboarding-steps';
import {
  ThumbsUp,
  Question,
  UserMinus,
  HouseLine,
  Barbell,
  Trophy,
  UserCircle,
  UserCircleMinus,
  UsersThree,
} from '@phosphor-icons/react';

interface Step5CommitmentProps {
  primaryColor?: string;
}

const PT_ICONS: Record<string, React.ElementType> = {
  yes: ThumbsUp,
  maybe: Question,
  no: UserMinus,
};

const PT_DESCS: Record<string, string> = {
  yes: 'I want expert guidance',
  maybe: 'Tell me more about it',
  no: 'I prefer to train independently',
};

const EQUIPMENT_ICONS: Record<string, React.ElementType> = {
  none: HouseLine,
  basic: Barbell,
  full: Trophy,
};

const TRAINED_PT_ICONS: Record<string, React.ElementType> = {
  never: UserCircleMinus,
  briefly: UserCircle,
  regularly: UsersThree,
};

export default function Step5Commitment({ primaryColor = '#1A56DB' }: Step5CommitmentProps) {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const selectedDays: string[] = watch('_selectedDays') ?? [];
  const selectedDuration = watch('sessionDurationMinutes');
  const homeEquipmentLevel = watch('homeEquipmentLevel');
  const selectedPT = watch('interestedInPT');
  const trainedPtBefore = watch('trainedPtBefore');

  function toggleDay(day: string) {
    let updated = [...selectedDays];
    if (updated.includes(day)) {
      updated = updated.filter((d) => d !== day);
    } else {
      updated.push(day);
    }

    const count = Math.min(Math.max(updated.length, 2), 6);
    setValue('_selectedDays', updated);
    if (count in DAY_COUNT_MAP) {
      setValue('daysPerWeekAvailable', DAY_COUNT_MAP[count as keyof typeof DAY_COUNT_MAP] ?? 3, {
        shouldValidate: true,
      });
    }
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">{STEP_META[5].title}</h2>
        <p className="text-gray-500 dark:text-zinc-400 mt-1 text-sm">{STEP_META[5].subtitle}</p>
      </div>

      {/* Days selector */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700 dark:text-zinc-300">
          Which days will you train?
          {selectedDays.length > 0 && (
            <span className="ml-2 text-xs" style={{ color: primaryColor }}>
              {selectedDays.length} days selected
            </span>
          )}
        </Label>
        <div className="flex gap-1.5">
          {DAYS.map((day) => (
            <button
              key={day}
              type="button"
              onClick={() => toggleDay(day)}
              className={cn(
                'flex-1 py-2.5 rounded-lg text-xs font-medium transition-all duration-200',
                selectedDays.includes(day)
                  ? 'text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-700',
              )}
              style={
                selectedDays.includes(day)
                  ? { backgroundColor: primaryColor }
                  : {}
              }
            >
              {day}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 dark:text-zinc-500">Select 2–6 days per week</p>
        {errors.daysPerWeekAvailable && (
          <p className="text-xs text-red-500">{String(errors.daysPerWeekAvailable.message)}</p>
        )}
      </div>

      {/* Session duration */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700 dark:text-zinc-300">Session Duration</Label>
        <div className="grid grid-cols-2 gap-2">
          {DURATION_OPTIONS.map((opt) => {
            const isSelected = selectedDuration === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() =>
                  setValue('sessionDurationMinutes', opt.value, { shouldValidate: true })
                }
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
                  className="text-sm font-bold"
                  style={isSelected ? { color: primaryColor } : { color: '#111827' }}
                >
                  {opt.label}
                </div>
                <div className="text-xs text-gray-400 dark:text-zinc-500">{opt.desc}</div>
              </button>
            );
          })}
        </div>
        {errors.sessionDurationMinutes && (
          <p className="text-xs text-red-500">{String(errors.sessionDurationMinutes.message)}</p>
        )}
      </div>

      {/* Home Equipment Level */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700 dark:text-zinc-300">Home Equipment?</Label>
        <div className="grid grid-cols-3 gap-2">
          {HOME_EQUIPMENT_LEVEL.map((opt) => {
            const Icon = EQUIPMENT_ICONS[opt.value];
            const isSelected = homeEquipmentLevel === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setValue('homeEquipmentLevel', opt.value, { shouldValidate: true })}
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
                  className="text-xs font-semibold"
                  style={isSelected ? { color: primaryColor } : { color: '#374151' }}
                >
                  {opt.label}
                </div>
                <div className="text-xs text-gray-400 dark:text-zinc-500">{opt.desc}</div>
              </button>
            );
          })}
        </div>
        {errors.homeEquipmentLevel && (
          <p className="text-xs text-red-500">{String(errors.homeEquipmentLevel.message)}</p>
        )}
      </div>

      {/* Trained with PT before */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700 dark:text-zinc-300">
          Have you ever trained with a personal trainer?
        </Label>
        <div className="grid grid-cols-3 gap-2">
          {TRAINED_PT_BEFORE.map((opt) => {
            const Icon = TRAINED_PT_ICONS[opt.value];
            const isSelected = trainedPtBefore === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setValue('trainedPtBefore', opt.value, { shouldValidate: true })}
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
                  className="text-xs font-semibold"
                  style={isSelected ? { color: primaryColor } : { color: '#374151' }}
                >
                  {opt.label}
                </div>
                <div className="text-xs text-gray-400 dark:text-zinc-500">{opt.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* PT Interest */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700 dark:text-zinc-300">Interested in Personal Training?</Label>
        <div className="space-y-2">
          {PT_OPTIONS.map((opt) => {
            const Icon = PT_ICONS[opt.value];
            const isSelected = selectedPT === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setValue('interestedInPT', opt.value, { shouldValidate: true })}
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
                    size={18}
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
                  <div className="text-xs text-gray-400 dark:text-zinc-500">{PT_DESCS[opt.value]}</div>
                </div>
              </button>
            );
          })}
        </div>
        {errors.interestedInPT && (
          <p className="text-xs text-red-500">{String(errors.interestedInPT.message)}</p>
        )}
      </div>
    </div>
  );
}
