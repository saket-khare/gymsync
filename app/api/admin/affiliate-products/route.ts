import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  listAffiliateProductsByGym,
  createAffiliateProduct,
  updateAffiliateProduct,
  getAffiliateClickStats,
} from '@/lib/db';
import { getGymConfig } from '@/lib/gym-config';

async function resolveGymId(gymSlug: string): Promise<string | null> {
  const cfg = await getGymConfig(gymSlug);
  return cfg?.id ?? null;
}

// GET /api/admin/affiliate-products?gymSlug=xxx
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
    const [products, clicks] = await Promise.all([
      listAffiliateProductsByGym(gymId),
      getAffiliateClickStats(gymId),
    ]);
    return NextResponse.json({ products, clicks });
  } catch (err) {
    console.error('[affiliate-products GET]', err);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

// POST /api/admin/affiliate-products
export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const gymSlug = (session.user as { gymSlug?: string }).gymSlug ?? null;
  if (!gymSlug) return NextResponse.json({ error: 'No gym' }, { status: 403 });

  const gymId = await resolveGymId(gymSlug);
  if (!gymId) return NextResponse.json({ error: 'Gym not found' }, { status: 404 });

  let body: {
    name: string;
    description?: string;
    imageUrl?: string;
    affiliateUrl: string;
    tag?: string;
    goalTags?: string[];
    sortOrder?: number;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.name?.trim() || !body.affiliateUrl?.trim()) {
    return NextResponse.json({ error: 'name and affiliateUrl are required' }, { status: 400 });
  }

  try {
    const product = await createAffiliateProduct({ gymId, ...body, name: body.name.trim(), affiliateUrl: body.affiliateUrl.trim() });
    return NextResponse.json({ product }, { status: 201 });
  } catch (err) {
    console.error('[affiliate-products POST]', err);
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}

// PATCH /api/admin/affiliate-products
export async function PATCH(req: NextRequest): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const gymSlug = (session.user as { gymSlug?: string }).gymSlug ?? null;
  if (!gymSlug) return NextResponse.json({ error: 'No gym' }, { status: 403 });

  let body: { id: string; [key: string]: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  try {
    await updateAffiliateProduct(body.id, body as Parameters<typeof updateAffiliateProduct>[1]);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[affiliate-products PATCH]', err);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
