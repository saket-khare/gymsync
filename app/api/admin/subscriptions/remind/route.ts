import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getGymConfig } from '@/lib/gym-config';
import { getDb } from '@/lib/db/client';
import { subscriptions, members, subscriptionTypes, gyms } from '@/lib/db/schema';
import { eq, and, lte, gte } from 'drizzle-orm';
import { Resend } from 'resend';

const PLAN_LABEL: Record<string, string> = {
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  half_yearly: '6 Months',
  annual: 'Annual',
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

// POST /api/admin/subscriptions/remind
// Body: { subscriptionId } — send renewal reminder for a specific subscription
// OR: {} — send reminders for all expiring in 7 days (cron use)
export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const gymSlug = (session.user as { gymSlug?: string }).gymSlug;
  if (!gymSlug) return NextResponse.json({ error: 'No gym' }, { status: 403 });

  const gymConfig = await getGymConfig(gymSlug);
  if (!gymConfig) return NextResponse.json({ error: 'Gym not found' }, { status: 404 });

  let body: { subscriptionId?: string } = {};
  try {
    body = await req.json();
  } catch {
    // empty body is ok for bulk
  }

  const db = getDb();
  const today = new Date().toISOString().slice(0, 10);
  const cutoff7 = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

  let rows;
  if (body.subscriptionId) {
    rows = await db
      .select({
        subId: subscriptions.id,
        planType: subscriptions.planType,
        endDate: subscriptions.endDate,
        amountPaid: subscriptions.amountPaid,
        typeName: subscriptionTypes.name,
        memberEmail: members.email,
        memberFirstName: members.firstName,
        memberLastName: members.lastName,
        gymId: subscriptions.gymId,
      })
      .from(subscriptions)
      .leftJoin(subscriptionTypes, eq(subscriptions.typeId, subscriptionTypes.id))
      .innerJoin(members, eq(subscriptions.memberId, members.id))
      .where(
        and(
          eq(subscriptions.id, body.subscriptionId),
          eq(subscriptions.gymId, gymConfig.id)
        )
      )
      .limit(1);
  } else {
    rows = await db
      .select({
        subId: subscriptions.id,
        planType: subscriptions.planType,
        endDate: subscriptions.endDate,
        amountPaid: subscriptions.amountPaid,
        typeName: subscriptionTypes.name,
        memberEmail: members.email,
        memberFirstName: members.firstName,
        memberLastName: members.lastName,
        gymId: subscriptions.gymId,
      })
      .from(subscriptions)
      .leftJoin(subscriptionTypes, eq(subscriptions.typeId, subscriptionTypes.id))
      .innerJoin(members, eq(subscriptions.memberId, members.id))
      .where(
        and(
          eq(subscriptions.gymId, gymConfig.id),
          eq(subscriptions.status, 'active'),
          gte(subscriptions.endDate, today),
          lte(subscriptions.endDate, cutoff7)
        )
      );
  }

  if (rows.length === 0) {
    return NextResponse.json({ sent: 0, message: 'No subscriptions to remind' });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? 'onboarding@gymsync.app';
  let sent = 0;

  for (const row of rows) {
    const memberName = `${row.memberFirstName} ${row.memberLastName}`;
    const planName = row.typeName ? `${row.typeName} – ${PLAN_LABEL[row.planType] ?? row.planType}` : (PLAN_LABEL[row.planType] ?? row.planType);
    const daysLeft = Math.round((new Date(row.endDate).getTime() - Date.now()) / 86400000);

    try {
      await resend.emails.send({
        from: `${gymConfig.name} <${FROM_EMAIL}>`,
        to: row.memberEmail,
        subject: `Your ${gymConfig.name} subscription expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`,
        html: `
          <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; color: #111;">
            <h2 style="margin: 0 0 8px; font-size: 20px;">Subscription Renewal Reminder</h2>
            <p style="margin: 0 0 16px; color: #555; font-size: 14px;">
              Hi ${row.memberFirstName},
            </p>
            <p style="margin: 0 0 16px; color: #555; font-size: 14px;">
              Your <strong>${planName}</strong> subscription at <strong>${gymConfig.name}</strong> expires on 
              <strong>${formatDate(row.endDate)}</strong> — that's ${daysLeft} day${daysLeft !== 1 ? 's' : ''} away.
            </p>
            <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
              <p style="margin: 0 0 4px; font-size: 13px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em;">Plan</p>
              <p style="margin: 0; font-size: 16px; font-weight: 600;">${planName}</p>
              <p style="margin: 4px 0 0; font-size: 13px; color: #6b7280;">Expires ${formatDate(row.endDate)}</p>
            </div>
            <p style="margin: 0 0 24px; color: #555; font-size: 14px;">
              To renew, simply visit ${gymConfig.name} or contact your trainer. We'd love to continue supporting your fitness journey.
            </p>
            <p style="margin: 0; color: #9ca3af; font-size: 12px;">
              — ${gymConfig.trainerName} &amp; the team at ${gymConfig.name}
            </p>
          </div>
        `,
      });
      sent++;
    } catch (err) {
      console.error('[remind] email error for', row.memberEmail, err);
    }
  }

  return NextResponse.json({ sent, total: rows.length });
}
