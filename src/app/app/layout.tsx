"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const isTasksPage = pathname?.includes("/app/tasks");
  const isSettingsPage = pathname?.includes("/app/settings");

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
                  href="/app/settings"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isSettingsPage
                      ? "bg-blue-100 text-blue-800"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Settings
                </Link>
              </div>
            </div>
            <div className="flex items-center">
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
