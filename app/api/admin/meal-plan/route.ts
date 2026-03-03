import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getMealPlanByRowId, getMemberByRowId, storeMealPlan, updateMember } from '@/lib/db';
import { getGymConfig } from '@/lib/gym-config';
import { generateMealPlanPDF } from '@/lib/pdf-generator';
import { sendWelcomeEmail } from '@/lib/email-sender';
import type { GeneratedMealPlan, MealPlanDay } from '@/types';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const gymSlug = (session.user as { gymSlug?: string }).gymSlug;
  if (!gymSlug) {
    return NextResponse.json({ error: 'No gym associated' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const rowId = searchParams.get('rowId');
  const requestedGymSlug = searchParams.get('gymSlug');

  if (!rowId || !requestedGymSlug || requestedGymSlug !== gymSlug) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  try {
    const plan = await getMealPlanByRowId(rowId, gymSlug);
    if (!plan) {
      return NextResponse.json({ error: 'Meal plan not found' }, { status: 404 });
    }
    return NextResponse.json({
      id: plan.id,
      memberName: plan.memberName,
      goal: plan.goal,
      weeklyCalorieTarget: plan.weeklyCalorieTarget,
      days: plan.days,
      generalGuidelines: plan.generalGuidelines ?? [],
      foodsToAvoid: plan.foodsToAvoid ?? [],
      supplementSuggestions: plan.supplementSuggestions ?? undefined,
      generatedAt: plan.generatedAt,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to load meal plan' }, { status: 500 });
  }
}

/** Store a meal plan (from template or custom) and optionally send email. */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const gymSlug = (session.user as { gymSlug?: string }).gymSlug;
  if (!gymSlug) {
    return NextResponse.json({ error: 'No gym associated' }, { status: 403 });
  }

  let body: { rowId?: string; plan?: Partial<GeneratedMealPlan>; sendEmail?: boolean } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const { rowId, plan: planInput, sendEmail } = body;
  if (!rowId || !planInput?.days || !Array.isArray(planInput.days)) {
    return NextResponse.json(
      { error: 'rowId and plan.days required' },
      { status: 400 }
    );
  }

  const member = await getMemberByRowId(rowId);
  if (!member || member.gymSlug !== gymSlug) {
    return NextResponse.json({ error: 'Member not found' }, { status: 404 });
  }

  const gymConfig = await getGymConfig(gymSlug);
  if (!gymConfig) {
    return NextResponse.json({ error: 'Gym not found' }, { status: 404 });
  }

  const memberName = `${member.firstName} ${member.lastName}`;
  const generatedAt = new Date().toISOString();
  const mealPlan: GeneratedMealPlan = {
    memberId: member._id,
    memberName,
    goal: planInput.goal ?? 'general_fitness',
    weeklyCalorieTarget: planInput.weeklyCalorieTarget ?? 14000,
    days: planInput.days as MealPlanDay[],
    generalGuidelines: planInput.generalGuidelines ?? [],
    foodsToAvoid: planInput.foodsToAvoid ?? [],
    supplementSuggestions: planInput.supplementSuggestions,
    generatedAt,
  };

  try {
    await storeMealPlan({
      memberId: member._id,
      gymId: member.gymId,
      memberName: mealPlan.memberName,
      goal: mealPlan.goal,
      weeklyCalorieTarget: mealPlan.weeklyCalorieTarget,
      days: mealPlan.days,
      generalGuidelines: mealPlan.generalGuidelines,
      foodsToAvoid: mealPlan.foodsToAvoid,
      supplementSuggestions: mealPlan.supplementSuggestions,
      generatedAt: mealPlan.generatedAt,
    });
    await updateMember(rowId, { mealPlanGenerated: true });

    if (sendEmail) {
      const mealPlanPdfBuffer = await generateMealPlanPDF(mealPlan, gymConfig);
      await sendWelcomeEmail({
        memberEmail: member.email,
        memberName: mealPlan.memberName,
        gymConfig,
        mealPlan,
        mealPlanPdfBuffer,
      });
      await updateMember(rowId, { emailSent: true });
    }

    return NextResponse.json({
      success: true,
      generatedAt: mealPlan.generatedAt,
      emailSent: !!sendEmail,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to save plan';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
