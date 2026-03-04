'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { GymConfig } from '@/types';
import { TOTAL_STEPS } from '@/lib/onboarding-steps';
import {
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
  step5Schema,
  step6Schema,
  step7Schema,
} from '@/lib/validations';

import FormProgress from './FormProgress';
import FormNavigation from './FormNavigation';
import Step1Personal from './steps/Step1Personal';
import Step2Goals from './steps/Step2Goals';
import Step3CurrentStatus from './steps/Step3CurrentStatus';
import Step4Lifestyle from './steps/Step4Lifestyle';
import Step5FoodKitchen from './steps/Step5FoodKitchen';
import Step5Commitment from './steps/Step5Commitment';
import Step6FitnessTest from './steps/Step6FitnessTest';

interface OnboardingFormProps {
  gymConfig: GymConfig;
}

const STEP_SCHEMAS = [
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
  step5Schema,
  step6Schema,
  step7Schema,
];

export default function OnboardingForm({ gymConfig }: OnboardingFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');

  const methods = useForm({
    mode: 'onTouched',
    defaultValues: {
      gymSlug: gymConfig.slug,
      sleepHoursPerNight: 7,
      stressLevel: 3,
      selfRatedFitness: 3,
      _selectedDays: [] as string[],
      whatDoYouEat: [] as string[],
      cantEat: [] as string[],
      // Step 6 defaults
      daysPerWeekAvailable: 3,
      sessionDurationMinutes: 60,
      homeEquipmentLevel: 'none' as const,
      interestedInPT: 'maybe' as const,
    },
  });

  const goNext = useCallback(async () => {
    const schema = STEP_SCHEMAS[currentStep - 1];
    const values = methods.getValues();

    const result = schema.safeParse(values);
    if (!result.success) {
      // Trigger validation display
      const fields = Object.keys(result.error.flatten().fieldErrors);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      fields.forEach((field) => methods.trigger(field as any));
      return;
    }

    if (currentStep < TOTAL_STEPS) {
      setDirection('forward');
      setCurrentStep((s) => s + 1);
    } else {
      await handleSubmit();
    }
  }, [currentStep, methods]);

  const goBack = useCallback(() => {
    if (currentStep > 1) {
      setDirection('back');
      setCurrentStep((s) => s - 1);
    }
  }, [currentStep]);

  const skipStep = useCallback(() => {
    setDirection('forward');
    setCurrentStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }, []);

  async function handleSubmit() {
    setIsSubmitting(true);

    try {
      const values = methods.getValues();
      const payload = {
        ...values,
        gymSlug: gymConfig.slug,
        submittedAt: new Date().toISOString(),
      };

      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as { success: boolean; data?: { rowId: string }; error?: string };

      if (!data.success) {
        alert(data.error ?? 'Something went wrong. Please try again.');
        return;
      }

      // Navigate to success page with member's first name
      const firstName = (values as Record<string, unknown>).firstName as string ?? '';
      router.push(
        `/${gymConfig.slug}/success?name=${encodeURIComponent(firstName)}&rowId=${data.data?.rowId ?? ''}`,
      );
    } catch {
      alert('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const primaryColor = gymConfig.primaryColor ?? '#1A56DB';

  return (
    <FormProvider {...methods}>
      <div className="w-full">
        <FormProgress
          currentStep={currentStep}
          totalSteps={TOTAL_STEPS}
          primaryColor={primaryColor}
        />

        <div
          key={currentStep}
          className="animate-in slide-in-from-right-4 duration-300"
        >
          {currentStep === 1 && <Step1Personal primaryColor={primaryColor} />}
          {currentStep === 2 && <Step2Goals primaryColor={primaryColor} />}
          {currentStep === 3 && <Step3CurrentStatus primaryColor={primaryColor} />}
          {currentStep === 4 && <Step4Lifestyle primaryColor={primaryColor} />}
          {currentStep === 5 && <Step5FoodKitchen primaryColor={primaryColor} />}
          {currentStep === 6 && <Step5Commitment primaryColor={primaryColor} />}
          {currentStep === 7 && <Step6FitnessTest primaryColor={primaryColor} />}
        </div>

        <FormNavigation
          currentStep={currentStep}
          totalSteps={TOTAL_STEPS}
          onBack={goBack}
          onNext={goNext}
          onSkip={currentStep === 7 ? skipStep : undefined}
          isSubmitting={isSubmitting}
          primaryColor={primaryColor}
        />
      </div>
    </FormProvider>
  );
}
