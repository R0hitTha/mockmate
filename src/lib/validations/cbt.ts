import { z } from "zod";

export const ATTEMPT_STATUSES = [
  "IN_PROGRESS",
  "SUBMITTED",
  "AUTO_SUBMITTED",
  "EXPIRED",
  "CANCELLED",
] as const;

export const ANSWER_STATUSES = [
  "NOT_VISITED",
  "NOT_ANSWERED",
  "ANSWERED",
  "MARKED_FOR_REVIEW",
  "ANSWERED_AND_MARKED_FOR_REVIEW",
] as const;

export const ATTEMPT_EVENT_TYPES = [
  "ATTEMPT_STARTED",
  "ANSWER_SAVED",
  "ANSWER_CLEARED",
  "MARKED_FOR_REVIEW",
  "SECTION_CHANGED",
  "SUBMITTED",
  "AUTO_SUBMITTED",
] as const;

export type AttemptStatus = (typeof ATTEMPT_STATUSES)[number];
export type AnswerStatus = (typeof ANSWER_STATUSES)[number];
export type AttemptEventType = (typeof ATTEMPT_EVENT_TYPES)[number];

export const startAttemptSchema = z.object({
  mockTestId: z.string().min(1, "Mock Test ID is required"),
});

export type StartAttemptInput = z.infer<typeof startAttemptSchema>;

export const saveAnswerSchema = z.object({
  attemptId: z.string().min(1, "Attempt ID is required"),
  questionId: z.string().min(1, "Question ID is required"),
  selectedOptionId: z.string().nullable().optional(),
  selectedOptionIds: z.array(z.string()).optional().default([]),
  answerPayload: z.string().nullable().optional(),
  markedForReview: z.boolean().default(false),
  answerStatus: z.enum(ANSWER_STATUSES),
  clientVersion: z.number().int().min(1).default(1),
});

export type SaveAnswerInput = z.input<typeof saveAnswerSchema>;

export const submitAttemptSchema = z.object({
  attemptId: z.string().min(1, "Attempt ID is required"),
  isAutoTimeout: z.boolean().default(false),
});

export type SubmitAttemptInput = z.infer<typeof submitAttemptSchema>;
