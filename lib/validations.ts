import { z } from 'zod';

export const leadSourceSchema = z.enum([
  'walk_in',
  'referral',
  'instagram',
  'facebook',
  'website',
  'other',
]);

export const step1Schema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().min(7, 'Phone number is too short').max(15),
  age: z.coerce
    .number()
    .min(16, 'You must be at least 16 years old')
    .max(75, 'Please enter a valid age'),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']),
  city: z.string().min(1, 'City is required').max(100),
  leadSource: leadSourceSchema.optional(),
});

export const step2Schema = z.object({
  primaryGoal: z.enum([
    'weight_loss',
    'muscle_gain',
    'aesthetic',
    'athletic_performance',
    'general_fitness',
    'competition_prep',
  ]),
  goalUrgency: z.enum(['casual', 'moderate', 'aggressive']),
  timelineMonths: z.coerce.number().refine((v) => [3, 6, 12, 24].includes(v), {
    message: 'Please select a valid timeline',
  }) as z.ZodType<3 | 6 | 12 | 24>,
  goalDetails: z.string().max(500).optional(),
});

export const step3Schema = z.object({
  weightKg: z.coerce.number().min(20, 'Please enter a valid weight').max(300),
  heightCm: z.coerce.number().min(100, 'Please enter a valid height').max(250),
  bodyFatPercent: z.coerce.number().min(1).max(70).optional().or(z.literal('')).transform(v => v === '' ? undefined : v),
  selfRatedFitness: z.coerce.number().refine((v) => [1, 2, 3, 4, 5].includes(v), {
    message: 'Please rate your fitness level',
  }) as z.ZodType<1 | 2 | 3 | 4 | 5>,
  gymExperience: z.enum(['complete_beginner', 'beginner', 'intermediate', 'advanced']),
});

export const step4Schema = z.object({
  dietType: z.enum(['vegetarian', 'non_vegetarian', 'vegan', 'eggetarian', 'keto', 'other']),
  sleepHoursPerNight: z.coerce.number().min(4).max(12),
  stressLevel: z.coerce.number().refine((v) => [1, 2, 3, 4, 5].includes(v), {
    message: 'Please select your stress level',
  }) as z.ZodType<1 | 2 | 3 | 4 | 5>,
  occupationType: z.enum(['desk_job', 'active_job', 'student', 'freelance', 'other']),
  medicalConditions: z.string().max(1000).optional(),
  injuries: z.string().max(1000).optional(),
  foodAllergies: z.string().max(500).optional(),
});

export const step5Schema = z.object({
  daysPerWeekAvailable: z.coerce.number().refine((v) => [2, 3, 4, 5, 6].includes(v), {
    message: 'Please select days per week',
  }) as z.ZodType<2 | 3 | 4 | 5 | 6>,
  sessionDurationMinutes: z.coerce.number().refine((v) => [30, 45, 60, 90].includes(v), {
    message: 'Please select session duration',
  }) as z.ZodType<30 | 45 | 60 | 90>,
  hasHomeEquipment: z.boolean(),
  interestedInPT: z.enum(['yes', 'maybe', 'no']),
  budgetForSupplements: z.enum(['none', 'low', 'medium', 'high']),
});

export const step6Schema = z.object({
  pushUpCount: z.coerce.number().min(0).max(500).optional().or(z.literal('')).transform(v => v === '' ? undefined : v),
  plankHoldSeconds: z.coerce.number().min(0).max(3600).optional().or(z.literal('')).transform(v => v === '' ? undefined : v),
  flexibilityTest: z.enum(['touch_toes', 'almost', 'cant_reach']).optional(),
  restingHeartRate: z.coerce.number().min(30).max(200).optional().or(z.literal('')).transform(v => v === '' ? undefined : v),
});

/** Keys stored in onboarding_extras for meal planner AI (multi-select, body goal, etc.). */
export const ONBOARDING_EXTRAS_KEYS = [
  'bodyGoal',
  'triedFitBefore',
  'timeSinceTrained',
  'mealsPerDay',
  'whatDoYouEat',
  'cantEat',
  'whoPreparesMeals',
  'cookingElaboration',
  'supplementsOpen',
  'trainedPtBefore',
  'homeEquipmentLevel',
] as const;

export const fullMemberSchema = step1Schema
  .merge(step2Schema)
  .merge(step3Schema)
  .merge(step4Schema)
  .merge(step5Schema)
  .merge(step6Schema)
  .extend({
    gymSlug: z.string().min(1),
    submittedAt: z.string(),
    onboardingExtras: z.record(z.unknown()).optional(),
  });

export type Step1Data = z.infer<typeof step1Schema>;
export type Step2Data = z.infer<typeof step2Schema>;
export type Step3Data = z.infer<typeof step3Schema>;
export type Step4Data = z.infer<typeof step4Schema>;
export type Step5Data = z.infer<typeof step5Schema>;
export type Step6Data = z.infer<typeof step6Schema>;
export type FullMemberData = z.infer<typeof fullMemberSchema>;
