// Gym configuration (stored in Supabase)
export interface GymConfig {
  id: string;
  slug: string;
  name: string;
  logoUrl: string;
  primaryColor: string;
  trainerName: string;
  trainerEmail: string;
  adminEmail: string;
  googleSheetId?: string;
  isActive: boolean;
  plan: 'starter' | 'growth' | 'pro';
  createdAt: string;
}

// Member form data — collected across all steps
export interface MemberFormData {
  // Step 1: Personal
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  age: number;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  city: string;
  // Step 2: Goals
  primaryGoal:
    | 'weight_loss'
    | 'muscle_gain'
    | 'aesthetic'
    | 'athletic_performance'
    | 'general_fitness'
    | 'competition_prep';
  goalUrgency: 'casual' | 'moderate' | 'aggressive';
  timelineMonths: 3 | 6 | 12 | 24;
  goalDetails?: string;
  // Step 3: Current Status
  weightKg: number;
  heightCm: number;
  bodyFatPercent?: number;
  selfRatedFitness: 1 | 2 | 3 | 4 | 5;
  gymExperience: 'complete_beginner' | 'beginner' | 'intermediate' | 'advanced';
  // Step 4: Lifestyle
  dietType: 'vegetarian' | 'non_vegetarian' | 'vegan' | 'eggetarian' | 'keto' | 'other';
  sleepHoursPerNight: number;
  stressLevel: 1 | 2 | 3 | 4 | 5;
  occupationType: 'desk_job' | 'active_job' | 'student' | 'freelance' | 'other';
  medicalConditions?: string;
  injuries?: string;
  foodAllergies?: string;
  // Step 5: Commitment
  daysPerWeekAvailable: 2 | 3 | 4 | 5 | 6;
  sessionDurationMinutes: 30 | 45 | 60 | 90;
  hasHomeEquipment: boolean;
  interestedInPT: 'yes' | 'maybe' | 'no';
  budgetForSupplements: 'none' | 'low' | 'medium' | 'high';
  // Step 6: Fitness Test (Optional)
  pushUpCount?: number;
  plankHoldSeconds?: number;
  flexibilityTest?: 'touch_toes' | 'almost' | 'cant_reach';
  restingHeartRate?: number;
  // Metadata
  gymSlug: string;
  submittedAt: string;
  /** Meal planner context from onboarding (bodyGoal, whatDoYouEat, cantEat, whoPreparesMeals, etc.). */
  onboardingExtras?: Record<string, unknown>;
}

// AI Generation outputs
export interface MealItem {
  name: string;
  description: string;
  portionSize: string;
  prepTimeMinutes: number;
}

export interface MealPlanDay {
  day: string;
  breakfast: MealItem;
  midMorningSnack?: MealItem;
  lunch: MealItem;
  eveningSnack?: MealItem;
  dinner: MealItem;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatsG: number;
  waterLitres: number;
  notes?: string;
}

export interface GeneratedMealPlan {
  memberId: string;
  memberName: string;
  goal: string;
  weeklyCalorieTarget: number;
  days: MealPlanDay[];
  generalGuidelines: string[];
  foodsToAvoid: string[];
  supplementSuggestions?: string[];
  generatedAt: string;
}

export interface TrainerBrief {
  memberId: string;
  memberSnapshot: {
    name: string;
    age: number;
    goal: string;
    goalUrgency: string;
    timeline: string;
    experienceLevel: string;
    fitnessScore: number;
  };
  gapAnalysis: string;
  conversationStarters: string[];
  upsellSignal: 'HIGH' | 'MEDIUM' | 'LOW';
  upsellReasoning: string;
  redFlags: string[];
  suggestedModifications: string[];
  baselineTestSummary?: string;
  generatedAt: string;
}

export type MemberStatus = 'lead' | 'converted' | 'lapsed';
export type LeadSubstatus = 'new' | 'contacted' | 'visited' | 'converted';
export type LeadSource =
  | 'walk_in'
  | 'referral'
  | 'instagram'
  | 'facebook'
  | 'website'
  | 'other';

// For Google Sheets rows / DB member rows in admin
export interface SheetRow extends MemberFormData {
  id?: string; // DB UUID — present when loaded from Postgres
  rowId: string;
  processingStatus: 'pending' | 'processing' | 'processed' | 'failed';
  mealPlanGenerated: boolean;
  emailSent: boolean;
  day3Sent: boolean;
  day7Sent: boolean;
  day30Sent: boolean;
  memberStatus?: MemberStatus;
  leadSource?: LeadSource;
  convertedAt?: string;
  leadSubstatus?: LeadSubstatus;
}

// API Response types
export interface ApiResponse<T = undefined> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface SubmitResponse {
  rowId: string;
}

export interface GenerateRequestBody {
  rowId: string;
  gymSlug: string;
  memberData: MemberFormData;
}

// Form step types
export type FormStep = 1 | 2 | 3 | 4 | 5 | 6;

export interface StepConfig {
  step: FormStep;
  title: string;
  subtitle: string;
  optional?: boolean;
}
