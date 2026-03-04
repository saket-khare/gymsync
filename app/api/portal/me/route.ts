import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { getMemberByRowId, getMealPlanByMemberId, getSubscriptionsByMember, listSubscriptionsByGym } from '@/lib/db';
import { getDb } from '@/lib/db/client';
import { members, subscriptionTypes, subscriptions } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

const PORTAL_SECRET = new TextEncoder().encode(
  process.env.PORTAL_JWT_SECRET ?? process.env.NEXTAUTH_SECRET ?? 'portal-secret-change-me'
);

async function getMemberFromToken(req: NextRequest) {
  const token = req.cookies.get('portal_token')?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, PORTAL_SECRET);
    return payload as { memberId: string; gymSlug: string };
  } catch {
    return null;
  }
}

// GET /api/portal/me — returns member profile, meal plan, and subscriptions
export async function GET(req: NextRequest): Promise<NextResponse> {
  const payload = await getMemberFromToken(req);
  if (!payload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDb();

  // Get member
  const memberRows = await db
    .select()
    .from(members)
    .where(eq(members.id, payload.memberId))
    .limit(1);
  const member = memberRows[0];
  if (!member || member.gymSlug !== payload.gymSlug) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Get meal plan
  const mealPlan = await getMealPlanByMemberId(member.id);

  // Get subscriptions with type info
  const subs = await db
    .select({
      id: subscriptions.id,
      typeId: subscriptions.typeId,
      planType: subscriptions.planType,
      startDate: subscriptions.startDate,
      endDate: subscriptions.endDate,
      amountPaid: subscriptions.amountPaid,
      paymentMethod: subscriptions.paymentMethod,
      status: subscriptions.status,
      notes: subscriptions.notes,
      createdAt: subscriptions.createdAt,
      typeName: subscriptionTypes.name,
      typeColor: subscriptionTypes.color,
    })
    .from(subscriptions)
    .leftJoin(subscriptionTypes, eq(subscriptions.typeId, subscriptionTypes.id))
    .where(eq(subscriptions.memberId, member.id))
    .orderBy(desc(subscriptions.createdAt));

  return NextResponse.json({
    member: {
      id: member.id,
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      phone: member.phone,
      weightKg: member.weightKg,
      heightCm: member.heightCm,
      primaryGoal: member.primaryGoal,
      dietType: member.dietType,
      gymSlug: member.gymSlug,
    },
    mealPlan: mealPlan
      ? {
          weeklyCalorieTarget: mealPlan.weeklyCalorieTarget,
          goal: mealPlan.goal,
          days: mealPlan.days,
          generalGuidelines: mealPlan.generalGuidelines,
          foodsToAvoid: mealPlan.foodsToAvoid,
          supplementSuggestions: mealPlan.supplementSuggestions,
          generatedAt: mealPlan.generatedAt,
        }
      : null,
    subscriptions: subs,
  });
}

// DELETE /api/portal/me — logout
export async function DELETE(): Promise<NextResponse> {
  const res = NextResponse.json({ success: true });
  res.cookies.delete('portal_token');
  return res;
}
