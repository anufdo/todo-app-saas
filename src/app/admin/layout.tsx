"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  const isAdminHome = pathname === "/admin";

  const handleSignOut = async () => {
    router.push("/auth/signin");
  };

  // Check if user is admin (platform-level admin only, not tenant owner)
  const isAdmin = session?.user?.role === "admin";

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You don&apos;t have permission to access the admin panel.</p>
          <Link href="/app/tasks" className="text-blue-600 hover:underline">
            Go to Tasks
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/admin" className="font-bold text-lg">
                🛡️ Admin Panel
              </Link>
              <div className="ml-10 flex space-x-4">
                <Link
                  href="/admin"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isAdminHome
                      ? "bg-blue-100 text-blue-800"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Tenants
                </Link>
                <Link
                  href="/app/tasks"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  Back to App
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {session?.user && (
                <div className="text-sm">
                  <span className="font-medium text-gray-700">{session.user.name || session.user.email}</span>
                  {session.user.role && (
                    <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-semibold">
                      {session.user.role.toUpperCase()}
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
