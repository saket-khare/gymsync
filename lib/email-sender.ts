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
}

export async function sendFollowUpEmail(params: SendFollowUpEmailParams): Promise<void> {
  const resend = getResendClient();
  const { memberEmail, memberName, gymConfig, day, primaryGoal } = params;

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
    html = await render(Day30FollowUp({ memberName, gymConfig }) as React.ReactElement);
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
