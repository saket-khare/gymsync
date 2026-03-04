import { Resend } from 'resend';
import type { GymConfig, GeneratedMealPlan, TrainerBrief } from '@/types';
import { render } from '@react-email/render';

function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY not configured.');
  }
  return new Resend(apiKey);
}

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? 'onboarding@gymsync.app';

export interface SendWelcomeEmailParams {
  memberEmail: string;
  memberName: string;
  gymConfig: GymConfig;
  mealPlan: GeneratedMealPlan;
  mealPlanPdfBuffer: Buffer;
}

export async function sendWelcomeEmail(params: SendWelcomeEmailParams): Promise<void> {
  const resend = getResendClient();
  const { memberEmail, memberName, gymConfig, mealPlan, mealPlanPdfBuffer } = params;

  // Dynamic import to avoid SSR issues with react-email components
  const { default: WelcomeEmail } = await import('@/components/email/WelcomeEmail');
  const html = await render(
    WelcomeEmail({ memberName, gymConfig, mealPlan }) as React.ReactElement,
  );

  const { error } = await resend.emails.send({
    from: `${gymConfig.name} <${FROM_EMAIL}>`,
    to: memberEmail,
    subject: `Welcome to ${gymConfig.name} — Your Meal Plan is Ready! 🎉`,
    html,
    attachments: [
      {
        filename: `${memberName.replace(/\s+/g, '_')}_MealPlan.pdf`,
        content: mealPlanPdfBuffer,
      },
    ],
  });

  if (error) {
    throw new Error(`Failed to send welcome email: ${error.message}`);
  }
}

export interface SendTrainerBriefEmailParams {
  gymConfig: GymConfig;
  memberName: string;
  trainerBrief: TrainerBrief;
  trainerBriefPdfBuffer: Buffer;
}

export async function sendTrainerBriefEmail(params: SendTrainerBriefEmailParams): Promise<void> {
  const resend = getResendClient();
  const { gymConfig, memberName, trainerBrief, trainerBriefPdfBuffer } = params;

  const { default: TrainerBriefEmail } = await import('@/components/email/TrainerBriefEmail');
  const html = await render(
    TrainerBriefEmail({ memberName, gymConfig, trainerBrief }) as React.ReactElement,
  );

  const { error } = await resend.emails.send({
    from: `GymSync <${FROM_EMAIL}>`,
    to: gymConfig.trainerEmail,
    subject: `New Member Alert: ${memberName} — ${trainerBrief.upsellSignal} PT Lead`,
    html,
    attachments: [
      {
        filename: `${memberName.replace(/\s+/g, '_')}_TrainerBrief.pdf`,
        content: trainerBriefPdfBuffer,
      },
    ],
  });

  if (error) {
    throw new Error(`Failed to send trainer brief email: ${error.message}`);
  }
}

export interface SendFollowUpEmailParams {
  memberEmail: string;
  memberName: string;
  gymConfig: GymConfig;
  day: 3 | 7 | 30;
  primaryGoal?: string;
  /** Top 2 affiliate products for Day 30 email (goal-matched). */
  affiliateProducts?: { name: string; affiliateUrl: string; description?: string }[];
}

export async function sendFollowUpEmail(params: SendFollowUpEmailParams): Promise<void> {
  const resend = getResendClient();
  const { memberEmail, memberName, gymConfig, day, primaryGoal, affiliateProducts } = params;

  let html: string;
  let subject: string;

  if (day === 3) {
    const { default: Day3FollowUp } = await import('@/components/email/Day3FollowUp');
    html = await render(Day3FollowUp({ memberName, gymConfig, primaryGoal }) as React.ReactElement);
    subject = `Day 3 check-in — how's it going, ${memberName.split(' ')[0]}?`;
  } else if (day === 7) {
    const { default: Day7FollowUp } = await import('@/components/email/Day7FollowUp');
    html = await render(Day7FollowUp({ memberName, gymConfig }) as React.ReactElement);
    subject = `Week 1 done 🎉 — here's what's next`;
  } else {
    const { default: Day30FollowUp } = await import('@/components/email/Day30FollowUp');
    html = await render(Day30FollowUp({ memberName, gymConfig, affiliateProducts: affiliateProducts ?? [] }) as React.ReactElement);
    subject = `30 days in — time to measure your progress`;
  }

  const toList: string[] = [memberEmail];
  if (day === 30) toList.push(gymConfig.trainerEmail);

  const { error } = await resend.emails.send({
    from: `${gymConfig.name} <${FROM_EMAIL}>`,
    to: toList,
    subject,
    html,
  });

  if (error) {
    throw new Error(`Failed to send Day ${day} follow-up email: ${error.message}`);
  }
}

