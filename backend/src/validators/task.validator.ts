import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(3).max(255),

  description: z.string().max(5000).optional(),

  assignedTo: z.string().uuid().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(3).max(255).optional(),

  description: z.string().max(5000).optional(),

  assignedTo: z.string().uuid().nullable().optional(),

  status: z.enum(["TODO", "IN_PROGRESS", "COMPLETED"]).optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
