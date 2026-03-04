import { NextRequest, NextResponse } from 'next/server';
import { getGymConfig } from '@/lib/gym-config';
import { getMemberByRowId, updateMember, listActiveAffiliateProducts } from '@/lib/db';
import { sendFollowUpEmail } from '@/lib/email-sender';

interface FollowUpBody {
  rowId: string;
  gymSlug: string;
  day: 3 | 7 | 30;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  // Verify internal secret
  const secret = req.headers.get('x-internal-secret');
  const expected = process.env.INTERNAL_API_SECRET ?? '';

  if (!expected || secret !== expected) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body: unknown = await req.json();
    const { rowId, gymSlug, day } = body as FollowUpBody;

    if (!rowId || !gymSlug || ![3, 7, 30].includes(day)) {
      return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
    }

    const gymConfig = await getGymConfig(gymSlug);
    if (!gymConfig) {
      return NextResponse.json({ success: false, error: 'Gym not found' }, { status: 404 });
    }

    // Get member from DB
    const member = await getMemberByRowId(rowId);
    if (!member) {
      return NextResponse.json({ success: false, error: 'Member not found' }, { status: 404 });
    }

    // Check if already sent
    const alreadySentKey = day === 3 ? 'day3Sent' : day === 7 ? 'day7Sent' : 'day30Sent';
    if (member[alreadySentKey]) {
      return NextResponse.json({ success: true, message: 'Already sent' });
    }

    const memberName = `${member.firstName} ${member.lastName}`;

    let affiliateProducts: { name: string; affiliateUrl: string; description?: string }[] | undefined;
    if (day === 30 && gymConfig.id) {
      const products = await listActiveAffiliateProducts(gymConfig.id);
      const goal = member.primaryGoal ?? '';
      const matched = products.filter(
        (p) => !p.goalTags || p.goalTags.length === 0 || (goal && p.goalTags?.includes(goal))
      );
      affiliateProducts = matched.slice(0, 2).map((p) => ({
        name: p.name,
        affiliateUrl: p.affiliateUrl,
        description: p.description ?? undefined,
      }));
    }

    await sendFollowUpEmail({
      memberEmail: member.email,
      memberName,
      gymConfig,
      day,
      primaryGoal: member.primaryGoal,
      affiliateProducts,
    });

    // Mark as sent
    await updateMember(rowId, { [alreadySentKey]: true } as {
      day3Sent?: boolean;
      day7Sent?: boolean;
      day30Sent?: boolean;
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[followup] Error:', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
