import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  listSubscriptionsByGym,
  getSubscriptionsByMember,
  createSubscription,
  updateSubscriptionStatus,
  getSubscriptionStats,
} from '@/lib/db';
import { getGymConfig } from '@/lib/gym-config';

async function resolveGymId(gymSlug: string): Promise<string | null> {
  const cfg = await getGymConfig(gymSlug);
  return cfg?.id ?? null;
}

// GET  /api/admin/subscriptions?gymSlug=xxx
// GET  /api/admin/subscriptions?gymSlug=xxx&memberId=yyy  → payment history for one member
export async function GET(req: NextRequest): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const gymSlug = (session.user as { gymSlug?: string }).gymSlug;
  if (!gymSlug) return NextResponse.json({ error: 'No gym associated' }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const requestedSlug = searchParams.get('gymSlug');
  if (!requestedSlug || requestedSlug !== gymSlug) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const gymId = await resolveGymId(gymSlug);
  if (!gymId) return NextResponse.json({ error: 'Gym not found' }, { status: 404 });

  const memberId = searchParams.get('memberId');

  try {
    if (memberId) {
      const history = await getSubscriptionsByMember(memberId);
      return NextResponse.json({ history });
    }

    const [subs, stats] = await Promise.all([
      listSubscriptionsByGym(gymId),
      getSubscriptionStats(gymId),
    ]);

    return NextResponse.json({ subscriptions: subs, stats });
  } catch (err) {
    console.error('[subscriptions GET]', err);
    return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 });
  }
}

// POST /api/admin/subscriptions  — create a new subscription
export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const gymSlug = (session.user as { gymSlug?: string }).gymSlug;
  if (!gymSlug) return NextResponse.json({ error: 'No gym associated' }, { status: 403 });

  const gymId = await resolveGymId(gymSlug);
  if (!gymId) return NextResponse.json({ error: 'Gym not found' }, { status: 404 });

  let body: {
    memberId: string;
    planType: string;
    startDate: string;
    endDate: string;
    amountPaid: number;
    paymentMethod: string;
    notes?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { memberId, planType, startDate, endDate, amountPaid, paymentMethod, notes } = body;
  if (!memberId || !planType || !startDate || !endDate || amountPaid == null || !paymentMethod) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const sub = await createSubscription({
      gymId,
      memberId,
      planType: planType as 'monthly' | 'quarterly' | 'half_yearly' | 'annual',
      startDate,
      endDate,
      amountPaid,
      paymentMethod: paymentMethod as 'cash' | 'upi' | 'card' | 'bank_transfer' | 'other',
      notes,
    });
    return NextResponse.json({ subscription: sub }, { status: 201 });
  } catch (err) {
    console.error('[subscriptions POST]', err);
    return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 });
  }
}

// PATCH /api/admin/subscriptions  — update subscription status
export async function PATCH(req: NextRequest): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const gymSlug = (session.user as { gymSlug?: string }).gymSlug;
  if (!gymSlug) return NextResponse.json({ error: 'No gym associated' }, { status: 403 });

  let body: { id: string; status: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { id, status } = body;
  if (!id || !status) return NextResponse.json({ error: 'Missing id or status' }, { status: 400 });

  const validStatuses = ['active', 'expired', 'cancelled', 'paused'];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  try {
    await updateSubscriptionStatus(id, status as 'active' | 'expired' | 'cancelled' | 'paused');
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[subscriptions PATCH]', err);
    return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 });
  }
}
