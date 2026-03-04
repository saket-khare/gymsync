import { eq, desc, and, gte, lte, sql, count } from 'drizzle-orm';
import { getDb } from './client';
import { gyms, members, mealPlans, mealPlanTemplates, trainerBriefs, subscriptions, subscriptionTypes, affiliateProducts, affiliateClicks } from './schema';
import type { SubscriptionRow, SubscriptionTypeRow, AffiliateProductRow } from './schema';
import type { GymConfig } from '@/types';

// ─── Gyms ─────────────────────────────────────────────────────────────────

export async function getGymBySlug(slug: string) {
  const db = getDb();
  const rows = await db.select().from(gyms).where(eq(gyms.slug, slug)).limit(1);
  return rows[0] ?? null;
}

export async function getGymByAdminEmail(email: string) {
  const db = getDb();
  const rows = await db.select().from(gyms).where(eq(gyms.adminEmail, email)).limit(1);
  return rows[0] ?? null;
}

export async function getGymPasswordHash(slug: string): Promise<string | null> {
  const gym = await getGymBySlug(slug);
  return gym?.adminPasswordHash ?? null;
}

export function gymRowToConfig(row: typeof gyms.$inferSelect): GymConfig {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    logoUrl: row.logoUrl,
    primaryColor: row.primaryColor,
    trainerName: row.trainerName,
    trainerEmail: row.trainerEmail,
    adminEmail: row.adminEmail,
    googleSheetId: row.googleSheetId ?? undefined,
    isActive: row.isActive,
    plan: row.plan as GymConfig['plan'],
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt),
  };
}

export async function createGym(args: {
  slug: string;
  name: string;
  logoUrl: string;
  primaryColor: string;
  trainerName: string;
  trainerEmail: string;
  adminEmail: string;
  adminPasswordHash: string;
  googleSheetId?: string;
  isActive: boolean;
  plan: 'starter' | 'growth' | 'pro';
}) {
  const db = getDb();
  const inserted = await db
    .insert(gyms)
    .values({
      ...args,
      googleSheetId: args.googleSheetId ?? null,
    })
    .returning({ id: gyms.id });
  return inserted[0]?.id ?? null;
}

// ─── Members ──────────────────────────────────────────────────────────────

export async function createMember(args: {
  gymId: string;
  gymSlug: string;
  rowId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  age: number;
  gender: string;
  city: string;
  primaryGoal: string;
  goalUrgency: string;
  timelineMonths: number;
  goalDetails?: string;
  weightKg: number;
  heightCm: number;
  bodyFatPercent?: number;
  selfRatedFitness: number;
  gymExperience: string;
  dietType: string;
  sleepHoursPerNight: number;
  stressLevel: number;
  occupationType: string;
  medicalConditions?: string;
  injuries?: string;
  foodAllergies?: string;
  daysPerWeekAvailable: number;
  sessionDurationMinutes: number;
  hasHomeEquipment: boolean;
  interestedInPT: string;
  budgetForSupplements: string;
  pushUpCount?: number;
  plankHoldSeconds?: number;
  flexibilityTest?: string;
  restingHeartRate?: number;
  submittedAt: string;
  leadSource?: 'walk_in' | 'referral' | 'instagram' | 'facebook' | 'website' | 'other';
  /** Meal planner context: bodyGoal, triedFitBefore, mealsPerDay, whatDoYouEat, cantEat, whoPreparesMeals, cookingElaboration, supplementsOpen, trainedPtBefore, homeEquipmentLevel, etc. */
  onboardingExtras?: Record<string, unknown> | null;
}) {
  const db = getDb();
  await db.insert(members).values({
    gymId: args.gymId,
    gymSlug: args.gymSlug,
    rowId: args.rowId,
    firstName: args.firstName,
    lastName: args.lastName,
    email: args.email,
    phone: args.phone,
    age: args.age,
    gender: args.gender as (typeof members.$inferSelect)['gender'],
    city: args.city,
    primaryGoal: args.primaryGoal as (typeof members.$inferSelect)['primaryGoal'],
    goalUrgency: args.goalUrgency as (typeof members.$inferSelect)['goalUrgency'],
    timelineMonths: args.timelineMonths,
    goalDetails: args.goalDetails ?? null,
    weightKg: args.weightKg,
    heightCm: args.heightCm,
    bodyFatPercent: args.bodyFatPercent ?? null,
    selfRatedFitness: args.selfRatedFitness,
    gymExperience: args.gymExperience as (typeof members.$inferSelect)['gymExperience'],
    dietType: args.dietType as (typeof members.$inferSelect)['dietType'],
    sleepHoursPerNight: args.sleepHoursPerNight,
    stressLevel: args.stressLevel,
    occupationType: args.occupationType as (typeof members.$inferSelect)['occupationType'],
    medicalConditions: args.medicalConditions ?? null,
    injuries: args.injuries ?? null,
    foodAllergies: args.foodAllergies ?? null,
    daysPerWeekAvailable: args.daysPerWeekAvailable,
    sessionDurationMinutes: args.sessionDurationMinutes,
    hasHomeEquipment: args.hasHomeEquipment,
    interestedInPT: args.interestedInPT as (typeof members.$inferSelect)['interestedInPT'],
    budgetForSupplements: args.budgetForSupplements as (typeof members.$inferSelect)['budgetForSupplements'],
    pushUpCount: args.pushUpCount ?? null,
    plankHoldSeconds: args.plankHoldSeconds ?? null,
    flexibilityTest: (args.flexibilityTest as (typeof members.$inferSelect)['flexibilityTest']) ?? null,
    restingHeartRate: args.restingHeartRate ?? null,
    submittedAt: args.submittedAt,
    ...(args.leadSource != null && { leadSource: args.leadSource }),
    ...(args.onboardingExtras != null && Object.keys(args.onboardingExtras).length > 0 && { onboardingExtras: args.onboardingExtras }),
  });
}

