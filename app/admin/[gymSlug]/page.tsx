import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getGymConfig } from '@/lib/gym-config';
import { getConvexClient } from '@/lib/convex';
import { api } from '@/convex/_generated/api';
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
    const convex = getConvexClient();
    const convexMembers = await convex.query(api.members.listByGym, { gymSlug });
    // Map Convex documents to SheetRow format for compatibility with AdminDashboard
    members = convexMembers.map((m) => ({
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
      goalDetails: m.goalDetails,
      weightKg: m.weightKg,
      heightCm: m.heightCm,
      bodyFatPercent: m.bodyFatPercent,
      selfRatedFitness: m.selfRatedFitness as SheetRow['selfRatedFitness'],
      gymExperience: m.gymExperience,
      dietType: m.dietType,
      sleepHoursPerNight: m.sleepHoursPerNight,
      stressLevel: m.stressLevel as SheetRow['stressLevel'],
      occupationType: m.occupationType,
      medicalConditions: m.medicalConditions,
      injuries: m.injuries,
      foodAllergies: m.foodAllergies,
      daysPerWeekAvailable: m.daysPerWeekAvailable as SheetRow['daysPerWeekAvailable'],
      sessionDurationMinutes: m.sessionDurationMinutes as SheetRow['sessionDurationMinutes'],
      hasHomeEquipment: m.hasHomeEquipment,
      interestedInPT: m.interestedInPT,
      budgetForSupplements: m.budgetForSupplements,
      pushUpCount: m.pushUpCount,
      plankHoldSeconds: m.plankHoldSeconds,
      flexibilityTest: m.flexibilityTest,
      restingHeartRate: m.restingHeartRate,
      gymSlug: m.gymSlug,
      submittedAt: m.submittedAt,
      processingStatus: m.processingStatus,
      mealPlanGenerated: m.mealPlanGenerated,
      emailSent: m.emailSent,
      day3Sent: m.day3Sent,
      day7Sent: m.day7Sent,
      day30Sent: m.day30Sent,
    }));
  } catch {
    // Convex not configured or empty — show empty state
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
    emailsSent: members.filter((m) => m.emailSent).length,
    highPTLeads: members.filter(
      (m) =>
        m.interestedInPT === 'yes' &&
        (m.gymExperience === 'complete_beginner' || m.gymExperience === 'beginner'),
    ).length,
  };

  return (
    <AdminDashboard gymConfig={gymConfig} members={members} stats={stats} />
  );
}
