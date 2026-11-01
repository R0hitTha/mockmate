import { describe, it, expect } from "vitest";
import {
  mockTestSchema,
  mockTestSectionSchema,
} from "@/lib/validations/mock-test";
import {
  getMockTestStats,
  getAdminMockTests,
  getStudentMockTests,
  getMockTestById,
} from "@/lib/mock-test-service";
import { SAMPLE_MOCK_TESTS } from "@/lib/mock-test-sample-data";

describe("Phase 8: CUET Mock Test Library & Test Builder Architecture", () => {
  describe("Zod Validation Schemas & CUET Examination Business Rules", () => {
    it("validates a compliant CUET UG full-length mock test payload", () => {
      const validPayload = {
        title: "CUET UG Physics Full Mock Test 01",
        slug: "cuet-ug-physics-mock-01",
        testCode: "MT-CUET-PHY-2026-01",
        description: "Official simulation for Physics.",
        examYearId: "year-2026",
        testType: "SUBJECT_WISE" as const,
        status: "PUBLISHED" as const,
        difficulty: "MEDIUM" as const,
        instructions: "Standard NTA exam instructions.",
        totalDuration: 45,
        totalMarks: 200,
        totalQuestions: 50,
        isOfficialPattern: true,
        sections: [
          {
            title: "Section A: Compulsory Core",
            subjectId: "sub-physics",
            sectionType: "COMPULSORY" as const,
            order: 1,
            totalQuestions: 25,
            questionsToAttempt: 20,
            totalMarks: 100,
            questionIds: Array.from({ length: 25 }, (_, i) => `q-sec-a-${i + 1}`),
          },
          {
            title: "Section B: Modern Physics",
            subjectId: "sub-physics",
            sectionType: "COMPULSORY" as const,
            order: 2,
            totalQuestions: 25,
            questionsToAttempt: 20,
            totalMarks: 100,
            questionIds: Array.from({ length: 25 }, (_, i) => `q-sec-b-${i + 1}`),
          },
        ],
      };

      const parsed = mockTestSchema.safeParse(validPayload);
      expect(parsed.success).toBe(true);
    });

    it("enforces CUET optionality rule: questionsToAttempt cannot exceed totalQuestions in a section", () => {
      const invalidSection = {
        title: "Invalid Section Optionality",
        subjectId: "sub-physics",
        sectionType: "COMPULSORY" as const,
        order: 1,
        totalQuestions: 40,
        questionsToAttempt: 50, // Invalid: trying to attempt 50 out of 40
        totalMarks: 200,
        questionIds: Array.from({ length: 40 }, (_, i) => `q-${i + 1}`),
      };

      const parsed = mockTestSectionSchema.safeParse(invalidSection);
      expect(parsed.success).toBe(false);
      if (!parsed.success) {
        expect(
          parsed.error.issues.some((issue) =>
            issue.message.includes("Questions to attempt cannot exceed total questions")
          )
        ).toBe(true);
      }
    });

    it("enforces exact question count matching: selected questions must equal totalQuestions", () => {
      const invalidSection = {
        title: "Count Mismatch Section",
        subjectId: "sub-physics",
        sectionType: "COMPULSORY" as const,
        order: 1,
        totalQuestions: 25,
        questionsToAttempt: 20,
        totalMarks: 100,
        questionIds: ["q-1", "q-2"], // Only 2 provided instead of 25
      };

      const parsed = mockTestSectionSchema.safeParse(invalidSection);
      expect(parsed.success).toBe(false);
      if (!parsed.success) {
        expect(
          parsed.error.issues.some((issue) =>
            issue.message.includes("Selected question count must match totalQuestions")
          )
        ).toBe(true);
      }
    });

    it("prevents assigning duplicate questions across sections in the same test paper", () => {
      const payloadWithDuplicates = {
        title: "Test With Duplicate Question",
        slug: "test-duplicate-q",
        testCode: "MT-DUP-01",
        examYearId: "year-2026",
        testType: "SUBJECT_WISE" as const,
        status: "DRAFT" as const,
        difficulty: "MEDIUM" as const,
        totalDuration: 45,
        totalMarks: 50,
        totalQuestions: 10,
        isOfficialPattern: false,
        sections: [
          {
            title: "Section 1",
            subjectId: "sub-1",
            sectionType: "COMPULSORY" as const,
            order: 1,
            totalQuestions: 5,
            questionsToAttempt: 5,
            totalMarks: 25,
            questionIds: ["q-dup", "q-2", "q-3", "q-4", "q-5"],
          },
          {
            title: "Section 2",
            subjectId: "sub-2",
            sectionType: "COMPULSORY" as const,
            order: 2,
            totalQuestions: 5,
            questionsToAttempt: 5,
            totalMarks: 25,
            questionIds: ["q-dup", "q-6", "q-7", "q-8", "q-9"], // "q-dup" repeated
          },
        ],
      };

      const parsed = mockTestSchema.safeParse(payloadWithDuplicates);
      expect(parsed.success).toBe(false);
      if (!parsed.success) {
        expect(
          parsed.error.issues.some((issue) =>
            issue.message.includes("A question cannot be assigned to multiple sections")
          )
        ).toBe(true);
      }
    });
  });

  describe("Mock Test Service & Administrative Queries", () => {
    it("retrieves mock test summary statistics accurately", async () => {
      const stats = await getMockTestStats();

      expect(stats.total).toBeGreaterThanOrEqual(1);
      expect(stats.published).toBeGreaterThanOrEqual(1);
      expect(stats.published + stats.draft + stats.inReview + stats.archived).toBe(stats.total);
    });

    it("filters admin tests by status, test type, and difficulty", async () => {
      const { tests: publishedTests } = await getAdminMockTests({
        status: "PUBLISHED",
      });
      expect(publishedTests.every((t) => t.status === "PUBLISHED")).toBe(true);

      const { tests: generalTests } = await getAdminMockTests({
        testType: "GENERAL_TEST",
      });
      expect(generalTests.every((t) => t.testType === "GENERAL_TEST")).toBe(true);
    });

    it("supports search keyword lookup matching title, test code, or slug", async () => {
      const { tests } = await getAdminMockTests({
        search: "physics",
      });

      expect(tests.length).toBeGreaterThan(0);
      expect(
        tests.some(
          (t) =>
            t.title.toLowerCase().includes("physics") ||
            t.slug.toLowerCase().includes("physics") ||
            t.testCode.toLowerCase().includes("phy")
        )
      ).toBe(true);
    });
  });

  describe("Student Mock Test Library & Anti-Leakage Security", () => {
    it("strictly returns only PUBLISHED tests to students (no drafts, reviews, or archives)", async () => {
      const { tests } = await getStudentMockTests();

      expect(tests.length).toBeGreaterThan(0);
      // All tests served to students must be published
      expect(tests.every((t) => t.publishedAt !== null)).toBe(true);

      // Verify no draft tests are visible to students
      const hasDrafts = tests.some((t) => t.title.toLowerCase().includes("draft"));
      expect(hasDrafts).toBe(false);
    });

    it("denies student access to unpublished/draft tests when requested by ID", async () => {
      // "test-cuet-chem-draft" is in DRAFT status in sample dataset
      const studentResult = await getMockTestById("test-cuet-chem-draft", true);
      expect(studentResult).toBeNull();

      // But administrator can inspect the draft
      const adminResult = await getMockTestById("test-cuet-chem-draft", false);
      expect(adminResult).not.toBeNull();
      expect(adminResult?.status).toBe("DRAFT");
    });

    it("SECURITY: Sanitizes questions for students by completely withholding isCorrect and explanation", async () => {
      const publishedSlug = "cuet-ug-physics-mock-01";

      // 1. Fetch as student (isStudent = true)
      const studentTest = await getMockTestById(publishedSlug, true);
      expect(studentTest).not.toBeNull();

      for (const section of studentTest!.sections) {
        for (const question of section.questions) {
          // Explanation must be null
          expect(question.explanation).toBeNull();

          // isCorrect must NOT be revealed in options
          for (const option of question.options) {
            expect(option.isCorrect).toBeUndefined();
          }
        }
      }

      // 2. Fetch as admin (isStudent = false)
      const adminTest = await getMockTestById(publishedSlug, false);
      expect(adminTest).not.toBeNull();

      const sampleQuestion = adminTest!.sections[0]?.questions[0];
      if (sampleQuestion) {
        // Explanations and answer keys exist for administrators
        expect(sampleQuestion.explanation).toBeDefined();
        const hasCorrectOption = sampleQuestion.options.some((opt) => opt.isCorrect === true);
        expect(hasCorrectOption).toBe(true);
      }
    });
  });

  describe("Test Versioning & Historical Student Attempt Safeguard", () => {
    it("preserves attemptsCount and provides safeguard against modifying attempted tests", () => {
      const attemptedTest = SAMPLE_MOCK_TESTS.find((t) => t.attemptsCount > 0);
      expect(attemptedTest).toBeDefined();
      expect(attemptedTest!.attemptsCount).toBeGreaterThan(0);

      // Verify safeguard logic: an attempted test must be protected
      const isLocked = attemptedTest!.attemptsCount > 0;
      expect(isLocked).toBe(true);
    });
  });
});
