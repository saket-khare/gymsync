import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getMemberById, updateLeadSubstatus } from '@/lib/db';

const VALID_SUBSTATUSES = ['new', 'contacted', 'visited', 'converted'] as const;

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
    const substatus = body.substatus;

    if (!memberId) {
      return NextResponse.json({ success: false, error: 'memberId is required' }, { status: 400 });
    }
    if (!VALID_SUBSTATUSES.includes(substatus)) {
      return NextResponse.json({ success: false, error: 'Invalid substatus' }, { status: 400 });
    }

    const member = await getMemberById(memberId);
    if (!member || member.gymSlug !== gymSlug) {
      return NextResponse.json({ success: false, error: 'Member not found' }, { status: 404 });
    }

    await updateLeadSubstatus(memberId, gymSlug, substatus);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[leads/status]', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
