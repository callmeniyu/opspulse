import { z } from "zod";

export const createIncidentSchema = z.object({
  title: z.string().min(3).max(255),

  description: z.string().max(5000).optional(),

  severity: z.enum(["SEV1", "SEV2", "SEV3", "SEV4"]),
});

export const updateIncidentSchema = z.object({
  title: z.string().min(3).max(255).optional(),

  description: z.string().max(5000).optional(),

  severity: z.enum(["SEV1", "SEV2", "SEV3", "SEV4"]).optional(),
});

export const updateIncidentStatusSchema = z.object({
  status: z.enum(["OPEN", "INVESTIGATING", "MITIGATED", "RESOLVED"]),
});

export type CreateIncidentInput = z.infer<typeof createIncidentSchema>;

export type UpdateIncidentInput = z.infer<typeof updateIncidentSchema>;

export type UpdateIncidentStatusInput = z.infer<typeof updateIncidentStatusSchema>;
