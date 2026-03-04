/**
 * Unified data for the onboarding form steps.
 * Single source of truth for all step metadata and option lists.
 * Aligned with meal planner AI prompt for precise diet planning.
 */

// ─── Step 1: Personal ─────────────────────────────────────────────────────

export const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
] as const;

// ─── Step 2: Your goal ─────────────────────────────────────────────────────

export const GOALS = [
  { value: 'weight_loss', label: 'Lose weight', icon: '🔥', desc: 'Burn fat, feel lighter' },
  { value: 'muscle_gain', label: 'Build muscle', icon: '💪', desc: 'Gain size and strength' },
  { value: 'aesthetic', label: 'Tone up', icon: '✂️', desc: 'Lean, defined, not bulky' },
  { value: 'general_fitness', label: 'Get fitter', icon: '🏃', desc: 'Stamina, energy, overall health' },
  { value: 'athletic_performance', label: 'Athletic performance', icon: '🏆', desc: 'Train for a sport or event' },
  { value: 'competition_prep', label: 'Health & recovery', icon: '❤️', desc: 'Managing a condition, getting back on track' },
] as const;

/** Body goal look — drives calorie targets (slim vs muscular). */
export const BODY_GOALS = [
  { value: 'slim_lean', label: 'Slim & lean', desc: 'Lean, lighter build' },
  { value: 'athletic_toned', label: 'Athletic & toned', desc: 'Defined, balanced' },
  { value: 'bigger_muscular', label: 'Bigger & muscular', desc: 'More size and strength' },
] as const;

export const URGENCIES = [
  { value: 'casual', label: 'No rush', desc: 'Building a long-term habit' },
  { value: 'moderate', label: 'Moderate', desc: 'Want to see results in 3–6 months' },
  { value: 'aggressive', label: 'ASAP', desc: 'I have a deadline or event coming up' },
] as const;

/** Have you tried getting fit before and stopped? — trainer conversation starter, PT upsell signal. */
export const TRIED_FIT_BEFORE = [
  { value: 'never_started', label: 'Never really started consistently' },
  { value: 'had_phases', label: "Yes — I've had phases but couldn't stick to it" },
  { value: 'was_consistent', label: 'Yes — I was consistent for a while but life got in the way' },
] as const;

export const TIMELINE_OPTIONS = [
  { value: 3, label: '3 months — Quick results' },
  { value: 6, label: '6 months — Solid transformation' },
  { value: 12, label: '1 year — Lifestyle change' },
  { value: 24, label: '2 years — Long-term mastery' },
] as const;

// ─── Step 3: Where you are right now ───────────────────────────────────────

export const FITNESS_LEVELS = [
  { value: 1, emoji: '😴', label: 'I get winded climbing stairs' },
  { value: 2, emoji: '🚶', label: 'Light activity is fine, intense effort is hard' },
  { value: 3, emoji: '🏃', label: "I'm reasonably active" },
  { value: 4, emoji: '🔥', label: 'I train occasionally and feel strong' },
  { value: 5, emoji: '⚡', label: "I'm quite fit and train regularly" },
] as const;

/** How long since trained regularly? */
export const TIME_SINCE_TRAINED = [
  { value: 'never_routine', label: "I've never had a routine" },
  { value: 'more_than_year', label: 'More than a year ago' },
  { value: '3_12_months', label: '3–12 months ago' },
  { value: 'currently_active', label: "I'm currently active" },
] as const;

export const EXPERIENCE_OPTIONS = [
  { value: 'complete_beginner', label: 'Never Trained', desc: 'First time at a gym' },
  { value: 'beginner', label: 'Beginner', desc: '< 1 year of training' },
  { value: 'intermediate', label: 'Intermediate', desc: '1–3 years of training' },
  { value: 'advanced', label: 'Advanced', desc: '3+ years, serious lifter' },
] as const;

// ─── Step 4: Lifestyle ─────────────────────────────────────────────────────

export const DIET_OPTIONS = [
  { value: 'vegetarian', label: 'Vegetarian', icon: '🌿' },
  { value: 'eggetarian', label: 'Eggetarian', icon: '🥚' },
  { value: 'non_vegetarian', label: 'Non-vegetarian', icon: '🍗' },
  { value: 'vegan', label: 'Vegan', icon: '🌱' },
  { value: 'keto', label: 'Keto / Low-carb', icon: '🥑' },
  { value: 'other', label: 'Other', icon: '🍽️' },
] as const;

