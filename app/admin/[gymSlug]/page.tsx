import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getGymConfig } from '@/lib/gym-config';
import {
  listMembersByGym,
  listMealPlansByGym,
  getDashboardIntelligence,
  getHighSignalMembers,
} from '@/lib/db';
import AdminDashboard from './AdminDashboard';
import type { SheetRow } from '@/types';

interface Props {
  params: Promise<{ gymSlug: string }>;
}

export default async function AdminGymPage({ params }: Props) {
  const { gymSlug } = await params;
  const session = await auth();

  if (!session) {
    redirect('/admin/login');
  }

  const sessionGymSlug = (session.user as { gymSlug?: string }).gymSlug;
  if (sessionGymSlug !== gymSlug) {
    redirect(`/admin/${sessionGymSlug}`);
  }

  const gymConfig = await getGymConfig(gymSlug);
  if (!gymConfig) {
    redirect('/admin/login');
  }

  let members: SheetRow[] = [];
  try {
    const dbMembers = await listMembersByGym(gymSlug);
    // Map DB rows to SheetRow format for compatibility with AdminDashboard
    members = dbMembers.map((m) => ({
      id: m.id,
      rowId: m.rowId,
      firstName: m.firstName,
      lastName: m.lastName,
      email: m.email,
      phone: m.phone,
      age: m.age,
      gender: m.gender,
      city: m.city,
      primaryGoal: m.primaryGoal,
      goalUrgency: m.goalUrgency,
      timelineMonths: m.timelineMonths as SheetRow['timelineMonths'],
      goalDetails: m.goalDetails ?? undefined,
      weightKg: m.weightKg,
      heightCm: m.heightCm,
      bodyFatPercent: m.bodyFatPercent ?? undefined,
      selfRatedFitness: m.selfRatedFitness as SheetRow['selfRatedFitness'],
      gymExperience: m.gymExperience,
      dietType: m.dietType,
      sleepHoursPerNight: m.sleepHoursPerNight,
      stressLevel: m.stressLevel as SheetRow['stressLevel'],
      occupationType: m.occupationType,
      medicalConditions: m.medicalConditions ?? undefined,
      injuries: m.injuries ?? undefined,
      foodAllergies: m.foodAllergies ?? undefined,
      daysPerWeekAvailable: m.daysPerWeekAvailable as SheetRow['daysPerWeekAvailable'],
      sessionDurationMinutes: m.sessionDurationMinutes as SheetRow['sessionDurationMinutes'],
      hasHomeEquipment: m.hasHomeEquipment,
      interestedInPT: m.interestedInPT,
      budgetForSupplements: m.budgetForSupplements,
      pushUpCount: m.pushUpCount ?? undefined,
      plankHoldSeconds: m.plankHoldSeconds ?? undefined,
      flexibilityTest: m.flexibilityTest ?? undefined,
      restingHeartRate: m.restingHeartRate ?? undefined,
      gymSlug: m.gymSlug,
      submittedAt: m.submittedAt,
      processingStatus: m.processingStatus,
      mealPlanGenerated: m.mealPlanGenerated,
      emailSent: m.emailSent,
      day3Sent: m.day3Sent,
      day7Sent: m.day7Sent,
      day30Sent: m.day30Sent,
      memberStatus: m.memberStatus ?? 'converted',
      leadSource: m.leadSource ?? undefined,
      convertedAt: m.convertedAt ? new Date(m.convertedAt).toISOString() : undefined,
    }));
  } catch {
    // DB not configured or empty — show empty state
  }

  let mealPlanByRowId: Record<string, { generatedAt: string }> = {};
  try {
    const plans = await listMealPlansByGym(gymSlug);
    mealPlanByRowId = Object.fromEntries(
      plans.map((p) => [p.rowId, { generatedAt: p.generatedAt }])
    );
  } catch {
    // ignore
  }

  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  const stats = {
    total: members.length,
    thisMonth: members.filter((m) => {
      const d = new Date(m.submittedAt);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    }).length,
    pending: members.filter((m) => m.processingStatus === 'pending').length,
    emailsSent: members.filter((m) => m.emailSent).length,
    mealPlansGenerated: members.filter((m) => m.mealPlanGenerated).length,
  };

  let dashboardIntelligence: Awaited<ReturnType<typeof getDashboardIntelligence>> | null = null;
  let highSignalMembers: Awaited<ReturnType<typeof getHighSignalMembers>> = [];
  try {
    [dashboardIntelligence, highSignalMembers] = await Promise.all([
      getDashboardIntelligence(gymConfig.id),
      getHighSignalMembers(gymConfig.id, 10),
    ]);
  } catch {
    // ignore
  }

  return (
    <AdminDashboard
      gymConfig={gymConfig}
      members={members}
      stats={stats}
      mealPlanByRowId={mealPlanByRowId}
      dashboardIntelligence={dashboardIntelligence}
      highSignalMembers={highSignalMembers}
    />
  );
}