/** Returns member with _id and gymId for Convex API compatibility. */
export async function getMemberByRowId(rowId: string) {
  const db = getDb();
  const rows = await db.select().from(members).where(eq(members.rowId, rowId)).limit(1);
  const row = rows[0];
  if (!row) return null;
  return { ...row, _id: row.id, gymId: row.gymId };
}

/** Returns member by DB id. */
export async function getMemberById(memberId: string) {
  const db = getDb();
  const rows = await db.select().from(members).where(eq(members.id, memberId)).limit(1);
  const row = rows[0];
  if (!row) return null;
  return { ...row, _id: row.id, gymId: row.gymId };
}

export async function updateMember(
  rowId: string,
  updates: {
    processingStatus?: 'pending' | 'processing' | 'processed' | 'failed';
    mealPlanGenerated?: boolean;
    emailSent?: boolean;
    day3Sent?: boolean;
    day7Sent?: boolean;
    day30Sent?: boolean;
  }
) {
  const db = getDb();
  const member = await getMemberByRowId(rowId);
  if (!member) throw new Error(`Member not found for rowId: ${rowId}`);
  const clean: Record<string, unknown> = {};
  if (updates.processingStatus !== undefined) clean.processingStatus = updates.processingStatus;
  if (updates.mealPlanGenerated !== undefined) clean.mealPlanGenerated = updates.mealPlanGenerated;
  if (updates.emailSent !== undefined) clean.emailSent = updates.emailSent;
  if (updates.day3Sent !== undefined) clean.day3Sent = updates.day3Sent;
  if (updates.day7Sent !== undefined) clean.day7Sent = updates.day7Sent;
  if (updates.day30Sent !== undefined) clean.day30Sent = updates.day30Sent;
  if (Object.keys(clean).length === 0) return;
  await db.update(members).set(clean).where(eq(members.id, member.id));
}

