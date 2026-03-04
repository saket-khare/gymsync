'use client';

import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { FITNESS_LEVELS, TIME_SINCE_TRAINED, STEP_META } from '@/lib/onboarding-steps';
import {
  Bed,
  PersonSimpleWalk,
  PersonSimpleRun,
  Fire,
  Lightning,
  CalendarX,
  CalendarCheck,
  Clock,
  Heartbeat,
} from '@phosphor-icons/react';

interface Step3CurrentStatusProps {
  primaryColor?: string;
}

const FITNESS_ICONS: Record<number, React.ElementType> = {
  1: Bed,
  2: PersonSimpleWalk,
  3: PersonSimpleRun,
  4: Fire,
  5: Lightning,
};

const TIME_SINCE_ICONS: Record<string, React.ElementType> = {
  never_routine: CalendarX,
  more_than_year: CalendarX,
  '3_12_months': Clock,
  currently_active: Heartbeat,
};

export default function Step3CurrentStatus({ primaryColor = '#1A56DB' }: Step3CurrentStatusProps) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');
  const [heightUnit, setHeightUnit] = useState<'cm' | 'ft'>('cm');
  const [feetVal, setFeetVal] = useState('');
  const [inchesVal, setInchesVal] = useState('');

  const selectedFitness = watch('selfRatedFitness');
  const selectedTimeSince = watch('timeSinceTrained');

  function handleWeightChange(val: string) {
    const num = parseFloat(val);
    if (isNaN(num)) return;
    const kg = weightUnit === 'lbs' ? num * 0.453592 : num;
    setValue('weightKg', Math.round(kg * 10) / 10, { shouldValidate: true });
  }

  function handleHeightChange(val: string) {
    const num = parseFloat(val);
    if (isNaN(num)) return;
    const cm = heightUnit === 'ft' ? num * 30.48 : num;
    setValue('heightCm', Math.round(cm), { shouldValidate: true });
  }

  function handleFtInChange(ft: string, inches: string) {
    const totalInches = parseFloat(ft || '0') * 12 + parseFloat(inches || '0');
    const cm = totalInches * 2.54;
    setValue('heightCm', Math.round(cm), { shouldValidate: true });
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">{STEP_META[2].title}</h2>
        <p className="text-gray-500 dark:text-zinc-400 mt-1 text-sm">{STEP_META[2].subtitle}</p>
      </div>

      {/* Weight */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <Label className="text-sm font-medium text-gray-700 dark:text-zinc-300">Weight</Label>
          <div className="flex bg-gray-100 dark:bg-zinc-800 rounded-lg p-0.5">
            {(['kg', 'lbs'] as const).map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => setWeightUnit(u)}
                className={cn(
                  'px-3 py-1 text-xs font-medium rounded-md transition-all',
                  weightUnit === u ? 'bg-white dark:bg-zinc-700 shadow text-gray-900 dark:text-zinc-100' : 'text-gray-500 dark:text-zinc-400',
                )}
              >
                {u}
              </button>
            ))}
          </div>
        </div>
        <Input
          type="number"
          placeholder={weightUnit === 'kg' ? '70' : '154'}
          min={weightUnit === 'kg' ? 20 : 44}
          max={weightUnit === 'kg' ? 300 : 660}
          step="0.1"
          onChange={(e) => handleWeightChange(e.target.value)}
          className={cn(errors.weightKg && 'border-red-400')}
        />
        {errors.weightKg && (
          <p className="text-xs text-red-500">{String(errors.weightKg.message)}</p>
        )}
      </div>

      {/* Height */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <Label className="text-sm font-medium text-gray-700 dark:text-zinc-300">Height</Label>
          <div className="flex bg-gray-100 dark:bg-zinc-800 rounded-lg p-0.5">
            {(['cm', 'ft'] as const).map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => setHeightUnit(u)}
                className={cn(
                  'px-3 py-1 text-xs font-medium rounded-md transition-all',
                  heightUnit === u ? 'bg-white dark:bg-zinc-700 shadow text-gray-900 dark:text-zinc-100' : 'text-gray-500 dark:text-zinc-400',
                )}
              >
                {u}
              </button>
            ))}
          </div>
        </div>
        {heightUnit === 'cm' ? (
          <Input
            type="number"
            placeholder="175"
            min={100}
            max={250}
            onChange={(e) => handleHeightChange(e.target.value)}
            className={cn(errors.heightCm && 'border-red-400')}
          />
        ) : (
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="5 ft"
              min={3}
              max={8}
              value={feetVal}
              onChange={(e) => {
                setFeetVal(e.target.value);
                handleFtInChange(e.target.value, inchesVal);
              }}
              className="flex-1"
            />
            <Input
              type="number"
              placeholder="10 in"
              min={0}
              max={11}
              value={inchesVal}
              onChange={(e) => {
                setInchesVal(e.target.value);
                handleFtInChange(feetVal, e.target.value);
              }}
              className="flex-1"
            />
          </div>
        )}
        {errors.heightCm && (
          <p className="text-xs text-red-500">{String(errors.heightCm.message)}</p>
        )}
      </div>

      {/* Body fat (optional) */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-gray-700 dark:text-zinc-300">
          Body Fat % <span className="text-gray-400">(optional)</span>
        </Label>
        <Input
          type="number"
          {...register('bodyFatPercent')}
          placeholder="e.g. 22"
          min={1}
          max={70}
        />
      </div>

      {/* Self-rated fitness */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700 dark:text-zinc-300">
          How fit do you feel right now?
        </Label>
        <div className="flex gap-2">
          {FITNESS_LEVELS.map((level) => {
            const Icon = FITNESS_ICONS[level.value];
            const isSelected = selectedFitness === level.value;
            return (
              <button
                key={level.value}
                type="button"
                onClick={() => setValue('selfRatedFitness', level.value, { shouldValidate: true })}
                className={cn(
                  'flex-1 flex flex-col items-center p-2 rounded-xl border-2 transition-all duration-200 min-h-[72px]',
                  isSelected
                    ? 'shadow-sm'
                    : 'border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600',
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
                    style={{ color: isSelected ? primaryColor : '#9CA3AF' }}
                  />
                )}
                <span className="text-xs text-gray-500 dark:text-zinc-400 mt-1 leading-tight text-center">
                  {level.label}
                </span>
              </button>
            );
          })}
        </div>
        {errors.selfRatedFitness && (
          <p className="text-xs text-red-500">{String(errors.selfRatedFitness.message)}</p>
        )}
      </div>

      {/* Time since trained */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700 dark:text-zinc-300">
          How long since you trained regularly?
        </Label>
        <div className="space-y-2">
          {TIME_SINCE_TRAINED.map((opt) => {
            const Icon = TIME_SINCE_ICONS[opt.value] ?? CalendarCheck;
            const isSelected = selectedTimeSince === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setValue('timeSinceTrained', opt.value, { shouldValidate: true })}
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
                <Icon
                  size={18}
                  weight="bold"
                  className="shrink-0"
                  style={{ color: isSelected ? primaryColor : '#6B7280' }}
                />
                <span
                  className="text-sm font-medium"
                  style={isSelected ? { color: primaryColor } : { color: '#111827' }}
                >
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>
        {errors.timeSinceTrained && (
          <p className="text-xs text-red-500">{String(errors.timeSinceTrained.message)}</p>
        )}
      </div>
    </div>
  );
}
