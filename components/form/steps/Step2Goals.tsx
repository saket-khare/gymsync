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

interface Step2GoalsProps {
  primaryColor?: string;
}

const GOALS = [
  { value: 'weight_loss', label: 'Weight Loss', icon: '🔥', desc: 'Burn fat, feel lighter' },
  { value: 'muscle_gain', label: 'Muscle Gain', icon: '🏋️', desc: 'Build strength & size' },
  { value: 'aesthetic', label: 'Body Recomp', icon: '⚡', desc: 'Lose fat, gain muscle' },
  { value: 'athletic_performance', label: 'Performance', icon: '🏃', desc: 'Speed, power, agility' },
  { value: 'general_fitness', label: 'General Fitness', icon: '💪', desc: 'Stay active, feel great' },
  { value: 'competition_prep', label: 'Competition', icon: '🏆', desc: 'Prep for a competition' },
];

const URGENCIES = [
  { value: 'casual', label: "I'm in no rush", desc: 'Slow and sustainable' },
  { value: 'moderate', label: 'Steady & consistent', desc: 'Balanced approach' },
  { value: 'aggressive', label: 'I want results fast', desc: 'Intense commitment' },
];

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
        <h2 className="text-2xl font-bold text-gray-900">What&apos;s your goal?</h2>
        <p className="text-gray-500 mt-1 text-sm">
          Be honest — your plan will be built around this.
        </p>
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
            <SelectItem value="3">3 months — Quick results</SelectItem>
            <SelectItem value="6">6 months — Solid transformation</SelectItem>
            <SelectItem value="12">1 year — Lifestyle change</SelectItem>
            <SelectItem value="24">2 years — Long-term mastery</SelectItem>
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
