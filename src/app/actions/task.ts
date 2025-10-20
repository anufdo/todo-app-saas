"use server";

import { db } from "@/lib/db";
import { setTenantContext, clearTenantContext } from "@/lib/tenant";
import { CreateTaskSchema, UpdateTaskSchema } from "@/lib/validations";
import { getTasksLimit, type Plan } from "@/types";
import { headers } from "next/headers";

/**
 * Create a new task
 */
export async function createTask(input: unknown) {
  const headersList = await headers();
  const tenantId = headersList.get("x-tenant-id");
  const plan = (headersList.get("x-plan") || "free") as Plan;
  const userId = headersList.get("x-user-id");

  if (!tenantId || !userId) {
    return { error: "Not authorized" };
  }

  try {
    const data = CreateTaskSchema.parse(input);

    let usage = await db.usageCounter.findUnique({
      where: { tenantId },
    });

    if (!usage) {
      usage = await db.usageCounter.create({
        data: {
          tenantId,
          taskCount: 0,
        },
      });
    }

    const limit = getTasksLimit(plan);
    if (limit > 0 && usage.taskCount >= limit) {
      return { error: `Task limit reached (${limit} tasks)` };
    }

    setTenantContext(tenantId);

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

    await db.usageCounter.update({
      where: { tenantId },
      data: { taskCount: { increment: 1 } },
    });

    await db.taskActivity.create({
      data: {
        tenantId,
        taskId: task.id,
        action: "created",
        userId,
        details: JSON.stringify({ title: task.title }),
      },
    });

    return { success: true, task };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to create task";
    console.error("Create task error:", error);
    return { error: errorMessage };
  } finally {
    clearTenantContext();
  }
}

/**
 * Get all tasks for current tenant
 */
export async function getTasks() {
  const headersList = await headers();
  const tenantId = headersList.get("x-tenant-id");
  const plan = (headersList.get("x-plan") || "free") as Plan;

  if (!tenantId) {
    return { error: "Not authorized" };
  }

  setTenantContext(tenantId);

  try {
    const [tasks, usage] = await Promise.all([
      db.task.findMany({
        where: { tenantId },
        include: {
          creator: { select: { id: true, name: true, email: true } },
          team: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      db.usageCounter.findUnique({
        where: { tenantId },
      }),
    ]);

    const taskCount = usage?.taskCount ?? 0;
    const taskLimit = getTasksLimit(plan);

    return {
      success: true,
      tasks,
      taskCount,
      taskLimit,
      plan,
    };
  } catch (error: unknown) {
    console.error("Get tasks error:", error);
    const msg = error instanceof Error ? error.message : "Failed to fetch tasks";
    return { error: msg };
  } finally {
    clearTenantContext();
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

    return { success: true, task };
  } catch (error: unknown) {
    console.error("Update task error:", error);
    const msg = error instanceof Error ? error.message : "Failed to update task";
    return { error: msg };
  } finally {
    clearTenantContext();
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
      return { error: "Task not found" };
    }

    // Log activity BEFORE deleting task
    await db.taskActivity.create({
      data: {
        tenantId,
        taskId,
        action: "deleted",
        userId,
        details: JSON.stringify({ title: existingTask.title }),
      },
    });

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

    return { success: true };
  } catch (error: unknown) {
    console.error("Delete task error:", error);
    const msg = error instanceof Error ? error.message : "Failed to delete task";
    return { error: msg };
  } finally {
    clearTenantContext();
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

    return { success: true, task };
  } catch (error: unknown) {
    console.error("Toggle task completion error:", error);
    const msg = error instanceof Error ? error.message : "Failed to update task";
    return { error: msg };
  } finally {
    clearTenantContext();
  }
}
