/**
 * Seed script: Populates test data for gyms, members, meal_plans, and trainer_briefs.
 *
 * Usage:
 *   pnpm db:seed-test [count]
 *   # or
 *   DATABASE_URL="postgresql://..." node scripts/seed-test-data.mjs [count]
 *
 * Run migration first: pnpm db:migrate
 * Run base seed first: pnpm db:seed (creates demo-gym)
 *
 * Args:
 *   count - number of members to create (default: 25)
 *
 * Creates members with random data based on onboarding form options,
 * with varied processing_status (pending, processed, failed).
 * Also seeds meal_plans and trainer_briefs for processed members.
 */

import { config } from 'dotenv';
config({ path: '.env.local' });
config({ path: '.env' });

import { neon } from '@neondatabase/serverless';
import { nanoid } from 'nanoid';

const DATABASE_URL =
  process.env.DATABASE_URL || process.env.NEXT_PUBLIC_DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL or NEXT_PUBLIC_DATABASE_URL is required.');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

// --- Data from onboarding form options (matches lib/onboarding-steps.ts) ---
const GENDERS = ['male', 'female', 'other', 'prefer_not_to_say'];
const GOALS = [
  'weight_loss',
  'muscle_gain',
  'aesthetic',
  'athletic_performance',
  'general_fitness',
  'competition_prep',
];
const URGENCIES = ['casual', 'moderate', 'aggressive'];
const TIMELINES = [3, 6, 12, 24];
const EXPERIENCES = ['complete_beginner', 'beginner', 'intermediate', 'advanced'];
const DIETS = ['vegetarian', 'non_vegetarian', 'vegan', 'eggetarian', 'keto', 'other'];
const OCCUPATIONS = ['desk_job', 'active_job', 'student', 'freelance', 'other'];
const DURATIONS = [30, 45, 60, 90];
const PT_OPTIONS = ['yes', 'maybe', 'no'];
const SUPPLEMENTS = ['none', 'low', 'medium', 'high'];
const FLEXIBILITY = ['touch_toes', 'almost', 'cant_reach'];
const PROCESSING_STATUSES = ['pending', 'processing', 'processed', 'failed'];

