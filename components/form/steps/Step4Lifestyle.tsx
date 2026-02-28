'use client';

import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface Step4LifestyleProps {
  primaryColor?: string;
}

const DIET_OPTIONS = [
  { value: 'vegetarian', label: 'Vegetarian', icon: '🥦' },
  { value: 'non_vegetarian', label: 'Non-Veg', icon: '🍗' },
  { value: 'vegan', label: 'Vegan', icon: '🌱' },
  { value: 'eggetarian', label: 'Eggetarian', icon: '🥚' },
  { value: 'keto', label: 'Keto', icon: '🥑' },
  { value: 'other', label: 'Other', icon: '🍽️' },
];

const OCCUPATION_OPTIONS = [
  { value: 'desk_job', label: 'Desk Job', icon: '💻' },
  { value: 'active_job', label: 'Active Job', icon: '🏗️' },
  { value: 'student', label: 'Student', icon: '📚' },
  { value: 'freelance', label: 'Freelance', icon: '🎯' },
  { value: 'other', label: 'Other', icon: '🔮' },
];

export default function Step4Lifestyle({ primaryColor = '#1A56DB' }: Step4LifestyleProps) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const [showHealthFields, setShowHealthFields] = useState(false);
  const selectedDiet = watch('dietType');
  const selectedOccupation = watch('occupationType');
  const sleepVal = watch('sleepHoursPerNight') ?? 7;
  const stressVal = watch('stressLevel') ?? 3;

  const STRESS_LABELS = ['Very Low', 'Low', 'Moderate', 'High', 'Very High'];

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Tell us about your lifestyle</h2>
        <p className="text-gray-500 mt-1 text-sm">
          The more you tell us, the better your plan will be.
        </p>
      </div>

      {/* Diet Type */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">Dietary Preference</Label>
        <div className="grid grid-cols-3 gap-2">
          {DIET_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setValue('dietType', opt.value, { shouldValidate: true })}
              className={cn(
                'p-3 rounded-xl border-2 text-center transition-all duration-200',
                selectedDiet === opt.value
                  ? 'border-current'
                  : 'border-gray-200 hover:border-gray-300',
              )}
              style={
                selectedDiet === opt.value
                  ? { borderColor: primaryColor, backgroundColor: `${primaryColor}10` }
                  : {}
              }
            >
              <div className="text-xl">{opt.icon}</div>
              <div
                className="text-xs font-medium mt-1"
                style={
                  selectedDiet === opt.value ? { color: primaryColor } : { color: '#374151' }
                }
              >
                {opt.label}
              </div>
            </button>
          ))}
        </div>
        {errors.dietType && (
          <p className="text-xs text-red-500">{String(errors.dietType.message)}</p>
        )}
      </div>

      {/* Sleep */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">
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
        <div className="flex justify-between text-xs text-gray-400">
          <span>4h (poor)</span>
          <span>7h (good)</span>
          <span>10h (great)</span>
        </div>
      </div>

      {/* Stress */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">
          Daily stress level:{' '}
          <span style={{ color: primaryColor }} className="font-bold">
            {STRESS_LABELS[(stressVal ?? 3) - 1]}
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
                stressVal === n ? 'text-white' : 'border-gray-200 text-gray-500',
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

      {/* Occupation */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">Occupation Type</Label>
        <div className="grid grid-cols-3 gap-2">
          {OCCUPATION_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setValue('occupationType', opt.value, { shouldValidate: true })}
              className={cn(
                'p-3 rounded-xl border-2 text-center transition-all duration-200',
                selectedOccupation === opt.value
                  ? 'border-current'
                  : 'border-gray-200 hover:border-gray-300',
              )}
              style={
                selectedOccupation === opt.value
                  ? { borderColor: primaryColor, backgroundColor: `${primaryColor}10` }
                  : {}
              }
            >
              <div className="text-xl">{opt.icon}</div>
              <div
                className="text-xs font-medium mt-1"
                style={
                  selectedOccupation === opt.value ? { color: primaryColor } : { color: '#374151' }
                }
              >
                {opt.label}
              </div>
            </button>
          ))}
        </div>
        {errors.occupationType && (
          <p className="text-xs text-red-500">{String(errors.occupationType.message)}</p>
        )}
      </div>

      {/* Food Allergies */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-gray-700">
          Food Allergies <span className="text-gray-400">(optional)</span>
        </Label>
        <Input {...register('foodAllergies')} placeholder="e.g. nuts, lactose, gluten..." />
      </div>

      {/* Health Toggle */}
      <button
        type="button"
        onClick={() => setShowHealthFields(!showHealthFields)}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
      >
        <div
          className={cn(
            'w-5 h-5 rounded border-2 flex items-center justify-center transition-all',
            showHealthFields ? 'border-current bg-current' : 'border-gray-300',
          )}
          style={showHealthFields ? { borderColor: primaryColor, backgroundColor: primaryColor } : {}}
        >
          {showHealthFields && <span className="text-white text-xs">✓</span>}
        </div>
        I have injuries or medical conditions to declare
      </button>

      {showHealthFields && (
        <div className="space-y-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">Injuries</Label>
            <Textarea
              {...register('injuries')}
              placeholder="Describe any current or past injuries..."
              rows={2}
              className="resize-none bg-white"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">Medical Conditions</Label>
            <Textarea
              {...register('medicalConditions')}
              placeholder="e.g. diabetes, hypertension, asthma..."
              rows={2}
              className="resize-none bg-white"
            />
          </div>
        </div>
      )}
    </div>
  );
}
