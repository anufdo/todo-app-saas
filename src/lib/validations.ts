import { z } from "zod";

// Auth schemas
export const SignInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const SignUpSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    name: z.string().min(2, "Name must be at least 2 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Tenant schemas
export const CreateTenantSchema = z.object({
  name: z.string().min(2, "Organization name must be at least 2 characters"),
  subdomain: z
    .string()
    .min(3, "Subdomain must be at least 3 characters")
    .max(20, "Subdomain must be at most 20 characters")
    .regex(/^[a-z0-9-]+$/, "Subdomain can only contain lowercase letters, numbers, and hyphens"),
});

// Task schemas
export const CreateTaskSchema = z.object({
  title: z.string().min(1, "Task title is required").max(255, "Title is too long"),
  description: z.string().max(2000, "Description is too long").optional().or(z.literal("")),
  dueDate: z.date().optional(),
  teamId: z.string().optional(),
});

export const UpdateTaskSchema = z.object({
  title: z.string().min(1, "Task title is required").max(255).optional(),
  description: z.string().max(2000).optional().or(z.literal("")),
  completed: z.boolean().optional(),
  dueDate: z.date().optional().or(z.null()),
  teamId: z.string().optional().or(z.null()),
});

// Invite schemas
export const CreateInviteSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["owner", "admin", "member"]).default("member"),
});

// Team schemas
export const CreateTeamSchema = z.object({
  name: z.string().min(2, "Team name must be at least 2 characters"),
  description: z.string().max(500).optional(),
});

export const UpdateTeamSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().max(500).optional(),
});

// Admin schemas
export const UpdateTenantPlanSchema = z.object({
  plan: z.enum(["free", "premium", "premium_plus"]),
  taskCap: z.number().int().positive().optional(),
  status: z.enum(["active", "suspended", "deleted"]).optional(),
});

// Type exports for use in components
export type SignInInput = z.infer<typeof SignInSchema>;
export type SignUpInput = z.infer<typeof SignUpSchema>;
export type CreateTenantInput = z.infer<typeof CreateTenantSchema>;
export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;
export type CreateInviteInput = z.infer<typeof CreateInviteSchema>;
export type CreateTeamInput = z.infer<typeof CreateTeamSchema>;
export type UpdateTenantPlanInput = z.infer<typeof UpdateTenantPlanSchema>;
