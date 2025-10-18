import { headers } from "next/headers";
import { db } from "./db";
import type { TenantContext } from "@/types";

/**
 * Extract tenant ID from request headers or context
 * Set by middleware before route handler
 */
export async function getTenantContext(): Promise<TenantContext | null> {
  try {
    const headersList = await headers();
    const tenantId = headersList.get("x-tenant-id");
    const subdomain = headersList.get("x-subdomain") || "app";
    const plan = (headersList.get("x-plan") || "free") as "free" | "premium" | "premium_plus";

    if (!tenantId) return null;

    return {
      tenantId,
      subdomain,
      plan,
    };
  } catch (error) {
    console.error("Error getting tenant context:", error);
    return null;
  }
}

/**
 * Get tenant by subdomain
 */
export async function getTenantBySubdomain(subdomain: string) {
  return db.tenant.findUnique({
    where: { subdomain },
  });
}

/**
 * Set tenant context in Prisma global scope
 */
export function setTenantContext(tenantId: string) {
  (globalThis as Record<string, unknown>).__tenantId = tenantId;
}

/**
 * Clear tenant context
 */
export function clearTenantContext() {
  delete (globalThis as Record<string, unknown>).__tenantId;
}
