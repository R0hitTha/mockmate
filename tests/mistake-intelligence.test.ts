import { describe, it, expect, beforeEach } from "vitest";
import {
  startOrResumeAttempt,
  saveAttemptAnswer,
  submitAttempt,
} from "@/lib/cbt-service";
import { evaluateAttempt } from "@/lib/evaluation-service";
import {
  getStudentMistakesPayload,
  getStudentMistakesList,
  updateMistakeReviewStatus,
  toggleQuestionBookmark,
  getStudentBookmarks,
  getStudentDashboardMistakeSummary,
  mistakeMemoryStore,
} from "@/lib/mistake-service";
import { cbtMemoryStore } from "@/lib/cbt-sample-data";
import { resultMemoryStore } from "@/lib/evaluation-sample-data";
import { getMockTestById } from "@/lib/mock-test-service";

describe("Phase 12: Mistake Intelligence — Architecture & Business Logic", () => {
  const studentAlice = "student_alice_mistakes";
  const studentBob = "student_bob_mistakes";
  const physicsTestId = "test-cuet-phy-01";

  beforeEach(() => {
    cbtMemoryStore.clear();
    resultMemoryStore.clear();
    mistakeMemoryStore.clear();
  });

  describe("1. Mistake Identification & Filtering Boundaries", () => {
    it("returns zero mistakes and empty state when student has no completed tests", async () => {
      const payload = await getStudentMistakesPayload(studentAlice);

      expect(payload.hasMistakes).toBe(false);
      expect(payload.overview.totalIncorrect).toBe(0);
      expect(payload.overview.totalUnanswered).toBe(0);
      expect(payload.overview.pendingReviewCount).toBe(0);
      expect(payload.overview.reviewedCount).toBe(0);
      expect(payload.overview.masteredCount).toBe(0);
      expect(payload.topicsToRevisit.length).toBe(0);
      expect(payload.categoryBreakdown.length).toBe(0);
    });

    it("identifies incorrect answers and unanswered questions separately while strictly excluding in-progress attempts", async () => {
      // 1. Start test
      const { attemptId } = await startOrResumeAttempt(studentAlice, physicsTestId);
      const test = (await getMockTestById(physicsTestId, false))!;
      const q1 = test.sections[0].questions[0]; // Q-PHY-2026-001

      // While in progress, mistake intelligence must see ZERO mistakes
      const inProgressPayload = await getStudentMistakesPayload(studentAlice);
      expect(inProgressPayload.hasMistakes).toBe(false);

      // Student answers Q1 incorrectly (chooses an incorrect option)
      const wrongOpt1 = q1.options.find((o) => !o.isCorrect)!;
      await saveAttemptAnswer(studentAlice, {
        attemptId,
        questionId: q1.id,
        selectedOptionId: wrongOpt1.id,
        markedForReview: false,
        answerStatus: "ANSWERED",
        clientVersion: 1,
      });

      // Student leaves Q2 completely unanswered

      // Submit and evaluate
      await submitAttempt(attemptId, studentAlice, false);
      await evaluateAttempt(attemptId, studentAlice);

      // Now query mistake payload
      const payload = await getStudentMistakesPayload(studentAlice);

      expect(payload.hasMistakes).toBe(true);
      expect(payload.overview.totalIncorrect).toBe(1);
      expect(payload.overview.totalUnanswered).toBe(1);
      expect(payload.overview.pendingReviewCount).toBe(2);

      // Verify category breakdown has distinct entries for incorrect and unanswered
      const incorrectCat = payload.categoryBreakdown.find((c) => c.category === "INCORRECT");
      const unansweredCat = payload.categoryBreakdown.find((c) => c.category === "UNANSWERED");

      expect(incorrectCat).toBeDefined();
      expect(incorrectCat?.count).toBe(1);
      expect(unansweredCat).toBeDefined();
      expect(unansweredCat?.count).toBe(1);
    });
  });

  describe("2. Evidence-Based Classification & Sample Size Rules", () => {
    it("does NOT classify a topic as CONCEPT_GAP when sample size is below threshold (N < 3)", async () => {
      const { attemptId } = await startOrResumeAttempt(studentAlice, physicsTestId);
      const test = (await getMockTestById(physicsTestId, false))!;
      const q1 = test.sections[0].questions[0];
      const wrongOpt1 = q1.options.find((o) => !o.isCorrect)!;

      // Single mistake
      await saveAttemptAnswer(studentAlice, {
        attemptId,
        questionId: q1.id,
        selectedOptionId: wrongOpt1.id,
        markedForReview: false,
        answerStatus: "ANSWERED",
        clientVersion: 1,
      });

      await submitAttempt(attemptId, studentAlice, false);
      await evaluateAttempt(attemptId, studentAlice);

      const payload = await getStudentMistakesPayload(studentAlice);

      // A single mistake must NOT produce a concept gap classification
      const conceptGapCat = payload.categoryBreakdown.find((c) => c.category === "CONCEPT_GAP");
      expect(conceptGapCat).toBeUndefined();

      const topicItem = payload.topicsToRevisit[0];
      expect(topicItem).toBeDefined();
      expect(topicItem.status).toBe("LIMITED_EVIDENCE");
    });

    it("classifies CONCEPT_GAP only when N >= 3 question attempts with sub-50% accuracy", async () => {
      // Complete 3 separate tests where student answers the same topic questions incorrectly
      for (let i = 1; i <= 3; i++) {
        const { attemptId } = await startOrResumeAttempt(studentAlice, physicsTestId);
        const test = (await getMockTestById(physicsTestId, false))!;
        const q1 = test.sections[0].questions[0];
        const wrongOpt = q1.options.find((o) => !o.isCorrect)!;

        await saveAttemptAnswer(studentAlice, {
          attemptId,
          questionId: q1.id,
          selectedOptionId: wrongOpt.id,
          markedForReview: false,
          answerStatus: "ANSWERED",
          clientVersion: 1,
        });

        await submitAttempt(attemptId, studentAlice, false);
        await evaluateAttempt(attemptId, studentAlice);
      }

      const payload = await getStudentMistakesPayload(studentAlice);

      // Now sample size N = 3 >= 3, and accuracy is 0% (< 50%)
      const conceptGapCat = payload.categoryBreakdown.find((c) => c.category === "CONCEPT_GAP");
      expect(conceptGapCat).toBeDefined();
      expect(conceptGapCat!.count).toBeGreaterThan(0);

      const topicItem = payload.topicsToRevisit.find((t) => t.status === "CONCEPT_GAP");
      expect(topicItem).toBeDefined();
      expect(topicItem!.sampleSize).toBeGreaterThanOrEqual(3);
      expect(topicItem!.accuracy).toBeLessThan(50);
    });

    it("identifies REPEATED_QUESTION_ERROR when the exact same question is missed across multiple attempts", async () => {
      // Attempt 1: miss Q1
      const { attemptId: att1 } = await startOrResumeAttempt(studentAlice, physicsTestId);
      const test1 = (await getMockTestById(physicsTestId, false))!;
      const q1 = test1.sections[0].questions[0];
      const wrongOpt1 = q1.options.find((o) => !o.isCorrect)!;

      await saveAttemptAnswer(studentAlice, {
        attemptId: att1,
        questionId: q1.id,
        selectedOptionId: wrongOpt1.id,
        markedForReview: false,
        answerStatus: "ANSWERED",
        clientVersion: 1,
      });
      await submitAttempt(att1, studentAlice, false);
      await evaluateAttempt(att1, studentAlice);

      // Attempt 2: miss Q1 again
      const { attemptId: att2 } = await startOrResumeAttempt(studentAlice, physicsTestId);
      await saveAttemptAnswer(studentAlice, {
        attemptId: att2,
        questionId: q1.id,
        selectedOptionId: wrongOpt1.id,
        markedForReview: false,
        answerStatus: "ANSWERED",
        clientVersion: 1,
      });
      await submitAttempt(att2, studentAlice, false);
      await evaluateAttempt(att2, studentAlice);

      const list = await getStudentMistakesList(studentAlice, { category: "ALL", sortBy: "recent" });
      const repeatedItems = list.items.filter((i) => i.questionId === q1.id && i.repeatedCountForQuestion >= 2);

      expect(repeatedItems.length).toBe(2); // Recorded for both attempts
      expect(repeatedItems[0].categories.some((c) => c.category === "REPEATED_QUESTION_ERROR")).toBe(true);
    });

    it("only assigns CARELESS_ERROR when explicitly tagged by student", async () => {
      const { attemptId } = await startOrResumeAttempt(studentAlice, physicsTestId);
      const test = (await getMockTestById(physicsTestId, false))!;
      const q1 = test.sections[0].questions[0];
      const wrongOpt1 = q1.options.find((o) => !o.isCorrect)!;

      await saveAttemptAnswer(studentAlice, {
        attemptId,
        questionId: q1.id,
        selectedOptionId: wrongOpt1.id,
        markedForReview: false,
        answerStatus: "ANSWERED",
        clientVersion: 1,
      });
      await submitAttempt(attemptId, studentAlice, false);
      await evaluateAttempt(attemptId, studentAlice);

      // Before tagging, CARELESS_ERROR must NOT exist
      let list = await getStudentMistakesList(studentAlice, { category: "ALL" });
      expect(list.items[0].categories.some((c) => c.category === "CARELESS_ERROR")).toBe(false);

      // Student tags it as CARELESS
      await updateMistakeReviewStatus(studentAlice, {
        attemptId,
        questionId: q1.id,
        status: "REVIEWED",
        errorReason: "CARELESS",
        notes: "Forgot the negative sign in Coulomb formula",
      });

      list = await getStudentMistakesList(studentAlice, { category: "ALL" });
      expect(list.items[0].categories.some((c) => c.category === "CARELESS_ERROR")).toBe(true);
      expect(list.items[0].studentNotes).toBe("Forgot the negative sign in Coulomb formula");
    });
  });

  describe("3. Review Status Lifecycle & Student Actions", () => {
    it("new mistakes begin as PENDING_REVIEW and transition to REVIEWED and MASTERED without altering original test results", async () => {
      const { attemptId } = await startOrResumeAttempt(studentAlice, physicsTestId);
      const test = (await getMockTestById(physicsTestId, false))!;
      const q1 = test.sections[0].questions[0];
      const wrongOpt1 = q1.options.find((o) => !o.isCorrect)!;

      await saveAttemptAnswer(studentAlice, {
        attemptId,
        questionId: q1.id,
        selectedOptionId: wrongOpt1.id,
        markedForReview: false,
        answerStatus: "ANSWERED",
        clientVersion: 1,
      });
      await submitAttempt(attemptId, studentAlice, false);
      const originalResult = await evaluateAttempt(attemptId, studentAlice);

      // 1. Initial State: PENDING_REVIEW
      let list = await getStudentMistakesList(studentAlice, { category: "ALL" });
      expect(list.items[0].reviewStatus).toBe("PENDING_REVIEW");

      // 2. Mark REVIEWED
      await updateMistakeReviewStatus(studentAlice, {
        attemptId,
        questionId: q1.id,
        status: "REVIEWED",
      });

      list = await getStudentMistakesList(studentAlice, { category: "ALL" });
      expect(list.items[0].reviewStatus).toBe("REVIEWED");
      expect(list.items[0].reviewedAt).toBeDefined();

      // 3. Mark MASTERED
      await updateMistakeReviewStatus(studentAlice, {
        attemptId,
        questionId: q1.id,
        status: "MASTERED",
      });

      list = await getStudentMistakesList(studentAlice, { category: "ALL" });
      expect(list.items[0].reviewStatus).toBe("MASTERED");
      expect(list.items[0].masteredAt).toBeDefined();

      // 4. Verify Original Test Result is completely unchanged
      const evaluatedResultAfter = await evaluateAttempt(attemptId, studentAlice);
      expect(evaluatedResultAfter.totalMarks).toBe(originalResult.totalMarks);
      expect(evaluatedResultAfter.accuracy).toBe(originalResult.accuracy);
      expect(evaluatedResultAfter.correctCount).toBe(originalResult.correctCount);
      expect(evaluatedResultAfter.incorrectCount).toBe(originalResult.incorrectCount);
    });
  });

  describe("4. Question Bookmarking", () => {
    it("allows bookmarking and removing bookmarks for revision", async () => {
      const questionId = "Q-PHY-2026-001";

      // 1. Bookmark question
      const res1 = await toggleQuestionBookmark(studentAlice, questionId, "Tricky electrostatics problem");
      expect(res1.isBookmarked).toBe(true);

      const bookmarks1 = await getStudentBookmarks(studentAlice);
      expect(bookmarks1.total).toBe(1);
      expect(bookmarks1.items[0].questionId).toBe(questionId);
      expect(bookmarks1.items[0].notes).toBe("Tricky electrostatics problem");

      // 2. Toggle again to remove bookmark
      const res2 = await toggleQuestionBookmark(studentAlice, questionId);
      expect(res2.isBookmarked).toBe(false);

      const bookmarks2 = await getStudentBookmarks(studentAlice);
      expect(bookmarks2.total).toBe(0);
    });

    it("STRICT ISOLATION: Student Bob cannot see or alter Student Alice's bookmarks", async () => {
      const questionId = "Q-PHY-2026-001";
      await toggleQuestionBookmark(studentAlice, questionId, "Alice private note");

      const bobBookmarks = await getStudentBookmarks(studentBob);
      expect(bobBookmarks.total).toBe(0);
    });
  });

  describe("5. Security & Student Data Isolation", () => {
    it("STRICT ISOLATION: Student Bob sees zero mistake records from Student Alice", async () => {
      const { attemptId } = await startOrResumeAttempt(studentAlice, physicsTestId);
      const test = (await getMockTestById(physicsTestId, false))!;
      const q1 = test.sections[0].questions[0];
      const wrongOpt1 = q1.options.find((o) => !o.isCorrect)!;

      await saveAttemptAnswer(studentAlice, {
        attemptId,
        questionId: q1.id,
        selectedOptionId: wrongOpt1.id,
        markedForReview: false,
        answerStatus: "ANSWERED",
        clientVersion: 1,
      });
      await submitAttempt(attemptId, studentAlice, false);
      await evaluateAttempt(attemptId, studentAlice);

      // Student Alice sees 1 incorrect
      const alicePayload = await getStudentMistakesPayload(studentAlice);
      expect(alicePayload.overview.totalIncorrect).toBe(1);

      // Student Bob must see 0
      const bobPayload = await getStudentMistakesPayload(studentBob);
      expect(bobPayload.hasMistakes).toBe(false);
      expect(bobPayload.overview.totalIncorrect).toBe(0);
      expect(bobPayload.overview.pendingReviewCount).toBe(0);

      const bobList = await getStudentMistakesList(studentBob, { category: "ALL" });
      expect(bobList.total).toBe(0);
    });

    it("STRICT AUTHORIZATION: prevents Student Bob from altering Student Alice's mistake review", async () => {
      const { attemptId } = await startOrResumeAttempt(studentAlice, physicsTestId);
      const test = (await getMockTestById(physicsTestId, false))!;
      const q1 = test.sections[0].questions[0];
      const wrongOpt1 = q1.options.find((o) => !o.isCorrect)!;

      await saveAttemptAnswer(studentAlice, {
        attemptId,
        questionId: q1.id,
        selectedOptionId: wrongOpt1.id,
        markedForReview: false,
        answerStatus: "ANSWERED",
        clientVersion: 1,
      });
      await submitAttempt(attemptId, studentAlice, false);
      await evaluateAttempt(attemptId, studentAlice);

      // Bob tries to update Alice's review status
      await expect(
        updateMistakeReviewStatus(studentBob, {
          attemptId,
          questionId: q1.id,
          status: "MASTERED",
        })
      ).rejects.toThrow("Access denied");
    });
  });

  describe("6. Dashboard Mistake Summary Integration", () => {
    it("returns accurate compact metrics for the dashboard", async () => {
      const summaryBefore = await getStudentDashboardMistakeSummary(studentAlice);
      expect(summaryBefore.hasMistakes).toBe(false);
      expect(summaryBefore.pendingReviewCount).toBe(0);

      const { attemptId } = await startOrResumeAttempt(studentAlice, physicsTestId);
      const test = (await getMockTestById(physicsTestId, false))!;
      const q1 = test.sections[0].questions[0];
      const wrongOpt1 = q1.options.find((o) => !o.isCorrect)!;

      await saveAttemptAnswer(studentAlice, {
        attemptId,
        questionId: q1.id,
        selectedOptionId: wrongOpt1.id,
        markedForReview: false,
        answerStatus: "ANSWERED",
        clientVersion: 1,
      });
      await submitAttempt(attemptId, studentAlice, false);
      await evaluateAttempt(attemptId, studentAlice);

      const summaryAfter = await getStudentDashboardMistakeSummary(studentAlice);
      expect(summaryAfter.hasMistakes).toBe(true);
      expect(summaryAfter.pendingReviewCount).toBe(2);
      expect(summaryAfter.totalIncorrect).toBe(1);
      expect(summaryAfter.topRecommendation).toBeDefined();
    });
  });
});

