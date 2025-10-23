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

export async function getAllUsers() {
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

    const users = await db.user.findMany({
      include: {
        memberships: {
          include: {
            tenant: {
              select: {
                id: true,
                name: true,
                subdomain: true
              }
            }
          }
        },
        _count: {
          select: {
            tasks: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return { success: true, users };
  } catch (error) {
    console.error("Get users error:", error);
    return { error: "Failed to fetch users" };
  }
}

export async function updateUserRole(userId: string, tenantId: string, role: string) {
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

    // Validate role
    if (!["member", "owner", "admin"].includes(role)) {
      return { error: "Invalid role" };
    }

    const userMembership = await db.membership.updateMany({
      where: { 
        userId,
        tenantId
      },
      data: { role: role as "member" | "owner" | "admin" }
    });

    revalidatePath("/admin/users");
    return { success: true, membership: userMembership };
  } catch (error) {
    console.error("Update user role error:", error);
    return { error: "Failed to update user role" };
  }
}

export async function deleteUser(userId: string) {
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

    // Prevent deleting yourself
    if (userId === session.user.id) {
      return { error: "Cannot delete your own account" };
    }

    await db.user.delete({
      where: { id: userId }
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Delete user error:", error);
    return { error: "Failed to delete user" };
  }
}
