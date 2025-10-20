"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getTeams() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { error: "Not authenticated" };
    }

    // Get tenant ID from headers (set by middleware)
    const { headers } = await import("next/headers");
    const headersList = await headers();
    const tenantId = headersList.get("x-tenant-id");
    const plan = headersList.get("x-plan");

    if (!tenantId) {
      return { error: "No tenant context" };
    }

    // Teams are Premium Plus only
    if (plan !== "premium_plus") {
      return { error: "Teams feature requires Premium Plus plan", requiresUpgrade: true };
    }

    const teams = await db.team.findMany({
      where: { tenantId },
      include: {
        _count: {
          select: {
            members: true,
            tasks: true,
          }
        },
        members: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return { success: true, teams };
  } catch (error) {
    console.error("Get teams error:", error);
    return { error: "Failed to fetch teams" };
  }
}

export async function createTeam(input: { name: string; description?: string }) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { error: "Not authenticated" };
    }

    const { headers } = await import("next/headers");
    const headersList = await headers();
    const tenantId = headersList.get("x-tenant-id");
    const plan = headersList.get("x-plan");

    if (!tenantId) {
      return { error: "No tenant context" };
    }

    if (plan !== "premium_plus") {
      return { error: "Teams feature requires Premium Plus plan" };
    }

    // Check if user is admin or owner
    const membership = await db.membership.findFirst({
      where: {
        userId: session.user.id,
        tenantId,
        role: { in: ["owner", "admin"] }
      }
    });

    if (!membership) {
      return { error: "Only owners and admins can create teams" };
    }

    const team = await db.team.create({
      data: {
        tenantId,
        name: input.name,
        description: input.description,
      }
    });

    revalidatePath("/app/teams");
    return { success: true, team };
  } catch (error) {
    console.error("Create team error:", error);
    return { error: "Failed to create team" };
  }
}

export async function addTeamMember(teamId: string, userId: string, role: "manager" | "member") {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { error: "Not authenticated" };
    }

    const { headers } = await import("next/headers");
    const headersList = await headers();
    const tenantId = headersList.get("x-tenant-id");

    if (!tenantId) {
      return { error: "No tenant context" };
    }

    // Check if requesting user is admin/owner or manager of the team
    const membership = await db.membership.findFirst({
      where: {
        userId: session.user.id,
        tenantId,
        role: { in: ["owner", "admin"] }
      }
    });

    const teamMembership = await db.teamMembership.findFirst({
      where: {
        userId: session.user.id,
        teamId,
        role: "manager"
      }
    });

    if (!membership && !teamMembership) {
      return { error: "Only owners, admins, or team managers can add members" };
    }

    // Check if user already exists in team
    const existing = await db.teamMembership.findUnique({
      where: {
        userId_teamId: {
          userId,
          teamId
        }
      }
    });

    if (existing) {
      return { error: "User is already a member of this team" };
    }

    const newMember = await db.teamMembership.create({
      data: {
        userId,
        teamId,
        role
      }
    });

    revalidatePath("/app/teams");
    return { success: true, member: newMember };
  } catch (error) {
    console.error("Add team member error:", error);
    return { error: "Failed to add team member" };
  }
}

export async function removeTeamMember(teamId: string, userId: string) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { error: "Not authenticated" };
    }

    const { headers } = await import("next/headers");
    const headersList = await headers();
    const tenantId = headersList.get("x-tenant-id");

    if (!tenantId) {
      return { error: "No tenant context" };
    }

    // Check permissions
    const membership = await db.membership.findFirst({
      where: {
        userId: session.user.id,
        tenantId,
        role: { in: ["owner", "admin"] }
      }
    });

    const teamMembership = await db.teamMembership.findFirst({
      where: {
        userId: session.user.id,
        teamId,
        role: "manager"
      }
    });

    if (!membership && !teamMembership) {
      return { error: "Only owners, admins, or team managers can remove members" };
    }

    await db.teamMembership.delete({
      where: {
        userId_teamId: {
          userId,
          teamId
        }
      }
    });

    revalidatePath("/app/teams");
    return { success: true };
  } catch (error) {
    console.error("Remove team member error:", error);
    return { error: "Failed to remove team member" };
  }
}

export async function deleteTeam(teamId: string) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { error: "Not authenticated" };
    }

    const { headers } = await import("next/headers");
    const headersList = await headers();
    const tenantId = headersList.get("x-tenant-id");

    if (!tenantId) {
      return { error: "No tenant context" };
    }

    // Check if user is admin or owner
    const membership = await db.membership.findFirst({
      where: {
        userId: session.user.id,
        tenantId,
        role: { in: ["owner", "admin"] }
      }
    });

    if (!membership) {
      return { error: "Only owners and admins can delete teams" };
    }

    await db.team.delete({
      where: { id: teamId }
    });

    revalidatePath("/app/teams");
    return { success: true };
  } catch (error) {
    console.error("Delete team error:", error);
    return { error: "Failed to delete team" };
  }
}

export async function getTenantMembers() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { error: "Not authenticated" };
    }

    const { headers } = await import("next/headers");
    const headersList = await headers();
    const tenantId = headersList.get("x-tenant-id");

    if (!tenantId) {
      return { error: "No tenant context" };
    }

    const members = await db.membership.findMany({
      where: { tenantId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    return { success: true, members };
  } catch (error) {
    console.error("Get tenant members error:", error);
    return { error: "Failed to fetch members" };
  }
}
