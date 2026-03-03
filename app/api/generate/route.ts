import { NextRequest, NextResponse } from 'next/server';
import { getGymConfig } from '@/lib/gym-config';
import {
  getMemberByRowId,
  updateMember,
  storeMealPlan,
  storeTrainerBrief,
} from '@/lib/db';
import { generateMealPlan, generateTrainerBrief } from '@/lib/ai-generation';
import { generateMealPlanPDF, generateTrainerBriefPDF } from '@/lib/pdf-generator';
import { sendWelcomeEmail, sendTrainerBriefEmail, sendInternalAlertEmail } from '@/lib/email-sender';
import type { GenerateRequestBody } from '@/types';

export const maxDuration = 60; // Vercel: allow up to 60s for this route

export async function POST(req: NextRequest): Promise<NextResponse> {
  // Verify internal secret
  const secret = req.headers.get('x-internal-secret');
  const expected = process.env.INTERNAL_API_SECRET ?? '';

  if (!expected || secret !== expected) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  let rowId = '';
  let gymSlug = '';

  try {
    const body: unknown = await req.json();
    const { rowId: rid, gymSlug: slug, memberData } = body as GenerateRequestBody;
    rowId = rid;
    gymSlug = slug;

    // Fetch gym config
    const gymConfig = await getGymConfig(gymSlug);
    if (!gymConfig) {
      throw new Error(`Gym config not found for slug: ${gymSlug}`);
    }

    // Update status to processing
    await updateMember(rowId, { processingStatus: 'processing' });

    // Generate meal plan and trainer brief in parallel
    const [mealPlan, trainerBrief] = await Promise.all([
      generateMealPlan(memberData, gymConfig),
      generateTrainerBrief(memberData, gymConfig),
    ]);

    // Store meal plan and trainer brief in DB
    const member = await getMemberByRowId(rowId);
    if (member) {
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
    }

    // Generate PDFs in parallel
    const [mealPlanPdfBuffer, trainerBriefPdfBuffer] = await Promise.all([
      generateMealPlanPDF(mealPlan, gymConfig),
      generateTrainerBriefPDF(trainerBrief, gymConfig),
    ]);

    const memberName = `${memberData.firstName} ${memberData.lastName}`;

    // Send emails in parallel
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

    // Update member: processed
    await updateMember(rowId, {
      processingStatus: 'processed',
      mealPlanGenerated: true,
      emailSent: true,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error('[generate] Pipeline failed:', errorMessage);

    // Try to update status to failed
    try {
      if (rowId) {
        await updateMember(rowId, { processingStatus: 'failed' });
      }
    } catch {
      // Best effort
    }

    // Send internal alert
    await sendInternalAlertEmail(errorMessage, { rowId, gymSlug });

    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
