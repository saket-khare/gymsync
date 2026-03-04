import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getGymConfig } from '@/lib/gym-config';
import { getTrainerBriefByMemberId, getMemberById } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const gymSlug = (session.user as { gymSlug?: string }).gymSlug;
    if (!gymSlug) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const gymConfig = await getGymConfig(gymSlug);
    if (!gymConfig) {
      return NextResponse.json({ success: false, error: 'Gym not found' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const memberId = searchParams.get('memberId');
    if (!memberId) {
      return NextResponse.json(
        { success: false, error: 'memberId is required' },
        { status: 400 },
      );
    }

    const member = await getMemberById(memberId);
    if (!member || member.gymId !== gymConfig.id) {
      return NextResponse.json({ success: false, error: 'Member not found' }, { status: 404 });
    }

    const brief = await getTrainerBriefByMemberId(memberId);
    if (!brief) {
      return NextResponse.json({ success: true, brief: null });
    }

    return NextResponse.json({
      success: true,
      brief: {
        memberSnapshot: brief.memberSnapshot,
        gapAnalysis: brief.gapAnalysis,
        conversationStarters: brief.conversationStarters,
        upsellSignal: brief.upsellSignal,
        upsellReasoning: brief.upsellReasoning,
        redFlags: brief.redFlags,
        suggestedModifications: brief.suggestedModifications,
        baselineTestSummary: brief.baselineTestSummary,
        generatedAt: brief.generatedAt,
      },
    });
  } catch (err) {
    console.error('[trainer-brief]', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
