import { eq, desc, and, gte, lte, sql } from 'drizzle-orm';
import { getDb } from './client';
import { gyms, members, mealPlans, mealPlanTemplates, trainerBriefs, subscriptions } from './schema';
import type { SubscriptionRow } from './schema';
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

export async function listMembersByGym(gymSlug: string) {
  const db = getDb();
  const rows = await db.select().from(members).where(eq(members.gymSlug, gymSlug));
  return rows.map((row) => ({ ...row, _id: row.id, gymId: row.gymId }));
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

// ─── Subscriptions ─────────────────────────────────────────────────────────

export type SubscriptionWithMember = SubscriptionRow & {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  rowId: string;
};

export async function listSubscriptionsByGym(gymId: string): Promise<SubscriptionWithMember[]> {
  const db = getDb();
  const rows = await db
    .select({
      id: subscriptions.id,
      gymId: subscriptions.gymId,
      memberId: subscriptions.memberId,
      planType: subscriptions.planType,
      startDate: subscriptions.startDate,
      endDate: subscriptions.endDate,
      amountPaid: subscriptions.amountPaid,
      paymentMethod: subscriptions.paymentMethod,
      status: subscriptions.status,
      notes: subscriptions.notes,
      createdAt: subscriptions.createdAt,
      firstName: members.firstName,
      lastName: members.lastName,
      email: members.email,
      phone: members.phone,
      rowId: members.rowId,
    })
    .from(subscriptions)
    .innerJoin(members, eq(subscriptions.memberId, members.id))
    .where(eq(subscriptions.gymId, gymId))
    .orderBy(desc(subscriptions.createdAt));
  return rows;
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
