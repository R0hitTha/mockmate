import { z } from "zod";

export const DAYS_OF_WEEK = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
] as const;

export type DayOfWeek = (typeof DAYS_OF_WEEK)[number];

export const TASK_TYPES = [
  "THEORY_REVISION",
  "TOPIC_PRACTICE",
  "MISTAKE_REVIEW",
  "MOCK_TEST",
  "SECTIONAL_TEST",
  "CUSTOM_TASK",
] as const;

export type TaskType = (typeof TASK_TYPES)[number];

export const TASK_STATUSES = [
  "PLANNED",
  "IN_PROGRESS",
  "COMPLETED",
  "SKIPPED",
  "RESCHEDULED",
] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

export const studyPreferenceSchema = z.object({
  weeklyTargetMinutes: z
    .number()
    .int()
    .min(60, "Weekly study target must be at least 1 hour (60 minutes)")
    .max(3600, "Weekly target cannot exceed 60 hours")
    .default(720),
  dailyTargetMinutes: z
    .number()
    .int()
    .min(15, "Daily target must be at least 15 minutes")
    .max(720, "Daily target cannot exceed 12 hours")
    .default(120),
  preferredSessionMinutes: z
    .number()
    .int()
    .min(15, "Session duration must be at least 15 minutes")
    .max(180, "Session duration cannot exceed 3 hours")
    .default(45),
  preferredStudyDays: z
    .array(z.enum(DAYS_OF_WEEK))
    .min(1, "Please select at least 1 active study day")
    .default(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"]),
  restDays: z.array(z.enum(DAYS_OF_WEEK)).default(["SUNDAY"]),
  subjectPriorities: z.array(z.string()).default([]),
});

export type StudyPreferenceInput = z.infer<typeof studyPreferenceSchema>;

export const generatePlanSchema = z.object({
  weekStartDate: z.string().optional(),
  regenerate: z.boolean().default(false),
  preserveCompleted: z.boolean().default(true),
});

export type GeneratePlanInput = z.infer<typeof generatePlanSchema>;

export const updateTaskStatusSchema = z.object({
  taskId: z.string().min(1, "Task ID is required"),
  status: z.enum(TASK_STATUSES),
  actualDurationMinutes: z.number().int().min(0).max(600).optional(),
});

export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>;

export const rescheduleTaskSchema = z.object({
  taskId: z.string().min(1, "Task ID is required"),
  newPlannedDate: z.string().min(10, "Valid date is required (YYYY-MM-DD)"),
});

export type RescheduleTaskInput = z.infer<typeof rescheduleTaskSchema>;

export const createCustomTaskSchema = z.object({
  studyPlanId: z.string().optional(),
  title: z
    .string()
    .min(3, "Task title must be at least 3 characters")
    .max(120, "Task title cannot exceed 120 characters"),
  description: z.string().max(500).optional(),
  taskType: z.enum(TASK_TYPES).default("CUSTOM_TASK"),
  subjectId: z.string().optional().nullable(),
  topicId: z.string().optional().nullable(),
  linkedMockTestId: z.string().optional().nullable(),
  plannedDate: z.string().min(10, "Valid date is required (YYYY-MM-DD)"),
  plannedDurationMinutes: z
    .number()
    .int()
    .min(10, "Duration must be at least 10 minutes")
    .max(300, "Duration cannot exceed 5 hours")
    .default(45),
});

export type CreateCustomTaskInput = z.infer<typeof createCustomTaskSchema>;
