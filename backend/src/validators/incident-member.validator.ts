import { z } from "zod";

export const addMemberSchema = z.object({
  userId: z.string(),

  role: z.enum(["RESPONDER", "VIEWER"]),
});

export const updateMemberRoleSchema = z.object({
  role: z.enum(["RESPONDER", "VIEWER"]),
});

export type AddMemberInput = z.infer<typeof addMemberSchema>;
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;