// Indian names and cities for realistic test data
const FIRST_NAMES = [
  'Rahul', 'Priya', 'Arjun', 'Ananya', 'Vikram', 'Sneha', 'Rohan', 'Kavya',
  'Aditya', 'Ishita', 'Karan', 'Neha', 'Siddharth', 'Divya', 'Amit', 'Pooja',
  'Ravi', 'Sonal', 'Varun', 'Meera', 'Sanjay', 'Kritika', 'Rishabh', 'Shreya',
];
const LAST_NAMES = [
  'Sharma', 'Patel', 'Singh', 'Kumar', 'Gupta', 'Reddy', 'Nair', 'Iyer',
  'Mehta', 'Joshi', 'Desai', 'Raj', 'Shah', 'Pillai', 'Rao', 'Khan',
];
const CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata',
  'Ahmedabad', 'Jaipur', 'Lucknow', 'Chandigarh', 'Indore', 'Kochi', 'Coimbatore',
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randomFloat(min, max, decimals = 1) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function generateMember(gymId, gymSlug) {
  const firstName = pick(FIRST_NAMES);
  const lastName = pick(LAST_NAMES);
  const rowId = nanoid(10);
  const submittedAt = new Date(
    Date.now() - randomInt(0, 30) * 24 * 60 * 60 * 1000
  ).toISOString();

  // Random status: 50% processed, 30% pending, 15% failed, 5% processing
  const r = Math.random();
  const processingStatus =
    r < 0.5 ? 'processed' : r < 0.8 ? 'pending' : r < 0.95 ? 'failed' : 'processing';

  const hasEmailSent = processingStatus === 'processed';
  const day3Sent = hasEmailSent && Math.random() > 0.3;
  const day7Sent = day3Sent && Math.random() > 0.4;
  const day30Sent = day7Sent && Math.random() > 0.5;

  return {
    gym_id: gymId,
    gym_slug: gymSlug,
    row_id: rowId,
    first_name: firstName,
    last_name: lastName,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomInt(1, 999)}@test.gymsync.app`,
    phone: `+91 ${randomInt(6, 9)}${randomInt(100000000, 999999999)}`,
    age: randomInt(18, 55),
    gender: pick(GENDERS),
    city: pick(CITIES),
    primary_goal: pick(GOALS),
    goal_urgency: pick(URGENCIES),
    timeline_months: pick(TIMELINES),
    goal_details: Math.random() > 0.3 ? `Test goal details for ${firstName}` : null,
    weight_kg: randomFloat(50, 95, 1),
    height_cm: randomFloat(155, 190, 0),
    body_fat_percent: Math.random() > 0.5 ? randomFloat(12, 35, 1) : null,
    self_rated_fitness: randomInt(1, 5),
    gym_experience: pick(EXPERIENCES),
    diet_type: pick(DIETS),
    sleep_hours_per_night: randomFloat(5, 9, 1),
    stress_level: randomInt(1, 5),
    occupation_type: pick(OCCUPATIONS),
    medical_conditions: Math.random() > 0.9 ? 'Mild hypertension' : null,
    injuries: Math.random() > 0.92 ? 'Previous knee strain' : null,
    food_allergies: Math.random() > 0.85 ? 'Nuts' : null,
    days_per_week_available: randomInt(2, 6),
    session_duration_minutes: pick(DURATIONS),
    has_home_equipment: Math.random() > 0.5,
    interested_in_pt: pick(PT_OPTIONS),
    budget_for_supplements: pick(SUPPLEMENTS),
    push_up_count: Math.random() > 0.3 ? randomInt(0, 50) : null,
    plank_hold_seconds: Math.random() > 0.3 ? randomInt(0, 180) : null,
    flexibility_test: Math.random() > 0.4 ? pick(FLEXIBILITY) : null,
    resting_heart_rate: Math.random() > 0.5 ? randomInt(55, 85) : null,
    submitted_at: submittedAt,
    processing_status: processingStatus,
    meal_plan_generated: processingStatus === 'processed',
    email_sent: hasEmailSent,
    day3_sent: day3Sent,
    day7_sent: day7Sent,
    day30_sent: day30Sent,
  };
}

function mealItem(name, desc, portion = '1 serving', prep = 15) {
  return { name, description: desc, portionSize: portion, prepTimeMinutes: prep };
}

function generateMealPlanDays() {
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  return dayNames.map((day) => ({
    day,
    breakfast: mealItem('Oats with fruits & nuts', 'High-fiber start', '1 bowl', 10),
    lunch: mealItem('Rice, dal, vegetables', 'Balanced Indian meal', '1 plate', 25),
    dinner: mealItem('Grilled protein, quinoa', 'Light evening meal', '1 plate', 20),
    calories: randomInt(1800, 2200),
    proteinG: randomInt(80, 120),
    carbsG: randomInt(180, 250),
    fatsG: randomInt(50, 80),
    waterLitres: 2.5,
  }));
}

function generateTrainerBrief(memberId, gymId, memberSnapshot) {
  return {
    member_id: memberId,
    gym_id: gymId,
    member_snapshot: memberSnapshot,
    gap_analysis: 'Member has good baseline fitness. Focus on progressive overload and nutrition consistency.',
    conversation_starters: [
      'How did your first week feel?',
      'Any discomfort or soreness?',
      'How is the meal plan working for you?',
    ],
    upsell_signal: pick(['HIGH', 'MEDIUM', 'LOW']),
    upsell_reasoning: 'Member has expressed interest in PT. Good candidate for intro session.',
    red_flags: [],
    suggested_modifications: ['Consider adding mobility work'],
    baseline_test_summary: 'Push-ups: moderate. Plank: good. Flexibility: average.',
    generated_at: new Date().toISOString(),
  };
}

async function seed() {
  const count = parseInt(process.argv[2] || '25', 10);

  console.log(`Seeding ${count} test members...`);

  const gyms = await sql`SELECT id, slug FROM gyms WHERE slug = 'demo-gym' LIMIT 1`;
  if (gyms.length === 0) {
    console.error('Demo gym not found. Run "pnpm db:seed" first to create it.');
    process.exit(1);
  } else {
    console.log(`Using gym: ${gyms[0].slug}`);
  }

  const { id: gymId, slug: gymSlug } = gyms[0];
  const insertedMembers = [];

  for (let i = 0; i < count; i++) {
    const m = generateMember(gymId, gymSlug);
    const [row] = await sql`
      INSERT INTO members (
        gym_id, gym_slug, row_id, first_name, last_name, email, phone,
        age, gender, city, primary_goal, goal_urgency, timeline_months, goal_details,
        weight_kg, height_cm, body_fat_percent, self_rated_fitness, gym_experience,
        diet_type, sleep_hours_per_night, stress_level, occupation_type,
        medical_conditions, injuries, food_allergies, days_per_week_available,
        session_duration_minutes, has_home_equipment, interested_in_pt, budget_for_supplements,
        push_up_count, plank_hold_seconds, flexibility_test, resting_heart_rate,
        submitted_at, processing_status, meal_plan_generated, email_sent,
        day3_sent, day7_sent, day30_sent
      ) VALUES (
        ${m.gym_id}, ${m.gym_slug}, ${m.row_id}, ${m.first_name}, ${m.last_name},
        ${m.email}, ${m.phone}, ${m.age}, ${m.gender}, ${m.city}, ${m.primary_goal},
        ${m.goal_urgency}, ${m.timeline_months}, ${m.goal_details}, ${m.weight_kg},
        ${m.height_cm}, ${m.body_fat_percent}, ${m.self_rated_fitness}, ${m.gym_experience},
        ${m.diet_type}, ${m.sleep_hours_per_night}, ${m.stress_level}, ${m.occupation_type},
        ${m.medical_conditions}, ${m.injuries}, ${m.food_allergies}, ${m.days_per_week_available},
        ${m.session_duration_minutes}, ${m.has_home_equipment}, ${m.interested_in_pt},
        ${m.budget_for_supplements}, ${m.push_up_count}, ${m.plank_hold_seconds},
        ${m.flexibility_test}, ${m.resting_heart_rate}, ${m.submitted_at},
        ${m.processing_status}, ${m.meal_plan_generated}, ${m.email_sent},
        ${m.day3_sent}, ${m.day7_sent}, ${m.day30_sent}
      )
      RETURNING id, first_name, last_name, processing_status
    `;
    insertedMembers.push({ ...row, memberData: m });
  }

  console.log(`Inserted ${insertedMembers.length} members.`);

  // Seed meal_plans and trainer_briefs for processed members
  const processed = insertedMembers.filter((m) => m.processing_status === 'processed');
  let mealPlans = 0;
  let trainerBriefs = 0;

  for (const member of processed) {
    const memberName = `${member.first_name} ${member.last_name}`;
    const goal = member.memberData.primary_goal.replace(/_/g, ' ');

    await sql`
      INSERT INTO meal_plans (
        member_id, gym_id, member_name, goal, weekly_calorie_target,
        days, general_guidelines, foods_to_avoid, supplement_suggestions, generated_at
      ) VALUES (
        ${member.id}, ${gymId}, ${memberName}, ${goal},
        ${randomInt(12000, 15000)},
        ${JSON.stringify(generateMealPlanDays())},
        ${JSON.stringify(['Eat protein with every meal', 'Stay hydrated - 3L daily', 'Limit processed foods'])},
        ${JSON.stringify(['Fried foods', 'Sugary drinks', 'Excess alcohol'])},
        ${JSON.stringify(['Vitamin D', 'Omega-3', 'Protein powder'])},
        ${new Date().toISOString()}
      )
    `;
    mealPlans++;

    const snapshot = {
      name: memberName,
      goal: member.memberData.primary_goal,
      age: member.memberData.age,
      weight: member.memberData.weight_kg,
      height: member.memberData.height_cm,
      experience: member.memberData.gym_experience,
      diet: member.memberData.diet_type,
    };
    await sql`
      INSERT INTO trainer_briefs (
        member_id, gym_id, member_snapshot, gap_analysis, conversation_starters,
        upsell_signal, upsell_reasoning, red_flags, suggested_modifications,
        baseline_test_summary, generated_at
      ) VALUES (
        ${member.id}, ${gymId}, ${JSON.stringify(snapshot)},
        'Focus on progressive overload and nutrition consistency.',
        ${JSON.stringify(['How did your first week feel?', 'Any discomfort?'])},
        ${pick(['HIGH', 'MEDIUM', 'LOW'])},
        'Member has expressed interest in PT.',
        ${JSON.stringify([])},
        ${JSON.stringify(['Consider mobility work'])},
        'Push-ups: moderate. Plank: good.',
        ${new Date().toISOString()}
      )
    `;
    trainerBriefs++;
  }

  console.log(`Inserted ${mealPlans} meal plans and ${trainerBriefs} trainer briefs.`);

  const statusCounts = insertedMembers.reduce((acc, m) => {
    acc[m.processing_status] = (acc[m.processing_status] || 0) + 1;
    return acc;
  }, {});
  console.log('\nSummary:');
  console.log('  Members by status:', statusCounts);
  console.log('\nDone. View at /admin/demo-gym');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
