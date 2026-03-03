'use client';

import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { FITNESS_LEVELS, EXPERIENCE_OPTIONS, STEP_META } from '@/lib/onboarding-steps';

interface Step3CurrentStatusProps {
  primaryColor?: string;
}

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
  const selectedExperience = watch('gymExperience');

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
        <h2 className="text-2xl font-bold text-gray-900">{STEP_META[2].title}</h2>
        <p className="text-gray-500 mt-1 text-sm">{STEP_META[2].subtitle}</p>
      </div>

      {/* Weight */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <Label className="text-sm font-medium text-gray-700">Weight</Label>
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            {(['kg', 'lbs'] as const).map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => setWeightUnit(u)}
                className={cn(
                  'px-3 py-1 text-xs font-medium rounded-md transition-all',
                  weightUnit === u ? 'bg-white shadow text-gray-900' : 'text-gray-500',
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
          <Label className="text-sm font-medium text-gray-700">Height</Label>
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            {(['cm', 'ft'] as const).map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => setHeightUnit(u)}
                className={cn(
                  'px-3 py-1 text-xs font-medium rounded-md transition-all',
                  heightUnit === u ? 'bg-white shadow text-gray-900' : 'text-gray-500',
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
        <Label className="text-sm font-medium text-gray-700">
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
        <Label className="text-sm font-medium text-gray-700">
          How fit do you feel right now?
        </Label>
        <div className="flex gap-2">
          {FITNESS_LEVELS.map((level) => (
            <button
              key={level.value}
              type="button"
              onClick={() => setValue('selfRatedFitness', level.value, { shouldValidate: true })}
              className={cn(
                'flex-1 flex flex-col items-center p-2 rounded-xl border-2 transition-all duration-200',
                selectedFitness === level.value
                  ? 'border-current shadow-sm'
                  : 'border-gray-200 hover:border-gray-300',
              )}
              style={
                selectedFitness === level.value
                  ? { borderColor: primaryColor, backgroundColor: `${primaryColor}10` }
                  : {}
              }
            >
              <span className="text-xl">{level.emoji}</span>
              <span className="text-xs text-gray-500 mt-1 leading-tight text-center">
                {level.label}
              </span>
            </button>
          ))}
        </div>
        {errors.selfRatedFitness && (
          <p className="text-xs text-red-500">{String(errors.selfRatedFitness.message)}</p>
        )}
      </div>

      {/* Gym experience */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">Gym Experience</Label>
        <div className="grid grid-cols-2 gap-2">
          {EXPERIENCE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setValue('gymExperience', opt.value, { shouldValidate: true })}
              className={cn(
                'p-3 rounded-xl border-2 text-left transition-all duration-200',
                selectedExperience === opt.value
                  ? 'border-current'
                  : 'border-gray-200 hover:border-gray-300',
              )}
              style={
                selectedExperience === opt.value
                  ? { borderColor: primaryColor, backgroundColor: `${primaryColor}10` }
                  : {}
              }
            >
              <div
                className="text-sm font-semibold"
                style={
                  selectedExperience === opt.value ? { color: primaryColor } : { color: '#111827' }
                }
              >
                {opt.label}
              </div>
              <div className="text-xs text-gray-400">{opt.desc}</div>
            </button>
          ))}
        </div>
        {errors.gymExperience && (
          <p className="text-xs text-red-500">{String(errors.gymExperience.message)}</p>
        )}
      </div>
    </div>
  );
}
