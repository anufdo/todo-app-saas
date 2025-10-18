"use client";

interface UpgradeCtaProps {
  plan: "free" | "premium" | "premium_plus";
  taskCount: number;
  taskLimit: number;
}

export function UpgradeCta({ plan, taskCount, taskLimit }: UpgradeCtaProps) {
  const percentageUsed = Math.round((taskCount / taskLimit) * 100);
  const canUpgrade = plan === "free" || plan === "premium";

  if (plan === "premium_plus" || taskLimit === -1) {
    return null; // No limit for premium_plus
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-blue-900 mb-1">Task Limit</h3>
          <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${Math.min(percentageUsed, 100)}%` }}
            />
          </div>
          <p className="text-sm text-blue-800">
            {taskCount} of {taskLimit} tasks used ({percentageUsed}%)
          </p>
        </div>
        {canUpgrade && percentageUsed >= 80 && (
          <button className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium whitespace-nowrap">
            Upgrade Plan
          </button>
        )}
      </div>
      {taskCount >= taskLimit && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
          You've reached your task limit. Upgrade to create more tasks.
        </div>
      )}
    </div>
  );
}
