import { describe, it, expect, beforeEach } from "vitest";
import {
  startOrResumeAttempt,
  getAttemptForExam,
  saveAttemptAnswer,
  submitAttempt,
} from "@/lib/cbt-service";
import { cbtMemoryStore } from "@/lib/cbt-sample-data";
import { resultMemoryStore } from "@/lib/evaluation-sample-data";
import {
  evaluateAttempt,
  getResultByAttemptId,
} from "@/lib/evaluation-service";
import { getMockTestById } from "@/lib/mock-test-service";
import { getStudentAnalytics } from "@/lib/analytics-service";
import { getStudentMistakesPayload, updateMistakeReviewStatus } from "@/lib/mistake-service";
import {
  saveStudentStudyPreferences,
  generateStudentWeeklyPlan,
  getStudentStudyPlannerData,
  updateStudyTaskStatus,
  studyPlannerMemoryStore,
} from "@/lib/study-planner-service";
import {
  isSuperAdmin,
  canManageSupport,
  canManageFinance,
  canManageContent,
  checkAdminAccess,
  adminMemoryStore,
  suspendStudent,
  reactivateStudent,
  getAdminStudentDetail,
} from "@/lib/admin-service";
import {
  assignStudentSubscription,
  checkStudentFeatureAccess,
  subscriptionMemoryStore,
} from "@/lib/entitlement-service";

