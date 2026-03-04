import { NextRequest, NextResponse } from 'next/server';
import { getMemberByEmailOrPhone, verifyMemberPortalOtp } from '@/lib/db';
import { SignJWT } from 'jose';

const PORTAL_SECRET = new TextEncoder().encode(
  process.env.PORTAL_JWT_SECRET ?? process.env.NEXTAUTH_SECRET ?? 'portal-secret-change-me'
);

// POST /api/portal/verify — verify OTP and issue portal JWT cookie
export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: { gymSlug: string; identifier: string; otp: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { gymSlug, identifier, otp } = body;
  if (!gymSlug || !identifier || !otp) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const member = await getMemberByEmailOrPhone(gymSlug, identifier.trim());
  if (!member) {
    return NextResponse.json({ error: 'Invalid code' }, { status: 401 });
  }

  const valid = await verifyMemberPortalOtp(member.id, otp.trim());
  if (!valid) {
    return NextResponse.json({ error: 'Invalid or expired code' }, { status: 401 });
  }

  // Issue a JWT valid for 7 days
  const token = await new SignJWT({ memberId: member.id, gymSlug })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(PORTAL_SECRET);

  const res = NextResponse.json({ success: true });
  res.cookies.set('portal_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  });
  return res;
}
