"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PLAN_LIMITS } from "@/types";

interface BillingManagementProps {
  currentPlan: "free" | "premium" | "premium_plus";
  tenantId: string;
  hasStripeSubscription: boolean;
}

export function BillingManagement({ currentPlan, tenantId, hasStripeSubscription }: BillingManagementProps) {
  const [loading, setLoading] = useState(false);
  const [selectedInterval, setSelectedInterval] = useState<"monthly" | "yearly">("monthly");

  const handleUpgrade = async (plan: "premium" | "premium_plus") => {
    setLoading(true);
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan,
          interval: selectedInterval,
          tenantId,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Failed to create checkout session");
      }
    } catch (error) {
      console.error("Upgrade error:", error);
      alert("Failed to start upgrade process");
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Failed to access billing portal");
      }
    } catch (error) {
      console.error("Portal error:", error);
      alert("Failed to access billing portal");
    } finally {
      setLoading(false);
    }
  };

  const getPlanPrice = (plan: "premium" | "premium_plus") => {
    const prices = PLAN_LIMITS[plan];
    if (selectedInterval === "yearly") {
      return `$${(prices.priceYearly / 100).toFixed(2)}/year`;
    }
    return `$${(prices.priceMonthly / 100).toFixed(2)}/month`;
  };

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold capitalize">
                {currentPlan.replace("_", " ")} Plan
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {currentPlan === "free" && "50 tasks maximum"}
                {currentPlan === "premium" && "500 tasks maximum"}
                {currentPlan === "premium_plus" && "Unlimited tasks + Teams"}
              </p>
            </div>
            {hasStripeSubscription && (
              <Button
                onClick={handleManageSubscription}
                disabled={loading}
                variant="outline"
              >
                {loading ? "Loading..." : "Manage Subscription"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Options */}
      {currentPlan !== "premium_plus" && (
        <Card>
          <CardHeader>
            <CardTitle>Upgrade Your Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="flex gap-4 mb-6">
                <button
                  onClick={() => setSelectedInterval("monthly")}
                  className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors ${
                    selectedInterval === "monthly"
                      ? "border-blue-600 bg-blue-50 text-blue-700 font-semibold"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setSelectedInterval("yearly")}
                  className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors ${
                    selectedInterval === "yearly"
                      ? "border-blue-600 bg-blue-50 text-blue-700 font-semibold"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  Yearly
                  <span className="ml-2 text-xs text-green-600 font-semibold">Save 20%</span>
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Premium Plan */}
              {currentPlan === "free" && (
                <div className="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-500 transition-colors">
                  <h3 className="text-xl font-bold mb-2">Premium</h3>
                  <div className="text-3xl font-bold text-blue-600 mb-4">
                    {getPlanPrice("premium")}
                  </div>
                  <ul className="space-y-3 mb-6 text-sm">
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      500 tasks maximum
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      Priority support
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      Advanced reporting
                    </li>
                  </ul>
                  <Button
                    onClick={() => handleUpgrade("premium")}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? "Loading..." : "Upgrade to Premium"}
                  </Button>
                </div>
              )}

              {/* Premium Plus Plan */}
              <div className="border-2 border-purple-200 rounded-lg p-6 bg-purple-50 hover:border-purple-500 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold">Premium Plus</h3>
                  <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded-full font-semibold">
                    BEST VALUE
                  </span>
                </div>
                <div className="text-3xl font-bold text-purple-600 mb-4">
                  {getPlanPrice("premium_plus")}
                </div>
                <ul className="space-y-3 mb-6 text-sm">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Unlimited tasks
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Team management with roles
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Manager & member hierarchy
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Priority support
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Advanced reporting
                  </li>
                </ul>
                <Button
                  onClick={() => handleUpgrade("premium_plus")}
                  disabled={loading}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {loading ? "Loading..." : "Upgrade to Premium Plus"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