describe("Phase 15: End-to-End User Journeys & Critical Lifecycle Verification", () => {
  const studentAlice = "student_cuet_alice_e2e";
  const studentBobIntruder = "student_cuet_bob_intruder";
  const superAdminId = "admin_super_e2e_01";
  const publishedTestId = "test-cuet-phy-01";

  beforeEach(() => {
    cbtMemoryStore.clear();
    resultMemoryStore.clear();
    studyPlannerMemoryStore.reset();
    adminMemoryStore.reset();
    subscriptionMemoryStore.reset();
  });

  describe("Complete Student Journey (Lifecycle Steps 1–13)", () => {
    it("completes full end-to-end journey: enrollment -> mock test -> answer submission -> evaluation -> mistake bank -> analytics -> study planner", async () => {
      // Step 1: Initial subscription & entitlement check (Free diagnostic tier by default)
      const freeEntitlement = await checkStudentFeatureAccess(studentAlice, "FULL_MOCK_TESTS");
      expect(freeEntitlement.allowed).toBe(true);
      expect(freeEntitlement.limit).toBe(1); // 1 free baseline diagnostic mock

      // Step 2: Student starts a mock test attempt (Server-authoritative timer)
      const { attemptId, isResumed } = await startOrResumeAttempt(studentAlice, publishedTestId);
      expect(attemptId).toBeDefined();
      expect(isResumed).toBe(false);

      const fullTest = (await getMockTestById(publishedTestId, false))!;
      expect(fullTest).toBeDefined();
      expect(fullTest.sections.length).toBeGreaterThan(0);

      const q1 = fullTest.sections[0].questions[0];
      const q2 = fullTest.sections[1]?.questions[0] || fullTest.sections[0].questions[1];
      const correctOpt1 = q1.options.find((o) => o.isCorrect)!;
      const incorrectOpt2 = q2.options.find((o) => !o.isCorrect)!;

      // Step 3: Student answers questions (saving answers with autosave confirmation)
      // Answer Q1 correctly
      const saveRes1 = await saveAttemptAnswer(studentAlice, {
        attemptId,
        questionId: q1.id,
        selectedOptionId: correctOpt1.id,
        markedForReview: false,
        answerStatus: "ANSWERED",
        clientVersion: 1,
      });
      expect(saveRes1.success).toBe(true);

      // Answer Q2 incorrectly
      const saveRes2 = await saveAttemptAnswer(studentAlice, {
        attemptId,
        questionId: q2.id,
        selectedOptionId: incorrectOpt2.id,
        markedForReview: false,
        answerStatus: "ANSWERED",
        clientVersion: 1,
      });
      expect(saveRes2.success).toBe(true);

      // Step 4: Verify attempt state on simulated page refresh (State recovery & timer persistence)
      const refreshedExam = await getAttemptForExam(attemptId, studentAlice);
      expect(refreshedExam.attempt.status).toBe("IN_PROGRESS");
      expect(refreshedExam.attempt.totalDuration).toBeGreaterThan(0);
      expect(refreshedExam.answers[q1.id]?.selectedOptionId).toBe(correctOpt1.id);

      // Step 5: Student submits test attempt
      const submission = await submitAttempt(attemptId, studentAlice, false);
      expect(submission.status).toBe("SUBMITTED");

      // Verify that after submission, no more answers can be saved (Immutable submitted attempt)
      await expect(
        saveAttemptAnswer(studentAlice, {
          attemptId,
          questionId: q1.id,
          selectedOptionId: incorrectOpt2.id,
          markedForReview: false,
          answerStatus: "ANSWERED",
          clientVersion: 2,
        })
      ).rejects.toThrow();

      // Step 6: Server evaluates attempt with NTA CUET marking scheme (+5 / -1 / 0)
      const result = await evaluateAttempt(attemptId, studentAlice);
      expect(result).toBeDefined();
      expect(result.status).toBe("EVALUATED");
      expect(result.correctCount).toBe(1);
      expect(result.incorrectCount).toBe(1);
      expect(result.totalMarks).toBe(4); // +5 (correct) - 1 (incorrect) = 4 marks

      // Step 7: Retrieve evaluated result scorecard
      const scorecard = await getResultByAttemptId(attemptId, studentAlice);
      expect(scorecard).toBeDefined();
      expect(scorecard?.totalMarks).toBe(4);

      // Step 8: Verify Mistake Intelligence captures the incorrect question
      const mistakes = await getStudentMistakesPayload(studentAlice);
      expect(mistakes.hasMistakes).toBe(true);
      expect(mistakes.overview.totalIncorrect).toBeGreaterThanOrEqual(1);

      // Transition mistake review status from PENDING_REVIEW to REVIEWED
      const reviewedMistake = await updateMistakeReviewStatus(studentAlice, {
        attemptId,
        questionId: q2.id,
        status: "REVIEWED",
        notes: "Reviewed electrostatics derivation",
      });
      expect(reviewedMistake.status).toBe("REVIEWED");

      // Step 9: Verify Performance Analytics computes accurate metrics
      const analytics = await getStudentAnalytics(studentAlice);
      expect(analytics.hasCompletedTests).toBe(true);
      expect(analytics.overview.completedTests).toBeGreaterThanOrEqual(1);

      // Step 10: Configure Study Preferences and generate rule-based weekly study plan
      await saveStudentStudyPreferences(studentAlice, {
        weeklyTargetMinutes: 900,
        dailyTargetMinutes: 150,
        preferredSessionMinutes: 50,
        preferredStudyDays: ["MONDAY", "WEDNESDAY", "FRIDAY", "SATURDAY"],
        restDays: ["SUNDAY"],
        subjectPriorities: ["PHYSICS", "CHEMISTRY"],
      });

      const weeklyPlan = await generateStudentWeeklyPlan(studentAlice);
      expect(weeklyPlan.status).toBe("ACTIVE");
      const allTasks = weeklyPlan.days.flatMap((d) => d.tasks);
      expect(allTasks.length).toBeGreaterThan(0);

      // Step 11: Student marks study task as COMPLETED
      const firstTask = allTasks[0];
      const completedTask = await updateStudyTaskStatus(studentAlice, firstTask.id, "COMPLETED");
      expect(completedTask.status).toBe("COMPLETED");

      // Step 12: Verify Study Planner Dashboard payload integrates progress
      const plannerData = await getStudentStudyPlannerData(studentAlice);
      expect(plannerData.activePlan).toBeDefined();
      expect(plannerData.completedTasksCount).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Security, Data Isolation & Authorization Guards (Lifecycle Steps 14–15)", () => {
    it("STRICT ISOLATION: prevents unauthorized student from accessing or answering another student's test attempt", async () => {
      // Alice starts attempt
      const { attemptId } = await startOrResumeAttempt(studentAlice, publishedTestId);

      // Bob (Intruder) tries to save an answer into Alice's attempt
      await expect(
        saveAttemptAnswer(studentBobIntruder, {
          attemptId,
          questionId: "q_phy_01",
          selectedOptionId: "opt_malicious",
          markedForReview: false,
          answerStatus: "ANSWERED",
          clientVersion: 1,
        })
      ).rejects.toThrow();

      // Bob tries to retrieve Alice's exam state
      await expect(
        getAttemptForExam(attemptId, studentBobIntruder)
      ).rejects.toThrow();

      // Bob tries to submit Alice's exam
      await expect(
        submitAttempt(attemptId, studentBobIntruder, false)
      ).rejects.toThrow();
    });

    it("ADMIN RBAC: enforces domain separation and protects super admin safeguards", async () => {
      // 1. Regular student has zero admin authority
      expect(isSuperAdmin("STUDENT")).toBe(false);
      expect(canManageSupport("STUDENT")).toBe(false);
      expect(canManageContent("STUDENT")).toBe(false);
      expect(canManageFinance("STUDENT")).toBe(false);

      // 2. Content Admin cannot manage finance/subscriptions
      expect(canManageContent("CONTENT_ADMIN")).toBe(true);
      expect(canManageFinance("CONTENT_ADMIN")).toBe(false);
      expect(checkAdminAccess("CONTENT_ADMIN", "FINANCE")).toBe(false);

      // 3. Support Admin cannot modify commercial test packs
      expect(canManageSupport("SUPPORT_ADMIN")).toBe(true);
      expect(canManageFinance("SUPPORT_ADMIN")).toBe(false);

      // 4. Super Admin has full platform authority
      expect(isSuperAdmin("SUPER_ADMIN")).toBe(true);
      expect(checkAdminAccess("SUPER_ADMIN", "ALL")).toBe(true);

      // 5. Super Admin soft-suspends student with audit trail
      const suspended = await suspendStudent(superAdminId, {
        studentId: studentAlice,
        reason: "Security investigation flagged suspicious concurrent IP sessions",
      });
      expect(suspended).toBe(true);

      const detail = await getAdminStudentDetail(studentAlice);
      expect(detail.banned).toBe(true);
      expect(detail.banReason).toContain("concurrent IP");

      // Reactivate
      const reactivated = await reactivateStudent(superAdminId, {
        studentId: studentAlice,
        notes: "Identity verified via helpdesk ticket #4082",
      });
      expect(reactivated).toBe(true);

      const restoredDetail = await getAdminStudentDetail(studentAlice);
      expect(restoredDetail.banned).toBe(false);
    });

    it("MONETIZATION ENTITLEMENTS: assigns premium plan and upgrades feature quotas", async () => {
      // 1. Initially student has free tier (1 mock test)
      const freeTier = await checkStudentFeatureAccess(studentAlice, "FULL_MOCK_TESTS");
      expect(freeTier.limit).toBe(1);

      // 2. Super Admin assigns Pro Season Pass (365 days)
      const assigned = await assignStudentSubscription(superAdminId, {
        studentId: studentAlice,
        planId: "PRO_SEASON",
        durationDays: 365,
        notes: "CUET 2026 Season Pass granted",
      });
      expect(assigned.status).toBe("ACTIVE");
      expect(assigned.planCode).toBe("PRO_SEASON");

      // 3. Verify upgraded entitlements (unlimited mock tests, 20 daily AI assistant queries)
      const upgradedMockAccess = await checkStudentFeatureAccess(studentAlice, "FULL_MOCK_TESTS");
      expect(upgradedMockAccess.allowed).toBe(true);
      expect(upgradedMockAccess.limit).toBeNull(); // Unlimited on Pro

      const upgradedAIAccess = await checkStudentFeatureAccess(studentAlice, "AI_ASSISTANT");
      expect(upgradedAIAccess.allowed).toBe(true);
      expect(upgradedAIAccess.limit).toBe(20);
      expect(upgradedAIAccess.period).toBe("DAILY");
    });
  });
});