/** Meals per day — shapes meal plan structure. */
export const MEALS_PER_DAY = [
  { value: '1_2', label: '1–2 meals' },
  { value: '3', label: '3 meals' },
  { value: '4_5', label: '4–5 meals' },
  { value: 'whenever', label: "I eat whenever I'm hungry" },
] as const;

/** Daily activity outside the gym — for TDEE/calorie multiplier. */
export const DAILY_ACTIVITY_OPTIONS = [
  { value: 'desk_job', label: 'Mostly sitting', icon: '🪑', desc: 'Desk job, studying' },
  { value: 'active_job', label: 'Light movement', icon: '🚶', desc: 'Through the day' },
  { value: 'student', label: 'On my feet most of the day', icon: '🏃', desc: 'On the go' },
  { value: 'freelance', label: 'Physically demanding', icon: '⚡', desc: 'Active job' },
] as const;

export const STRESS_LABELS = ['Very relaxed', 'Generally calm', 'Moderate, manageable', 'Frequently stressed', 'Constantly overwhelmed'] as const;

export const OCCUPATION_OPTIONS = [
  { value: 'desk_job', label: 'Desk Job', icon: '💻' },
  { value: 'active_job', label: 'Active Job', icon: '🏗️' },
  { value: 'student', label: 'Student', icon: '📚' },
  { value: 'freelance', label: 'Freelance', icon: '🎯' },
  { value: 'other', label: 'Other', icon: '🔮' },
] as const;

// ─── Step 5: Your Food & Kitchen ───────────────────────────────────────────

/** What do you eat? Select all that apply. */
export const WHAT_DO_YOU_EAT = [
  { value: 'vegetarian', label: 'Vegetarian', icon: '🥗' },
  { value: 'eggs', label: 'Eggs', icon: '🥚' },
  { value: 'chicken_fish', label: 'Chicken & fish', icon: '🍗' },
  { value: 'red_meat', label: 'Red meat (mutton, beef, pork)', icon: '🥩' },
  { value: 'vegan', label: 'Vegan (no dairy either)', icon: '🌱' },
  { value: 'dairy', label: 'Dairy (milk, paneer, curd)', icon: '🥛' },
] as const;

/** Anything you can't eat or strongly dislike? Select all that apply. */
export const CANT_EAT_OPTIONS = [
  { value: 'fish_seafood', label: 'Fish / seafood', icon: '🐟' },
  { value: 'spicy', label: 'Spicy food', icon: '🌶️' },
  { value: 'onion_garlic', label: 'Onion / garlic', icon: '🧄' },
  { value: 'dairy_upset', label: 'Dairy upsets my stomach', icon: '🥛' },
  { value: 'wheat_gluten', label: 'Wheat / gluten sensitivity', icon: '🌾' },
  { value: 'picky_veg', label: "I'm a picky eater (most vegetables)", icon: '🥦' },
  { value: 'none', label: 'None of the above', icon: '✓' },
] as const;

/** Who prepares your meals? */
export const WHO_PREPARES_MEALS = [
  { value: 'someone_home', label: 'Someone at home cooks for me', icon: '👩‍🍳' },
  { value: 'self', label: 'I cook for myself', icon: '🍳' },
  { value: 'hostel', label: 'Hostel mess / canteen', icon: '🏫' },
  { value: 'order_in', label: 'Mostly order in or eat outside', icon: '🍱' },
  { value: 'mix', label: 'Mix of everything', icon: '🔀' },
] as const;

/** How elaborate can the cooking get? (Skip if hostel/canteen/order.) */
export const COOKING_ELABORATION = [
  { value: 'very_simple', label: 'Very simple', desc: 'Boiling, reheating, no-cook only' },
  { value: 'basic', label: 'Basic', desc: 'Eggs, rice, simple dal/sabzi' },
  { value: 'full_meals', label: 'Full meals', desc: 'Can follow a proper recipe' },
  { value: 'adventurous', label: 'Adventurous', desc: 'Open to new techniques' },
] as const;

/** Open to protein/supplements? */
export const SUPPLEMENTS_OPEN_OPTIONS = [
  { value: 'yes', label: 'Yes', desc: 'Already use them or happy to start' },
  { value: 'maybe', label: 'Maybe', desc: 'If simple and affordable' },
  { value: 'whole_food', label: 'Prefer whole food only', desc: 'No supplements' },
] as const;

