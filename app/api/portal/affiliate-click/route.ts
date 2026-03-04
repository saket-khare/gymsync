import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { recordAffiliateClick, listActiveAffiliateProducts } from '@/lib/db';
import { getGymConfig } from '@/lib/gym-config';

const PORTAL_SECRET = new TextEncoder().encode(
  process.env.PORTAL_JWT_SECRET ?? process.env.NEXTAUTH_SECRET ?? 'portal-secret-change-me'
);

async function getMemberFromToken(req: NextRequest) {
  const token = req.cookies.get('portal_token')?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, PORTAL_SECRET);
    return payload as { memberId: string; gymSlug: string };
  } catch {
    return null;
  }
}

// GET /api/portal/affiliate-click?gymSlug=xxx — returns active products for the gym
export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const gymSlug = searchParams.get('gymSlug');
  if (!gymSlug) return NextResponse.json({ error: 'gymSlug required' }, { status: 400 });

  const gymConfig = await getGymConfig(gymSlug);
  if (!gymConfig) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const products = await listActiveAffiliateProducts(gymConfig.id);
  return NextResponse.json({ products });
}

// POST /api/portal/affiliate-click — log a click and redirect
export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: { productId: string; gymSlug: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { productId, gymSlug } = body;
  if (!productId || !gymSlug) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  const gymConfig = await getGymConfig(gymSlug);
  if (!gymConfig) return NextResponse.json({ error: 'Gym not found' }, { status: 404 });

  const payload = await getMemberFromToken(req);

  try {
    await recordAffiliateClick(productId, gymConfig.id, payload?.memberId);
  } catch (err) {
    console.error('[affiliate-click]', err);
  }

  return NextResponse.json({ success: true });
}
