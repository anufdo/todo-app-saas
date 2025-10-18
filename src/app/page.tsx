import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export default async function Home() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  // Check if user has any tenants
  const membership = await db.membership.findFirst({
    where: { userId: session.user.id },
    include: { tenant: true },
  });

  if (membership) {
    // Redirect to their workspace
    const isLocalhost = process.env.NODE_ENV === 'development';
    if (isLocalhost) {
      redirect(`/app/tasks?tenant=${membership.tenant.subdomain}`);
    } else {
      // In production, this would redirect to subdomain
      redirect(`/app/tasks`);
    }
  } else {
    // No workspace, go to onboarding
    redirect('/onboarding');
  }
}
