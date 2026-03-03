'use client';

import { useFormContext } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { GOALS, URGENCIES, TIMELINE_OPTIONS, STEP_META } from '@/lib/onboarding-steps';

interface Step2GoalsProps {
  primaryColor?: string;
}

export default function Step2Goals({ primaryColor = '#1A56DB' }: Step2GoalsProps) {
  const {
    watch,
    setValue,
    register,
    formState: { errors },
  } = useFormContext();

  const selectedGoal = watch('primaryGoal');
  const selectedUrgency = watch('goalUrgency');

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{STEP_META[1].title}</h2>
        <p className="text-gray-500 mt-1 text-sm">{STEP_META[1].subtitle}</p>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">Primary Goal</Label>
        <div className="grid grid-cols-2 gap-2.5">
          {GOALS.map((goal) => (
            <button
              key={goal.value}
              type="button"
              onClick={() => setValue('primaryGoal', goal.value, { shouldValidate: true })}
              className={cn(
                'p-3.5 rounded-xl border-2 text-left transition-all duration-200 hover:shadow-sm',
                selectedGoal === goal.value
                  ? 'border-current shadow-sm'
                  : 'border-gray-200 hover:border-gray-300',
              )}
              style={
                selectedGoal === goal.value
                  ? { borderColor: primaryColor, backgroundColor: `${primaryColor}10` }
                  : {}
              }
            >
              <div className="text-xl mb-1">{goal.icon}</div>
              <div
                className="text-sm font-semibold"
                style={selectedGoal === goal.value ? { color: primaryColor } : { color: '#111827' }}
              >
                {goal.label}
              </div>
              <div className="text-xs text-gray-400 mt-0.5">{goal.desc}</div>
            </button>
          ))}
        </div>
        {errors.primaryGoal && (
          <p className="text-xs text-red-500">{String(errors.primaryGoal.message)}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">How urgent is this for you?</Label>
        <div className="space-y-2">
          {URGENCIES.map((u) => (
            <button
              key={u.value}
              type="button"
              onClick={() => setValue('goalUrgency', u.value, { shouldValidate: true })}
              className={cn(
                'w-full p-3.5 rounded-xl border-2 text-left transition-all duration-200',
                selectedUrgency === u.value ? 'border-current' : 'border-gray-200 hover:border-gray-300',
              )}
              style={
                selectedUrgency === u.value
                  ? { borderColor: primaryColor, backgroundColor: `${primaryColor}10` }
                  : {}
              }
            >
              <div
                className="text-sm font-semibold"
                style={selectedUrgency === u.value ? { color: primaryColor } : { color: '#111827' }}
              >
                {u.label}
              </div>
              <div className="text-xs text-gray-400">{u.desc}</div>
            </button>
          ))}
        </div>
        {errors.goalUrgency && (
          <p className="text-xs text-red-500">{String(errors.goalUrgency.message)}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-gray-700">Timeline</Label>
        <Select
          onValueChange={(v) => setValue('timelineMonths', Number(v), { shouldValidate: true })}
        >
          <SelectTrigger className={cn(errors.timelineMonths && 'border-red-400')}>
            <SelectValue placeholder="How long do you have?" />
          </SelectTrigger>
          <SelectContent>
            {TIMELINE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={String(opt.value)}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.timelineMonths && (
          <p className="text-xs text-red-500">{String(errors.timelineMonths.message)}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-gray-700">
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
