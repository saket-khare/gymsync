'use client';

import { useFormContext } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface Step5CommitmentProps {
  primaryColor?: string;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_VALUES: Record<number, 2 | 3 | 4 | 5 | 6> = {
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
};

const DURATION_OPTIONS = [
  { value: 30, label: '30 min', desc: 'Quick & efficient' },
  { value: 45, label: '45 min', desc: 'Focused session' },
  { value: 60, label: '1 hour', desc: 'Standard workout' },
  { value: 90, label: '90 min', desc: 'Full deep work' },
];

const PT_OPTIONS = [
  { value: 'yes', label: 'Yes, definitely', icon: '🙌', desc: 'I want a personal trainer' },
  { value: 'maybe', label: 'Tell me more', icon: '🤔', desc: "I'm curious about PT" },
  { value: 'no', label: "I'll train solo", icon: '💪', desc: 'I prefer self-directed' },
];

const SUPPLEMENT_OPTIONS = [
  { value: 'none', label: 'No budget', desc: 'Food only' },
  { value: 'low', label: '₹500–1k/mo', desc: 'Basic only' },
  { value: 'medium', label: '₹1k–3k/mo', desc: 'Quality picks' },
  { value: 'high', label: '₹3k+/mo', desc: 'Full stack' },
];

export default function Step5Commitment({ primaryColor = '#1A56DB' }: Step5CommitmentProps) {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const selectedDays: string[] = watch('_selectedDays') ?? [];
  const selectedDuration = watch('sessionDurationMinutes');
  const hasHomeEquipment = watch('hasHomeEquipment');
  const selectedPT = watch('interestedInPT');
  const selectedSupplement = watch('budgetForSupplements');

  function toggleDay(day: string) {
    let updated = [...selectedDays];
    if (updated.includes(day)) {
      updated = updated.filter((d) => d !== day);
    } else {
      updated.push(day);
    }

    const count = Math.min(Math.max(updated.length, 2), 6);
    setValue('_selectedDays', updated);
    if (count in DAY_VALUES) {
      setValue('daysPerWeekAvailable', DAY_VALUES[count as keyof typeof DAY_VALUES] ?? 3, {
        shouldValidate: true,
      });
    }
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Let&apos;s plan your schedule</h2>
        <p className="text-gray-500 mt-1 text-sm">
          Let&apos;s make a plan that actually fits your life.
        </p>
      </div>

      {/* Days selector */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">
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
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200',
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
        <p className="text-xs text-gray-400">Select 2–6 days per week</p>
        {errors.daysPerWeekAvailable && (
          <p className="text-xs text-red-500">{String(errors.daysPerWeekAvailable.message)}</p>
        )}
      </div>

      {/* Session duration */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">Session Duration</Label>
        <div className="grid grid-cols-2 gap-2">
          {DURATION_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() =>
                setValue('sessionDurationMinutes', opt.value, { shouldValidate: true })
              }
              className={cn(
                'p-3 rounded-xl border-2 text-left transition-all duration-200',
                selectedDuration === opt.value
                  ? 'border-current'
                  : 'border-gray-200 hover:border-gray-300',
              )}
              style={
                selectedDuration === opt.value
                  ? { borderColor: primaryColor, backgroundColor: `${primaryColor}10` }
                  : {}
              }
            >
              <div
                className="text-sm font-bold"
                style={
                  selectedDuration === opt.value ? { color: primaryColor } : { color: '#111827' }
                }
              >
                {opt.label}
              </div>
              <div className="text-xs text-gray-400">{opt.desc}</div>
            </button>
          ))}
        </div>
        {errors.sessionDurationMinutes && (
          <p className="text-xs text-red-500">{String(errors.sessionDurationMinutes.message)}</p>
        )}
      </div>

      {/* Home Equipment */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">Home Equipment?</Label>
        <div className="flex gap-3">
          {[
            { val: true, label: 'Yes, I have some', icon: '🏠' },
            { val: false, label: 'No, gym only', icon: '🏋️' },
          ].map((opt) => (
            <button
              key={String(opt.val)}
              type="button"
              onClick={() => setValue('hasHomeEquipment', opt.val, { shouldValidate: true })}
              className={cn(
                'flex-1 p-3 rounded-xl border-2 text-center transition-all',
                hasHomeEquipment === opt.val ? 'border-current' : 'border-gray-200',
              )}
              style={
                hasHomeEquipment === opt.val
                  ? { borderColor: primaryColor, backgroundColor: `${primaryColor}10` }
                  : {}
              }
            >
              <div className="text-xl">{opt.icon}</div>
              <div className="text-xs font-medium mt-1 text-gray-700">{opt.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* PT Interest */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">Personal Training?</Label>
        <div className="space-y-2">
          {PT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setValue('interestedInPT', opt.value, { shouldValidate: true })}
              className={cn(
                'w-full p-3 rounded-xl border-2 text-left flex items-center gap-3 transition-all',
                selectedPT === opt.value ? 'border-current' : 'border-gray-200',
              )}
              style={
                selectedPT === opt.value
                  ? { borderColor: primaryColor, backgroundColor: `${primaryColor}10` }
                  : {}
              }
            >
              <span className="text-xl">{opt.icon}</span>
              <div>
                <div
                  className="text-sm font-semibold"
                  style={selectedPT === opt.value ? { color: primaryColor } : { color: '#111827' }}
                >
                  {opt.label}
                </div>
                <div className="text-xs text-gray-400">{opt.desc}</div>
              </div>
            </button>
          ))}
        </div>
        {errors.interestedInPT && (
          <p className="text-xs text-red-500">{String(errors.interestedInPT.message)}</p>
        )}
      </div>

      {/* Supplement Budget */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">Supplement Budget</Label>
        <div className="grid grid-cols-2 gap-2">
          {SUPPLEMENT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() =>
                setValue('budgetForSupplements', opt.value, { shouldValidate: true })
              }
              className={cn(
                'p-3 rounded-xl border-2 text-left transition-all',
                selectedSupplement === opt.value ? 'border-current' : 'border-gray-200',
              )}
              style={
                selectedSupplement === opt.value
                  ? { borderColor: primaryColor, backgroundColor: `${primaryColor}10` }
                  : {}
              }
            >
              <div
                className="text-sm font-semibold"
                style={
                  selectedSupplement === opt.value ? { color: primaryColor } : { color: '#111827' }
                }
              >
                {opt.label}
              </div>
              <div className="text-xs text-gray-400">{opt.desc}</div>
            </button>
          ))}
        </div>
        {errors.budgetForSupplements && (
          <p className="text-xs text-red-500">{String(errors.budgetForSupplements.message)}</p>
        )}
      </div>
    </div>
  );
}