/** Update lead follow-up flags and optionally set member_status to lapsed. */
export async function updateMemberLeadFollowUp(
  memberId: string,
  updates: {
    followUpDay1Sent?: boolean;
    followUpDay3Sent?: boolean;
    followUpDay7Sent?: boolean;
    followUpDay14Sent?: boolean;
    followUpDay30Sent?: boolean;
    memberStatus?: 'lapsed';
  }
) {
  const db = getDb();
  const clean: Record<string, unknown> = {};
  if (updates.followUpDay1Sent !== undefined) clean.followUpDay1Sent = updates.followUpDay1Sent;
  if (updates.followUpDay3Sent !== undefined) clean.followUpDay3Sent = updates.followUpDay3Sent;
  if (updates.followUpDay7Sent !== undefined) clean.followUpDay7Sent = updates.followUpDay7Sent;
  if (updates.followUpDay14Sent !== undefined) clean.followUpDay14Sent = updates.followUpDay14Sent;
  if (updates.followUpDay30Sent !== undefined) clean.followUpDay30Sent = updates.followUpDay30Sent;
  if (updates.memberStatus !== undefined) clean.memberStatus = updates.memberStatus;
  if (Object.keys(clean).length === 0) return;
  await db.update(members).set(clean).where(eq(members.id, memberId));
}

export async function setMemberPtOfferSent(memberId: string): Promise<void> {
  const db = getDb();
  await db
    .update(members)
    .set({ ptOfferSent: true, ptOfferSentAt: new Date() })
    .where(eq(members.id, memberId));
}

export async function listMembersByGym(gymSlug: string, options?: { memberStatus?: 'lead' | 'converted' | 'lapsed' }) {
  const db = getDb();
  const conditions = [eq(members.gymSlug, gymSlug)];
  if (options?.memberStatus) {
    conditions.push(eq(members.memberStatus, options.memberStatus));
  }
  const rows = await db.select().from(members).where(and(...conditions));
  return rows.map((row) => ({ ...row, _id: row.id, gymId: row.gymId }));
}

/** Find existing member by email or phone for the same gym (for duplicate detection). */
export async function getExistingMemberByGymEmailOrPhone(gymId: string, email: string, phone: string) {
  const db = getDb();
  const rows = await db
    .select()
    .from(members)
    .where(
      and(
        eq(members.gymId, gymId),
        sql`(${members.email} = ${email} OR ${members.phone} = ${phone})`
      )
    )
    .limit(1);
  return rows[0] ?? null;
}

/** Update lead substatus (new → contacted → visited → converted). */
export async function updateLeadSubstatus(
  memberId: string,
  gymSlug: string,
  substatus: 'new' | 'contacted' | 'visited' | 'converted'
): Promise<void> {
  const db = getDb();
  await db
    .update(members)
    .set({ leadSubstatus: substatus })
    .where(and(eq(members.id, memberId), eq(members.gymSlug, gymSlug)));
}

/** Set member_status to 'converted' and converted_at to now. */
export async function convertLeadToMember(memberId: string) {
  const db = getDb();
  await db
    .update(members)
    .set({ memberStatus: 'converted', convertedAt: new Date() })
    .where(eq(members.id, memberId));
}

// ─── Meal plans & trainer briefs ───────────────────────────────────────────

/** Returns meal plan rows for a gym (joined with members to get rowId). */
export async function listMealPlansByGym(gymSlug: string) {
  const db = getDb();
  const rows = await db
    .select({
      id: mealPlans.id,
      memberId: mealPlans.memberId,
      memberName: mealPlans.memberName,
      goal: mealPlans.goal,
      weeklyCalorieTarget: mealPlans.weeklyCalorieTarget,
      generatedAt: mealPlans.generatedAt,
      rowId: members.rowId,
    })
    .from(mealPlans)
    .innerJoin(members, eq(mealPlans.memberId, members.id))
    .where(eq(members.gymSlug, gymSlug));
  return rows;
}

export async function getMealPlanByMemberId(memberId: string) {
  const db = getDb();
  const rows = await db
    .select()
    .from(mealPlans)
    .where(eq(mealPlans.memberId, memberId))
    .limit(1);
  return rows[0] ?? null;
}

/** Get meal plan for a member by rowId (and optional gymSlug for auth). */
export async function getMealPlanByRowId(rowId: string, gymSlug?: string) {
  const member = await getMemberByRowId(rowId);
  if (!member) return null;
  if (gymSlug && member.gymSlug !== gymSlug) return null;
  return getMealPlanByMemberId(member.id);
}

