"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { CreateTenantSchema, CreateTenantInput } from "@/lib/validations";

export async function createTenant(input: CreateTenantInput & { userId: string | null }) {
  try {
    // Destructure and validate
    const { name, subdomain, userId } = input;
    const data = CreateTenantSchema.parse({ name, subdomain });

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

export async function getTenantInfo() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { error: "Not authenticated" };
    }

    // Get user's primary tenant (first membership)
    const membership = await db.membership.findFirst({
      where: { userId: session.user.id },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            subdomain: true,
            plan: true,
            stripeCustomerId: true,
            stripeSubscriptionId: true,
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    if (!membership || !membership.tenant) {
      return { error: "No tenant found" };
    }

    return { success: true, tenant: membership.tenant };
  } catch (error) {
    console.error("Get tenant info error:", error);
    return { error: "Failed to fetch tenant information" };
  }
}
