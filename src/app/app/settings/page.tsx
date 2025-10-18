"use client";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Settings</h1>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Workspace Settings</h2>
        <p className="text-gray-600 mb-6">Manage your workspace and billing settings</p>

        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-900">Plan Information</h3>
            <p className="text-sm text-gray-600 mt-1">
              View and manage your current plan. Upgrade to unlock more features.
            </p>
            <button className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Manage Billing
            </button>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <h3 className="font-medium text-gray-900">Workspace Members</h3>
            <p className="text-sm text-gray-600 mt-1">
              Manage team members and their permissions
            </p>
            <button className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Manage Members
            </button>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <h3 className="font-medium text-gray-900">Advanced</h3>
            <p className="text-sm text-gray-600 mt-1">
              Danger zone - advanced workspace operations
            </p>
            <button className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              Delete Workspace
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
