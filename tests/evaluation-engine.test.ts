import { describe, it, expect, beforeEach } from "vitest";
import {
  startOrResumeAttempt,
  saveAttemptAnswer,
  submitAttempt,
} from "@/lib/cbt-service";
import { cbtMemoryStore } from "@/lib/cbt-sample-data";
import { resultMemoryStore } from "@/lib/evaluation-sample-data";
import {
  evaluateAttempt,
  getResultById,
  getResultByAttemptId,
  getStudentResults,
  getAdminResults,
} from "@/lib/evaluation-service";
import { getMockTestById } from "@/lib/mock-test-service";

describe("Phase 10: Evaluation & Result System — Architecture & Business Logic", () => {
  const studentAlice = "student_alice_phase10";
  const studentBob = "student_bob_phase10";
  const adminUser = "admin_supervisor_phase10";
  const publishedTestId = "test-cuet-phy-01";

  beforeEach(() => {
    cbtMemoryStore.clear();
    resultMemoryStore.clear();
  });

  describe("1. Core Marking Rules & Evaluation Correctness", () => {
    it("evaluates a submitted test with correct, incorrect, and unanswered questions applying +5, -1 scheme", async () => {
      // 1. Start test
      const { attemptId } = await startOrResumeAttempt(studentAlice, publishedTestId);
      const fullTest = (await getMockTestById(publishedTestId, false))!;
      const q1 = fullTest.sections[0].questions[0];
      const q2 = fullTest.sections[1].questions[0];

      const correctOpt1 = q1.options.find((o) => o.isCorrect)!;
      const incorrectOpt2 = q2.options.find((o) => !o.isCorrect)!;

      // 2. Student answers Q1 correctly and Q2 incorrectly
      await saveAttemptAnswer(studentAlice, {
        attemptId,
        questionId: q1.id,
        selectedOptionId: correctOpt1.id,
        markedForReview: false,
        answerStatus: "ANSWERED",
        clientVersion: 1,
      });

      await saveAttemptAnswer(studentAlice, {
        attemptId,
        questionId: q2.id,
        selectedOptionId: incorrectOpt2.id,
        markedForReview: false,
        answerStatus: "ANSWERED",
        clientVersion: 1,
      });

      // 3. Submit attempt
      await submitAttempt(attemptId, studentAlice, false);

      // 4. Server-authoritative evaluation
      const result = await evaluateAttempt(attemptId, studentAlice);

      expect(result).toBeDefined();
      expect(result.attemptId).toBe(attemptId);
      expect(result.status).toBe("EVALUATED");

      // Verify question counts
      expect(result.correctCount).toBe(1);
      expect(result.incorrectCount).toBe(1);
      expect(result.unansweredCount).toBe(0);
      expect(result.totalQuestions).toBe(2);

      // Verify marks (+5 for Q1, -1 for Q2 = 4.0 net marks)
      expect(result.totalMarks).toBe(4.0);

      // Verify Accuracy: 1 correct out of 2 attempted = 50.0%
      expect(result.accuracy).toBe(50.0);

      // Verify Percentage: 4.0 / maximumMarks * 100
      const expectedPercentage = Math.round((4.0 / result.maximumMarks) * 10000) / 100;
      expect(result.percentage).toBe(expectedPercentage);

      // Inspect question details
      const q1Res = result.questions.find((q) => q.questionId === q1.id)!;
      expect(q1Res.status).toBe("CORRECT");
      expect(q1Res.isCorrect).toBe(true);
      expect(q1Res.awardedMarks).toBe(5.0);
      expect(q1Res.negativeMarksApplied).toBe(0.0);
      expect(q1Res.selectedOptionId).toBe(correctOpt1.id);

      const q2Res = result.questions.find((q) => q.questionId === q2.id)!;
      expect(q2Res.status).toBe("INCORRECT");
      expect(q2Res.isCorrect).toBe(false);
      expect(q2Res.awardedMarks).toBe(-1.0);
      expect(q2Res.negativeMarksApplied).toBe(1.0);
      expect(q2Res.selectedOptionId).toBe(incorrectOpt2.id);
    });

    it("correctly handles tests where student attempts zero questions (100% unanswered)", async () => {
      const { attemptId } = await startOrResumeAttempt(studentAlice, publishedTestId);
      await submitAttempt(attemptId, studentAlice, false);

      const result = await evaluateAttempt(attemptId, studentAlice);

      expect(result.correctCount).toBe(0);
      expect(result.incorrectCount).toBe(0);
      expect(result.unansweredCount).toBe(result.totalQuestions);
      expect(result.totalMarks).toBe(0.0);
      expect(result.accuracy).toBe(0.0);
      expect(result.percentage).toBe(0.0);
    });

    it("correctly calculates 100% accuracy when all attempted questions are correct", async () => {
      const { attemptId } = await startOrResumeAttempt(studentAlice, publishedTestId);
      const fullTest = (await getMockTestById(publishedTestId, false))!;

      const q1 = fullTest.sections[0].questions[0];
      const correctOpt1 = q1.options.find((o) => o.isCorrect)!;

      await saveAttemptAnswer(studentAlice, {
        attemptId,
        questionId: q1.id,
        selectedOptionId: correctOpt1.id,
        markedForReview: false,
        answerStatus: "ANSWERED",
        clientVersion: 1,
      });

      await submitAttempt(attemptId, studentAlice, false);

      const result = await evaluateAttempt(attemptId, studentAlice);
      expect(result.correctCount).toBe(1);
      expect(result.incorrectCount).toBe(0);
      expect(result.accuracy).toBe(100.0);
      expect(result.totalMarks).toBe(5.0);
    });

    it("correctly aggregates section-wise performance and accuracy", async () => {
      const { attemptId } = await startOrResumeAttempt(studentAlice, publishedTestId);
      const fullTest = (await getMockTestById(publishedTestId, false))!;

      const q1 = fullTest.sections[0].questions[0];
      const correctOpt1 = q1.options.find((o) => o.isCorrect)!;

      await saveAttemptAnswer(studentAlice, {
        attemptId,
        questionId: q1.id,
        selectedOptionId: correctOpt1.id,
        markedForReview: false,
        answerStatus: "ANSWERED",
        clientVersion: 1,
      });

      await submitAttempt(attemptId, studentAlice, false);
      const result = await evaluateAttempt(attemptId, studentAlice);

      expect(result.sections.length).toBeGreaterThan(0);
      const sec1 = result.sections[0];
      expect(sec1.correctCount).toBe(1);
      expect(sec1.totalMarks).toBe(5.0);
      expect(sec1.accuracy).toBe(100.0);
    });
  });

  describe("2. Idempotency & Historical Immutability", () => {
    it("guarantees idempotency: repeated evaluations return the same result without duplicate records", async () => {
      const { attemptId } = await startOrResumeAttempt(studentAlice, publishedTestId);
      await submitAttempt(attemptId, studentAlice, false);

      const firstEval = await evaluateAttempt(attemptId, studentAlice);
      const secondEval = await evaluateAttempt(attemptId, studentAlice);

      expect(secondEval.id).toBe(firstEval.id);
      expect(secondEval.evaluationVersion).toBe(1);
      expect(secondEval.evaluatedAt).toBe(firstEval.evaluatedAt);
      expect(secondEval.totalMarks).toBe(firstEval.totalMarks);
    });

    it("supports audited administrative re-evaluation and increments evaluationVersion", async () => {
      const { attemptId } = await startOrResumeAttempt(studentAlice, publishedTestId);
      await submitAttempt(attemptId, studentAlice, false);

      const initialEval = await evaluateAttempt(attemptId, studentAlice);
      expect(initialEval.evaluationVersion).toBe(1);

      // Admin triggers re-evaluation
      const reEval = await evaluateAttempt(attemptId, adminUser, true, true);
      expect(reEval.id).toBe(initialEval.id);
      expect(reEval.evaluationVersion).toBe(2);
    });

    it("freezes options and question text in snapshot for historical integrity", async () => {
      const { attemptId } = await startOrResumeAttempt(studentAlice, publishedTestId);
      await submitAttempt(attemptId, studentAlice, false);

      const result = await evaluateAttempt(attemptId, studentAlice);
      for (const q of result.questions) {
        expect(q.options.length).toBeGreaterThan(0);
        for (const opt of q.options) {
          expect(opt.optionLabel).toBeDefined();
          expect(opt.optionText).toBeDefined();
          expect(typeof opt.isCorrect).toBe("boolean");
        }
      }
    });
  });

  describe("3. Security & Access Control Boundaries", () => {
    it("rejects evaluation of an in-progress attempt", async () => {
      const { attemptId } = await startOrResumeAttempt(studentAlice, publishedTestId);

      await expect(
        evaluateAttempt(attemptId, studentAlice)
      ).rejects.toThrow("Cannot evaluate an in-progress test attempt.");
    });

    it("STRICT AUTHORIZATION: prevents a student from evaluating another student's attempt", async () => {
      const { attemptId } = await startOrResumeAttempt(studentAlice, publishedTestId);
      await submitAttempt(attemptId, studentAlice, false);

      await expect(
        evaluateAttempt(attemptId, studentBob)
      ).rejects.toThrow("Access denied: You cannot evaluate another student's attempt.");
    });

    it("STRICT AUTHORIZATION: prevents a student from viewing another student's result by result ID", async () => {
      const { attemptId } = await startOrResumeAttempt(studentAlice, publishedTestId);
      await submitAttempt(attemptId, studentAlice, false);
      const result = await evaluateAttempt(attemptId, studentAlice);

      await expect(
        getResultById(result.id, studentBob, false)
      ).rejects.toThrow("Access denied: You are not authorized to view this result.");
    });

    it("allows authorized administrators to view any student's result", async () => {
      const { attemptId } = await startOrResumeAttempt(studentAlice, publishedTestId);
      await submitAttempt(attemptId, studentAlice, false);
      const result = await evaluateAttempt(attemptId, studentAlice);

      const adminView = await getResultById(result.id, adminUser, true);
      expect(adminView).not.toBeNull();
      expect(adminView?.id).toBe(result.id);

      const byAttempt = await getResultByAttemptId(attemptId, studentAlice, false);
      expect(byAttempt).not.toBeNull();
      expect(byAttempt?.id).toBe(result.id);
    });
  });

  describe("4. Results History & Dashboard Queries", () => {
    it("returns real evaluated results for a student and filters out other students' results", async () => {
      const { attemptId } = await startOrResumeAttempt(studentAlice, publishedTestId);
      await submitAttempt(attemptId, studentAlice, false);
      await evaluateAttempt(attemptId, studentAlice);

      const aliceHistory = await getStudentResults(studentAlice);
      expect(aliceHistory.total).toBe(1);
      expect(aliceHistory.results[0].attemptId).toBe(attemptId);

      const bobHistory = await getStudentResults(studentBob);
      expect(bobHistory.total).toBe(0);
      expect(bobHistory.results.length).toBe(0);
    });

    it("supports search filtering in results history", async () => {
      const { attemptId } = await startOrResumeAttempt(studentAlice, publishedTestId);
      await submitAttempt(attemptId, studentAlice, false);
      await evaluateAttempt(attemptId, studentAlice);

      const matched = await getStudentResults(studentAlice, {
        search: "Physics",
        page: 1,
        limit: 10,
        sortBy: "date",
        sortOrder: "desc",
      });
      expect(matched.total).toBe(1);

      const unmatched = await getStudentResults(studentAlice, {
        search: "NonExistentKeywordXYZ",
        page: 1,
        limit: 10,
        sortBy: "date",
        sortOrder: "desc",
      });
      expect(unmatched.total).toBe(0);
    });

    it("allows administrators to list all student results via getAdminResults", async () => {
      const { attemptId } = await startOrResumeAttempt(studentAlice, publishedTestId);
      await submitAttempt(attemptId, studentAlice, false);
      await evaluateAttempt(attemptId, studentAlice);

      const adminList = await getAdminResults();
      expect(adminList.total).toBeGreaterThanOrEqual(1);
      const item = adminList.results.find((r) => r.attemptId === attemptId);
      expect(item).toBeDefined();
    });
  });
});
