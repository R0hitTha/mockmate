import { z } from "zod";

export const ADMIN_ROLES = [
  "SUPER_ADMIN",
  "CONTENT_ADMIN",
  "SUPPORT_ADMIN",
  "FINANCE_ADMIN",
  "ADMIN", // Legacy broad admin
] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];

export const ALL_ROLES = ["STUDENT", ...ADMIN_ROLES] as const;
export type UserRole = (typeof ALL_ROLES)[number];

export const suspendStudentSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  reason: z
    .string()
    .min(3, "Suspension reason must be at least 3 characters")
    .max(500, "Reason cannot exceed 500 characters"),
});

export type SuspendStudentInput = z.infer<typeof suspendStudentSchema>;

export const reactivateStudentSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  notes: z.string().max(500).optional(),
});

export type ReactivateStudentInput = z.infer<typeof reactivateStudentSchema>;

export const updateStudentRoleSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  role: z.enum(ALL_ROLES),
});

export type UpdateStudentRoleInput = z.infer<typeof updateStudentRoleSchema>;

export const studentFilterSchema = z.object({
  search: z.string().optional(),
  targetYear: z.coerce.number().int().optional(),
  stream: z.string().optional(),
  status: z.enum(["ALL", "ACTIVE", "SUSPENDED", "ONBOARDED"]).default("ALL"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type StudentFilterInput = z.infer<typeof studentFilterSchema>;

export const platformSettingSchema = z.object({
  key: z.string().min(1, "Setting key is required"),
  value: z.string(),
  category: z.enum(["GENERAL", "EXAM", "ACCESS", "MONETIZATION", "AI"]).default("GENERAL"),
  description: z.string().optional(),
});

export type PlatformSettingInput = z.infer<typeof platformSettingSchema>;
