import { NextRequest, NextResponse } from 'next/server';
import { fullMemberSchema } from '@/lib/validations';
import { getGymConfig } from '@/lib/gym-config';
import { createMember } from '@/lib/db';
import { normalizePhone } from '@/lib/utils';
import type { GenerateRequestBody } from '@/types';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body: unknown = await req.json();

    // Validate
    const parsed = fullMemberSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const memberData = parsed.data;

    // Sanitize
    memberData.firstName = memberData.firstName.trim();
    memberData.lastName = memberData.lastName.trim();
    memberData.email = memberData.email.trim().toLowerCase();
    memberData.phone = normalizePhone(memberData.phone);
    memberData.city = memberData.city.trim();
    memberData.submittedAt = new Date().toISOString();

    // Fetch gym config
    const gymConfig = await getGymConfig(memberData.gymSlug);
    if (!gymConfig) {
      return NextResponse.json(
        { success: false, error: 'Gym not found' },
        { status: 404 },
      );
    }

    if (!gymConfig.isActive) {
      return NextResponse.json(
        { success: false, error: 'Gym is not active' },
        { status: 403 },
      );
    }

    // Generate unique row ID
    const rowId = crypto.randomUUID();
    const isDemoMode = process.env.DEMO_MODE === 'true' || !process.env.DATABASE_URL;

    // Write to Neon DB (skip in demo mode)
    if (!isDemoMode) {
      await createMember({
        gymId: gymConfig.id,
        gymSlug: memberData.gymSlug,
        rowId,
        firstName: memberData.firstName,
        lastName: memberData.lastName,
        email: memberData.email,
        phone: memberData.phone,
        age: memberData.age,
        gender: memberData.gender,
        city: memberData.city,
        primaryGoal: memberData.primaryGoal,
        goalUrgency: memberData.goalUrgency,
        timelineMonths: memberData.timelineMonths,
        goalDetails: memberData.goalDetails,
        weightKg: memberData.weightKg,
        heightCm: memberData.heightCm,
        bodyFatPercent: memberData.bodyFatPercent,
        selfRatedFitness: memberData.selfRatedFitness,
        gymExperience: memberData.gymExperience,
        dietType: memberData.dietType,
        sleepHoursPerNight: memberData.sleepHoursPerNight,
        stressLevel: memberData.stressLevel,
        occupationType: memberData.occupationType,
        medicalConditions: memberData.medicalConditions,
        injuries: memberData.injuries,
        foodAllergies: memberData.foodAllergies,
        daysPerWeekAvailable: memberData.daysPerWeekAvailable,
        sessionDurationMinutes: memberData.sessionDurationMinutes,
        hasHomeEquipment: memberData.hasHomeEquipment,
        interestedInPT: memberData.interestedInPT,
        budgetForSupplements: memberData.budgetForSupplements,
        pushUpCount: memberData.pushUpCount,
        plankHoldSeconds: memberData.plankHoldSeconds,
        flexibilityTest: memberData.flexibilityTest,
        restingHeartRate: memberData.restingHeartRate,
        submittedAt: memberData.submittedAt,
      });
    } else {
      console.log('[submit] Demo mode: skipping DB write.');
    }

    // Fire-and-forget: trigger AI generation pipeline (skip in demo mode)
    if (!isDemoMode) {
      const generatePayload: GenerateRequestBody = {
        rowId,
        gymSlug: memberData.gymSlug,
        memberData,
      };

      const baseUrl = process.env.NEXTAUTH_URL ?? `https://${req.headers.get('host')}`;
      const secret = process.env.INTERNAL_API_SECRET ?? '';

      fetch(`${baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-internal-secret': secret,
        },
        body: JSON.stringify(generatePayload),
      }).catch((err) => {
        console.error('[submit] Failed to trigger generate pipeline:', err);
      });
    } else {
      console.log('[submit] Demo mode: skipping AI generation pipeline.');
    }

    return NextResponse.json({ success: true, data: { rowId } });
  } catch (err) {
    console.error('[submit] Error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
