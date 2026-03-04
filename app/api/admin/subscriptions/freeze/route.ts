import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getGymConfig } from '@/lib/gym-config';
import { getSubscriptionById, freezeSubscription } from '@/lib/db';

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
    const subscriptionId = typeof body.subscriptionId === 'string' ? body.subscriptionId.trim() : null;
    const freezeEndDate = typeof body.freezeEndDate === 'string' ? body.freezeEndDate.trim() : null;

    if (!subscriptionId || !freezeEndDate) {
      return NextResponse.json(
        { success: false, error: 'subscriptionId and freezeEndDate are required' },
        { status: 400 },
      );
    }

    const sub = await getSubscriptionById(subscriptionId);
    if (!sub || sub.gymId !== gymConfig.id) {
      return NextResponse.json({ success: false, error: 'Subscription not found' }, { status: 404 });
    }

    if (sub.status !== 'active') {
      return NextResponse.json(
        { success: false, error: 'Only active subscriptions can be frozen' },
        { status: 400 },
      );
    }

    await freezeSubscription(subscriptionId, freezeEndDate);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[subscriptions/freeze]', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
