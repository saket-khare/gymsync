import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getGymConfig } from '@/lib/gym-config';
import {
  getMemberByRowId,
  updateMember,
  storeMealPlan,
  storeTrainerBrief,
} from '@/lib/db';
import { generateMealPlan, generateTrainerBrief } from '@/lib/ai-generation';
import { generateMealPlanPDF, generateTrainerBriefPDF } from '@/lib/pdf-generator';
import {
  sendWelcomeEmail,
  sendTrainerBriefEmail,
  sendInternalAlertEmail,
} from '@/lib/email-sender';
import type { MemberFormData } from '@/types';

export const maxDuration = 60;

type MemberRow = Awaited<ReturnType<typeof getMemberByRowId>>;

function memberRowToFormData(row: MemberRow): MemberFormData | null {
  if (!row) return null;
  return {
    firstName: row.firstName,
    lastName: row.lastName,
    email: row.email,
    phone: row.phone,
    age: row.age,
    gender: row.gender as MemberFormData['gender'],
    city: row.city,
    primaryGoal: row.primaryGoal as MemberFormData['primaryGoal'],
    goalUrgency: row.goalUrgency as MemberFormData['goalUrgency'],
    timelineMonths: row.timelineMonths as MemberFormData['timelineMonths'],
    goalDetails: row.goalDetails ?? undefined,
    weightKg: row.weightKg,
    heightCm: row.heightCm,
    bodyFatPercent: row.bodyFatPercent ?? undefined,
    selfRatedFitness: row.selfRatedFitness as MemberFormData['selfRatedFitness'],
    gymExperience: row.gymExperience as MemberFormData['gymExperience'],
    dietType: row.dietType as MemberFormData['dietType'],
    sleepHoursPerNight: row.sleepHoursPerNight,
    stressLevel: row.stressLevel as MemberFormData['stressLevel'],
    occupationType: row.occupationType as MemberFormData['occupationType'],
    medicalConditions: row.medicalConditions ?? undefined,
    injuries: row.injuries ?? undefined,
    foodAllergies: row.foodAllergies ?? undefined,
    daysPerWeekAvailable: row.daysPerWeekAvailable as MemberFormData['daysPerWeekAvailable'],
    sessionDurationMinutes: row.sessionDurationMinutes as MemberFormData['sessionDurationMinutes'],
    hasHomeEquipment: row.hasHomeEquipment,
    interestedInPT: row.interestedInPT as MemberFormData['interestedInPT'],
    budgetForSupplements: row.budgetForSupplements as MemberFormData['budgetForSupplements'],
    pushUpCount: row.pushUpCount ?? undefined,
    plankHoldSeconds: row.plankHoldSeconds ?? undefined,
    flexibilityTest: row.flexibilityTest as MemberFormData['flexibilityTest'],
    restingHeartRate: row.restingHeartRate ?? undefined,
    gymSlug: row.gymSlug,
    submittedAt: row.submittedAt,
  };
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const gymSlug = (session.user as { gymSlug?: string }).gymSlug;
  if (!gymSlug) {
    return NextResponse.json({ success: false, error: 'No gym associated' }, { status: 403 });
  }

  let rowId = '';
  try {
    const body = await req.json();
    rowId = body?.rowId ?? '';
    if (!rowId || typeof rowId !== 'string') {
      return NextResponse.json({ success: false, error: 'rowId required' }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid body' }, { status: 400 });
  }

  const member = await getMemberByRowId(rowId);
  if (!member || member.gymSlug !== gymSlug) {
    return NextResponse.json({ success: false, error: 'Member not found' }, { status: 404 });
  }

  const memberData = memberRowToFormData(member);
  if (!memberData) {
    return NextResponse.json({ success: false, error: 'Invalid member data' }, { status: 400 });
  }

  const gymConfig = await getGymConfig(gymSlug);
  if (!gymConfig) {
    return NextResponse.json({ success: false, error: 'Gym not found' }, { status: 404 });
  }

  try {
    await updateMember(rowId, { processingStatus: 'processing' });

    const [mealPlan, trainerBrief] = await Promise.all([
      generateMealPlan(memberData, gymConfig),
      generateTrainerBrief(memberData, gymConfig),
    ]);

    await Promise.all([
      storeMealPlan({
        memberId: member._id,
        gymId: member.gymId,
        memberName: `${memberData.firstName} ${memberData.lastName}`,
        goal: mealPlan.goal,
        weeklyCalorieTarget: mealPlan.weeklyCalorieTarget,
        days: mealPlan.days,
        generalGuidelines: mealPlan.generalGuidelines,
        foodsToAvoid: mealPlan.foodsToAvoid,
        supplementSuggestions: mealPlan.supplementSuggestions,
        generatedAt: mealPlan.generatedAt,
      }),
      storeTrainerBrief({
        memberId: member._id,
        gymId: member.gymId,
        memberSnapshot: trainerBrief.memberSnapshot,
        gapAnalysis: trainerBrief.gapAnalysis,
        conversationStarters: trainerBrief.conversationStarters,
        upsellSignal: trainerBrief.upsellSignal,
        upsellReasoning: trainerBrief.upsellReasoning,
        redFlags: trainerBrief.redFlags,
        suggestedModifications: trainerBrief.suggestedModifications,
        baselineTestSummary: trainerBrief.baselineTestSummary,
        generatedAt: trainerBrief.generatedAt,
      }),
    ]);

    const [mealPlanPdfBuffer, trainerBriefPdfBuffer] = await Promise.all([
      generateMealPlanPDF(mealPlan, gymConfig),
      generateTrainerBriefPDF(trainerBrief, gymConfig),
    ]);

    const memberName = `${memberData.firstName} ${memberData.lastName}`;
    await Promise.all([
      sendWelcomeEmail({
        memberEmail: memberData.email,
        memberName,
        gymConfig,
        mealPlan,
        mealPlanPdfBuffer,
      }),
      sendTrainerBriefEmail({
        gymConfig,
        memberName,
        trainerBrief,
        trainerBriefPdfBuffer,
      }),
    ]);

    await updateMember(rowId, {
      processingStatus: 'processed',
      mealPlanGenerated: true,
      emailSent: true,
    });

    return NextResponse.json({
      success: true,
      plan: {
        goal: mealPlan.goal,
        weeklyCalorieTarget: mealPlan.weeklyCalorieTarget,
        generatedAt: mealPlan.generatedAt,
      },
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    try {
      if (rowId) await updateMember(rowId, { processingStatus: 'failed' });
    } catch {
      // ignore
    }
    await sendInternalAlertEmail(errorMessage, { rowId, gymSlug });
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
