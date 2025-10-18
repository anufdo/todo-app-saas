"use client";

import { useState } from "react";
import { createTenant } from "@/app/actions/tenant";

export default function OnboardingPage() {
  const [name, setName] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await createTenant({ name, subdomain });

      if (result.error) {
        setError(result.error);
      } else if (result.success && result.tenant) {
        // Redirect to the new tenant subdomain
        const protocol = window.location.protocol;
        const newUrl = `${protocol}//${result.tenant.subdomain}.${window.location.host}/app/tasks`;
        window.location.href = newUrl;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create workspace";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold mb-2">Create Your Workspace</h1>
          <p className="text-gray-600 mb-8">Set up your organization to get started</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Organization Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="My Company"
                required
              />
              <p className="text-xs text-gray-500 mt-1">This is the name of your workspace</p>
            </div>

            <div>
              <label htmlFor="subdomain" className="block text-sm font-medium text-gray-700 mb-1">
                Workspace URL
              </label>
              <div className="flex items-center">
                <span className="text-gray-500">
                  {typeof window !== "undefined" && window.location.host}/
                </span>
                <input
                  type="text"
                  id="subdomain"
                  value={subdomain}
                  onChange={(e) => setSubdomain(e.target.value.toLowerCase())}
                  className="flex-1 px-4 py-2 border border-l-0 border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="my-workspace"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Use lowercase letters, numbers, and hyphens only
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {loading ? "Creating workspace..." : "Create Workspace"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