/** Lead follow-up (pre-conversion): simple nudge to visit the gym. */
export interface SendLeadFollowUpParams {
  memberEmail: string;
  memberName: string;
  gymConfig: GymConfig;
  day: 1 | 3 | 7 | 14 | 30;
}

export async function sendLeadFollowUpEmail(params: SendLeadFollowUpParams): Promise<void> {
  const resend = getResendClient();
  const { memberEmail, memberName, gymConfig, day } = params;
  const firstName = memberName.split(' ')[0] || memberName;

  const subjects: Record<number, string> = {
    1: `We'd love to see you at ${gymConfig.name}`,
    3: `Quick reminder — ${gymConfig.name} is waiting for you`,
    7: `A week in — ready to start at ${gymConfig.name}?`,
    14: `Two weeks — still thinking about ${gymConfig.name}?`,
    30: `Last chance: we'd love to have you at ${gymConfig.name}`,
  };

  const bodyLines: Record<number, string[]> = {
    1: [
      `Hi ${firstName}, thanks for your interest in ${gymConfig.name}.`,
      `We'd love to show you around and help you get started. Drop in anytime or reply to this email to book a visit.`,
      `— ${gymConfig.trainerName} & the team`,
    ],
    3: [
      `Hi ${firstName}, just a quick nudge from ${gymConfig.name}.`,
      `If you've been thinking about joining, come by for a free tour. No pressure — we're here when you're ready.`,
      `— ${gymConfig.trainerName} & the team`,
    ],
    7: [
      `Hi ${firstName}, it's been a week since we heard from you.`,
      `We'd still love to help you reach your goals at ${gymConfig.name}. Visit us or get in touch to take the next step.`,
      `— ${gymConfig.trainerName} & the team`,
    ],
    14: [
      `Hi ${firstName}, we're still here at ${gymConfig.name}.`,
      `If your schedule has opened up, come say hi. We'd be glad to show you around and answer any questions.`,
      `— ${gymConfig.trainerName} & the team`,
    ],
    30: [
      `Hi ${firstName}, we're closing your enquiry file at ${gymConfig.name}.`,
      `If you'd still like to join, reply to this email or visit us in the next few days. We'd love to have you.`,
      `— ${gymConfig.trainerName} & the team`,
    ],
  };

  const html = `
    <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; color: #111;">
      <p style="margin: 0 0 12px; font-size: 15px;">${bodyLines[day][0]}</p>
      <p style="margin: 0 0 12px; font-size: 15px;">${bodyLines[day][1]}</p>
      <p style="margin: 0; font-size: 14px; color: #555;">${bodyLines[day][2]}</p>
    </div>
  `;

  const { error } = await resend.emails.send({
    from: `${gymConfig.name} <${FROM_EMAIL}>`,
    to: memberEmail,
    subject: subjects[day],
    html,
  });

  if (error) {
    throw new Error(`Lead follow-up email failed: ${error.message}`);
  }
}

/** Time-limited PT offer email (upsell). */
export interface SendPtOfferParams {
  memberEmail: string;
  memberName: string;
  gymConfig: GymConfig;
}

