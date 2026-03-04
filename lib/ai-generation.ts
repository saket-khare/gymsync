import Anthropic from '@anthropic-ai/sdk';
import type { MemberFormData, GymConfig, GeneratedMealPlan, MealPlanDay, TrainerBrief } from '@/types';
import { calculateTDEE, goalLabel, retryWithBackoff } from '@/lib/utils';

function getAnthropicClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured.');
  return new Anthropic({ apiKey });
}

function parseJsonResponse<T>(content: string | null | undefined): T {
  if (!content) throw new Error('Empty response from AI');
  const cleaned = content
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    throw new Error(`Failed to parse AI JSON: ${cleaned.slice(0, 200)}`);
  }
}

// Compact schema string used in every day-chunk prompt (keeps tokens low)
const DAY_SCHEMA = `{"day":"DAY","breakfast":{"name":"","description":"","portionSize":"","prepTimeMinutes":0},"midMorningSnack":{"name":"","description":"","portionSize":"","prepTimeMinutes":0},"lunch":{"name":"","description":"","portionSize":"","prepTimeMinutes":0},"eveningSnack":{"name":"","description":"","portionSize":"","prepTimeMinutes":0},"dinner":{"name":"","description":"","portionSize":"","prepTimeMinutes":0},"calories":0,"proteinG":0,"carbsG":0,"fatsG":0,"waterLitres":2.5,"notes":""}`;

export async function generateMealPlan(
  member: MemberFormData,
  gymConfig: GymConfig,
): Promise<GeneratedMealPlan> {
  const anthropic = getAnthropicClient();

  // Compute daily calorie target ourselves — never let the model guess this
  const tdee = calculateTDEE(
    member.weightKg,
    member.heightCm,
    member.age,
    member.gender,
    member.daysPerWeekAvailable,
  );
  let dailyTarget = tdee;
  if (member.primaryGoal === 'weight_loss') dailyTarget = tdee - 400;
  else if (member.primaryGoal === 'muscle_gain') dailyTarget = tdee + 300;

  const systemPrompt = `You are a sports nutritionist specialising in Indian dietary patterns. Return ONLY valid JSON — no prose, no markdown fences. Use common Indian ingredients. Keep all meals under 30 minutes prep. Diet type "${member.dietType}": strictly follow it.`;

  const extrasStr =
    member.onboardingExtras && Object.keys(member.onboardingExtras).length > 0
      ? ` | Extras: ${JSON.stringify(member.onboardingExtras)}`
      : '';
  const ctx = `Name: ${member.firstName} ${member.lastName} | Goal: ${goalLabel(member.primaryGoal)} | Daily target: ${dailyTarget} kcal | Diet: ${member.dietType} | Allergies: ${member.foodAllergies || 'none'} | Medical: ${member.medicalConditions || 'none'}${extrasStr}`;

  const call = (days: string) =>
    retryWithBackoff(() =>
      anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1500,
        temperature: 0.7,
        system: systemPrompt,
        messages: [{
          role: 'user',
          content: `${ctx}\n\nGenerate meal plans for ONLY ${days}. Return a JSON array of day objects matching this schema exactly:\n[${DAY_SCHEMA}]`,
        }],
      }),
    );

  const guidelinesCall = () =>
    retryWithBackoff(() =>
      anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 500,
        temperature: 0.5,
        system: systemPrompt,
        messages: [{
          role: 'user',
          content: `${ctx}\n\nReturn ONLY this JSON object:\n{"generalGuidelines":["3-5 practical tips"],"foodsToAvoid":["3-5 items"],"supplementSuggestions":["1-3 items or empty array"]}`,
        }],
      }),
    );

  // 4 day-chunks (2 days each) + guidelines — all run in parallel
  const [resA, resB, resC, resD, resG] = await Promise.all([
    call('Monday, Tuesday'),
    call('Wednesday, Thursday'),
    call('Friday, Saturday'),
    call('Sunday'),
    guidelinesCall(),
  ]);

  const raw = (r: Awaited<ReturnType<typeof call>>) =>
    r.content[0]?.type === 'text' ? r.content[0].text : null;

  const rawG = resG.content[0]?.type === 'text' ? resG.content[0].text : null;

  const daysA = parseJsonResponse<MealPlanDay[]>(raw(resA));
  const daysB = parseJsonResponse<MealPlanDay[]>(raw(resB));
  const daysC = parseJsonResponse<MealPlanDay[]>(raw(resC));
  const daysD = parseJsonResponse<MealPlanDay[]>(raw(resD));
  const guidelines = parseJsonResponse<{
    generalGuidelines: string[];
    foodsToAvoid: string[];
    supplementSuggestions: string[];
  }>(rawG);

  return {
    memberId: `${gymConfig.slug}_${member.email.split('@')[0]}`,
    memberName: `${member.firstName} ${member.lastName}`,
    goal: goalLabel(member.primaryGoal),
    weeklyCalorieTarget: dailyTarget * 7, // computed here, not by the model
    days: [...daysA, ...daysB, ...daysC, ...daysD],
    generalGuidelines: guidelines.generalGuidelines,
    foodsToAvoid: guidelines.foodsToAvoid,
    supplementSuggestions: guidelines.supplementSuggestions ?? [],
    generatedAt: new Date().toISOString(),
  };
}

