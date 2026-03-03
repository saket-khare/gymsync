import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getGymBySlug } from '@/lib/db';
import { listMealPlanTemplatesByGym, createMealPlanTemplate } from '@/lib/db';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const gymSlug = (session.user as { gymSlug?: string }).gymSlug;
  if (!gymSlug) {
    return NextResponse.json({ error: 'No gym associated' }, { status: 403 });
  }

  const gym = await getGymBySlug(gymSlug);
  if (!gym) {
    return NextResponse.json({ error: 'Gym not found' }, { status: 404 });
  }

  try {
    const templates = await listMealPlanTemplatesByGym(gym.id);
    return NextResponse.json(
      templates.map((t) => ({
        id: t.id,
        name: t.name,
        dietType: t.dietType,
        goal: t.goal,
        weeklyCalorieTarget: t.weeklyCalorieTarget,
        days: t.days,
        generalGuidelines: t.generalGuidelines ?? [],
        foodsToAvoid: t.foodsToAvoid ?? [],
        createdAt: t.createdAt,
      }))
    );
  } catch {
    return NextResponse.json({ error: 'Failed to list templates' }, { status: 500 });
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const gymSlug = (session.user as { gymSlug?: string }).gymSlug;
  if (!gymSlug) {
    return NextResponse.json({ error: 'No gym associated' }, { status: 403 });
  }

  const gym = await getGymBySlug(gymSlug);
  if (!gym) {
    return NextResponse.json({ error: 'Gym not found' }, { status: 404 });
  }

  let body: { name?: string; dietType?: string; goal?: string; weeklyCalorieTarget?: number; days?: unknown; generalGuidelines?: string[]; foodsToAvoid?: string[] } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const { name, dietType, goal, weeklyCalorieTarget, days, generalGuidelines, foodsToAvoid } = body;
  if (!name || !days) {
    return NextResponse.json({ error: 'name and days required' }, { status: 400 });
  }

  try {
    const row = await createMealPlanTemplate({
      gymId: gym.id,
      name,
      dietType,
      goal,
      weeklyCalorieTarget,
      days,
      generalGuidelines,
      foodsToAvoid,
    });
    return NextResponse.json({
      id: row.id,
      name: row.name,
      createdAt: row.createdAt,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
  }
}
