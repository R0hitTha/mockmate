import { describe, it, expect, beforeEach } from "vitest";
import {
  startOrResumeAttempt,
  getAttemptForExam,
  saveAttemptAnswer,
  submitAttempt,
  getAttemptSubmissionSummary,
} from "@/lib/cbt-service";
import { cbtMemoryStore } from "@/lib/cbt-sample-data";

describe("Phase 9: CBT Examination Engine — Architecture & Business Logic", () => {
  const studentAlice = "student_alice_123";
  const studentBob = "student_bob_456";
  const publishedTestId = "test-cuet-phy-01";
  const draftTestId = "test-cuet-chem-draft";

  beforeEach(() => {
    cbtMemoryStore.clear();
  });

  describe("1. Attempt Lifecycle Management", () => {
    it("starts a valid published mock test and initializes attempt state", async () => {
      const { attemptId, isResumed } = await startOrResumeAttempt(
        studentAlice,
        publishedTestId
      );

      expect(attemptId).toBeDefined();
      expect(isResumed).toBe(false);

      const examPayload = await getAttemptForExam(attemptId, studentAlice);
      expect(examPayload.attempt.status).toBe("IN_PROGRESS");
      expect(examPayload.attempt.mockTestId).toBe(publishedTestId);
      expect(examPayload.sections.length).toBeGreaterThan(0);
      expect(Object.keys(examPayload.answers).length).toBeGreaterThan(0);
    });

    it("rejects attempt initiation for unpublished or draft mock tests", async () => {
      await expect(
        startOrResumeAttempt(studentAlice, draftTestId)
      ).rejects.toThrow("Cannot start test: This mock examination is not currently published.");
    });

    it("prevents duplicate active attempts: clicking start again resumes the active attempt", async () => {
      const first = await startOrResumeAttempt(studentAlice, publishedTestId);
      expect(first.isResumed).toBe(false);

      // Subsequent call by same student on same test
      const second = await startOrResumeAttempt(studentAlice, publishedTestId);
      expect(second.isResumed).toBe(true);
      expect(second.attemptId).toBe(first.attemptId);
    });

    it("successfully submits an attempt and transitions to SUBMITTED", async () => {
      const { attemptId } = await startOrResumeAttempt(studentAlice, publishedTestId);

      const submission = await submitAttempt(attemptId, studentAlice, false);
      expect(submission.success).toBe(true);
      expect(submission.status).toBe("SUBMITTED");
      expect(submission.submittedAt).toBeDefined();

      const summary = await getAttemptSubmissionSummary(attemptId, studentAlice);
      expect(summary.status).toBe("SUBMITTED");
    });

    it("ensures submission is idempotent: repeated submission requests do not corrupt data", async () => {
      const { attemptId } = await startOrResumeAttempt(studentAlice, publishedTestId);

      const firstSub = await submitAttempt(attemptId, studentAlice, false);
      const secondSub = await submitAttempt(attemptId, studentAlice, false);

      expect(secondSub.success).toBe(true);
      expect(secondSub.status).toBe("SUBMITTED");
      expect(secondSub.submittedAt).toBe(firstSub.submittedAt);
    });
  });

  describe("2. Answer Persistence & Versioning", () => {
    it("persists a chosen answer and updates answerStatus to ANSWERED", async () => {
      const { attemptId } = await startOrResumeAttempt(studentAlice, publishedTestId);
      const exam = await getAttemptForExam(attemptId, studentAlice);
      const question = exam.sections[0].questions[0];

      const saveResult = await saveAttemptAnswer(studentAlice, {
        attemptId,
        questionId: question.id,
        selectedOptionId: question.options[0].id,
        selectedOptionIds: [question.options[0].id],
        markedForReview: false,
        answerStatus: "ANSWERED",
        clientVersion: 1,
      });

      expect(saveResult.success).toBe(true);
      expect(saveResult.answerStatus).toBe("ANSWERED");
      expect(saveResult.version).toBe(2);

      // Verify reloaded exam payload reflects persisted answer
      const updatedExam = await getAttemptForExam(attemptId, studentAlice);
      expect(updatedExam.answers[question.id].selectedOptionId).toBe(question.options[0].id);
      expect(updatedExam.answers[question.id].answerStatus).toBe("ANSWERED");
    });

    it("supports changing an answer option", async () => {
      const { attemptId } = await startOrResumeAttempt(studentAlice, publishedTestId);
      const exam = await getAttemptForExam(attemptId, studentAlice);
      const question = exam.sections[0].questions[0];

      // Option 1
      await saveAttemptAnswer(studentAlice, {
        attemptId,
        questionId: question.id,
        selectedOptionId: question.options[0].id,
        selectedOptionIds: [question.options[0].id],
        markedForReview: false,
        answerStatus: "ANSWERED",
        clientVersion: 1,
      });

      // Change to Option 2
      const updated = await saveAttemptAnswer(studentAlice, {
        attemptId,
        questionId: question.id,
        selectedOptionId: question.options[1].id,
        selectedOptionIds: [question.options[1].id],
        markedForReview: false,
        answerStatus: "ANSWERED",
        clientVersion: 2,
      });

      expect(updated.success).toBe(true);
      const refreshed = await getAttemptForExam(attemptId, studentAlice);
      expect(refreshed.answers[question.id].selectedOptionId).toBe(question.options[1].id);
    });

    it("clears an answer when student selects clear response", async () => {
      const { attemptId } = await startOrResumeAttempt(studentAlice, publishedTestId);
      const exam = await getAttemptForExam(attemptId, studentAlice);
      const question = exam.sections[0].questions[0];

      await saveAttemptAnswer(studentAlice, {
        attemptId,
        questionId: question.id,
        selectedOptionId: question.options[0].id,
        selectedOptionIds: [question.options[0].id],
        markedForReview: false,
        answerStatus: "ANSWERED",
        clientVersion: 1,
      });

      // Clear response
      await saveAttemptAnswer(studentAlice, {
        attemptId,
        questionId: question.id,
        selectedOptionId: null,
        selectedOptionIds: [],
        markedForReview: false,
        answerStatus: "NOT_ANSWERED",
        clientVersion: 2,
      });

      const refreshed = await getAttemptForExam(attemptId, studentAlice);
      expect(refreshed.answers[question.id].selectedOptionId).toBeNull();
      expect(refreshed.answers[question.id].answerStatus).toBe("NOT_ANSWERED");
    });

    it("marks question for review (with or without answer)", async () => {
      const { attemptId } = await startOrResumeAttempt(studentAlice, publishedTestId);
      const exam = await getAttemptForExam(attemptId, studentAlice);
      const question = exam.sections[0].questions[0];

      // Mark for review without option
      const res1 = await saveAttemptAnswer(studentAlice, {
        attemptId,
        questionId: question.id,
        selectedOptionId: null,
        selectedOptionIds: [],
        markedForReview: true,
        answerStatus: "MARKED_FOR_REVIEW",
        clientVersion: 1,
      });
      expect(res1.answerStatus).toBe("MARKED_FOR_REVIEW");

      // Mark for review with option
      const res2 = await saveAttemptAnswer(studentAlice, {
        attemptId,
        questionId: question.id,
        selectedOptionId: question.options[0].id,
        selectedOptionIds: [question.options[0].id],
        markedForReview: true,
        answerStatus: "ANSWERED_AND_MARKED_FOR_REVIEW",
        clientVersion: res1.version,
      });
      expect(res2.answerStatus).toBe("ANSWERED_AND_MARKED_FOR_REVIEW");
    });

    it("protects against out-of-order stale writes via versioning", async () => {
      const { attemptId } = await startOrResumeAttempt(studentAlice, publishedTestId);
      const exam = await getAttemptForExam(attemptId, studentAlice);
      const question = exam.sections[0].questions[0];

      // Request 1 arrives and increments version to 2
      await saveAttemptAnswer(studentAlice, {
        attemptId,
        questionId: question.id,
        selectedOptionId: question.options[0].id,
        markedForReview: false,
        answerStatus: "ANSWERED",
        clientVersion: 1,
      });

      // Request 2 arrives and increments version to 3
      await saveAttemptAnswer(studentAlice, {
        attemptId,
        questionId: question.id,
        selectedOptionId: question.options[1].id,
        markedForReview: false,
        answerStatus: "ANSWERED",
        clientVersion: 2,
      });

      // Delayed Request with old clientVersion=1 arrives late
      await saveAttemptAnswer(studentAlice, {
        attemptId,
        questionId: question.id,
        selectedOptionId: question.options[0].id,
        markedForReview: false,
        answerStatus: "ANSWERED",
        clientVersion: 1, // Stale!
      });

      // The server must reject the stale overwrite
      const examRefreshed = await getAttemptForExam(attemptId, studentAlice);
      expect(examRefreshed.answers[question.id].selectedOptionId).toBe(question.options[1].id);
    });
  });

  describe("3. Server-Authoritative Timer & Expiration Handling", () => {
    it("determines duration from server database records, not client input", async () => {
      const { attemptId } = await startOrResumeAttempt(studentAlice, publishedTestId);
      const exam = await getAttemptForExam(attemptId, studentAlice);

      const startedMs = new Date(exam.attempt.startedAt).getTime();
      const expiresMs = new Date(exam.attempt.expiresAt).getTime();
      const diffMins = Math.round((expiresMs - startedMs) / (60 * 1000));

      expect(diffMins).toBe(45); // NTA Physics standard 45 minutes
      expect(exam.attempt.totalDuration).toBe(45);
    });

    it("rejects answer writes after examination has expired", async () => {
      const { attemptId } = await startOrResumeAttempt(studentAlice, publishedTestId);

      // Artificially simulate an expired attempt in the store
      const stored = cbtMemoryStore.getAttempt(attemptId);
      expect(stored).toBeDefined();
      stored!.expiresAt = new Date(Date.now() - 10000).toISOString(); // Expired 10s ago
      cbtMemoryStore.saveAttempt(stored!);

      const exam = await getAttemptForExam(attemptId, studentAlice);
      const question = exam.sections[0].questions[0];

      // Attempting to save after expiry must be rejected
      await expect(
        saveAttemptAnswer(studentAlice, {
          attemptId,
          questionId: question.id,
          selectedOptionId: question.options[0].id,
          markedForReview: false,
          answerStatus: "ANSWERED",
          clientVersion: 1,
        })
      ).rejects.toThrow(/expired|Cannot save answer/i);
    });

    it("triggers automatic submission when accessing an expired attempt", async () => {
      const { attemptId } = await startOrResumeAttempt(studentAlice, publishedTestId);

      // Artificially expire the attempt
      const stored = cbtMemoryStore.getAttempt(attemptId);
      stored!.expiresAt = new Date(Date.now() - 5000).toISOString();
      cbtMemoryStore.saveAttempt(stored!);

      const payload = await getAttemptForExam(attemptId, studentAlice);
      expect(payload.attempt.status).toBe("AUTO_SUBMITTED");
    });
  });

  describe("4. Security & Anti-Leakage Controls", () => {
    it("STRICT SECURITY: Questions payload NEVER contains isCorrect in options", async () => {
      const { attemptId } = await startOrResumeAttempt(studentAlice, publishedTestId);
      const payload = await getAttemptForExam(attemptId, studentAlice);

      for (const section of payload.sections) {
        for (const question of section.questions) {
          for (const opt of question.options) {
            expect((opt as unknown as Record<string, unknown>).isCorrect).toBeUndefined();
          }
        }
      }
    });

    it("STRICT SECURITY: Questions payload NEVER contains explanation before submission", async () => {
      const { attemptId } = await startOrResumeAttempt(studentAlice, publishedTestId);
      const payload = await getAttemptForExam(attemptId, studentAlice);

      for (const section of payload.sections) {
        for (const question of section.questions) {
          expect((question as unknown as Record<string, unknown>).explanation).toBeUndefined();
        }
      }
    });

    it("STRICT AUTHORIZATION: Denies access when a student attempts to view another student's attempt", async () => {
      const { attemptId } = await startOrResumeAttempt(studentAlice, publishedTestId);

      // Student Bob tries to view Alice's attempt
      await expect(getAttemptForExam(attemptId, studentBob)).rejects.toThrow(
        "Access denied: You are not authorized to view this test attempt."
      );
    });

    it("STRICT AUTHORIZATION: Denies saving answers to another student's attempt", async () => {
      const { attemptId } = await startOrResumeAttempt(studentAlice, publishedTestId);

      await expect(
        saveAttemptAnswer(studentBob, {
          attemptId,
          questionId: "any-q",
          selectedOptionId: "any-opt",
          markedForReview: false,
          answerStatus: "ANSWERED",
          clientVersion: 1,
        })
      ).rejects.toThrow("Access denied: You cannot alter another student's test answers.");
    });

    it("rejects saving answers to already submitted attempts", async () => {
      const { attemptId } = await startOrResumeAttempt(studentAlice, publishedTestId);
      const exam = await getAttemptForExam(attemptId, studentAlice);
      const question = exam.sections[0].questions[0];

      await submitAttempt(attemptId, studentAlice, false);

      await expect(
        saveAttemptAnswer(studentAlice, {
          attemptId,
          questionId: question.id,
          selectedOptionId: question.options[0].id,
          markedForReview: false,
          answerStatus: "ANSWERED",
          clientVersion: 1,
        })
      ).rejects.toThrow("Cannot save answer: This attempt is already SUBMITTED.");
    });
  });
});
