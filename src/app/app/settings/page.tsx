"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BillingManagement } from "@/components/BillingManagement";
import { getTenantInfo } from "@/app/actions/tenant";

function SettingsContent() {
  const searchParams = useSearchParams();
  const [tenantInfo, setTenantInfo] = useState<{
    id: string;
    name: string;
    plan: "free" | "premium" | "premium_plus";
    hasStripeSubscription: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCanceled, setShowCanceled] = useState(false);

  useEffect(() => {
    // Check for success/canceled query params
    if (searchParams?.get("success") === "true") {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    }
    if (searchParams?.get("canceled") === "true") {
      setShowCanceled(true);
      setTimeout(() => setShowCanceled(false), 5000);
    }

    // Load tenant info
    loadTenantInfo();
  }, [searchParams]);

  const loadTenantInfo = async () => {
    try {
      const result = await getTenantInfo();
      if (result.success && result.tenant) {
        setTenantInfo({
          id: result.tenant.id,
          name: result.tenant.name,
          plan: result.tenant.plan as "free" | "premium" | "premium_plus",
          hasStripeSubscription: !!result.tenant.stripeSubscriptionId,
        });
      }
    } catch (error) {
      console.error("Failed to load tenant info:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading settings...</div>;
  }

  if (!tenantInfo) {
    return <div className="text-center py-8 text-red-600">Failed to load tenant information</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your workspace, billing, and preferences</p>
      </div>

      {showSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          ✓ Subscription updated successfully!
        </div>
      )}

      {showCanceled && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
          Checkout was canceled. No charges were made.
        </div>
      )}

      <BillingManagement
        currentPlan={tenantInfo.plan}
        tenantId={tenantInfo.id}
        hasStripeSubscription={tenantInfo.hasStripeSubscription}
      />
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="text-center py-8">Loading settings...</div>}>
      <SettingsContent />
    </Suspense>
  );
}