// ─── Step 6: Schedule & commitment ─────────────────────────────────────────

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
  { value: 60, label: '60 min', desc: 'Standard workout' },
  { value: 90, label: '90 min+', desc: 'Full session' },
] as const;

/** Have you ever trained with a personal trainer before? */
export const TRAINED_PT_BEFORE = [
  { value: 'never', label: 'Never', desc: "I've always trained alone or not at all" },
  { value: 'briefly', label: 'Yes, briefly', desc: 'Tried a few sessions' },
  { value: 'regularly', label: 'Yes, regularly', desc: 'I know how PT works' },
] as const;

export const PT_OPTIONS = [
  { value: 'yes', label: 'Definitely interested', icon: '👍' },
  { value: 'maybe', label: 'Maybe — tell me more', icon: '🤔' },
  { value: 'no', label: 'I prefer to train independently', icon: '🙅' },
] as const;

export const SUPPLEMENT_OPTIONS = [
  { value: 'yes', label: 'Yes, already use some' },
  { value: 'open', label: 'Open to it' },
  { value: 'avoid', label: 'Prefer to avoid' },
] as const;

/** Do you have any equipment at home? */
export const HOME_EQUIPMENT_LEVEL = [
  { value: 'none', label: 'None', desc: "I'll only use the gym" },
  { value: 'basic', label: 'Basic', desc: 'Resistance bands, dumbbells' },
  { value: 'full', label: 'Full setup', desc: 'Barbell, bench, etc.' },
] as const;

// Legacy (for backward compatibility with schema)
export const HOME_EQUIPMENT_OPTIONS = [
  { value: true, label: 'Yes, I have some', icon: '🏠' },
  { value: false, label: 'No, gym only', icon: '🏋️' },
] as const;

export const FLEXIBILITY_OPTIONS = [
  { value: 'touch_toes', label: 'Can touch toes', icon: '🤸', desc: 'Great flexibility' },
  { value: 'almost', label: 'Almost there', icon: '😅', desc: 'Getting close' },
  { value: 'cant_reach', label: "Can't reach", icon: '😬', desc: 'Needs work' },
] as const;

export const LEAD_SOURCE_OPTIONS = [
  { value: 'walk_in', label: 'Walk-in', desc: 'Visited the gym' },
  { value: 'referral', label: 'Referral', desc: 'Referred by someone' },
  { value: 'instagram', label: 'Instagram', desc: 'Instagram ad or post' },
  { value: 'facebook', label: 'Facebook', desc: 'Facebook ad or post' },
  { value: 'website', label: 'Website', desc: 'Gym website' },
  { value: 'other', label: 'Other', desc: 'Other source' },
] as const;

// Budget (for schema compatibility)
export const BUDGET_FOR_SUPPLEMENTS_OPTIONS = [
  { value: 'none', label: 'No budget', desc: 'Food only' },
  { value: 'low', label: '₹500–1k/mo', desc: 'Basic only' },
  { value: 'medium', label: '₹1k–3k/mo', desc: 'Quality picks' },
  { value: 'high', label: '₹3k+/mo', desc: 'Full stack' },
] as const;

// ─── Step metadata ─────────────────────────────────────────────────────────

/** Step metadata: title, subtitle, optional flag. 7 steps. */
export const STEP_META = [
  {
    id: 1,
    title: "Let's get to know you",
    subtitle: 'Personal details. Fast, factual.',
    optional: false,
  },
  {
    id: 2,
    title: "Your goal",
    subtitle: "What you're here for. This shapes everything.",
    optional: false,
  },
  {
    id: 3,
    title: 'Where you are right now',
    subtitle: 'Your current stats. Honest answers make better plans.',
    optional: false,
  },
  {
    id: 4,
    title: 'Your lifestyle',
    subtitle: 'Small inputs that make a big difference to your plan.',
    optional: false,
  },
  {
    id: 5,
    title: 'Your food & kitchen',
    subtitle: 'Helps us build a meal plan that actually works for you.',
    optional: false,
  },
  {
    id: 6,
    title: 'Your schedule & commitment',
    subtitle: "What's realistic for you.",
    optional: false,
  },
  {
    id: 7,
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
  'Status',
  'Lifestyle',
  'Food',
  'Schedule',
  'Fitness',
] as const;
