import { NextRequest, NextResponse } from "next/server";
import { getMemberByEmailOrPhone, setMemberPortalOtp } from "@/lib/db";
import { Resend } from "resend";

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// POST /api/portal/otp — request OTP for portal login
export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: { gymSlug: string; identifier: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { gymSlug, identifier } = body;
  if (!gymSlug || !identifier?.trim()) {
    return NextResponse.json(
      { error: "gymSlug and identifier are required" },
      { status: 400 },
    );
  }

  const member = await getMemberByEmailOrPhone(gymSlug, identifier.trim());
  if (!member) {
    // Return success to prevent enumeration
    return NextResponse.json({ sent: true });
  }

  const otp = generateOtp();
  await setMemberPortalOtp(member.id, otp);

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? "GymSync <noreply@gymsync.app>",
      to: member.email,
      subject: `Your login code: ${otp}`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
          <h2 style="margin: 0 0 8px; font-size: 20px; color: #111;">Your login code</h2>
          <p style="margin: 0 0 24px; color: #555; font-size: 14px;">
            Hi ${member.firstName}, use the code below to log in to your member portal. It expires in 10 minutes.
          </p>
          <div style="background: #f4f4f5; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
            <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #111;">${otp}</span>
          </div>
          <p style="margin: 0; color: #999; font-size: 12px;">
            If you didn't request this, you can safely ignore this email.
          </p>
        </div>
      `,
    });
  } catch (err) {
    console.error("[portal/otp] email error:", err);
    // Don't expose email errors to the client
  }

  return NextResponse.json({ sent: true });
}
