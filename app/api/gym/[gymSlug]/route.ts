import { NextRequest, NextResponse } from 'next/server';
import { getGymConfig, toPublicConfig } from '@/lib/gym-config';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ gymSlug: string }> },
): Promise<NextResponse> {
  const { gymSlug } = await params;

  try {
    const config = await getGymConfig(gymSlug);

    if (!config) {
      return NextResponse.json(
        { success: false, error: 'Gym not found' },
        { status: 404 },
      );
    }

    if (!config.isActive) {
      return NextResponse.json(
        { success: false, error: 'Gym is not active' },
        { status: 403 },
      );
    }

    return NextResponse.json({ success: true, data: toPublicConfig(config) });
  } catch (err) {
    console.error('[api/gym] Error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
