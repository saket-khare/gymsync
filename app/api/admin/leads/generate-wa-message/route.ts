import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getMemberById, getTrainerBriefByMemberId } from '@/lib/db';
import Anthropic from '@anthropic-ai/sdk';
import { goalLabel } from '@/lib/utils';

export const maxDuration = 30;

const SYSTEM_PROMPT = `You are a gym owner writing a personal WhatsApp message to someone who filled out a fitness interest form at your gym.

Your goal: get them to come in for a free visit this week.

Tone rules:
- Write like a real person texting — warm, conversational, zero formality
- Never use sales language: no "limited offer", "join today", "exclusive", "best deal", "don't miss out"
- No corporate openers like "Dear valued customer" or "I hope this message finds you well"
- Use their first name once at the start — naturally, not robotically
- Max 1 emoji in the whole message, and only if it feels natural (not forced at the end of every line)
- Keep it to 4–6 lines total — people read WhatsApp on their phones, not on a desktop
- End with a single soft open-ended question about when they're free this week

Personalization rules:
- Pick ONE specific thing from the person's profile (their goal, a lifestyle detail, or a conversation starter from the trainer brief) and weave it in naturally
- Make it feel like you noticed something real about them — not like you're reading a form back
- Do NOT mention "meal plans", "AI", "reports", or "analysis" — keep it human
- Do NOT say "I noticed on your form" — just reference the detail directly as if you know them

What you're writing:
- A short, genuine message from a gym owner/trainer to a prospective member
- The subtext is: "I see you, I think we can help you, come check us out"
- Never a hard close — just enough to get a reply or a visit

Return ONLY the message text. No quotes, no labels, no explanation. Just the message.`;

function buildUserPrompt(
  firstName: string,
  trainerName: string,
  gymName: string,
  goal: string,
  goalUrgency: string,
  timelineMonths: number,
  gymExperience: string,
  interestedInPT: string,
  leadSubstatus: string,
  conversationStarters: string[],
  gapAnalysis: string | null
): string {
  const urgencyMap: Record<string, string> = {
    casual: 'is taking it easy, no rush',
    moderate: 'is reasonably motivated',
    aggressive: 'is highly motivated and wants results fast',
  };
  const expMap: Record<string, string> = {
    complete_beginner: 'has never set foot in a gym',
    beginner: 'has some gym experience but is fairly new',
    intermediate: 'has been training for a while',
    advanced: 'is an experienced gym-goer',
  };

  const lines = [
    `Write a WhatsApp message from ${trainerName} at ${gymName} to ${firstName}.`,
    '',
    `About ${firstName}:`,
    `- Goal: ${goal} within ${timelineMonths} months`,
    `- Urgency: ${urgencyMap[goalUrgency] ?? goalUrgency}`,
    `- Gym experience: ${expMap[gymExperience] ?? gymExperience}`,
    `- Interested in personal training: ${interestedInPT}`,
    `- Current lead stage: ${leadSubstatus}`,
  ];

  if (conversationStarters.length > 0) {
    lines.push('');
    lines.push('Trainer brief — conversation starters (pick the most relevant one):');
    conversationStarters.slice(0, 3).forEach((s, i) => lines.push(`${i + 1}. ${s}`));
  }

  if (gapAnalysis) {
    lines.push('');
    lines.push(`Gap analysis (context only, do not quote directly): ${gapAnalysis}`);
  }

  lines.push('');
  lines.push('Write the message now. 4–6 lines max. No quotes around it.');

  return lines.join('\n');
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const gymSlug = (session.user as { gymSlug?: string }).gymSlug;
    if (!gymSlug) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { memberId, trainerName, gymName } = body;

    if (!memberId) {
      return NextResponse.json({ success: false, error: 'memberId required' }, { status: 400 });
    }

    const member = await getMemberById(memberId);
    if (!member || member.gymSlug !== gymSlug) {
      return NextResponse.json({ success: false, error: 'Member not found' }, { status: 404 });
    }

    const brief = await getTrainerBriefByMemberId(memberId);

    const userPrompt = buildUserPrompt(
      member.firstName,
      trainerName ?? 'the trainer',
      gymName ?? 'the gym',
      goalLabel(member.primaryGoal),
      member.goalUrgency,
      member.timelineMonths,
      member.gymExperience,
      member.interestedInPT,
      member.leadSubstatus ?? 'new',
      (brief?.conversationStarters as string[]) ?? [],
      brief?.gapAnalysis ?? null
    );

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'AI not configured' }, { status: 500 });
    }

    const anthropic = new Anthropic({ apiKey });
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const text = response.content[0]?.type === 'text' ? response.content[0].text.trim() : null;
    if (!text) {
      return NextResponse.json({ success: false, error: 'Empty response from AI' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: text });
  } catch (err) {
    console.error('[generate-wa-message]', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
