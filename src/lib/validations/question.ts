import { z } from "zod";

export const QuestionTypeEnum = z.enum([
  "MCQ_SINGLE",
  "MCQ_MULTIPLE",
  "ASSERTION_REASON",
  "PASSAGE_BASED",
  "TRUE_FALSE",
]);

export const QuestionDifficultyEnum = z.enum(["EASY", "MEDIUM", "HARD"]);

export const QuestionStatusEnum = z.enum([
  "DRAFT",
  "IN_REVIEW",
  "APPROVED",
  "PUBLISHED",
  "REJECTED",
  "ARCHIVED",
]);

export const QuestionOptionSchema = z.object({
  id: z.string().optional(),
  optionLabel: z.string().min(1, "Option label is required (e.g. A, B, C, D)"),
  optionText: z.string().min(1, "Option text cannot be empty"),
  isCorrect: z.boolean().default(false),
  order: z.number().int().default(0),
});

export const QuestionSchema = z
  .object({
    id: z.string().optional(),
    questionCode: z.string().optional(),
    examYear: z.number().int().min(2025).max(2030).default(2026),
    subjectSlug: z.string().min(1, "Subject is required"),
    unitNumber: z.number().int().min(1, "Syllabus unit is required"),
    topicOrder: z.number().int().min(1, "Topic is required"),
    subtopicOrder: z.number().int().optional(),
    questionType: QuestionTypeEnum.default("MCQ_SINGLE"),
    questionText: z.string().min(5, "Question statement must be at least 5 characters"),
    passageId: z.string().optional(),
    passageTitle: z.string().optional(),
    passageText: z.string().optional(),
    difficulty: QuestionDifficultyEnum.default("MEDIUM"),
    explanation: z.string().optional(),
    marks: z.number().positive("Marks must be positive").default(5.0),
    negativeMarks: z.number().nonnegative("Negative marks must be non-negative").default(1.0),
    status: QuestionStatusEnum.default("DRAFT"),
    tags: z.array(z.string()).default([]),
    options: z.array(QuestionOptionSchema).min(2, "At least 2 options are required"),
  })
  .superRefine((data, ctx) => {
    // Single MCQ validation
    if (data.questionType === "MCQ_SINGLE") {
      const correctCount = data.options.filter((o) => o.isCorrect).length;
      if (correctCount !== 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Multiple Choice Questions must have exactly one correct answer marked.",
          path: ["options"],
        });
      }
    }

    // Multiple Select MCQ validation
    if (data.questionType === "MCQ_MULTIPLE") {
      const correctCount = data.options.filter((o) => o.isCorrect).length;
      if (correctCount < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Multiple Select Questions must have at least one correct option marked.",
          path: ["options"],
        });
      }
    }

    // True/False validation
    if (data.questionType === "TRUE_FALSE") {
      if (data.options.length !== 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "True/False questions must contain exactly two options (True and False).",
          path: ["options"],
        });
      }
      const correctCount = data.options.filter((o) => o.isCorrect).length;
      if (correctCount !== 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "True/False questions must have exactly one correct answer.",
          path: ["options"],
        });
      }
    }

    // Assertion & Reason validation
    if (data.questionType === "ASSERTION_REASON") {
      const correctCount = data.options.filter((o) => o.isCorrect).length;
      if (correctCount !== 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Assertion-Reason questions must have exactly one correct answer option.",
          path: ["options"],
        });
      }
    }

    // Publishing readiness rules
    if (data.status === "PUBLISHED") {
      if (!data.explanation || data.explanation.trim().length < 5) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Published questions must include a comprehensive explanation.",
          path: ["explanation"],
        });
      }
    }
  });

export const QuestionReviewSchema = z.object({
  reviewStatus: z.enum(["APPROVED", "REJECTED", "CHANGES_REQUESTED", "PUBLISHED"]),
  feedback: z.string().optional(),
}).superRefine((data, ctx) => {
  if ((data.reviewStatus === "REJECTED" || data.reviewStatus === "CHANGES_REQUESTED") && (!data.feedback || data.feedback.trim().length < 5)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Feedback is required when rejecting or requesting changes on a question.",
      path: ["feedback"],
    });
  }
});

export const BulkImportRowSchema = z.object({
  questionText: z.string().min(5, "Question text required"),
  examYear: z.coerce.number().int().default(2026),
  subjectCodeOrSlug: z.string().min(1, "Subject required"),
  unitNumber: z.coerce.number().int().min(1, "Unit number required"),
  topicOrder: z.coerce.number().int().min(1, "Topic order required"),
  questionType: QuestionTypeEnum.default("MCQ_SINGLE"),
  optionA: z.string().min(1, "Option A required"),
  optionB: z.string().min(1, "Option B required"),
  optionC: z.string().optional(),
  optionD: z.string().optional(),
  correctAnswer: z.string().min(1, "Correct answer (e.g. A, B, C, D) required"),
  explanation: z.string().optional(),
  difficulty: QuestionDifficultyEnum.default("MEDIUM"),
  marks: z.coerce.number().default(5.0),
  negativeMarks: z.coerce.number().default(1.0),
  tags: z.string().optional(),
});

export type QuestionInput = z.infer<typeof QuestionSchema>;
export type QuestionReviewInput = z.infer<typeof QuestionReviewSchema>;
export type BulkImportRow = z.infer<typeof BulkImportRowSchema>;

