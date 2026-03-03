import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getGymConfig } from '@/lib/gym-config';
import { sendTestEmail } from '@/lib/email-sender';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const gymSlug = (session.user as { gymSlug?: string }).gymSlug;
  if (!gymSlug) {
    return NextResponse.json({ success: false, error: 'No gym associated' }, { status: 403 });
  }

  const gymConfig = await getGymConfig(gymSlug);
  if (!gymConfig) {
    return NextResponse.json({ success: false, error: 'Gym not found' }, { status: 404 });
  }

  let body: { to?: string } = {};
  try {
    body = await req.json();
  } catch {
    // optional body
  }

  const to = (body.to && body.to.trim()) || gymConfig.trainerEmail;
  if (!to) {
    return NextResponse.json(
      { success: false, error: 'No recipient; set trainer email in gym settings' },
      { status: 400 },
    );
  }

  try {
    await sendTestEmail(to, gymConfig.name);
    return NextResponse.json({ success: true, to });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to send test email';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
