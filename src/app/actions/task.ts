"use server";

import { db } from "@/lib/db";
import { setTenantContext, clearTenantContext } from "@/lib/tenant";
import { CreateTaskSchema, UpdateTaskSchema } from "@/lib/validations";
import { getTasksLimit } from "@/types";
import { headers } from "next/headers";

/**
 * Create a new task
 */
export async function createTask(input: unknown) {
  try {
    // Validate input
    const data = CreateTaskSchema.parse(input);

    // Get tenant context from headers
    const headersList = await headers();
    const tenantId = headersList.get("x-tenant-id");
    const plan = (headersList.get("x-plan") || "free") as "free" | "premium" | "premium_plus";
    const userId = headersList.get("x-user-id");

    if (!tenantId || !userId) {
      return { error: "Not authorized" };
    }

    // Check task limit
    const usage = await db.usageCounter.findUnique({
      where: { tenantId },
    });

    const limit = getTasksLimit(plan);
    if (limit > 0 && usage && usage.taskCount >= limit) {
      return { error: `Task limit reached (${limit} tasks)` };
    }

    setTenantContext(tenantId);

    // Create task
    const task = await db.task.create({
      data: {
        tenantId,
        title: data.title,
        description: data.description,
        dueDate: data.dueDate,
        teamId: data.teamId,
        createdBy: userId,
      },
    });

    // Update usage counter
    if (usage) {
      await db.usageCounter.update({
        where: { tenantId },
        data: { taskCount: { increment: 1 } },
      });
    }

    // Log activity
    await db.taskActivity.create({
      data: {
        tenantId,
        taskId: task.id,
        action: "created",
        userId,
        details: JSON.stringify({ title: task.title }),
      },
    });

    clearTenantContext();
    return { success: true, task };
  } catch (error: unknown) {
    clearTenantContext();
    const errorMessage = error instanceof Error ? error.message : "Failed to create task";
    console.error("Create task error:", error);
    return { error: errorMessage };
  }
}

/**
 * Get all tasks for current tenant
 */
export async function getTasks() {
  try {
    const headersList = await headers();
    const tenantId = headersList.get("x-tenant-id");

    if (!tenantId) {
      return { error: "Not authorized" };
    }

    setTenantContext(tenantId);

    const tasks = await db.task.findMany({
      where: { tenantId },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        team: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    clearTenantContext();
    return { success: true, tasks };
  } catch (error: unknown) {
    clearTenantContext();
    console.error("Get tasks error:", error);
    const msg = error instanceof Error ? error.message : "Failed to fetch tasks";
    return { error: msg };
  }
}

/**
 * Update a task
 */
export async function updateTask(taskId: string, input: unknown) {
  try {
    const data = UpdateTaskSchema.parse(input);

    const headersList = await headers();
    const tenantId = headersList.get("x-tenant-id");
    const userId = headersList.get("x-user-id");

    if (!tenantId || !userId) {
      return { error: "Not authorized" };
    }

    setTenantContext(tenantId);

    // Verify task belongs to tenant
    const existingTask = await db.task.findUnique({
      where: { id: taskId },
    });

    if (!existingTask || existingTask.tenantId !== tenantId) {
      clearTenantContext();
      return { error: "Task not found" };
    }

    // Update task
    const task = await db.task.update({
      where: { id: taskId },
      data,
    });

    // Log activity
    await db.taskActivity.create({
      data: {
        tenantId,
        taskId,
        action: "updated",
        userId,
        details: JSON.stringify(data),
      },
    });

    clearTenantContext();
    return { success: true, task };
  } catch (error: unknown) {
    clearTenantContext();
    console.error("Update task error:", error);
    const msg = error instanceof Error ? error.message : "Failed to update task";
    return { error: msg };
  }
}

/**
 * Delete a task
 */
export async function deleteTask(taskId: string) {
  try {
    const headersList = await headers();
    const tenantId = headersList.get("x-tenant-id");
    const userId = headersList.get("x-user-id");

    if (!tenantId || !userId) {
      return { error: "Not authorized" };
    }

    setTenantContext(tenantId);

    // Verify task belongs to tenant
    const existingTask = await db.task.findUnique({
      where: { id: taskId },
    });

    if (!existingTask || existingTask.tenantId !== tenantId) {
      clearTenantContext();
      return { error: "Task not found" };
    }

    // Delete task
    await db.task.delete({
      where: { id: taskId },
    });

    // Update usage counter
    const usage = await db.usageCounter.findUnique({
      where: { tenantId },
    });

    if (usage && usage.taskCount > 0) {
      await db.usageCounter.update({
        where: { tenantId },
        data: { taskCount: { decrement: 1 } },
      });
    }

    // Log activity
    await db.taskActivity.create({
      data: {
        tenantId,
        action: "deleted",
        userId,
        details: JSON.stringify({ title: existingTask.title }),
      },
    });

    clearTenantContext();
    return { success: true };
  } catch (error: unknown) {
    clearTenantContext();
    console.error("Delete task error:", error);
    const msg = error instanceof Error ? error.message : "Failed to delete task";
    return { error: msg };
  }
}

/**
 * Toggle task completion
 */
export async function toggleTaskCompletion(taskId: string) {
  try {
    const headersList = await headers();
    const tenantId = headersList.get("x-tenant-id");
    const userId = headersList.get("x-user-id");

    if (!tenantId || !userId) {
      return { error: "Not authorized" };
    }

    setTenantContext(tenantId);

    // Get task
    const existingTask = await db.task.findUnique({
      where: { id: taskId },
    });

    if (!existingTask || existingTask.tenantId !== tenantId) {
      clearTenantContext();
      return { error: "Task not found" };
    }

    // Toggle completion
    const task = await db.task.update({
      where: { id: taskId },
      data: { completed: !existingTask.completed },
    });

    // Log activity
    await db.taskActivity.create({
      data: {
        tenantId,
        taskId,
        action: existingTask.completed ? "reopened" : "completed",
        userId,
      },
    });

    clearTenantContext();
    return { success: true, task };
  } catch (error: unknown) {
    clearTenantContext();
    console.error("Toggle task completion error:", error);
    const msg = error instanceof Error ? error.message : "Failed to update task";
    return { error: msg };
  }
}
