/**
 * Unified data for the onboarding form steps.
 * Single source of truth for all step metadata and option lists.
 */

export const GENDERS = [
  { value: 'male', label: '♂ Male' },
  { value: 'female', label: '♀ Female' },
  { value: 'other', label: '⚧ Other' },
  { value: 'prefer_not_to_say', label: '🤐 Prefer not to say' },
] as const;

export const GOALS = [
  { value: 'weight_loss', label: 'Weight Loss', icon: '🔥', desc: 'Burn fat, feel lighter' },
  { value: 'muscle_gain', label: 'Muscle Gain', icon: '🏋️', desc: 'Build strength & size' },
  { value: 'aesthetic', label: 'Body Recomp', icon: '⚡', desc: 'Lose fat, gain muscle' },
  { value: 'athletic_performance', label: 'Performance', icon: '🏃', desc: 'Speed, power, agility' },
  { value: 'general_fitness', label: 'General Fitness', icon: '💪', desc: 'Stay active, feel great' },
  { value: 'competition_prep', label: 'Competition', icon: '🏆', desc: 'Prep for a competition' },
] as const;

export const URGENCIES = [
  { value: 'casual', label: "I'm in no rush", desc: 'Slow and sustainable' },
  { value: 'moderate', label: 'Steady & consistent', desc: 'Balanced approach' },
  { value: 'aggressive', label: 'I want results fast', desc: 'Intense commitment' },
] as const;

export const TIMELINE_OPTIONS = [
  { value: 3, label: '3 months — Quick results' },
  { value: 6, label: '6 months — Solid transformation' },
  { value: 12, label: '1 year — Lifestyle change' },
  { value: 24, label: '2 years — Long-term mastery' },
] as const;

export const FITNESS_LEVELS = [
  { value: 1, emoji: '😴', label: 'Couch potato' },
  { value: 2, emoji: '🚶', label: 'Light active' },
  { value: 3, emoji: '🏃', label: 'Moderately fit' },
  { value: 4, emoji: '🔥', label: 'Very fit' },
  { value: 5, emoji: '⚡', label: 'Athlete' },
] as const;

export const EXPERIENCE_OPTIONS = [
  { value: 'complete_beginner', label: 'Never Trained', desc: 'First time at a gym' },
  { value: 'beginner', label: 'Beginner', desc: '< 1 year of training' },
  { value: 'intermediate', label: 'Intermediate', desc: '1–3 years of training' },
  { value: 'advanced', label: 'Advanced', desc: '3+ years, serious lifter' },
] as const;

export const DIET_OPTIONS = [
  { value: 'vegetarian', label: 'Vegetarian', icon: '🥦' },
  { value: 'non_vegetarian', label: 'Non-Veg', icon: '🍗' },
  { value: 'vegan', label: 'Vegan', icon: '🌱' },
  { value: 'eggetarian', label: 'Eggetarian', icon: '🥚' },
  { value: 'keto', label: 'Keto', icon: '🥑' },
  { value: 'other', label: 'Other', icon: '🍽️' },
] as const;

export const STRESS_LABELS = ['Very Low', 'Low', 'Moderate', 'High', 'Very High'] as const;

export const OCCUPATION_OPTIONS = [
  { value: 'desk_job', label: 'Desk Job', icon: '💻' },
  { value: 'active_job', label: 'Active Job', icon: '🏗️' },
  { value: 'student', label: 'Student', icon: '📚' },
  { value: 'freelance', label: 'Freelance', icon: '🎯' },
  { value: 'other', label: 'Other', icon: '🔮' },
] as const;

export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

export const DAY_COUNT_MAP: Record<number, 2 | 3 | 4 | 5 | 6> = {
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
};

export const DURATION_OPTIONS = [
  { value: 30, label: '30 min', desc: 'Quick & efficient' },
  { value: 45, label: '45 min', desc: 'Focused session' },
  { value: 60, label: '1 hour', desc: 'Standard workout' },
  { value: 90, label: '90 min', desc: 'Full deep work' },
] as const;

export const PT_OPTIONS = [
  { value: 'yes', label: 'Yes, definitely', icon: '🙌', desc: 'I want a personal trainer' },
  { value: 'maybe', label: 'Tell me more', icon: '🤔', desc: "I'm curious about PT" },
  { value: 'no', label: "I'll train solo", icon: '💪', desc: 'I prefer self-directed' },
] as const;

export const SUPPLEMENT_OPTIONS = [
  { value: 'none', label: 'No budget', desc: 'Food only' },
  { value: 'low', label: '₹500–1k/mo', desc: 'Basic only' },
  { value: 'medium', label: '₹1k–3k/mo', desc: 'Quality picks' },
  { value: 'high', label: '₹3k+/mo', desc: 'Full stack' },
] as const;

export const FLEXIBILITY_OPTIONS = [
  { value: 'touch_toes', label: 'Can touch toes', icon: '🤸', desc: 'Great flexibility' },
  { value: 'almost', label: 'Almost there', icon: '😅', desc: 'Getting close' },
  { value: 'cant_reach', label: "Can't reach", icon: '😬', desc: 'Needs work' },
] as const;

export const HOME_EQUIPMENT_OPTIONS = [
  { value: true, label: 'Yes, I have some', icon: '🏠' },
  { value: false, label: 'No, gym only', icon: '🏋️' },
] as const;

/** Step metadata: title, subtitle, and optional flag */
export const STEP_META = [
  {
    id: 1,
    title: "Let's get to know you",
    subtitle: 'This takes about 5 minutes.',
    optional: false,
  },
  {
    id: 2,
    title: "What's your goal?",
    subtitle: 'Be honest — your plan will be built around this.',
    optional: false,
  },
  {
    id: 3,
    title: 'Where are you right now?',
    subtitle: 'Honest numbers help us build an accurate plan.',
    optional: false,
  },
  {
    id: 4,
    title: 'Tell us about your lifestyle',
    subtitle: 'The more you tell us, the better your plan will be.',
    optional: false,
  },
  {
    id: 5,
    title: "Let's plan your schedule",
    subtitle: "Let's make a plan that actually fits your life.",
    optional: false,
  },
  {
    id: 6,
    title: 'Quick Fitness Baseline',
    subtitle:
      "Let your trainer see your starting point. Takes 5 minutes — they'll guide you through this on Day 1.",
    optional: true,
  },
] as const;

export const TOTAL_STEPS = STEP_META.length;

export const STEP_LABELS = [
  'Personal',
  'Goals',
  'Current Status',
  'Lifestyle',
  'Commitment',
  'Fitness Test',
] as const;
