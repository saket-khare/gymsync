import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getGymConfig } from '@/lib/gym-config';
import {
  getExpiredSubscriptionsForWinback,
  updateSubscriptionWinbackFlags,
} from '@/lib/db';
import { sendWinbackEmail } from '@/lib/email-sender';

/** POST: run win-back drip for expired subscriptions. Call from cron or manually. */
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

    const rows = await getExpiredSubscriptionsForWinback(gymConfig.id);
    let sent = 0;

    for (const row of rows) {
      const endDate = new Date(row.endDate).getTime();
      const daysSinceExpiry = Math.floor((Date.now() - endDate) / 86400000);

      let dayToSend: 7 | 30 | 60 | null = null;
      const updates: { winbackDay7Sent?: boolean; winbackDay30Sent?: boolean; winbackDay60Sent?: boolean } = {};

      if (daysSinceExpiry >= 60 && !row.winbackDay60Sent) {
        dayToSend = 60;
        updates.winbackDay60Sent = true;
      } else if (daysSinceExpiry >= 30 && !row.winbackDay30Sent) {
        dayToSend = 30;
        updates.winbackDay30Sent = true;
      } else if (daysSinceExpiry >= 7 && !row.winbackDay7Sent) {
        dayToSend = 7;
        updates.winbackDay7Sent = true;
      }

      if (dayToSend) {
        try {
          await sendWinbackEmail({
            memberEmail: row.memberEmail,
            memberFirstName: row.memberFirstName,
            gymConfig,
            day: dayToSend,
          });
          await updateSubscriptionWinbackFlags(row.id, updates);
          sent++;
        } catch (err) {
          console.error('[winback]', row.memberEmail, dayToSend, err);
        }
      }
    }

    return NextResponse.json({ success: true, sent, total: rows.length });
  } catch (err) {
    console.error('[winback]', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
