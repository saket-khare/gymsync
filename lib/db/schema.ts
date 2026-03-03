import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  real,
  timestamp,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';

const planEnum = ['starter', 'growth', 'pro'] as const;
const genderEnum = ['male', 'female', 'other', 'prefer_not_to_say'] as const;
const goalEnum = [
  'weight_loss',
  'muscle_gain',
  'aesthetic',
  'athletic_performance',
  'general_fitness',
  'competition_prep',
] as const;
const urgencyEnum = ['casual', 'moderate', 'aggressive'] as const;
const experienceEnum = ['complete_beginner', 'beginner', 'intermediate', 'advanced'] as const;
const dietEnum = ['vegetarian', 'non_vegetarian', 'vegan', 'eggetarian', 'keto', 'other'] as const;
const occupationEnum = ['desk_job', 'active_job', 'student', 'freelance', 'other'] as const;
const ptEnum = ['yes', 'maybe', 'no'] as const;
const budgetEnum = ['none', 'low', 'medium', 'high'] as const;
const flexibilityEnum = ['touch_toes', 'almost', 'cant_reach'] as const;
const processingStatusEnum = ['pending', 'processing', 'processed', 'failed'] as const;
const upsellSignalEnum = ['HIGH', 'MEDIUM', 'LOW'] as const;

export const gyms = pgTable(
  'gyms',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    name: varchar('name', { length: 512 }).notNull(),
    logoUrl: text('logo_url').notNull().default(''),
    primaryColor: varchar('primary_color', { length: 32 }).notNull().default('#1A56DB'),
    trainerName: varchar('trainer_name', { length: 255 }).notNull(),
    trainerEmail: varchar('trainer_email', { length: 255 }).notNull(),
    adminEmail: varchar('admin_email', { length: 255 }).notNull(),
    adminPasswordHash: text('admin_password_hash').notNull(),
    googleSheetId: varchar('google_sheet_id', { length: 512 }),
    isActive: boolean('is_active').notNull().default(true),
    plan: varchar('plan', { length: 32 }).notNull().$type<(typeof planEnum)[number]>(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('gyms_slug_idx').on(t.slug),
    index('gyms_admin_email_idx').on(t.adminEmail),
  ]
);

export const members = pgTable(
  'members',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    gymId: uuid('gym_id')
      .notNull()
      .references(() => gyms.id, { onDelete: 'cascade' }),
    gymSlug: varchar('gym_slug', { length: 255 }).notNull(),
    rowId: varchar('row_id', { length: 64 }).notNull(),
    firstName: varchar('first_name', { length: 255 }).notNull(),
    lastName: varchar('last_name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    phone: varchar('phone', { length: 64 }).notNull(),
    age: integer('age').notNull(),
    gender: varchar('gender', { length: 32 }).notNull().$type<(typeof genderEnum)[number]>(),
    city: varchar('city', { length: 255 }).notNull(),
    primaryGoal: varchar('primary_goal', { length: 64 })
      .notNull()
      .$type<(typeof goalEnum)[number]>(),
    goalUrgency: varchar('goal_urgency', { length: 32 })
      .notNull()
      .$type<(typeof urgencyEnum)[number]>(),
    timelineMonths: integer('timeline_months').notNull(),
    goalDetails: text('goal_details'),
    weightKg: real('weight_kg').notNull(),
    heightCm: real('height_cm').notNull(),
    bodyFatPercent: real('body_fat_percent'),
    selfRatedFitness: integer('self_rated_fitness').notNull(),
    gymExperience: varchar('gym_experience', { length: 32 })
      .notNull()
      .$type<(typeof experienceEnum)[number]>(),
    dietType: varchar('diet_type', { length: 32 }).notNull().$type<(typeof dietEnum)[number]>(),
    sleepHoursPerNight: real('sleep_hours_per_night').notNull(),
    stressLevel: integer('stress_level').notNull(),
    occupationType: varchar('occupation_type', { length: 32 })
      .notNull()
      .$type<(typeof occupationEnum)[number]>(),
    medicalConditions: text('medical_conditions'),
    injuries: text('injuries'),
    foodAllergies: text('food_allergies'),
    daysPerWeekAvailable: integer('days_per_week_available').notNull(),
    sessionDurationMinutes: integer('session_duration_minutes').notNull(),
    hasHomeEquipment: boolean('has_home_equipment').notNull(),
    interestedInPT: varchar('interested_in_pt', { length: 16 })
      .notNull()
      .$type<(typeof ptEnum)[number]>(),
    budgetForSupplements: varchar('budget_for_supplements', { length: 16 })
      .notNull()
      .$type<(typeof budgetEnum)[number]>(),
    pushUpCount: integer('push_up_count'),
    plankHoldSeconds: integer('plank_hold_seconds'),
    flexibilityTest: varchar('flexibility_test', { length: 32 }).$type<
      (typeof flexibilityEnum)[number]
    >(),
    restingHeartRate: integer('resting_heart_rate'),
    submittedAt: varchar('submitted_at', { length: 64 }).notNull(),
    processingStatus: varchar('processing_status', { length: 32 })
      .notNull()
      .default('pending')
      .$type<(typeof processingStatusEnum)[number]>(),
    mealPlanGenerated: boolean('meal_plan_generated').notNull().default(false),
    emailSent: boolean('email_sent').notNull().default(false),
    day3Sent: boolean('day3_sent').notNull().default(false),
    day7Sent: boolean('day7_sent').notNull().default(false),
    day30Sent: boolean('day30_sent').notNull().default(false),
  },
  (t) => [
    index('members_row_id_idx').on(t.rowId),
    index('members_gym_id_idx').on(t.gymId),
    index('members_gym_slug_idx').on(t.gymSlug),
  ]
);

