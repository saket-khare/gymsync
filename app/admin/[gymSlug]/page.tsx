import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getGymConfig } from '@/lib/gym-config';
import { getAllRows } from '@/lib/google-sheets';
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
    if (gymConfig.googleSheetId) {
      members = await getAllRows(gymConfig.googleSheetId);
    }
  } catch {
    // Sheet not configured or empty — show empty state
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