// ─── Meal plan templates (trainer-saved) ───────────────────────────────────

export async function listMealPlanTemplatesByGym(gymId: string) {
  const db = getDb();
  return db
    .select()
    .from(mealPlanTemplates)
    .where(eq(mealPlanTemplates.gymId, gymId))
    .orderBy(desc(mealPlanTemplates.createdAt));
}

export async function createMealPlanTemplate(args: {
  gymId: string;
  name: string;
  dietType?: string;
  goal?: string;
  weeklyCalorieTarget?: number;
  days: unknown;
  generalGuidelines?: string[];
  foodsToAvoid?: string[];
}) {
  const db = getDb();
  const [row] = await db
    .insert(mealPlanTemplates)
    .values({
      gymId: args.gymId,
      name: args.name,
      dietType: args.dietType ?? null,
      goal: args.goal ?? null,
      weeklyCalorieTarget: args.weeklyCalorieTarget ?? null,
      days: args.days,
      generalGuidelines: args.generalGuidelines ?? null,
      foodsToAvoid: args.foodsToAvoid ?? null,
      isBuiltIn: false,
    })
    .returning();
  return row;
}

export async function storeMealPlan(args: {
  memberId: string;
  gymId: string;
  memberName: string;
  goal: string;
  weeklyCalorieTarget: number;
  days: unknown;
  generalGuidelines: string[];
  foodsToAvoid: string[];
  supplementSuggestions?: string[];
  generatedAt: string;
}) {
  const db = getDb();
  await db.insert(mealPlans).values({
    memberId: args.memberId,
    gymId: args.gymId,
    memberName: args.memberName,
    goal: args.goal,
    weeklyCalorieTarget: args.weeklyCalorieTarget,
    days: args.days,
    generalGuidelines: args.generalGuidelines,
    foodsToAvoid: args.foodsToAvoid,
    supplementSuggestions: args.supplementSuggestions ?? null,
    generatedAt: args.generatedAt,
  });
}

export async function getTrainerBriefByMemberId(memberId: string) {
  const db = getDb();
  const rows = await db
    .select()
    .from(trainerBriefs)
    .where(eq(trainerBriefs.memberId, memberId))
    .limit(1);
  return rows[0] ?? null;
}

export async function storeTrainerBrief(args: {
  memberId: string;
  gymId: string;
  memberSnapshot: unknown;
  gapAnalysis: string;
  conversationStarters: string[];
  upsellSignal: 'HIGH' | 'MEDIUM' | 'LOW';
  upsellReasoning: string;
  redFlags: string[];
  suggestedModifications: string[];
  baselineTestSummary?: string;
  generatedAt: string;
}) {
  const db = getDb();
  await db.insert(trainerBriefs).values({
    memberId: args.memberId,
    gymId: args.gymId,
    memberSnapshot: args.memberSnapshot,
    gapAnalysis: args.gapAnalysis,
    conversationStarters: args.conversationStarters,
    upsellSignal: args.upsellSignal,
    upsellReasoning: args.upsellReasoning,
    redFlags: args.redFlags,
    suggestedModifications: args.suggestedModifications,
    baselineTestSummary: args.baselineTestSummary ?? null,
    generatedAt: args.generatedAt,
  });
}

// ─── Member Portal Auth ────────────────────────────────────────────────────

export async function getMemberByEmailOrPhone(gymSlug: string, identifier: string) {
  const db = getDb();
  const rows = await db
    .select()
    .from(members)
    .where(
      and(
        eq(members.gymSlug, gymSlug),
        sql`(${members.email} = ${identifier} OR ${members.phone} = ${identifier})`
      )
    )
    .limit(1);
  return rows[0] ?? null;
}

export async function setMemberPortalOtp(memberId: string, otp: string): Promise<void> {
  const db = getDb();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  await db
    .update(members)
    .set({ portalOtp: otp, portalOtpExpiresAt: expiresAt })
    .where(eq(members.id, memberId));
}

