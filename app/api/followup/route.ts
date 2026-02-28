import { NextRequest, NextResponse } from 'next/server';
import { getGymConfig } from '@/lib/gym-config';
import { getRow, updateRow } from '@/lib/google-sheets';
import { sendFollowUpEmail } from '@/lib/email-sender';

interface FollowUpBody {
  rowId: string;
  gymSlug: string;
  day: 3 | 7 | 30;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  // Verify internal secret
  const secret = req.headers.get('x-internal-secret');
  const expected = process.env.INTERNAL_API_SECRET ?? '';

  if (!expected || secret !== expected) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body: unknown = await req.json();
    const { rowId, gymSlug, day } = body as FollowUpBody;

    if (!rowId || !gymSlug || ![3, 7, 30].includes(day)) {
      return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
    }

    const gymConfig = await getGymConfig(gymSlug);
    if (!gymConfig) {
      return NextResponse.json({ success: false, error: 'Gym not found' }, { status: 404 });
    }

    // Get member row
    if (!gymConfig.googleSheetId) {
      return NextResponse.json({ success: false, error: 'No sheet configured' }, { status: 400 });
    }

    const memberRow = await getRow(gymConfig.googleSheetId, rowId);
    if (!memberRow) {
      return NextResponse.json({ success: false, error: 'Member not found' }, { status: 404 });
    }

    // Check if already sent
    const alreadySentKey = day === 3 ? 'day3Sent' : day === 7 ? 'day7Sent' : 'day30Sent';
    if (memberRow[alreadySentKey]) {
      return NextResponse.json({ success: true, message: 'Already sent' });
    }

    const memberName = `${memberRow.firstName} ${memberRow.lastName}`;

    await sendFollowUpEmail({
      memberEmail: memberRow.email,
      memberName,
      gymConfig,
      day,
      primaryGoal: memberRow.primaryGoal,
    });

    // Mark as sent
    await updateRow(gymConfig.googleSheetId, rowId, {
      [alreadySentKey]: true,
    } as Parameters<typeof updateRow>[2]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[followup] Error:', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
