import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  real,
  timestamp,
  date,
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
export const leadSubstatusEnum = ['new', 'contacted', 'visited', 'converted'] as const;

export const memberStatusEnum = ['lead', 'converted', 'lapsed'] as const;
export const leadSourceEnum = ['walk_in', 'referral', 'instagram', 'facebook', 'website', 'other'] as const;

export const subscriptionPlanEnum = ['monthly', 'quarterly', 'half_yearly', 'annual'] as const;
export const subscriptionStatusEnum = ['active', 'expired', 'cancelled', 'paused'] as const;
export const paymentMethodEnum = ['cash', 'upi', 'card', 'bank_transfer', 'other'] as const;

export const subscriptionTypes = pgTable(
  'subscription_types',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    gymId: uuid('gym_id')
      .notNull()
      .references(() => gyms.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    color: varchar('color', { length: 32 }).notNull().default('#5E6AD2'),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('subscription_types_gym_id_idx').on(t.gymId)]
);

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
    portalOtp: varchar('portal_otp', { length: 8 }),
    portalOtpExpiresAt: timestamp('portal_otp_expires_at', { withTimezone: true }),
    lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
    memberStatus: varchar('member_status', { length: 32 })
      .notNull()
      .default('lead')
      .$type<(typeof memberStatusEnum)[number]>(),
    leadSource: varchar('lead_source', { length: 32 }).$type<(typeof leadSourceEnum)[number]>(),
    convertedAt: timestamp('converted_at', { withTimezone: true }),
    followUpDay1Sent: boolean('follow_up_day1_sent').notNull().default(false),
    followUpDay3Sent: boolean('follow_up_day3_sent').notNull().default(false),
    followUpDay7Sent: boolean('follow_up_day7_sent').notNull().default(false),
    followUpDay14Sent: boolean('follow_up_day14_sent').notNull().default(false),
    followUpDay30Sent: boolean('follow_up_day30_sent').notNull().default(false),
    ptOfferSent: boolean('pt_offer_sent').notNull().default(false),
    ptOfferSentAt: timestamp('pt_offer_sent_at', { withTimezone: true }),
    leadSubstatus: varchar('lead_substatus', { length: 32 })
      .notNull()
      .default('new')
      .$type<(typeof leadSubstatusEnum)[number]>(),
    /** Meal planner context: bodyGoal, triedFitBefore, mealsPerDay, whatDoYouEat, cantEat, whoPreparesMeals, cookingElaboration, supplementsOpen, trainedPtBefore, homeEquipmentLevel, etc. */
    onboardingExtras: jsonb('onboarding_extras'),
  },
  (t) => [
    index('members_row_id_idx').on(t.rowId),
    index('members_gym_id_idx').on(t.gymId),
    index('members_gym_slug_idx').on(t.gymSlug),
    index('members_member_status_idx').on(t.memberStatus),
    index('members_lead_source_idx').on(t.leadSource),
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

export const mealPlanTemplates = pgTable(
  'meal_plan_templates',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    gymId: uuid('gym_id')
      .notNull()
      .references(() => gyms.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    dietType: varchar('diet_type', { length: 32 }),
    goal: varchar('goal', { length: 64 }),
    weeklyCalorieTarget: integer('weekly_calorie_target'),
    days: jsonb('days').notNull(),
    generalGuidelines: jsonb('general_guidelines').$type<string[]>(),
    foodsToAvoid: jsonb('foods_to_avoid').$type<string[]>(),
    isBuiltIn: boolean('is_built_in').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('meal_plan_templates_gym_id_idx').on(t.gymId)]
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

export const subscriptions = pgTable(
  'subscriptions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    gymId: uuid('gym_id')
      .notNull()
      .references(() => gyms.id, { onDelete: 'cascade' }),
    memberId: uuid('member_id')
      .notNull()
      .references(() => members.id, { onDelete: 'cascade' }),
    typeId: uuid('type_id').references(() => subscriptionTypes.id, { onDelete: 'set null' }),
    planType: varchar('plan_type', { length: 32 })
      .notNull()
      .$type<(typeof subscriptionPlanEnum)[number]>(),
    startDate: date('start_date').notNull(),
    endDate: date('end_date').notNull(),
    amountPaid: integer('amount_paid').notNull(), // in INR (whole rupees)
    paymentMethod: varchar('payment_method', { length: 32 })
      .notNull()
      .$type<(typeof paymentMethodEnum)[number]>(),
    status: varchar('status', { length: 32 })
      .notNull()
      .default('active')
      .$type<(typeof subscriptionStatusEnum)[number]>(),
    notes: text('notes'),
    freezeStartDate: date('freeze_start_date'),
    freezeEndDate: date('freeze_end_date'),
    originalEndDate: date('original_end_date'),
    winbackDay7Sent: boolean('winback_day7_sent').notNull().default(false),
    winbackDay30Sent: boolean('winback_day30_sent').notNull().default(false),
    winbackDay60Sent: boolean('winback_day60_sent').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('subscriptions_gym_id_idx').on(t.gymId),
    index('subscriptions_member_id_idx').on(t.memberId),
    index('subscriptions_status_idx').on(t.status),
    index('subscriptions_end_date_idx').on(t.endDate),
  ]
);

export const affiliateProducts = pgTable(
  'affiliate_products',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    gymId: uuid('gym_id')
      .notNull()
      .references(() => gyms.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    imageUrl: text('image_url'),
    affiliateUrl: text('affiliate_url').notNull(),
    tag: varchar('tag', { length: 64 }), // protein / supplement / equipment / apparel / other
    goalTags: jsonb('goal_tags').$type<string[]>(), // e.g. ['weight_loss', 'muscle_gain']
    isActive: boolean('is_active').notNull().default(true),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('affiliate_products_gym_id_idx').on(t.gymId)]
);

export const affiliateClicks = pgTable(
  'affiliate_clicks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    productId: uuid('product_id')
      .notNull()
      .references(() => affiliateProducts.id, { onDelete: 'cascade' }),
    memberId: uuid('member_id').references(() => members.id, { onDelete: 'set null' }),
    gymId: uuid('gym_id')
      .notNull()
      .references(() => gyms.id, { onDelete: 'cascade' }),
    clickedAt: timestamp('clicked_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('affiliate_clicks_product_id_idx').on(t.productId),
    index('affiliate_clicks_gym_id_idx').on(t.gymId),
  ]
);

export type GymRow = typeof gyms.$inferSelect;
export type MemberRow = typeof members.$inferSelect;
export type MealPlanRow = typeof mealPlans.$inferSelect;
export type MealPlanTemplateRow = typeof mealPlanTemplates.$inferSelect;
export type TrainerBriefRow = typeof trainerBriefs.$inferSelect;
export type SubscriptionRow = typeof subscriptions.$inferSelect;
export type SubscriptionTypeRow = typeof subscriptionTypes.$inferSelect;
export type AffiliateProductRow = typeof affiliateProducts.$inferSelect;
export type AffiliateClickRow = typeof affiliateClicks.$inferSelect;