export async function verifyMemberPortalOtp(
  memberId: string,
  otp: string
): Promise<boolean> {
  const db = getDb();
  const rows = await db
    .select({ portalOtp: members.portalOtp, portalOtpExpiresAt: members.portalOtpExpiresAt })
    .from(members)
    .where(eq(members.id, memberId))
    .limit(1);
  const row = rows[0];
  if (!row || row.portalOtp !== otp) return false;
  if (!row.portalOtpExpiresAt || new Date() > row.portalOtpExpiresAt) return false;
  // Clear OTP and set last login
  await db
    .update(members)
    .set({ portalOtp: null, portalOtpExpiresAt: null, lastLoginAt: new Date() })
    .where(eq(members.id, memberId));
  return true;
}

// ─── Subscription Types ────────────────────────────────────────────────────

export async function listSubscriptionTypesByGym(gymId: string): Promise<SubscriptionTypeRow[]> {
  const db = getDb();
  return db
    .select()
    .from(subscriptionTypes)
    .where(eq(subscriptionTypes.gymId, gymId))
    .orderBy(subscriptionTypes.createdAt);
}

export async function createSubscriptionType(args: {
  gymId: string;
  name: string;
  description?: string;
  color?: string;
}): Promise<SubscriptionTypeRow> {
  const db = getDb();
  const [row] = await db
    .insert(subscriptionTypes)
    .values({
      gymId: args.gymId,
      name: args.name,
      description: args.description ?? null,
      color: args.color ?? '#5E6AD2',
    })
    .returning();
  return row;
}

export async function updateSubscriptionType(
  id: string,
  updates: { name?: string; description?: string; color?: string; isActive?: boolean }
): Promise<void> {
  const db = getDb();
  const clean: Record<string, unknown> = {};
  if (updates.name !== undefined) clean.name = updates.name;
  if (updates.description !== undefined) clean.description = updates.description;
  if (updates.color !== undefined) clean.color = updates.color;
  if (updates.isActive !== undefined) clean.isActive = updates.isActive;
  if (Object.keys(clean).length === 0) return;
  await db.update(subscriptionTypes).set(clean).where(eq(subscriptionTypes.id, id));
}

// ─── Subscriptions ─────────────────────────────────────────────────────────

export type SubscriptionWithMember = SubscriptionRow & {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  rowId: string;
  typeName: string | null;
  typeColor: string | null;
};

export async function listSubscriptionsByGym(gymId: string): Promise<SubscriptionWithMember[]> {
  const db = getDb();
  const rows = await db
    .select({
      id: subscriptions.id,
      gymId: subscriptions.gymId,
      memberId: subscriptions.memberId,
      typeId: subscriptions.typeId,
      planType: subscriptions.planType,
      startDate: subscriptions.startDate,
      endDate: subscriptions.endDate,
      amountPaid: subscriptions.amountPaid,
      paymentMethod: subscriptions.paymentMethod,
      status: subscriptions.status,
      notes: subscriptions.notes,
      freezeStartDate: subscriptions.freezeStartDate,
      freezeEndDate: subscriptions.freezeEndDate,
      originalEndDate: subscriptions.originalEndDate,
      winbackDay7Sent: subscriptions.winbackDay7Sent,
      winbackDay30Sent: subscriptions.winbackDay30Sent,
      winbackDay60Sent: subscriptions.winbackDay60Sent,
      createdAt: subscriptions.createdAt,
      firstName: members.firstName,
      lastName: members.lastName,
      email: members.email,
      phone: members.phone,
      rowId: members.rowId,
      typeName: subscriptionTypes.name,
      typeColor: subscriptionTypes.color,
    })
    .from(subscriptions)
    .innerJoin(members, eq(subscriptions.memberId, members.id))
    .leftJoin(subscriptionTypes, eq(subscriptions.typeId, subscriptionTypes.id))
    .where(eq(subscriptions.gymId, gymId))
    .orderBy(desc(subscriptions.createdAt));
  return rows;
}

