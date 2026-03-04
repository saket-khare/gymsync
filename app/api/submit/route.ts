import { NextRequest, NextResponse } from 'next/server';
import { fullMemberSchema, ONBOARDING_EXTRAS_KEYS } from '@/lib/validations';
import { getGymConfig } from '@/lib/gym-config';
import { createMember, getExistingMemberByGymEmailOrPhone } from '@/lib/db';
import { normalizePhone } from '@/lib/utils';
import type { GenerateRequestBody, MemberFormData } from '@/types';

/** Derive gymExperience from timeSinceTrained */
function deriveGymExperience(timeSinceTrained: string): string {
  switch (timeSinceTrained) {
    case 'never_routine': return 'complete_beginner';
    case 'more_than_year': return 'beginner';
    case '3_12_months': return 'intermediate';
    case 'currently_active': return 'advanced';
    default: return 'complete_beginner';
  }
}

/** Derive dietType from whatDoYouEat array */
function deriveDietType(whatDoYouEat: string[]): string {
  if (whatDoYouEat.includes('vegan')) return 'vegan';
  if (whatDoYouEat.includes('red_meat') || whatDoYouEat.includes('chicken_fish')) return 'non_vegetarian';
  if (whatDoYouEat.includes('eggs')) return 'eggetarian';
  if (whatDoYouEat.includes('vegetarian') || whatDoYouEat.includes('dairy')) return 'vegetarian';
  return 'other';
}

/** Derive hasHomeEquipment from homeEquipmentLevel */
function deriveHasHomeEquipment(homeEquipmentLevel: string): boolean {
  return homeEquipmentLevel === 'basic' || homeEquipmentLevel === 'full';
}

/** Derive budgetForSupplements from supplementsOpen */
function deriveBudgetForSupplements(supplementsOpen: string): string {
  switch (supplementsOpen) {
    case 'yes': return 'medium';
    case 'maybe': return 'low';
    case 'whole_food': return 'none';
    default: return 'none';
  }
}

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

    // Derive DB fields from new form fields
    const gymExperience = deriveGymExperience(memberData.timeSinceTrained);
    const dietType = deriveDietType(memberData.whatDoYouEat);
    const hasHomeEquipment = deriveHasHomeEquipment(memberData.homeEquipmentLevel);
    const budgetForSupplements = deriveBudgetForSupplements(memberData.supplementsOpen);

    const isDemoMode = process.env.DEMO_MODE === 'true' || !process.env.DATABASE_URL;

    if (!isDemoMode) {
      const existing = await getExistingMemberByGymEmailOrPhone(
        gymConfig.id,
        memberData.email,
        memberData.phone,
      );
      if (existing) {
        return NextResponse.json({
          success: true,
          data: { rowId: existing.rowId, existing: true },
        });
      }
    }

    const rowId = crypto.randomUUID();

    const raw = memberData as Record<string, unknown>;
    const onboardingExtras = ONBOARDING_EXTRAS_KEYS.reduce<Record<string, unknown>>((acc, key) => {
      const val = raw[key];
      if (val !== undefined && val !== null && val !== '') {
        // For arrays, only skip if empty
        if (Array.isArray(val) && val.length === 0) return acc;
        acc[key] = val;
      }
      return acc;
    }, {});

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
        gymExperience,
        dietType,
        sleepHoursPerNight: memberData.sleepHoursPerNight,
        stressLevel: memberData.stressLevel,
        occupationType: memberData.occupationType,
        medicalConditions: memberData.medicalConditions,
        injuries: memberData.injuries,
        foodAllergies: memberData.foodAllergies,
        daysPerWeekAvailable: memberData.daysPerWeekAvailable,
        sessionDurationMinutes: memberData.sessionDurationMinutes,
        hasHomeEquipment,
        interestedInPT: memberData.interestedInPT,
        budgetForSupplements,
        pushUpCount: memberData.pushUpCount,
        plankHoldSeconds: memberData.plankHoldSeconds,
        flexibilityTest: memberData.flexibilityTest,
        restingHeartRate: memberData.restingHeartRate,
        submittedAt: memberData.submittedAt,
        leadSource: memberData.leadSource,
        ...(Object.keys(onboardingExtras).length > 0 && { onboardingExtras }),
      });
    } else {
      console.log('[submit] Demo mode: skipping DB write.');
    }

    // Fire-and-forget: trigger AI generation pipeline (skip in demo mode)
    if (!isDemoMode) {
      const generatePayload: GenerateRequestBody = {
        rowId,
        gymSlug: memberData.gymSlug,
        memberData: {
          ...memberData,
          gymExperience: gymExperience as MemberFormData['gymExperience'],
          dietType: dietType as MemberFormData['dietType'],
          hasHomeEquipment,
          budgetForSupplements: budgetForSupplements as MemberFormData['budgetForSupplements'],
          ...(Object.keys(onboardingExtras).length > 0 && { onboardingExtras }),
        },
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
