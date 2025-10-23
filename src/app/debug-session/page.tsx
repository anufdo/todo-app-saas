"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function DebugSessionPage() {
  const { data: session, status } = useSession();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/app/tasks" className="text-blue-600 hover:underline">
            ← Back to App
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Session Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Status:</h3>
                <p className="font-mono bg-gray-100 p-2 rounded">{status}</p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Session Data:</h3>
                <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
                  {JSON.stringify(session, null, 2)}
                </pre>
              </div>

              {session?.user && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg mb-2">Quick Info:</h3>
                  <div className="bg-blue-50 p-3 rounded space-y-1">
                    <p><strong>Email:</strong> {session.user.email}</p>
                    <p><strong>Name:</strong> {session.user.name || "N/A"}</p>
                    <p><strong>Role:</strong> {session.user.role || "N/A"}</p>
                    <p><strong>Tenant ID:</strong> {session.user.tenantId || "N/A"}</p>
                    <p><strong>Subdomain:</strong> {session.user.subdomain || "N/A"}</p>
                    <p><strong>Has Tenant:</strong> {session.user.hasTenant ? "Yes" : "No"}</p>
                    <p><strong>Is Admin:</strong> {session.user.role === "admin" ? "✅ YES" : "❌ NO"}</p>
                  </div>
                </div>
              )}

              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
                <h3 className="font-semibold mb-2">💡 Note:</h3>
                <p className="text-sm">
                  If you just changed user roles or memberships in the database, you need to sign out and sign back in for the session to update.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
