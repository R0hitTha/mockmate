import { z } from "zod";

export const TEST_TYPES = [
  "FULL_LENGTH",
  "SUBJECT_WISE",
  "GENERAL_TEST",
  "SECTIONAL",
  "CUSTOM_PRACTICE",
] as const;

export const TEST_STATUSES = [
  "DRAFT",
  "IN_REVIEW",
  "PUBLISHED",
  "ARCHIVED",
] as const;

export const TEST_DIFFICULTIES = [
  "EASY",
  "MEDIUM",
  "HARD",
] as const;

export const SECTION_TYPES = [
  "COMPULSORY",
  "OPTIONAL",
] as const;

export type TestType = (typeof TEST_TYPES)[number];
export type TestStatus = (typeof TEST_STATUSES)[number];
export type TestDifficulty = (typeof TEST_DIFFICULTIES)[number];
export type SectionType = (typeof SECTION_TYPES)[number];

export const mockTestSectionSchema = z
  .object({
    id: z.string().optional(),
    title: z.string().min(2, "Section title must be at least 2 characters").max(100),
    subjectId: z.string().min(1, "A subject must be selected for each section"),
    sectionType: z.enum(SECTION_TYPES).default("COMPULSORY"),
    description: z.string().optional(),
    order: z.number().int().min(1).default(1),
    duration: z.number().int().min(1).optional().nullable(),
    totalMarks: z.number().min(0).default(200),
    totalQuestions: z.number().int().min(1, "Section must have at least 1 question"),
    questionsToAttempt: z.number().int().min(1, "Questions to attempt must be at least 1"),
    questionIds: z.array(z.string()).min(1, "Section must have at least one question selected"),
  })
  .refine(
    (data) => data.questionsToAttempt <= data.totalQuestions,
    {
      message: "Questions to attempt cannot exceed total questions in section",
      path: ["questionsToAttempt"],
    }
  )
  .refine(
    (data) => data.questionIds.length === data.totalQuestions,
    {
      message: "Selected question count must match totalQuestions specified for the section",
      path: ["questionIds"],
    }
  );

export type MockTestSectionInput = z.infer<typeof mockTestSectionSchema>;

export const mockTestSchema = z
  .object({
    id: z.string().optional(),
    title: z.string().min(3, "Test title must be at least 3 characters").max(150),
    slug: z
      .string()
      .min(3, "Slug must be at least 3 characters")
      .regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase letters, numbers, and hyphens"),
    testCode: z
      .string()
      .min(3, "Test code must be at least 3 characters")
      .regex(/^[A-Z0-9-_]+$/, "Test code must contain uppercase letters, numbers, hyphens or underscores"),
    description: z.string().optional().nullable(),
    examYearId: z.string().min(1, "Exam target year is required"),
    testType: z.enum(TEST_TYPES).default("SUBJECT_WISE"),
    status: z.enum(TEST_STATUSES).default("DRAFT"),
    difficulty: z.enum(TEST_DIFFICULTIES).default("MEDIUM"),
    instructions: z.string().optional().nullable(),
    totalDuration: z.number().int().min(5, "Duration must be at least 5 minutes").max(300),
    totalMarks: z.number().min(1, "Total marks must be greater than 0"),
    totalQuestions: z.number().int().min(1, "Total questions must be at least 1"),
    isOfficialPattern: z.boolean().default(false),
    sections: z.array(mockTestSectionSchema).min(1, "A mock test must have at least one section"),
  })
  .refine(
    (data) => {
      // Validate no duplicate questions across all sections
      const allQuestionIds = data.sections.flatMap((s) => s.questionIds);
      const uniqueIds = new Set(allQuestionIds);
      return uniqueIds.size === allQuestionIds.length;
    },
    {
      message: "A question cannot be assigned to multiple sections in the same test",
      path: ["sections"],
    }
  )
  .refine(
    (data) => {
      // Validate totalQuestions matches sum of section total questions
      const sum = data.sections.reduce((acc, s) => acc + s.totalQuestions, 0);
      return sum === data.totalQuestions;
    },
    {
      message: "Overall total questions must equal the sum of questions across all sections",
      path: ["totalQuestions"],
    }
  );

export type MockTestInput = z.infer<typeof mockTestSchema>;
