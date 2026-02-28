'use client';

import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface FormProgressProps {
  currentStep: number;
  totalSteps: number;
  primaryColor?: string;
}

const STEP_LABELS = [
  'Personal',
  'Goals',
  'Current Status',
  'Lifestyle',
  'Commitment',
  'Fitness Test',
];

export default function FormProgress({
  currentStep,
  totalSteps,
  primaryColor = '#1A56DB',
}: FormProgressProps) {
  const percentage = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-600">
          Step {currentStep} of {totalSteps}
          {currentStep === 6 && (
            <span className="ml-1 text-xs text-gray-400">(Optional)</span>
          )}
        </span>
        <span className="text-sm font-medium" style={{ color: primaryColor }}>
          {STEP_LABELS[currentStep - 1]}
        </span>
      </div>
      <Progress
        value={percentage}
        className="h-1.5"
        style={
          {
            '--progress-color': primaryColor,
          } as React.CSSProperties
        }
      />
      <div className="flex justify-between mt-2">
        {STEP_LABELS.map((label, i) => (
          <div
            key={label}
            className={cn(
              'w-2 h-2 rounded-full transition-all duration-300',
              i + 1 < currentStep
                ? 'opacity-100 scale-100'
                : i + 1 === currentStep
                  ? 'scale-125'
                  : 'opacity-30',
            )}
            style={{
              backgroundColor:
                i + 1 <= currentStep ? primaryColor : '#D1D5DB',
            }}
          />
        ))}
      </div>
    </div>
  );
}