export async function getSubscriptionById(id: string): Promise<SubscriptionRow | null> {
  const db = getDb();
  const rows = await db.select().from(subscriptions).where(eq(subscriptions.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function freezeSubscription(subscriptionId: string, freezeEndDate: string): Promise<void> {
  const db = getDb();
  const sub = await getSubscriptionById(subscriptionId);
  if (!sub) throw new Error('Subscription not found');
  const today = new Date().toISOString().slice(0, 10);
  await db
    .update(subscriptions)
    .set({
      status: 'paused',
      freezeStartDate: today,
      freezeEndDate,
      originalEndDate: sub.endDate,
    })
    .where(eq(subscriptions.id, subscriptionId));
}

export async function unfreezeSubscription(subscriptionId: string): Promise<void> {
  const db = getDb();
  const sub = await getSubscriptionById(subscriptionId);
  if (!sub || !sub.freezeStartDate || !sub.freezeEndDate) throw new Error('Subscription not frozen');
  const start = new Date(sub.freezeStartDate).getTime();
  const end = new Date(sub.freezeEndDate).getTime();
  const frozenDays = Math.ceil((end - start) / 86400000);
  const currentEnd = new Date(sub.endDate);
  currentEnd.setDate(currentEnd.getDate() + frozenDays);
  const newEndDate = currentEnd.toISOString().slice(0, 10);
  await db
    .update(subscriptions)
    .set({
      status: 'active',
      endDate: newEndDate,
      freezeStartDate: null,
      freezeEndDate: null,
      originalEndDate: null,
    })
    .where(eq(subscriptions.id, subscriptionId));
}

export async function getSubscriptionsByMember(memberId: string): Promise<SubscriptionRow[]> {
  const db = getDb();
  return db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.memberId, memberId))
    .orderBy(desc(subscriptions.createdAt));
}

export async function createSubscription(args: {
  gymId: string;
  memberId: string;
  typeId?: string;
  planType: 'monthly' | 'quarterly' | 'half_yearly' | 'annual';
  startDate: string;
  endDate: string;
  amountPaid: number;
  paymentMethod: 'cash' | 'upi' | 'card' | 'bank_transfer' | 'other';
  status?: 'active' | 'expired' | 'cancelled' | 'paused';
  notes?: string;
}): Promise<SubscriptionRow> {
  const db = getDb();
  const [row] = await db
    .insert(subscriptions)
    .values({
      gymId: args.gymId,
      memberId: args.memberId,
      typeId: args.typeId ?? null,
      planType: args.planType,
      startDate: args.startDate,
      endDate: args.endDate,
      amountPaid: args.amountPaid,
      paymentMethod: args.paymentMethod,
      status: args.status ?? 'active',
      notes: args.notes ?? null,
    })
    .returning();
  return row;
}

export async function updateSubscriptionStatus(
  id: string,
  status: 'active' | 'expired' | 'cancelled' | 'paused'
): Promise<void> {
  const db = getDb();
  await db.update(subscriptions).set({ status }).where(eq(subscriptions.id, id));
}

export async function updateSubscriptionWinbackFlags(
  id: string,
  updates: { winbackDay7Sent?: boolean; winbackDay30Sent?: boolean; winbackDay60Sent?: boolean }
): Promise<void> {
  const db = getDb();
  const clean: Record<string, unknown> = {};
  if (updates.winbackDay7Sent !== undefined) clean.winbackDay7Sent = updates.winbackDay7Sent;
  if (updates.winbackDay30Sent !== undefined) clean.winbackDay30Sent = updates.winbackDay30Sent;
  if (updates.winbackDay60Sent !== undefined) clean.winbackDay60Sent = updates.winbackDay60Sent;
  if (Object.keys(clean).length === 0) return;
  await db.update(subscriptions).set(clean).where(eq(subscriptions.id, id));
}

/** Expired subscriptions with member info for winback drip. */
export async function getExpiredSubscriptionsForWinback(gymId: string) {
  const db = getDb();
  const today = new Date().toISOString().slice(0, 10);
  const day7Ago = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
  const day30Ago = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
  const day60Ago = new Date(Date.now() - 60 * 86400000).toISOString().slice(0, 10);

  const rows = await db
    .select({
      id: subscriptions.id,
      endDate: subscriptions.endDate,
      winbackDay7Sent: subscriptions.winbackDay7Sent,
      winbackDay30Sent: subscriptions.winbackDay30Sent,
      winbackDay60Sent: subscriptions.winbackDay60Sent,
      memberEmail: members.email,
      memberFirstName: members.firstName,
    })
    .from(subscriptions)
    .innerJoin(members, eq(subscriptions.memberId, members.id))
    .where(and(eq(subscriptions.gymId, gymId), eq(subscriptions.status, 'expired')));

  return rows.filter((r) => r.endDate < today);
}

// ─── Affiliate Products ────────────────────────────────────────────────────

export async function listAffiliateProductsByGym(gymId: string): Promise<AffiliateProductRow[]> {
  const db = getDb();
  return db
    .select()
    .from(affiliateProducts)
    .where(eq(affiliateProducts.gymId, gymId))
    .orderBy(affiliateProducts.sortOrder, affiliateProducts.createdAt);
}

export async function listActiveAffiliateProducts(gymId: string): Promise<AffiliateProductRow[]> {
  const db = getDb();
  return db
    .select()
    .from(affiliateProducts)
    .where(and(eq(affiliateProducts.gymId, gymId), eq(affiliateProducts.isActive, true)))
    .orderBy(affiliateProducts.sortOrder, affiliateProducts.createdAt);
}

export async function createAffiliateProduct(args: {
  gymId: string;
  name: string;
  description?: string;
  imageUrl?: string;
  affiliateUrl: string;
  tag?: string;
  goalTags?: string[];
  sortOrder?: number;
}): Promise<AffiliateProductRow> {
  const db = getDb();
  const [row] = await db
    .insert(affiliateProducts)
    .values({
      gymId: args.gymId,
      name: args.name,
      description: args.description ?? null,
      imageUrl: args.imageUrl ?? null,
      affiliateUrl: args.affiliateUrl,
      tag: args.tag ?? null,
      goalTags: args.goalTags ?? null,
      sortOrder: args.sortOrder ?? 0,
    })
    .returning();
  return row;
}

export async function updateAffiliateProduct(
  id: string,
  updates: {
    name?: string;
    description?: string;
    imageUrl?: string;
    affiliateUrl?: string;
    tag?: string;
    goalTags?: string[];
    isActive?: boolean;
    sortOrder?: number;
  }
): Promise<void> {
  const db = getDb();
  const clean: Record<string, unknown> = {};
  if (updates.name !== undefined) clean.name = updates.name;
  if (updates.description !== undefined) clean.description = updates.description;
  if (updates.imageUrl !== undefined) clean.imageUrl = updates.imageUrl;
  if (updates.affiliateUrl !== undefined) clean.affiliateUrl = updates.affiliateUrl;
  if (updates.tag !== undefined) clean.tag = updates.tag;
  if (updates.goalTags !== undefined) clean.goalTags = updates.goalTags;
  if (updates.isActive !== undefined) clean.isActive = updates.isActive;
  if (updates.sortOrder !== undefined) clean.sortOrder = updates.sortOrder;
  if (Object.keys(clean).length === 0) return;
  await db.update(affiliateProducts).set(clean).where(eq(affiliateProducts.id, id));
}

export async function recordAffiliateClick(productId: string, gymId: string, memberId?: string): Promise<void> {
  const db = getDb();
  await db.insert(affiliateClicks).values({
    productId,
    gymId,
    memberId: memberId ?? null,
  });
}

export async function getAffiliateClickStats(gymId: string) {
  const db = getDb();
  const rows = await db
    .select({
      productId: affiliateClicks.productId,
      productName: affiliateProducts.name,
      clicks: count(affiliateClicks.id),
    })
    .from(affiliateClicks)
    .innerJoin(affiliateProducts, eq(affiliateClicks.productId, affiliateProducts.id))
    .where(eq(affiliateClicks.gymId, gymId))
    .groupBy(affiliateClicks.productId, affiliateProducts.name)
    .orderBy(desc(count(affiliateClicks.id)));
  return rows;
}

export async function getSubscriptionStats(gymId: string) {
  const db = getDb();
  const today = new Date().toISOString().slice(0, 10);
  const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString()
    .slice(0, 10);
  const cutoff7 = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

  const all = await db.select().from(subscriptions).where(eq(subscriptions.gymId, gymId));

  const active = all.filter((s) => s.status === 'active');
  const expiringSoon = active.filter((s) => s.endDate >= today && s.endDate <= cutoff7);
  const overdue = all.filter((s) => s.status === 'active' && s.endDate < today);
  const monthlyRevenue = all
    .filter((s) => s.startDate >= firstOfMonth)
    .reduce((sum, s) => sum + s.amountPaid, 0);

  return {
    activeCount: active.length,
    expiringSoonCount: expiringSoon.length,
    overdueCount: overdue.length,
    monthlyRevenue,
  };
}

export interface DashboardIntelligence {
  hotLeads: number;
  conversionRate: number; // 0–100, converted this month / total leads+converted this month
  ptPipelineCount: number;
  expiringIn30Days: number;
  affiliateClicksThisMonth: number;
}

export async function getDashboardIntelligence(gymId: string): Promise<DashboardIntelligence> {
  const db = getDb();
  const now = new Date();
  const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const today = now.toISOString().slice(0, 10);
  const in30Days = new Date(now.getTime() + 30 * 86400000).toISOString().slice(0, 10);

  const [allMembers, highSignalBriefs, activeSubs, affiliateClicksCountResult] = await Promise.all([
    db.select({ memberStatus: members.memberStatus, submittedAt: members.submittedAt, convertedAt: members.convertedAt }).from(members).where(eq(members.gymId, gymId)),
    db.select({ id: trainerBriefs.id }).from(trainerBriefs).where(and(eq(trainerBriefs.gymId, gymId), eq(trainerBriefs.upsellSignal, 'HIGH'))),
    db.select({ endDate: subscriptions.endDate }).from(subscriptions).where(and(eq(subscriptions.gymId, gymId), eq(subscriptions.status, 'active'))),
    db.select({ count: count(affiliateClicks.id) }).from(affiliateClicks).where(and(eq(affiliateClicks.gymId, gymId), gte(affiliateClicks.clickedAt, firstOfMonth))),
  ]);

  const hotLeads = allMembers.filter(
    (m) => m.memberStatus === 'lead' && new Date(m.submittedAt) >= fortyEightHoursAgo
  ).length;

  const thisMonthLeads = allMembers.filter((m) => {
    const d = new Date(m.submittedAt);
    return d >= firstOfMonth && m.memberStatus === 'lead';
  }).length;
  const thisMonthConverted = allMembers.filter((m) => {
    if (m.memberStatus !== 'converted' || !m.convertedAt) return false;
    const d = new Date(m.convertedAt);
    return d >= firstOfMonth;
  }).length;
  const totalThisMonth = thisMonthLeads + thisMonthConverted;
  const conversionRate = totalThisMonth > 0 ? Math.round((thisMonthConverted / totalThisMonth) * 100) : 0;

  const expiringIn30Days = activeSubs.filter(
    (s) => s.endDate >= today && s.endDate <= in30Days
  ).length;

  return {
    hotLeads,
    conversionRate,
    ptPipelineCount: highSignalBriefs.length,
    expiringIn30Days,
    affiliateClicksThisMonth: Number(affiliateClicksCountResult[0]?.count ?? 0),
  };
}

/** Members with HIGH upsell signal for PT pipeline widget. */
export async function getHighSignalMembers(gymId: string, limit = 10) {
  const db = getDb();
  const rows = await db
    .select({
      memberId: members.id,
      firstName: members.firstName,
      lastName: members.lastName,
      email: members.email,
      primaryGoal: members.primaryGoal,
      upsellSignal: trainerBriefs.upsellSignal,
      upsellReasoning: trainerBriefs.upsellReasoning,
    })
    .from(trainerBriefs)
    .innerJoin(members, eq(trainerBriefs.memberId, members.id))
    .where(and(eq(trainerBriefs.gymId, gymId), eq(trainerBriefs.upsellSignal, 'HIGH')))
    .limit(limit);
  return rows;
}
