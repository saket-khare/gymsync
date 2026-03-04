import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getGymConfig } from '@/lib/gym-config';
import { listMembersByGym, updateMemberLeadFollowUp } from '@/lib/db';
import { sendLeadFollowUpEmail } from '@/lib/email-sender';

/** POST: run lead follow-up sequence for the current gym's leads. Call from cron or manually. */
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

    const leads = await listMembersByGym(gymSlug, { memberStatus: 'lead' });
    let sent = 0;

    for (const lead of leads) {
      const submittedAt = new Date(lead.submittedAt).getTime();
      const daysSince = Math.floor((Date.now() - submittedAt) / 86400000);

      let dayToSend: 1 | 3 | 7 | 14 | 30 | null = null;
      const updates: {
        followUpDay1Sent?: boolean;
        followUpDay3Sent?: boolean;
        followUpDay7Sent?: boolean;
        followUpDay14Sent?: boolean;
        followUpDay30Sent?: boolean;
        memberStatus?: 'lapsed';
      } = {};

      if (daysSince >= 30 && !lead.followUpDay30Sent) {
        dayToSend = 30;
        updates.followUpDay30Sent = true;
        updates.memberStatus = 'lapsed';
      } else if (daysSince >= 14 && !lead.followUpDay14Sent) {
        dayToSend = 14;
        updates.followUpDay14Sent = true;
      } else if (daysSince >= 7 && !lead.followUpDay7Sent) {
        dayToSend = 7;
        updates.followUpDay7Sent = true;
      } else if (daysSince >= 3 && !lead.followUpDay3Sent) {
        dayToSend = 3;
        updates.followUpDay3Sent = true;
      } else if (daysSince >= 1 && !lead.followUpDay1Sent) {
        dayToSend = 1;
        updates.followUpDay1Sent = true;
      }

      if (dayToSend) {
        try {
          await sendLeadFollowUpEmail({
            memberEmail: lead.email,
            memberName: `${lead.firstName} ${lead.lastName}`.trim(),
            gymConfig,
            day: dayToSend,
          });
          await updateMemberLeadFollowUp(lead.id, updates);
          sent++;
        } catch (err) {
          console.error('[followup-leads]', lead.email, dayToSend, err);
        }
      }
    }

    return NextResponse.json({ success: true, sent, total: leads.length });
  } catch (err) {
    console.error('[followup-leads]', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
