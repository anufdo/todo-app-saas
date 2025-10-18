export type Plan = "free" | "premium" | "premium_plus";
export type Role = "owner" | "admin" | "member";
export type TeamRole = "manager" | "member";

export interface TenantContext {
  tenantId: string;
  subdomain: string;
  plan: Plan;
  userId?: string;
  userRole?: Role;
}

export interface AuthSession {
  user?: {
    id: string;
    email: string;
    name?: string;
  };
  expires: string;
}

export const PLAN_LIMITS = {
  free: { tasks: 50, price: 0, priceMonthly: 0, priceYearly: 0 },
  premium: { tasks: 500, price: 999, priceMonthly: 999, priceYearly: 9990 }, // $9.99/mo, $99.90/yr (20% off)
  premium_plus: { tasks: -1, price: 2999, priceMonthly: 2999, priceYearly: 29990 }, // $29.99/mo, $299.90/yr
};

export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  owner: ["create", "read", "update", "delete", "invite", "billing"],
  admin: ["create", "read", "update", "delete", "invite"],
  member: ["create", "read", "update"],
};

export const TEAM_ROLE_PERMISSIONS: Record<TeamRole, string[]> = {
  manager: ["create", "read", "update", "delete", "assign"],
  member: ["read", "create"],
};

export function getTasksLimit(plan: Plan): number {
  const limit = PLAN_LIMITS[plan]?.tasks;
  if (typeof limit !== "number") return 50;
  return limit;
}

export function hasPermission(role: Role, action: string): boolean {
  return ROLE_PERMISSIONS[role as Role]?.includes(action) ?? false;
}

export function hasTeamPermission(role: TeamRole, action: string): boolean {
  return TEAM_ROLE_PERMISSIONS[role as TeamRole]?.includes(action) ?? false;
}
