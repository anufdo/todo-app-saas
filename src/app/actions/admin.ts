"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getAllTenants() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { error: "Not authenticated" };
    }

    // Check if user is admin or owner
    const membership = await db.membership.findFirst({
      where: {
        userId: session.user.id,
        role: { in: ["admin", "owner"] }
      }
    });

    if (!membership) {
      return { error: "Not authorized" };
    }

    const tenants = await db.tenant.findMany({
      include: {
        _count: {
          select: {
            users: true,
            memberships: true,
            tasks: true
          }
        },
        usageCounter: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return { success: true, tenants };
  } catch (error) {
    console.error("Get tenants error:", error);
    return { error: "Failed to fetch tenants" };
  }
}

export async function updateTenantPlan(tenantId: string, plan: "free" | "premium" | "premium_plus") {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { error: "Not authenticated" };
    }

    // Check if user is admin or owner
    const membership = await db.membership.findFirst({
      where: {
        userId: session.user.id,
        role: { in: ["admin", "owner"] }
      }
    });

    if (!membership) {
      return { error: "Not authorized" };
    }

    const tenant = await db.tenant.update({
      where: { id: tenantId },
      data: { plan }
    });

    revalidatePath("/admin");
    return { success: true, tenant };
  } catch (error) {
    console.error("Update tenant plan error:", error);
    return { error: "Failed to update tenant plan" };
  }
}

export async function updateTenantStatus(tenantId: string, status: string) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { error: "Not authenticated" };
    }

    // Check if user is admin or owner
    const membership = await db.membership.findFirst({
      where: {
        userId: session.user.id,
        role: { in: ["admin", "owner"] }
      }
    });

    if (!membership) {
      return { error: "Not authorized" };
    }

    const tenant = await db.tenant.update({
      where: { id: tenantId },
      data: { status }
    });

    revalidatePath("/admin");
    return { success: true, tenant };
  } catch (error) {
    console.error("Update tenant status error:", error);
    return { error: "Failed to update tenant status" };
  }
}

export async function deleteTenant(tenantId: string) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { error: "Not authenticated" };
    }

    // Check if user is owner (only owners can delete)
    const membership = await db.membership.findFirst({
      where: {
        userId: session.user.id,
        role: "owner"
      }
    });

    if (!membership) {
      return { error: "Not authorized - only owners can delete tenants" };
    }

    await db.tenant.delete({
      where: { id: tenantId }
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Delete tenant error:", error);
    return { error: "Failed to delete tenant" };
  }
}
