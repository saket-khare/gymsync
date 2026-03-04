import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  listSubscriptionTypesByGym,
  createSubscriptionType,
  updateSubscriptionType,
} from '@/lib/db';
import { getGymConfig } from '@/lib/gym-config';

async function resolveGymId(gymSlug: string): Promise<string | null> {
  const cfg = await getGymConfig(gymSlug);
  return cfg?.id ?? null;
}

// GET /api/admin/subscription-types?gymSlug=xxx
export async function GET(req: NextRequest): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const gymSlug = (session.user as { gymSlug?: string }).gymSlug ?? null;
  if (!gymSlug) return NextResponse.json({ error: 'No gym associated' }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const requestedSlug = searchParams.get('gymSlug');
  if (!requestedSlug || requestedSlug !== gymSlug) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const gymId = await resolveGymId(gymSlug);
  if (!gymId) return NextResponse.json({ error: 'Gym not found' }, { status: 404 });

  try {
    const types = await listSubscriptionTypesByGym(gymId);
    return NextResponse.json({ types });
  } catch (err) {
    console.error('[subscription-types GET]', err);
    return NextResponse.json({ error: 'Failed to fetch subscription types' }, { status: 500 });
  }
}

// POST /api/admin/subscription-types — create a new type
export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const gymSlug = (session.user as { gymSlug?: string }).gymSlug ?? null;
  if (!gymSlug) return NextResponse.json({ error: 'No gym associated' }, { status: 403 });

  const gymId = await resolveGymId(gymSlug);
  if (!gymId) return NextResponse.json({ error: 'Gym not found' }, { status: 404 });

  let body: { name: string; description?: string; color?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.name?.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  try {
    const type = await createSubscriptionType({
      gymId,
      name: body.name.trim(),
      description: body.description?.trim(),
      color: body.color,
    });
    return NextResponse.json({ type }, { status: 201 });
  } catch (err) {
    console.error('[subscription-types POST]', err);
    return NextResponse.json({ error: 'Failed to create subscription type' }, { status: 500 });
  }
}

// PATCH /api/admin/subscription-types — update a type
export async function PATCH(req: NextRequest): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const gymSlug = (session.user as { gymSlug?: string }).gymSlug ?? null;
  if (!gymSlug) return NextResponse.json({ error: 'No gym associated' }, { status: 403 });

  let body: { id: string; name?: string; description?: string; color?: string; isActive?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  try {
    await updateSubscriptionType(body.id, {
      name: body.name?.trim(),
      description: body.description?.trim(),
      color: body.color,
      isActive: body.isActive,
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[subscription-types PATCH]', err);
    return NextResponse.json({ error: 'Failed to update subscription type' }, { status: 500 });
  }
}
