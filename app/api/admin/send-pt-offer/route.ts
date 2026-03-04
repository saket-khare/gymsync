import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getGymConfig } from '@/lib/gym-config';
import { getMemberById, setMemberPtOfferSent } from '@/lib/db';
import { sendPtOfferEmail } from '@/lib/email-sender';

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

    const gymConfig = await getGymConfig(gymSlug);
    if (!gymConfig) {
      return NextResponse.json({ success: false, error: 'Gym not found' }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const memberId = typeof body.memberId === 'string' ? body.memberId.trim() : null;
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

    await sendPtOfferEmail({
      memberEmail: member.email,
      memberName: `${member.firstName} ${member.lastName}`.trim(),
      gymConfig,
    });
    await setMemberPtOfferSent(memberId);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[send-pt-offer]', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 },
    );
  }
}