export const mealPlans = pgTable(
  'meal_plans',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    memberId: uuid('member_id')
      .notNull()
      .references(() => members.id, { onDelete: 'cascade' }),
    gymId: uuid('gym_id')
      .notNull()
      .references(() => gyms.id, { onDelete: 'cascade' }),
    memberName: varchar('member_name', { length: 512 }).notNull(),
    goal: varchar('goal', { length: 255 }).notNull(),
    weeklyCalorieTarget: integer('weekly_calorie_target').notNull(),
    days: jsonb('days').notNull(),
    generalGuidelines: jsonb('general_guidelines').$type<string[]>().notNull(),
    foodsToAvoid: jsonb('foods_to_avoid').$type<string[]>().notNull(),
    supplementSuggestions: jsonb('supplement_suggestions').$type<string[]>(),
    generatedAt: varchar('generated_at', { length: 64 }).notNull(),
  },
  (t) => [
    index('meal_plans_member_id_idx').on(t.memberId),
    index('meal_plans_gym_id_idx').on(t.gymId),
  ]
);

export const trainerBriefs = pgTable(
  'trainer_briefs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    memberId: uuid('member_id')
      .notNull()
      .references(() => members.id, { onDelete: 'cascade' }),
    gymId: uuid('gym_id')
      .notNull()
      .references(() => gyms.id, { onDelete: 'cascade' }),
    memberSnapshot: jsonb('member_snapshot').notNull(),
    gapAnalysis: text('gap_analysis').notNull(),
    conversationStarters: jsonb('conversation_starters').$type<string[]>().notNull(),
    upsellSignal: varchar('upsell_signal', { length: 16 })
      .notNull()
      .$type<(typeof upsellSignalEnum)[number]>(),
    upsellReasoning: text('upsell_reasoning').notNull(),
    redFlags: jsonb('red_flags').$type<string[]>().notNull(),
    suggestedModifications: jsonb('suggested_modifications').$type<string[]>().notNull(),
    baselineTestSummary: text('baseline_test_summary'),
    generatedAt: varchar('generated_at', { length: 64 }).notNull(),
  },
  (t) => [
    index('trainer_briefs_member_id_idx').on(t.memberId),
    index('trainer_briefs_gym_id_idx').on(t.gymId),
  ]
);

export type GymRow = typeof gyms.$inferSelect;
export type MemberRow = typeof members.$inferSelect;
export type MealPlanRow = typeof mealPlans.$inferSelect;
export type TrainerBriefRow = typeof trainerBriefs.$inferSelect;
