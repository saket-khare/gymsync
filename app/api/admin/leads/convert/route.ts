import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { convertLeadToMember, getMemberById } from '@/lib/db';

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
    const memberId = typeof body.memberId === 'string' ? body.memberId.trim() : null;
    if (!memberId) {
      return NextResponse.json(
        { success: false, error: 'memberId is required' },
        { status: 400 },
      );
    }

    const member = await getMemberById(memberId);
    if (!member || member.gymSlug !== gymSlug) {
      return NextResponse.json({ success: false, error: 'Member not found' }, { status: 404 });
    }

    if (member.memberStatus !== 'lead') {
      return NextResponse.json(
        { success: false, error: 'Only leads can be converted' },
        { status: 400 },
      );
    }

    await convertLeadToMember(memberId);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[leads/convert]', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
