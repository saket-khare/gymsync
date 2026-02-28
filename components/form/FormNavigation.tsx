'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

interface FormNavigationProps {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
  onSkip?: () => void;
  isSubmitting?: boolean;
  primaryColor?: string;
}

export default function FormNavigation({
  currentStep,
  totalSteps,
  onBack,
  onNext,
  onSkip,
  isSubmitting = false,
  primaryColor = '#1A56DB',
}: FormNavigationProps) {
  const isLastStep = currentStep === totalSteps;

  return (
    <div className="flex items-center justify-between pt-6 border-t border-gray-100 mt-6">
      {currentStep > 1 ? (
        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          disabled={isSubmitting}
          className="flex items-center gap-1 text-gray-600"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>
      ) : (
        <div />
      )}

      <div className="flex items-center gap-3">
        {onSkip && (
          <Button
            type="button"
            variant="ghost"
            onClick={onSkip}
            disabled={isSubmitting}
            className="text-gray-400 text-sm"
          >
            Skip this step
          </Button>
        )}

        <Button
          type="button"
          onClick={onNext}
          disabled={isSubmitting}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-95"
          style={{ backgroundColor: primaryColor }}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Submitting...
            </>
          ) : isLastStep ? (
            'Submit'
          ) : (
            <>
              Next
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
