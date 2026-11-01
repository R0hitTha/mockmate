import { z } from "zod";

export const evaluationStatusSchema = z.enum([
  "PENDING_EVALUATION",
  "EVALUATING",
  "EVALUATED",
  "EVALUATION_FAILED",
]);

export type EvaluationStatus = z.infer<typeof evaluationStatusSchema>;

export const questionResultStatusSchema = z.enum([
  "CORRECT",
  "INCORRECT",
  "UNANSWERED",
]);

export type QuestionResultStatus = z.infer<typeof questionResultStatusSchema>;

export const evaluateAttemptInputSchema = z.object({
  attemptId: z.string().min(1, "Attempt ID is required"),
  isReEvaluation: z.boolean().optional().default(false),
});

export type EvaluateAttemptInput = z.infer<typeof evaluateAttemptInputSchema>;

export const resultFilterSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  examYear: z.string().optional(),
  status: evaluationStatusSchema.optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().optional().default(10),
  sortBy: z.enum(["date", "marks", "percentage", "accuracy"]).optional().default("date"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export type ResultFilterParams = z.infer<typeof resultFilterSchema>;

export interface EvaluatedOptionSnapshot {
  id: string;
  optionLabel: string;
  optionText: string;
  isCorrect: boolean;
  order: number;
}

export interface TestResultQuestionData {
  id: string;
  questionId: string;
  questionVersionId?: string | null;
  questionNumber: number;
  sectionId: string;
  sectionTitle: string;
  questionText: string;
  passageText?: string | null;
  questionType: string;
  selectedOptionId?: string | null;
  selectedOptionIds: string[];
  selectedOptionLabel?: string | null;
  correctOptionId?: string | null;
  correctOptionLabel?: string | null;
  options: EvaluatedOptionSnapshot[];
  status: QuestionResultStatus;
  isCorrect: boolean;
  markedForReview: boolean;
  awardedMarks: number;
  maximumMarks: number;
  negativeMarksApplied: number;
  explanation?: string | null;
}

export interface TestResultSectionData {
  id: string;
  sectionId: string;
  sectionTitle: string;
  subjectId: string;
  subjectName: string;
  totalMarks: number;
  maximumMarks: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  totalQuestions: number;
  accuracy: number;
}

export interface TestResultData {
  id: string;
  attemptId: string;
  studentId: string;
  studentName?: string;
  studentEmail?: string;
  mockTestId: string;
  testTitle: string;
  testCode: string;
  testCategory?: string;
  examYear?: number;
  testVersionId?: string | null;
  totalMarks: number;
  maximumMarks: number;
  percentage: number;
  accuracy: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  totalQuestions: number;
  timeTaken?: number | null;
  status: EvaluationStatus;
  evaluatedAt: string;
  evaluationVersion: number;
  failureReason?: string | null;
  createdAt: string;
  sections: TestResultSectionData[];
  questions: TestResultQuestionData[];
}
