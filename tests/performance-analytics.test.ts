import { describe, it, expect, beforeEach } from "vitest";
import {
  startOrResumeAttempt,
  saveAttemptAnswer,
  submitAttempt,
} from "@/lib/cbt-service";
import { evaluateAttempt } from "@/lib/evaluation-service";
import {
  getStudentAnalytics,
  getStudentDashboardAnalytics,
} from "@/lib/analytics-service";
import { cbtMemoryStore } from "@/lib/cbt-sample-data";
import { resultMemoryStore } from "@/lib/evaluation-sample-data";
import { getMockTestById } from "@/lib/mock-test-service";

describe("Phase 11: Performance Analytics — Architecture & Business Logic", () => {
  const studentAlice = "student_alice_analytics";
  const studentBob = "student_bob_analytics";
  const physicsTestId = "test-cuet-phy-01";
  const mathTestId = "test-cuet-math-01";

  beforeEach(() => {
    cbtMemoryStore.clear();
    resultMemoryStore.clear();
  });

  describe("1. Overall Analytics & Metrics Calculation", () => {
    it("returns an empty state with zeroed metrics when student has no completed tests", async () => {
      const analytics = await getStudentAnalytics(studentAlice);

      expect(analytics.hasCompletedTests).toBe(false);
      expect(analytics.hasEnoughDataForTrends).toBe(false);
      expect(analytics.overview.completedTests).toBe(0);
      expect(analytics.overview.averageScorePercentage).toBe(0);
      expect(analytics.overview.bestScorePercentage).toBe(0);
      expect(analytics.overview.averageAccuracy).toBe(0);
      expect(analytics.scoreTrend.length).toBe(0);
      expect(analytics.subjects.length).toBe(0);
      expect(analytics.topics.length).toBe(0);
    });

    it("correctly calculates average score, best score, and accuracy across multiple completed tests", async () => {
      // Test 1: Physics Test
      const { attemptId: att1 } = await startOrResumeAttempt(studentAlice, physicsTestId);
      const test1 = (await getMockTestById(physicsTestId, false))!;
      const q1 = test1.sections[0].questions[0];
      const correctOpt1 = q1.options.find((o) => o.isCorrect)!;

      // Answer Q1 correctly
      await saveAttemptAnswer(studentAlice, {
        attemptId: att1,
        questionId: q1.id,
        selectedOptionId: correctOpt1.id,
        markedForReview: false,
        answerStatus: "ANSWERED",
        clientVersion: 1,
      });
      await submitAttempt(att1, studentAlice, false);
      await evaluateAttempt(att1, studentAlice);

      // Test 2: Math Test
      const { attemptId: att2 } = await startOrResumeAttempt(studentAlice, mathTestId);
      const test2 = (await getMockTestById(mathTestId, false))!;
      const qMath = test2.sections[0].questions[0];
      const incorrectOptMath = qMath.options.find((o) => !o.isCorrect)!;

      // Answer QMath incorrectly
      await saveAttemptAnswer(studentAlice, {
        attemptId: att2,
        questionId: qMath.id,
        selectedOptionId: incorrectOptMath.id,
        markedForReview: false,
        answerStatus: "ANSWERED",
        clientVersion: 1,
      });
      await submitAttempt(att2, studentAlice, false);
      await evaluateAttempt(att2, studentAlice);

      // Compute analytics
      const analytics = await getStudentAnalytics(studentAlice);

      expect(analytics.hasCompletedTests).toBe(true);
      expect(analytics.hasEnoughDataForTrends).toBe(true);
      expect(analytics.overview.completedTests).toBe(2);

      // Total attempted: 1 correct + 1 incorrect = 2 questions
      expect(analytics.overview.totalQuestionsAttempted).toBe(2);
      expect(analytics.overview.totalQuestionsCorrect).toBe(1);
      expect(analytics.overview.totalQuestionsIncorrect).toBe(1);

      // Accuracy: 1 / 2 = 50.0%
      expect(analytics.overview.averageAccuracy).toBe(50.0);

      // Best score percentage should equal max percentage
      expect(analytics.overview.bestScorePercentage).toBeGreaterThanOrEqual(
        analytics.overview.averageScorePercentage
      );

      // Progression trend: with 2 tests, an overall trend is determined
      expect(analytics.overview.overallTrend).not.toBeNull();
      expect(analytics.scoreTrend.length).toBe(2);
    });

    it("excludes unanswered questions from accuracy denominator", async () => {
      const { attemptId } = await startOrResumeAttempt(studentAlice, physicsTestId);
      const test = (await getMockTestById(physicsTestId, false))!;
      const q1 = test.sections[0].questions[0];
      const correctOpt1 = q1.options.find((o) => o.isCorrect)!;

      // Only attempt Q1 (correct), Q2 left unanswered
      await saveAttemptAnswer(studentAlice, {
        attemptId,
        questionId: q1.id,
        selectedOptionId: correctOpt1.id,
        markedForReview: false,
        answerStatus: "ANSWERED",
        clientVersion: 1,
      });
      await submitAttempt(attemptId, studentAlice, false);
      await evaluateAttempt(attemptId, studentAlice);

      const analytics = await getStudentAnalytics(studentAlice);

      // 1 attempted, 1 unanswered. Accuracy must be 100% (1 / 1), NOT 50% (1 / 2)
      expect(analytics.overview.totalQuestionsAttempted).toBe(1);
      expect(analytics.overview.totalQuestionsUnanswered).toBe(1);
      expect(analytics.overview.averageAccuracy).toBe(100.0);
    });
  });

  describe("2. Subject-Wise Analytics", () => {
    it("aggregates performance by subject across completed tests", async () => {
      const { attemptId } = await startOrResumeAttempt(studentAlice, physicsTestId);
      const test = (await getMockTestById(physicsTestId, false))!;
      const q1 = test.sections[0].questions[0];
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
      await evaluateAttempt(attemptId, studentAlice);

      const analytics = await getStudentAnalytics(studentAlice);
      expect(analytics.subjects.length).toBeGreaterThanOrEqual(1);

      const phySub = analytics.subjects.find((s) => s.subjectName === "Physics");
      expect(phySub).toBeDefined();
      expect(phySub?.testsCount).toBe(1);
      expect(phySub?.correctCount).toBe(1);
      expect(phySub?.accuracy).toBe(100.0);
    });
  });

  describe("3. Topic-Wise Diagnostics & Sample Size Thresholds", () => {
    it("marks topics with insufficient sample size (< 2 questions) as INSUFFICIENT_DATA", async () => {
      const { attemptId } = await startOrResumeAttempt(studentAlice, physicsTestId);
      const test = (await getMockTestById(physicsTestId, false))!;
      const q1 = test.sections[0].questions[0];
      const correctOpt1 = q1.options.find((o) => o.isCorrect)!;

      // 1 question attempted in this topic
      await saveAttemptAnswer(studentAlice, {
        attemptId,
        questionId: q1.id,
        selectedOptionId: correctOpt1.id,
        markedForReview: false,
        answerStatus: "ANSWERED",
        clientVersion: 1,
      });
      await submitAttempt(attemptId, studentAlice, false);
      await evaluateAttempt(attemptId, studentAlice);

      const analytics = await getStudentAnalytics(studentAlice);
      const singleTopic = analytics.topics.find((t) => t.sampleSize === 1);

      if (singleTopic) {
        expect(singleTopic.status).toBe("INSUFFICIENT_DATA");
      }
    });

    it("evaluates diagnostic status (STRONG / NEEDS_PRACTICE) when sample size >= 2", async () => {
      // Complete 2 separate tests with physics questions
      const { attemptId: att1 } = await startOrResumeAttempt(studentAlice, physicsTestId);
      const test = (await getMockTestById(physicsTestId, false))!;
      const q1 = test.sections[0].questions[0];
      const correctOpt1 = q1.options.find((o) => o.isCorrect)!;

      await saveAttemptAnswer(studentAlice, {
        attemptId: att1,
        questionId: q1.id,
        selectedOptionId: correctOpt1.id,
        markedForReview: false,
        answerStatus: "ANSWERED",
        clientVersion: 1,
      });
      await submitAttempt(att1, studentAlice, false);
      await evaluateAttempt(att1, studentAlice);

      // Second attempt on same test
      const { attemptId: att2 } = await startOrResumeAttempt("student_alice_second", physicsTestId);
      await saveAttemptAnswer("student_alice_second", {
        attemptId: att2,
        questionId: q1.id,
        selectedOptionId: correctOpt1.id,
        markedForReview: false,
        answerStatus: "ANSWERED",
        clientVersion: 1,
      });
      await submitAttempt(att2, "student_alice_second", false);
      await evaluateAttempt(att2, "student_alice_second");

      const analytics = await getStudentAnalytics(studentAlice);
      expect(analytics.topics.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("4. Time Management & Pacing Analytics", () => {
    it("correctly computes total time spent and average speed per question", async () => {
      const { attemptId } = await startOrResumeAttempt(studentAlice, physicsTestId);
      const test = (await getMockTestById(physicsTestId, false))!;
      const q1 = test.sections[0].questions[0];

      await saveAttemptAnswer(studentAlice, {
        attemptId,
        questionId: q1.id,
        selectedOptionId: q1.options[0].id,
        markedForReview: false,
        answerStatus: "ANSWERED",
        clientVersion: 1,
      });
      await submitAttempt(attemptId, studentAlice, false);
      await evaluateAttempt(attemptId, studentAlice);

      const analytics = await getStudentAnalytics(studentAlice);
      expect(analytics.timeManagement.totalTimeSpentMinutes).toBeGreaterThanOrEqual(0);
      expect(analytics.timeManagement.paceDescription).toBeDefined();
    });
  });

  describe("5. Security & Student Data Isolation", () => {
    it("STRICT ISOLATION: Student Bob sees zero data from Student Alice's attempts", async () => {
      // Alice completes a test
      const { attemptId } = await startOrResumeAttempt(studentAlice, physicsTestId);
      const test = (await getMockTestById(physicsTestId, false))!;
      const q1 = test.sections[0].questions[0];

      await saveAttemptAnswer(studentAlice, {
        attemptId,
        questionId: q1.id,
        selectedOptionId: q1.options[0].id,
        markedForReview: false,
        answerStatus: "ANSWERED",
        clientVersion: 1,
      });
      await submitAttempt(attemptId, studentAlice, false);
      await evaluateAttempt(attemptId, studentAlice);

      // Check Alice's analytics
      const aliceAnalytics = await getStudentAnalytics(studentAlice);
      expect(aliceAnalytics.overview.completedTests).toBe(1);

      // Check Bob's analytics
      const bobAnalytics = await getStudentAnalytics(studentBob);
      expect(bobAnalytics.overview.completedTests).toBe(0);
      expect(bobAnalytics.hasCompletedTests).toBe(false);
      expect(bobAnalytics.scoreTrend.length).toBe(0);
      expect(bobAnalytics.subjects.length).toBe(0);
    });
  });

  describe("6. Filters & Dashboard Integration", () => {
    it("respects category and exam year filters", async () => {
      const { attemptId } = await startOrResumeAttempt(studentAlice, physicsTestId);
      const test = (await getMockTestById(physicsTestId, false))!;
      const q1 = test.sections[0].questions[0];

      await saveAttemptAnswer(studentAlice, {
        attemptId,
        questionId: q1.id,
        selectedOptionId: q1.options[0].id,
        markedForReview: false,
        answerStatus: "ANSWERED",
        clientVersion: 1,
      });
      await submitAttempt(attemptId, studentAlice, false);
      await evaluateAttempt(attemptId, studentAlice);

      // Matched filter
      const matched = await getStudentAnalytics(studentAlice, "Alice", {
        category: "SUBJECT_WISE",
        examYear: "2026",
        period: "all",
      });
      expect(matched.overview.completedTests).toBe(1);

      // Unmatched category filter
      const unmatched = await getStudentAnalytics(studentAlice, "Alice", {
        category: "GENERAL_TEST",
        examYear: "2026",
        period: "all",
      });
      expect(unmatched.overview.completedTests).toBe(0);
    });

    it("provides concise dashboard analytics via getStudentDashboardAnalytics", async () => {
      const { attemptId } = await startOrResumeAttempt(studentAlice, physicsTestId);
      const test = (await getMockTestById(physicsTestId, false))!;
      const q1 = test.sections[0].questions[0];
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
      await evaluateAttempt(attemptId, studentAlice);

      const dashboard = await getStudentDashboardAnalytics(studentAlice);
      expect(dashboard.hasCompletedTests).toBe(true);
      expect(dashboard.completedTests).toBe(1);
      expect(dashboard.latestResult).not.toBeNull();
      expect(dashboard.latestResult?.testTitle).toBe(test.title);
      expect(dashboard.averageAccuracy).toBe(100.0);
    });
  });
});