export async function sendPtOfferEmail(params: SendPtOfferParams): Promise<void> {
  const resend = getResendClient();
  const { memberEmail, memberName, gymConfig } = params;
  const firstName = memberName.split(' ')[0] || memberName;

  const html = `
    <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; color: #111;">
      <h2 style="margin: 0 0 16px; font-size: 20px;">Personal training — special offer</h2>
      <p style="margin: 0 0 12px; font-size: 15px;">
        Hi ${firstName},
      </p>
      <p style="margin: 0 0 12px; font-size: 15px;">
        Your trainer <strong>${gymConfig.trainerName}</strong> at <strong>${gymConfig.name}</strong> thinks you'd benefit from personal training sessions.
      </p>
      <p style="margin: 0 0 12px; font-size: 15px;">
        For the next 7 days, try 3 PT sessions at a special introductory price. Talk to ${gymConfig.trainerName} next time you're at the gym to claim this offer.
      </p>
      <p style="margin: 0; font-size: 14px; color: #555;">
        — The team at ${gymConfig.name}
      </p>
    </div>
  `;

  const { error } = await resend.emails.send({
    from: `${gymConfig.name} <${FROM_EMAIL}>`,
    to: memberEmail,
    subject: `Special PT offer — ${gymConfig.name}`,
    html,
  });

  if (error) {
    throw new Error(`PT offer email failed: ${error.message}`);
  }
}

/** Win-back drip: Day 7 / 30 / 60 after subscription expiry. */
export interface SendWinbackParams {
  memberEmail: string;
  memberFirstName: string;
  gymConfig: GymConfig;
  day: 7 | 30 | 60;
}

export async function sendWinbackEmail(params: SendWinbackParams): Promise<void> {
  const resend = getResendClient();
  const { memberEmail, memberFirstName, gymConfig, day } = params;

  const subjects: Record<number, string> = {
    7: `We miss you at ${gymConfig.name}`,
    30: `Special re-join offer — ${gymConfig.name}`,
    60: `Last chance — ${gymConfig.name}`,
  };

  const bodyLines: Record<number, string[]> = {
    7: [
      `Hi ${memberFirstName}, we noticed you haven't been in for a while.`,
      `We'd love to see you back at ${gymConfig.name}. Drop in anytime or reply to this email if you'd like to chat.`,
      `— ${gymConfig.trainerName} & the team`,
    ],
    30: [
      `Hi ${memberFirstName}, we're reaching out with a special re-join offer at ${gymConfig.name}.`,
      `Come back and get back on track. Reply to this email or visit us to claim your offer.`,
      `— ${gymConfig.trainerName} & the team`,
    ],
    60: [
      `Hi ${memberFirstName}, this is our last nudge from ${gymConfig.name}.`,
      `If you'd like to rejoin, we're here. Reply or visit us in the next few days.`,
      `— ${gymConfig.trainerName} & the team`,
    ],
  };

  const html = `
    <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; color: #111;">
      <p style="margin: 0 0 12px; font-size: 15px;">${bodyLines[day][0]}</p>
      <p style="margin: 0 0 12px; font-size: 15px;">${bodyLines[day][1]}</p>
      <p style="margin: 0; font-size: 14px; color: #555;">${bodyLines[day][2]}</p>
    </div>
  `;

  const { error } = await resend.emails.send({
    from: `${gymConfig.name} <${FROM_EMAIL}>`,
    to: memberEmail,
    subject: subjects[day],
    html,
  });

  if (error) {
    throw new Error(`Winback email failed: ${error.message}`);
  }
}

/** Sends a simple test email to verify Resend is configured. */
export async function sendTestEmail(to: string, fromName?: string): Promise<void> {
  const resend = getResendClient();
  const name = fromName ?? 'GymSync';
  const { error } = await resend.emails.send({
    from: `${name} <${FROM_EMAIL}>`,
    to,
    subject: 'GymSync — Test email',
    html: `
      <p>This is a test email from GymSync.</p>
      <p>If you received this, your email configuration is working.</p>
      <p><small>Sent at ${new Date().toISOString()}</small></p>
    `,
  });
  if (error) {
    throw new Error(`Test email failed: ${error.message}`);
  }
}

export async function sendInternalAlertEmail(
  errorMessage: string,
  context: Record<string, unknown>,
): Promise<void> {
  try {
    const resend = getResendClient();
    await resend.emails.send({
      from: `GymSync Alerts <${FROM_EMAIL}>`,
      to: 'admin@gymsync.app',
      subject: `[GymSync] Generation Pipeline Error`,
      html: `<pre>${JSON.stringify({ error: errorMessage, context }, null, 2)}</pre>`,
    });
  } catch {
    // Don't throw — this is a best-effort alert
    console.error('[email-sender] Failed to send internal alert');
  }
}