export async function generateTrainerBrief(
  member: MemberFormData,
  gymConfig: GymConfig,
): Promise<TrainerBrief> {
  const anthropic = getAnthropicClient();

  let upsellSignal: 'HIGH' | 'MEDIUM' | 'LOW';
  if (
    (member.gymExperience === 'complete_beginner' || member.gymExperience === 'beginner') &&
    member.goalUrgency === 'aggressive' &&
    member.interestedInPT === 'yes'
  ) {
    upsellSignal = 'HIGH';
  } else if (member.goalUrgency === 'moderate' || member.interestedInPT === 'maybe') {
    upsellSignal = 'MEDIUM';
  } else {
    upsellSignal = 'LOW';
  }

  const redFlagsList: string[] = [];
  if (member.injuries) redFlagsList.push(`Injuries: ${member.injuries}`);
  if (member.medicalConditions) redFlagsList.push(`Medical: ${member.medicalConditions}`);

  const systemPrompt = `You are a head fitness coach writing a 2-minute client handover brief for a colleague at ${gymConfig.name}. Be direct and concise. Return ONLY valid JSON. No prose.`;

  const userMessage = `New member brief:
Name: ${member.firstName} ${member.lastName}, Age: ${member.age}
Goal: ${goalLabel(member.primaryGoal)} | Urgency: ${member.goalUrgency} | Timeline: ${member.timelineMonths}mo
Experience: ${member.gymExperience} | Fitness self-rating: ${member.selfRatedFitness}/5
Weight: ${member.weightKg}kg | Height: ${member.heightCm}cm${member.bodyFatPercent ? ` | BF: ${member.bodyFatPercent}%` : ''}
Training: ${member.daysPerWeekAvailable}x/wk, ${member.sessionDurationMinutes}min | PT interest: ${member.interestedInPT}
Injuries: ${member.injuries || 'none'} | Medical: ${member.medicalConditions || 'none'}
Fitness test: push-ups ${member.pushUpCount ?? 'N/A'} | plank ${member.plankHoldSeconds ?? 'N/A'}s | flexibility ${member.flexibilityTest ?? 'N/A'} | resting HR ${member.restingHeartRate ?? 'N/A'}bpm

Return ONLY this JSON:
{"memberId":"","memberSnapshot":{"name":"","age":0,"goal":"","goalUrgency":"","timeline":"","experienceLevel":"","fitnessScore":0},"gapAnalysis":"2-3 sentences","conversationStarters":["","",""],"upsellSignal":"${upsellSignal}","upsellReasoning":"1-2 sentences","redFlags":${JSON.stringify(redFlagsList)},"suggestedModifications":[""],"baselineTestSummary":"","generatedAt":""}`;

  return retryWithBackoff(async () => {
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1200,
      temperature: 0.5,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    });

    const raw = message.content[0]?.type === 'text' ? message.content[0].text : null;
    const parsed = parseJsonResponse<TrainerBrief>(raw);
    parsed.memberId = `${gymConfig.slug}_${member.email.split('@')[0]}`;
    parsed.memberSnapshot.fitnessScore = member.selfRatedFitness;
    parsed.upsellSignal = upsellSignal;
    parsed.generatedAt = new Date().toISOString();
    return parsed;
  });
}
