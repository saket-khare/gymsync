import type { GeneratedMealPlan, GymConfig, TrainerBrief } from '@/types';
import type { ReactElement } from 'react';

export async function generateMealPlanPDF(
  mealPlan: GeneratedMealPlan,
  gymConfig: GymConfig,
): Promise<Buffer> {
  // Dynamic import — @react-pdf/renderer must run server-side only
  const { renderToBuffer } = await import('@react-pdf/renderer');
  const { default: MealPlanPDF } = await import('@/components/pdf/MealPlanPDF');
  const React = await import('react');

  // Cast to satisfy @react-pdf/renderer's DocumentProps requirement
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = React.createElement(MealPlanPDF, { mealPlan, gymConfig }) as ReactElement<any>;
  const buffer = await renderToBuffer(element);
  return Buffer.from(buffer);
}

export async function generateTrainerBriefPDF(
  trainerBrief: TrainerBrief,
  gymConfig: GymConfig,
): Promise<Buffer> {
  const { renderToBuffer } = await import('@react-pdf/renderer');
  const { default: TrainerBriefPDF } = await import('@/components/pdf/TrainerBriefPDF');
  const React = await import('react');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = React.createElement(TrainerBriefPDF, { trainerBrief, gymConfig }) as ReactElement<any>;
  const buffer = await renderToBuffer(element);
  return Buffer.from(buffer);
}
