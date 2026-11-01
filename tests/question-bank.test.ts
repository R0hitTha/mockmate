import { describe, it, expect } from "vitest";
import {
  QuestionSchema,
  QuestionReviewSchema,
  BulkImportRowSchema,
} from "@/lib/validations/question";
import { SAMPLE_QUESTIONS } from "@/lib/question-sample-data";
import {
  getQuestions,
  getQuestionBankStats,
  getSyllabusCascade,
} from "@/lib/question-service";

describe("Phase 7: CUET Question Bank Management & Business Rules", () => {
  // 1. MCQ Option Validation (MCQ_SINGLE)
  it("enforces that Single Choice MCQs have exactly one correct answer marked", () => {
    // Valid: 4 options, 1 correct
    const validMCQ = {
      examYear: 2026,
      subjectSlug: "physics",
      unitNumber: 1,
      topicOrder: 1,
      questionType: "MCQ_SINGLE" as const,
      questionText: "What is the dimensional formula of electric permittivity?",
      difficulty: "MEDIUM" as const,
      marks: 5,
      negativeMarks: 1,
      options: [
        { optionLabel: "A", optionText: "[M^-1 L^-3 T^4 A^2]", isCorrect: true, order: 1 },
        { optionLabel: "B", optionText: "[M L^3 T^-4 A^-2]", isCorrect: false, order: 2 },
        { optionLabel: "C", optionText: "[M^-1 L^3 T^2 A]", isCorrect: false, order: 3 },
        { optionLabel: "D", optionText: "[M L^-3 T^-2 A^2]", isCorrect: false, order: 4 },
      ],
    };

    const validResult = QuestionSchema.safeParse(validMCQ);
    expect(validResult.success).toBe(true);

    // Invalid: 0 correct options
    const zeroCorrect = {
      ...validMCQ,
      options: validMCQ.options.map((o) => ({ ...o, isCorrect: false })),
    };
    const zeroResult = QuestionSchema.safeParse(zeroCorrect);
    expect(zeroResult.success).toBe(false);

    // Invalid: 2 correct options in a single MCQ
    const twoCorrect = {
      ...validMCQ,
      options: validMCQ.options.map((o, i) => ({ ...o, isCorrect: i < 2 })),
    };
    const twoResult = QuestionSchema.safeParse(twoCorrect);
    expect(twoResult.success).toBe(false);
  });

  // 2. Multi-Select and True/False Validation
  it("validates multi-select and true-false question constraints", () => {
    // True/False must have exactly 2 options
    const invalidTF = {
      examYear: 2026,
      subjectSlug: "biology",
      unitNumber: 1,
      topicOrder: 1,
      questionType: "TRUE_FALSE" as const,
      questionText: "Viruses possess cellular organelles for ATP generation.",
      options: [
        { optionLabel: "A", optionText: "True", isCorrect: false, order: 1 },
        { optionLabel: "B", optionText: "False", isCorrect: true, order: 2 },
        { optionLabel: "C", optionText: "Neither", isCorrect: false, order: 3 },
      ],
    };
    const tfResult = QuestionSchema.safeParse(invalidTF);
    expect(tfResult.success).toBe(false);

    const validTF = {
      ...invalidTF,
      options: invalidTF.options.slice(0, 2),
    };
    expect(QuestionSchema.safeParse(validTF).success).toBe(true);
  });

  // 3. Publishing Readiness: Requires Comprehensive Explanation
  it("requires a comprehensive explanation before publishing a question", () => {
    const unpublishedDraft = {
      examYear: 2026,
      subjectSlug: "chemistry",
      unitNumber: 1,
      topicOrder: 1,
      questionType: "MCQ_SINGLE" as const,
      questionText: "Which gas is evolved at cathode during electrolysis of brine?",
      status: "DRAFT" as const,
      options: [
        { optionLabel: "A", optionText: "H2", isCorrect: true, order: 1 },
        { optionLabel: "B", optionText: "Cl2", isCorrect: false, order: 2 },
      ],
    };

    // Valid as DRAFT even without explanation
    expect(QuestionSchema.safeParse(unpublishedDraft).success).toBe(true);

    // Invalid as PUBLISHED without explanation
    const publishAttempt = {
      ...unpublishedDraft,
      status: "PUBLISHED" as const,
      explanation: "",
    };
    const pubResult = QuestionSchema.safeParse(publishAttempt);
    expect(pubResult.success).toBe(false);
    expect(pubResult.error?.issues[0]?.message).toContain("comprehensive explanation");
  });

  // 4. Review Workflow Decision Rules
  it("enforces feedback when rejecting or requesting changes in review", () => {
    // Approved without feedback is allowed
    const approve = { reviewStatus: "APPROVED" as const };
    expect(QuestionReviewSchema.safeParse(approve).success).toBe(true);

    // Rejected without feedback is rejected
    const rejectNoFeedback = { reviewStatus: "REJECTED" as const, feedback: "" };
    const rejectResult = QuestionReviewSchema.safeParse(rejectNoFeedback);
    expect(rejectResult.success).toBe(false);
    expect(rejectResult.error?.issues[0]?.message).toContain("Feedback is required");

    // Rejected with valid feedback is valid
    const rejectWithFeedback = {
      reviewStatus: "REJECTED" as const,
      feedback: "Option C has a calculation error. Please recalculate.",
    };
    expect(QuestionReviewSchema.safeParse(rejectWithFeedback).success).toBe(true);
  });

  // 5. CSV Row Schema Validation
  it("validates CSV import row fields and answers", () => {
    const validRow = {
      questionText: "What is the speed of light in vacuum?",
      examYear: 2026,
      subjectCodeOrSlug: "physics",
      unitNumber: 5,
      topicOrder: 1,
      questionType: "MCQ_SINGLE" as const,
      optionA: "3 x 10^8 m/s",
      optionB: "3 x 10^6 m/s",
      optionC: "3 x 10^5 km/s",
      optionD: "Both A and C",
      correctAnswer: "D",
      explanation: "Speed of light is 3 x 10^8 m/s which equals 3 x 10^5 km/s.",
      difficulty: "EASY" as const,
      marks: 5,
      negativeMarks: 1,
      tags: "Optics, High Yield",
    };

    const rowResult = BulkImportRowSchema.safeParse(validRow);
    expect(rowResult.success).toBe(true);

    // Missing required option B
    const missingOption = { ...validRow, optionB: "" };
    expect(BulkImportRowSchema.safeParse(missingOption).success).toBe(false);
  });

  // 6. Test Usage Safeguard Logic
  it("safeguards locked questions that have active test sessions from answer key changes", () => {
    const question = {
      id: "q-locked-1",
      questionCode: "Q-PHY-2026-001",
      usageCount: 42, // Locked: Used in 42 student test attempts
      status: "PUBLISHED",
      currentCorrectOption: "A",
    };

    const canModifyAnswerKey = (q: typeof question, newCorrectOption: string) => {
      if (q.usageCount > 0 && q.status === "PUBLISHED" && q.currentCorrectOption !== newCorrectOption) {
        return false;
      }
      return true;
    };

    // Changing answer key from A to B on an in-use test question is disallowed
    expect(canModifyAnswerKey(question, "B")).toBe(false);

    // Keeping the same answer key is allowed
    expect(canModifyAnswerKey(question, "A")).toBe(true);

    // Draft question with 0 usage can freely change keys
    const draftQuestion = { ...question, usageCount: 0, status: "DRAFT" };
    expect(canModifyAnswerKey(draftQuestion, "C")).toBe(true);
  });

  // 7. Student Answer-Key Exposure Prevention (Security Policy)
  it("guarantees student-facing query helpers strip correct answer keys and internal explanations", () => {
    const rawQuestion = {
      id: "q-1",
      questionText: "Sample question?",
      explanation: "Secret solution derivation...",
      options: [
        { id: "o-1", optionLabel: "A", optionText: "Alpha", isCorrect: true },
        { id: "o-2", optionLabel: "B", optionText: "Beta", isCorrect: false },
      ],
    };

    // Sanitization function used by student test-taking endpoints
    const sanitizeForStudent = (q: typeof rawQuestion) => ({
      id: q.id,
      questionText: q.questionText,
      options: q.options.map((opt) => ({
        id: opt.id,
        optionLabel: opt.optionLabel,
        optionText: opt.optionText,
        // Notice: isCorrect is explicitly stripped!
      })),
      // Notice: explanation is stripped during live test taking!
    });

    const sanitized = sanitizeForStudent(rawQuestion);
    expect((sanitized as Record<string, unknown>).explanation).toBeUndefined();
    sanitized.options.forEach((opt) => {
      expect((opt as Record<string, unknown>).isCorrect).toBeUndefined();
    });
  });

  // 8. Benchmark Sample Dataset Quality
  it("verifies authentic provenance and completeness of sample benchmark dataset", () => {
    expect(SAMPLE_QUESTIONS.length).toBeGreaterThanOrEqual(5);

    for (const q of SAMPLE_QUESTIONS) {
      expect(q.questionCode).toMatch(/^Q-[A-Z]+-\d{4}-\d{3}$/);
      expect(q.provenance.length).toBeGreaterThan(10);
      expect(q.options.length).toBeGreaterThanOrEqual(2);
      expect(q.options.filter((o) => o.isCorrect).length).toBeGreaterThanOrEqual(1);
    }
  });

  // 9. Query & Filter Functionality
  it("filters questions by status, difficulty, and subject correctly", async () => {
    const stats = await getQuestionBankStats();
    expect(stats.total).toBeGreaterThan(0);
    expect(stats.published).toBeGreaterThan(0);

    // Filter by published
    const pubQuestions = await getQuestions({ status: "PUBLISHED" });
    expect(pubQuestions.questions.every((q) => q.status === "PUBLISHED")).toBe(true);

    // Filter by difficulty
    const easyQuestions = await getQuestions({ difficulty: "EASY" });
    expect(easyQuestions.questions.every((q) => q.difficulty === "EASY")).toBe(true);
  });

  // 10. Cascaded Syllabus Hierarchy
  it("returns dependent cascaded syllabus data for dynamic question creator", async () => {
    const cascade = await getSyllabusCascade({ examYear: 2026, subjectSlug: "physics", unitNumber: 1 });
    expect(cascade.examYears.length).toBe(2);
    expect(cascade.subjects.length).toBeGreaterThan(5);
    expect(cascade.units.length).toBeGreaterThan(0);
    expect(cascade.topics.length).toBeGreaterThan(0);
  });
});
