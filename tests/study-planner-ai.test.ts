import { describe, it, expect, beforeEach } from "vitest";
import {
  getStudentStudyPreferences,
  saveStudentStudyPreferences,
  generateStudentWeeklyPlan,
  getStudentStudyPlannerData,
  updateStudyTaskStatus,
  rescheduleStudyTask,
  createCustomStudyTask,
  deleteStudyTask,
  getStudentPlanHistory,
  studyPlannerMemoryStore,
} from "@/lib/study-planner-service";
import {
  getAIProviderStatus,
  createAIConversation,
  getStudentConversations,
  getConversationMessages,
  deleteAIConversation,
  clearAIConversation,
  aiAssistantMemoryStore,
} from "@/lib/ai-assistant-service";

describe("Phase 13: Study Planner & AI Assistant — Architecture & Business Logic", () => {
  const studentAlice = "student_alice_planner";
  const studentBob = "student_bob_planner";

  beforeEach(() => {
    studyPlannerMemoryStore.reset();
    aiAssistantMemoryStore.reset();
  });

  describe("1. Study Preferences & Defaults", () => {
    it("returns sensible default preferences when student has not configured any", async () => {
      const prefs = await getStudentStudyPreferences(studentAlice);

      expect(prefs.studentId).toBe(studentAlice);
      expect(prefs.weeklyTargetMinutes).toBe(720); // 12 hours
      expect(prefs.dailyTargetMinutes).toBe(120);   // 2 hours
      expect(prefs.preferredSessionMinutes).toBe(45);
      expect(prefs.preferredStudyDays).toContain("MONDAY");
      expect(prefs.preferredStudyDays).toContain("SATURDAY");
      expect(prefs.restDays).toContain("SUNDAY");
    });

    it("saves and persists student custom study preferences", async () => {
      const saved = await saveStudentStudyPreferences(studentAlice, {
        weeklyTargetMinutes: 900, // 15 hours
        dailyTargetMinutes: 180,  // 3 hours
        preferredSessionMinutes: 60,
        preferredStudyDays: ["MONDAY", "WEDNESDAY", "FRIDAY"],
        restDays: ["TUESDAY", "THURSDAY", "SATURDAY", "SUNDAY"],
        subjectPriorities: ["314", "306"],
      });

      expect(saved.weeklyTargetMinutes).toBe(900);
      expect(saved.dailyTargetMinutes).toBe(180);
      expect(saved.preferredSessionMinutes).toBe(60);
      expect(saved.preferredStudyDays).toEqual(["MONDAY", "WEDNESDAY", "FRIDAY"]);
      expect(saved.restDays).toEqual(["TUESDAY", "THURSDAY", "SATURDAY", "SUNDAY"]);

      // Verify re-fetch returns updated preferences
      const refetched = await getStudentStudyPreferences(studentAlice);
      expect(refetched.weeklyTargetMinutes).toBe(900);
      expect(refetched.preferredStudyDays).toEqual(["MONDAY", "WEDNESDAY", "FRIDAY"]);
    });
  });

  describe("2. Rule-Based Weekly Plan Generation", () => {
    it("generates a weekly schedule respecting preferred study days and excluding rest days", async () => {
      // Configure Alice to study only Mon, Wed, Fri
      await saveStudentStudyPreferences(studentAlice, {
        weeklyTargetMinutes: 360,
        dailyTargetMinutes: 120,
        preferredSessionMinutes: 60,
        preferredStudyDays: ["MONDAY", "WEDNESDAY", "FRIDAY"],
        restDays: ["TUESDAY", "THURSDAY", "SATURDAY", "SUNDAY"],
        subjectPriorities: [],
      });

      const schedule = await generateStudentWeeklyPlan(studentAlice, {
        weekStartDate: "2026-11-02",
      });

      expect(schedule.days.length).toBe(7);

      // Check active days have tasks
      const monday = schedule.days.find((d) => d.dayOfWeek === "MONDAY")!;
      const wednesday = schedule.days.find((d) => d.dayOfWeek === "WEDNESDAY")!;
      const friday = schedule.days.find((d) => d.dayOfWeek === "FRIDAY")!;

      expect(monday.tasks.length).toBeGreaterThan(0);
      expect(wednesday.tasks.length).toBeGreaterThan(0);
      expect(friday.tasks.length).toBeGreaterThan(0);

      // Check rest days have 0 generated tasks
      const tuesday = schedule.days.find((d) => d.dayOfWeek === "TUESDAY")!;
      const sunday = schedule.days.find((d) => d.dayOfWeek === "SUNDAY")!;

      expect(tuesday.isRestDay).toBe(true);
      expect(tuesday.tasks.length).toBe(0);
      expect(sunday.isRestDay).toBe(true);
      expect(sunday.tasks.length).toBe(0);
    });

    it("respects daily study time limits and session duration", async () => {
      await saveStudentStudyPreferences(studentAlice, {
        weeklyTargetMinutes: 450,
        dailyTargetMinutes: 90, // max 90 mins per day
        preferredSessionMinutes: 45, // 2 sessions of 45 mins
        preferredStudyDays: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
        restDays: ["SATURDAY", "SUNDAY"],
        subjectPriorities: [],
      });

      const schedule = await generateStudentWeeklyPlan(studentAlice, {
        weekStartDate: "2026-11-02",
      });

      for (const day of schedule.days) {
        if (!day.isRestDay) {
          expect(day.totalPlannedMinutes).toBeLessThanOrEqual(90);
          for (const task of day.tasks) {
            expect(task.plannedDurationMinutes).toBeLessThanOrEqual(60);
          }
        }
      }
    });

    it("preserves completed tasks when regenerating a weekly plan", async () => {
      const schedule = await generateStudentWeeklyPlan(studentAlice, {
        weekStartDate: "2026-11-02",
      });

      const firstTask = schedule.days.find((d) => d.tasks.length > 0)!.tasks[0];

      // Mark first task as completed
      await updateStudyTaskStatus(studentAlice, firstTask.id, "COMPLETED", 45);

      // Regenerate the plan with preserveCompleted: true
      const regenerated = await generateStudentWeeklyPlan(studentAlice, {
        weekStartDate: "2026-11-02",
        regenerate: true,
        preserveCompleted: true,
      });

      const preservedTask = regenerated.days
        .flatMap((d) => d.tasks)
        .find((t) => t.id === firstTask.id);

      expect(preservedTask).toBeDefined();
      expect(preservedTask?.status).toBe("COMPLETED");
      expect(preservedTask?.actualDurationMinutes).toBe(45);
    });
  });

  describe("3. Task Tracking & Lifecycle", () => {
    it("updates task status and records completion timestamps", async () => {
      const schedule = await generateStudentWeeklyPlan(studentAlice, {
        weekStartDate: "2026-11-02",
      });

      const task = schedule.days.find((d) => d.tasks.length > 0)!.tasks[0];
      expect(task.status).toBe("PLANNED");

      // Complete task
      const completed = await updateStudyTaskStatus(studentAlice, task.id, "COMPLETED", 50);
      expect(completed.status).toBe("COMPLETED");
      expect(completed.actualDurationMinutes).toBe(50);
      expect(completed.completedAt).toBeDefined();

      // Undo to PLANNED
      const undone = await updateStudyTaskStatus(studentAlice, task.id, "PLANNED");
      expect(undone.status).toBe("PLANNED");
      expect(undone.completedAt).toBeNull();
    });

    it("reschedules a study task to a new planned date", async () => {
      const schedule = await generateStudentWeeklyPlan(studentAlice, {
        weekStartDate: "2026-11-02",
      });

      const task = schedule.days.find((d) => d.tasks.length > 0)!.tasks[0];
      const newDate = "2026-11-07";

      const rescheduled = await rescheduleStudyTask(studentAlice, task.id, newDate);
      expect(rescheduled.plannedDate).toBe(newDate);
      expect(rescheduled.status).toBe("RESCHEDULED");
    });

    it("creates custom student study tasks and supports deletion", async () => {
      const schedule = await generateStudentWeeklyPlan(studentAlice, {
        weekStartDate: "2026-11-02",
      });

      const customTask = await createCustomStudyTask(studentAlice, {
        studyPlanId: schedule.planId,
        title: "Revise Electrostatics NCERT Exemplar",
        description: "Focus on capacitance questions",
        taskType: "CUSTOM_TASK",
        plannedDate: "2026-11-04",
        plannedDurationMinutes: 60,
      });

      expect(customTask.title).toBe("Revise Electrostatics NCERT Exemplar");
      expect(customTask.plannedDurationMinutes).toBe(60);
      expect(customTask.recommendationSource).toBe("STUDENT_CUSTOM");

      // Delete custom task
      const deleted = await deleteStudyTask(studentAlice, customTask.id);
      expect(deleted).toBe(true);

      const check = studyPlannerMemoryStore.getTask(customTask.id);
      expect(check).toBeNull();
    });
  });

  describe("4. Security & Student Isolation", () => {
    it("STRICT ISOLATION: prevents Student Bob from modifying Student Alice's study task", async () => {
      const schedule = await generateStudentWeeklyPlan(studentAlice, {
        weekStartDate: "2026-11-02",
      });

      const aliceTask = schedule.days.find((d) => d.tasks.length > 0)!.tasks[0];

      await expect(
        updateStudyTaskStatus(studentBob, aliceTask.id, "COMPLETED")
      ).rejects.toThrow("Unauthorized");

      await expect(
        rescheduleStudyTask(studentBob, aliceTask.id, "2026-11-08")
      ).rejects.toThrow("Unauthorized");

      await expect(
        deleteStudyTask(studentBob, aliceTask.id)
      ).rejects.toThrow("Unauthorized");
    });

    it("STRICT ISOLATION: prevents Student Bob from viewing or deleting Student Alice's AI conversations", async () => {
      const conv = await createAIConversation(studentAlice, "Alice's Physics Doubts");

      await expect(
        getConversationMessages(studentBob, conv.id)
      ).rejects.toThrow("Unauthorized");

      await expect(
        deleteAIConversation(studentBob, conv.id)
      ).rejects.toThrow("Unauthorized");

      await expect(
        clearAIConversation(studentBob, conv.id)
      ).rejects.toThrow("Unauthorized");
    });
  });

  describe("5. AI Assistant Provider Abstraction & Safeguards", () => {
    it("reports unconfigured state gracefully when no external API key is set in environment", async () => {
      const status = await getAIProviderStatus(studentAlice);

      // In test environment without GEMINI_API_KEY / OPENAI_API_KEY
      expect(status.dailyQuotaLimit).toBe(20);
      expect(status.remainingDailyQuota).toBeLessThanOrEqual(20);

      if (!process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY) {
        expect(status.isConfigured).toBe(false);
        expect(status.setupInstructions).toContain("GEMINI_API_KEY");
      }
    });

    it("creates, retrieves, and deletes AI conversation threads properly", async () => {
      const conv = await createAIConversation(studentAlice, "CUET English Vocabulary");
      expect(conv.id).toBeDefined();
      expect(conv.title).toBe("CUET English Vocabulary");

      const studentConvs = await getStudentConversations(studentAlice);
      expect(studentConvs.some((c) => c.id === conv.id)).toBe(true);

      const deleted = await deleteAIConversation(studentAlice, conv.id);
      expect(deleted).toBe(true);

      const afterDelete = await getStudentConversations(studentAlice);
      expect(afterDelete.some((c) => c.id === conv.id)).toBe(false);
    });
  });

  describe("6. Dashboard Metrics Integration", () => {
    it("computes accurate study planner dashboard payload", async () => {
      const schedule = await generateStudentWeeklyPlan(studentAlice, {
        weekStartDate: "2026-11-02",
      });

      const firstTask = schedule.days.find((d) => d.tasks.length > 0)!.tasks[0];
      await updateStudyTaskStatus(studentAlice, firstTask.id, "COMPLETED", 45);

      const dashboardData = await getStudentStudyPlannerData(studentAlice);

      expect(dashboardData.activePlan).toBeDefined();
      expect(dashboardData.weeklyTargetMinutes).toBe(720);
      expect(dashboardData.completedMinutes).toBe(45);
      expect(dashboardData.remainingMinutes).toBe(675);
      expect(dashboardData.progressPercentage).toBe(6); // 45 / 720 ~ 6%
      expect(dashboardData.completedTasksCount).toBe(1);
      expect(dashboardData.subjectAllocations.length).toBeGreaterThan(0);
    });

    it("tracks and displays past plan history accurately", async () => {
      await generateStudentWeeklyPlan(studentAlice, {
        weekStartDate: "2026-11-02",
      });

      const history = await getStudentPlanHistory(studentAlice, 1, 10);
      expect(history.total).toBe(1);
      expect(history.plans[0].weekStartDate).toBe("2026-11-02");
    });
  });
});
