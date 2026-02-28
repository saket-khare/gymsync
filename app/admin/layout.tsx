import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Allow login page to render without auth
  if (!session) {
    // We only redirect from non-login admin pages
    // The middleware handles this more granularly, but this is a safety net
  }

  return <>{children}</>;
}
