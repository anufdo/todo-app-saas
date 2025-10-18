"use client";

export function PlanBadge({ plan }: { plan: string }) {
  const planColors: Record<string, { bg: string; text: string; label: string }> = {
    free: { bg: "bg-gray-100", text: "text-gray-800", label: "Free" },
    premium: { bg: "bg-blue-100", text: "text-blue-800", label: "Premium" },
    premium_plus: { bg: "bg-purple-100", text: "text-purple-800", label: "Premium Plus" },
  };

  const colors = planColors[plan] || planColors.free;

  return (
    <span className={`${colors.bg} ${colors.text} px-3 py-1 rounded-full text-xs font-semibold`}>
      {colors.label}
    </span>
  );
}
