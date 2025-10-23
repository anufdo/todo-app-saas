"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  const isTasksPage = pathname?.includes("/app/tasks");
  const isTeamsPage = pathname?.includes("/app/teams");
  const isSettingsPage = pathname?.includes("/app/settings");
  // Only show admin link for platform admins (not tenant owners)
  const isAdmin = session?.user?.role === "admin";

  // Debug logging
  if (typeof window !== 'undefined') {
    console.log('🔍 Session Debug:', {
      email: session?.user?.email,
      role: session?.user?.role,
      isAdmin,
      shouldShowAdminMenu: isAdmin
    });
  }

  const handleSignOut = async () => {
    // TODO: Sign out user
    router.push("/auth/signin");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/app/tasks" className="font-bold text-lg">
                Todo SaaS
              </Link>
              <div className="ml-10 flex space-x-4">
                <Link
                  href="/app/tasks"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isTasksPage
                      ? "bg-blue-100 text-blue-800"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Tasks
                </Link>
                <Link
                  href="/app/teams"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isTeamsPage
                      ? "bg-blue-100 text-blue-800"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Teams
                </Link>
                <Link
                  href="/app/settings"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isSettingsPage
                      ? "bg-blue-100 text-blue-800"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Settings
                </Link>
                {isAdmin && (
                  <>
                    <Link
                      href="/admin"
                      className="px-3 py-2 rounded-md text-sm font-medium bg-purple-100 text-purple-700 hover:bg-purple-200 font-semibold"
                    >
                      🛡️ Admin Panel
                    </Link>
                    <Link
                      href="/admin/users"
                      className="px-3 py-2 rounded-md text-sm font-medium text-purple-600 hover:text-purple-800 hover:bg-purple-50"
                    >
                      All Users
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              {session?.user && (
                <div className="text-sm text-gray-700">
                  <span className="font-medium">{session.user.name || session.user.email}</span>
                  {session.user.role && (
                    <span className={`ml-2 text-xs px-2 py-1 rounded-full font-semibold ${
                      session.user.role === 'admin' 
                        ? 'bg-purple-100 text-purple-700' 
                        : session.user.role === 'owner'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {session.user.role}
                    </span>
                  )}
                </div>
              )}
              <button
                onClick={handleSignOut}
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
