import { z } from "zod";

export const FEATURE_KEYS = [
  "FULL_MOCK_TESTS",
  "TOPIC_PRACTICE",
  "ADVANCED_ANALYTICS",
  "MISTAKE_INTELLIGENCE",
  "STUDY_PLANNER",
  "AI_ASSISTANT",
] as const;

export type FeatureKey = (typeof FEATURE_KEYS)[number];

export const BILLING_INTERVALS = [
  "FREE",
  "MONTHLY",
  "ANNUAL",
  "EXAM_SEASON",
  "ONE_TIME",
] as const;

export type BillingInterval = (typeof BILLING_INTERVALS)[number];

export const planEntitlementInputSchema = z.object({
  featureKey: z.string().min(1, "Feature key is required"),
  enabled: z.boolean().default(true),
  usageLimit: z.number().int().min(0).nullable().optional(),
  usagePeriod: z.enum(["DAILY", "WEEKLY", "MONTHLY", "TOTAL"]).nullable().optional(),
});

export type PlanEntitlementInput = z.infer<typeof planEntitlementInputSchema>;

export const savePlanSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .min(2, "Plan name must be at least 2 characters")
    .max(80, "Plan name cannot exceed 80 characters"),
  code: z
    .string()
    .min(2, "Plan code must be at least 2 characters")
    .max(40, "Plan code cannot exceed 40 characters")
    .regex(/^[A-Z0-9_]+$/, "Code must consist of uppercase letters, numbers, and underscores"),
  description: z.string().max(500).optional(),
  priceAmount: z.number().min(0, "Price cannot be negative").default(0),
  currency: z.string().default("INR"),
  billingInterval: z.enum(BILLING_INTERVALS).default("FREE"),
  isActive: z.boolean().default(true),
  isPublic: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
  badge: z.string().max(40).optional(),
  highlight: z.boolean().default(false),
  entitlements: z.array(planEntitlementInputSchema).default([]),
});

export type SavePlanInput = z.infer<typeof savePlanSchema>;

export const assignSubscriptionSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  planId: z.string().min(1, "Plan ID is required"),
  durationDays: z.number().int().min(1).max(730).default(365),
  notes: z.string().max(500).optional(),
});

export type AssignSubscriptionInput = z.infer<typeof assignSubscriptionSchema>;

