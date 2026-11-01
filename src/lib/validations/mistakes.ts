import { z } from "zod";

export const MistakeReviewStatusEnum = z.enum(["PENDING_REVIEW", "REVIEWED", "MASTERED"]);
export type MistakeReviewStatus = z.infer<typeof MistakeReviewStatusEnum>;

export const MistakeErrorReasonEnum = z.enum([
  "CARELESS",
  "CONCEPT_GAP",
  "MISREAD_QUESTION",
  "TIME_PRESSURE",
  "CALCULATION_ERROR",
  "OTHER",
]);
export type MistakeErrorReason = z.infer<typeof MistakeErrorReasonEnum>;

export const MistakeCategoryEnum = z.enum([
  "INCORRECT",
  "UNANSWERED",
  "CONCEPT_GAP",
  "REPEATED_TOPIC_ERROR",
  "REPEATED_QUESTION_ERROR",
  "TIME_PRESSURE",
  "CARELESS_ERROR",
]);
export type MistakeCategory = z.infer<typeof MistakeCategoryEnum>;

export const MistakeFilterSchema = z.object({
  subject: z.string().optional(),
  topic: z.string().optional(),
  testId: z.string().optional(),
  category: z.string().optional().default("ALL"),
  status: z.string().optional().default("ALL"),
  sortBy: z.enum(["recent", "oldest", "most_repeated", "subject"]).optional().default("recent"),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(50).optional().default(10),
});
export type MistakeFilterInput = z.input<typeof MistakeFilterSchema>;
export type MistakeFilterOutput = z.infer<typeof MistakeFilterSchema>;

export const UpdateMistakeStatusSchema = z.object({
  attemptId: z.string().min(1, "Attempt ID is required"),
  questionId: z.string().min(1, "Question ID is required"),
  status: MistakeReviewStatusEnum,
  errorReason: MistakeErrorReasonEnum.optional().nullable(),
  notes: z.string().max(1000, "Notes cannot exceed 1000 characters").optional().nullable(),
});
export type UpdateMistakeStatusInput = z.infer<typeof UpdateMistakeStatusSchema>;

export const ToggleBookmarkSchema = z.object({
  questionId: z.string().min(1, "Question ID is required"),
  notes: z.string().max(1000).optional().nullable(),
});
export type ToggleBookmarkInput = z.infer<typeof ToggleBookmarkSchema>;

export interface MistakeOptionSnapshot {
  id: string;
  optionLabel: string;
  optionText: string;
  isCorrect: boolean;
  order: number;
}

export interface MistakeItem {
  id: string; // unique review/event key (e.g. attemptId-questionId)
  attemptId: string;
  testId: string;
  testTitle: string;
  testCode: string;
  attemptDate: string;
  attemptTimeTakenSeconds: number | null;
  isAutoSubmitted: boolean;
  questionId: string;
  questionNumber: number;
  sectionTitle: string;
  subjectName: string;
  subjectCode: string;
  topicTitle: string;
  unitNumber?: number;
  questionType: string;
  questionText: string;
  passageText: string | null;
  options: MistakeOptionSnapshot[];
  selectedOptionId: string | null;
  selectedOptionLabel: string | null;
  correctOptionId: string | null;
  correctOptionLabel: string | null;
  explanation: string | null;
  resultStatus: "INCORRECT" | "UNANSWERED";
  awardedMarks: number;
  negativeMarksApplied: number;
  // Review State
  reviewStatus: MistakeReviewStatus;
  reviewedAt: string | null;
  masteredAt: string | null;
  studentNotes: string | null;
  studentErrorReason: MistakeErrorReason | null;
  // Bookmark state
  isBookmarked: boolean;
  // Intelligence Classifications
  categories: Array<{
    category: MistakeCategory;
    label: string;
    description: string;
    evidence: string;
    confidenceLevel?: "HIGH" | "MODERATE" | "LIMITED";
  }>;
  repeatedCountForQuestion: number;
  repeatedCountForTopic: number;
}

export interface MistakeOverviewMetrics {
  totalIncorrect: number;
  totalUnanswered: number;
  totalUniqueQuestions: number;
  pendingReviewCount: number;
  reviewedCount: number;
  masteredCount: number;
  recurringErrorTopicsCount: number;
  bookmarkedCount: number;
}

export interface MistakeCategoryStat {
  category: MistakeCategory;
  label: string;
  count: number;
  description: string;
}

export interface TopicRevisitItem {
  subjectName: string;
  topicTitle: string;
  unitNumber?: number;
  attemptedCount: number;
  incorrectCount: number;
  unansweredCount: number;
  accuracy: number;
  sampleSize: number;
  reason: string;
  status: "CONCEPT_GAP" | "REPEATED_STRUGGLE" | "LIMITED_EVIDENCE";
}

export interface MistakeTrendPoint {
  date: string;
  formattedDate: string;
  incorrectCount: number;
  unansweredCount: number;
  reviewedCount: number;
}

export interface RevisionRecommendation {
  id: string;
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  category: "PENDING_MISTAKES" | "RECURRING_TOPIC" | "UNANSWERED_PACING" | "REVISIT_REVIEWED";
}

export interface StudentMistakesPayload {
  overview: MistakeOverviewMetrics;
  categoryBreakdown: MistakeCategoryStat[];
  topicsToRevisit: TopicRevisitItem[];
  trend: MistakeTrendPoint[];
  hasEnoughDataForTrend: boolean;
  recommendations: RevisionRecommendation[];
  hasMistakes: boolean;
}

