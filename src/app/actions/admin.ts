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

    // Check if user has platform admin role (not just tenant owner/admin)
    const membership = await db.membership.findFirst({
      where: {
        userId: session.user.id,
        role: "admin" // Only platform admins
      }
    });

    if (!membership) {
      return { error: "Not authorized - Platform admin access required" };
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

    // Check if user has platform admin role
    const membership = await db.membership.findFirst({
      where: {
        userId: session.user.id,
        role: "admin"
      }
    });

    if (!membership) {
      return { error: "Not authorized - Platform admin access required" };
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

    // Check if user has platform admin role
    const membership = await db.membership.findFirst({
      where: {
        userId: session.user.id,
        role: "admin"
      }
    });

    if (!membership) {
      return { error: "Not authorized - Platform admin access required" };
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

    // Check if user has platform admin role (only platform admins can delete)
    const membership = await db.membership.findFirst({
      where: {
        userId: session.user.id,
        role: "admin"
      }
    });

    if (!membership) {
      return { error: "Not authorized - Only platform admins can delete tenants" };
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
