"use server";

import { db } from "@/lib/db";
import { CreateTenantSchema } from "@/lib/validations";
import { headers } from "next/headers";

export async function createTenant(input: unknown) {
  try {
    // Validate input
    const data = CreateTenantSchema.parse(input);

    // This would normally use NextAuth session, but for now we get it from headers
    const headersList = await headers();
    const userId = headersList.get("x-user-id");

    if (!userId) {
      return { error: "Not authenticated" };
    }

    // Check if subdomain is taken
    const existingTenant = await db.tenant.findUnique({
      where: { subdomain: data.subdomain },
    });

    if (existingTenant) {
      return { error: "Subdomain already taken" };
    }

    // Create tenant
    const tenant = await db.tenant.create({
      data: {
        name: data.name,
        subdomain: data.subdomain,
        plan: "free",
      },
    });

    // Create membership (user is owner)
    await db.membership.create({
      data: {
        userId,
        tenantId: tenant.id,
        role: "owner",
      },
    });

    // Create usage counter
    await db.usageCounter.create({
      data: {
        tenantId: tenant.id,
        taskCount: 0,
      },
    });

    return { success: true, tenant };
  } catch (error: unknown) {
    console.error("Create tenant error:", error);
    const msg = error instanceof Error ? error.message : "Failed to create tenant";
    return { error: msg };
  }
}
