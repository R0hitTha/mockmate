import { prisma } from "@/lib/prisma";
import { getStudentProfile } from "@/lib/auth-server";
import { getStudentMistakesPayload } from "@/lib/mistake-service";
import { getStudentMockTests } from "@/lib/mock-test-service";
import { CUET_SUBJECTS_CATALOG } from "./syllabus-data";
import {
  type DayOfWeek,
  type TaskType,
  type TaskStatus,
  type StudyPreferenceInput,
  type CreateCustomTaskInput,
} from "./validations/planner";

export type { DayOfWeek, TaskType, TaskStatus };

export interface StoredStudyPreference {
  id: string;
  studentId: string;
  weeklyTargetMinutes: number;
  dailyTargetMinutes: number;
  preferredSessionMinutes: number;
  preferredStudyDays: DayOfWeek[];
  restDays: DayOfWeek[];
  subjectPriorities: string[];
  createdAt: string;
  updatedAt: string;
}

export interface StoredStudyPlan {
  id: string;
  studentId: string;
  title: string;
  weekStartDate: string; // ISO string (YYYY-MM-DD)
  weekEndDate: string;   // ISO string (YYYY-MM-DD)
  status: "ACTIVE" | "ARCHIVED" | "SUPERSEDED";
  generatedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoredStudyTask {
  id: string;
  studyPlanId: string;
  studentId: string;
  title: string;
  description: string | null;
  taskType: TaskType;
  subjectId: string | null;
  subjectName?: string | null;
  topicId: string | null;
  topicTitle?: string | null;
  linkedMockTestId: string | null;
  mockTestTitle?: string | null;
  plannedDate: string; // YYYY-MM-DD
  plannedDurationMinutes: number;
  actualDurationMinutes: number | null;
  status: TaskStatus;
  completedAt: string | null;
  recommendationSource: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DaySchedule {
  date: string; // YYYY-MM-DD
  dayOfWeek: DayOfWeek;
  dayLabel: string; // e.g. "Monday, Nov 3"
  isRestDay: boolean;
  isToday: boolean;
  tasks: StoredStudyTask[];
  totalPlannedMinutes: number;
  totalCompletedMinutes: number;
}

export interface WeeklySchedule {
  planId: string;
  planTitle: string;
  weekStartDate: string;
  weekEndDate: string;
  status: string;
  days: DaySchedule[];
  totalPlannedMinutes: number;
  totalCompletedMinutes: number;
}

export interface SubjectAllocation {
  subjectId: string;
  subjectName: string;
  plannedMinutes: number;
  taskCount: number;
  percentage: number;
}

export interface PlannerDashboardData {
  preferences: StoredStudyPreference;
  activePlan: StoredStudyPlan | null;
  weeklySchedule: WeeklySchedule | null;
  weeklyTargetMinutes: number;
  completedMinutes: number;
  remainingMinutes: number;
  progressPercentage: number;
  todayTasks: StoredStudyTask[];
  upcomingTasks: StoredStudyTask[];
  subjectAllocations: SubjectAllocation[];
  strugglingTopics: {
    topicId: string;
    topicTitle: string;
    subjectName: string;
    reason: string;
  }[];
  totalTasksCount: number;
  completedTasksCount: number;
}

// =============================================================================
// IN-MEMORY RESILIENT STORE FOR OFFLINE / TESTING ENVIRONMENTS
// =============================================================================

class StudyPlannerMemoryStore {
  private preferences = new Map<string, StoredStudyPreference>();
  private plans = new Map<string, StoredStudyPlan>();
  private tasks = new Map<string, StoredStudyTask>();

  reset() {
    this.preferences.clear();
    this.plans.clear();
    this.tasks.clear();
  }

  // Preferences
  getPreference(studentId: string): StoredStudyPreference | null {
    return this.preferences.get(studentId) || null;
  }

  savePreference(pref: StoredStudyPreference) {
    this.preferences.set(pref.studentId, pref);
  }

  // Plans
  getPlan(planId: string): StoredStudyPlan | null {
    return this.plans.get(planId) || null;
  }

  getActivePlan(studentId: string): StoredStudyPlan | null {
    const studentPlans = Array.from(this.plans.values())
      .filter((p) => p.studentId === studentId && p.status === "ACTIVE")
      .sort((a, b) => new Date(b.weekStartDate).getTime() - new Date(a.weekStartDate).getTime());
    return studentPlans[0] || null;
  }

  listStudentPlans(studentId: string): StoredStudyPlan[] {
    return Array.from(this.plans.values())
      .filter((p) => p.studentId === studentId)
      .sort((a, b) => new Date(b.weekStartDate).getTime() - new Date(a.weekStartDate).getTime());
  }

  savePlan(plan: StoredStudyPlan) {
    this.plans.set(plan.id, plan);
  }

  // Tasks
  getTask(taskId: string): StoredStudyTask | null {
    return this.tasks.get(taskId) || null;
  }

  listTasksForPlan(planId: string): StoredStudyTask[] {
    return Array.from(this.tasks.values())
      .filter((t) => t.studyPlanId === planId)
      .sort((a, b) => a.plannedDate.localeCompare(b.plannedDate));
  }

  listStudentTasks(studentId: string): StoredStudyTask[] {
    return Array.from(this.tasks.values()).filter((t) => t.studentId === studentId);
  }

  saveTask(task: StoredStudyTask) {
    this.tasks.set(task.id, task);
  }

  deleteTask(taskId: string): boolean {
    return this.tasks.delete(taskId);
  }
}

export const studyPlannerMemoryStore = new StudyPlannerMemoryStore();

// =============================================================================
// DATE & CALENDAR HELPER UTILITIES
// =============================================================================

const DAY_NAMES: DayOfWeek[] = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];

export function getMondayOfCurrentWeek(d?: Date): Date {
  const date = d ? new Date(d) : new Date();
  const day = date.getDay();
  // day 0 is Sunday, 1 is Monday...
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export function formatToYYYYMMDD(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getWeekDays(startDate: Date): { date: string; dayOfWeek: DayOfWeek; d: Date }[] {
  const days: { date: string; dayOfWeek: DayOfWeek; d: Date }[] = [];
  for (let i = 0; i < 7; i++) {
    const cur = new Date(startDate);
    cur.setDate(startDate.getDate() + i);
    const dayOfWeek = DAY_NAMES[cur.getDay()];
    days.push({
      date: formatToYYYYMMDD(cur),
      dayOfWeek,
      d: cur,
    });
  }
  return days;
}

// =============================================================================
// PREFERENCES SERVICE
// =============================================================================

export async function getStudentStudyPreferences(studentId: string): Promise<StoredStudyPreference> {
  try {
    const dbPref = await prisma.studyPreference.findUnique({
      where: { studentId },
    });
    if (dbPref) {
      return {
        id: dbPref.id,
        studentId: dbPref.studentId,
        weeklyTargetMinutes: dbPref.weeklyTargetMinutes,
        dailyTargetMinutes: dbPref.dailyTargetMinutes,
        preferredSessionMinutes: dbPref.preferredSessionMinutes,
        preferredStudyDays: dbPref.preferredStudyDays as DayOfWeek[],
        restDays: dbPref.restDays as DayOfWeek[],
        subjectPriorities: dbPref.subjectPriorities,
        createdAt: dbPref.createdAt.toISOString(),
        updatedAt: dbPref.updatedAt.toISOString(),
      };
    }
  } catch {
    // DB fallback to memory store
  }

  const memPref = studyPlannerMemoryStore.getPreference(studentId);
  if (memPref) return memPref;

  // Sensible CUET Defaults
  const defaultPref: StoredStudyPreference = {
    id: `pref-${studentId}`,
    studentId,
    weeklyTargetMinutes: 720, // 12 hours/week
    dailyTargetMinutes: 120,  // 2 hours/day
    preferredSessionMinutes: 45,
    preferredStudyDays: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"],
    restDays: ["SUNDAY"],
    subjectPriorities: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  studyPlannerMemoryStore.savePreference(defaultPref);
  return defaultPref;
}

export async function saveStudentStudyPreferences(
  studentId: string,
  input: StudyPreferenceInput
): Promise<StoredStudyPreference> {
  const now = new Date();
  try {
    const upserted = await prisma.studyPreference.upsert({
      where: { studentId },
      create: {
        studentId,
        weeklyTargetMinutes: input.weeklyTargetMinutes,
        dailyTargetMinutes: input.dailyTargetMinutes,
        preferredSessionMinutes: input.preferredSessionMinutes,
        preferredStudyDays: input.preferredStudyDays,
        restDays: input.restDays,
        subjectPriorities: input.subjectPriorities,
      },
      update: {
        weeklyTargetMinutes: input.weeklyTargetMinutes,
        dailyTargetMinutes: input.dailyTargetMinutes,
        preferredSessionMinutes: input.preferredSessionMinutes,
        preferredStudyDays: input.preferredStudyDays,
        restDays: input.restDays,
        subjectPriorities: input.subjectPriorities,
      },
    });

    const result: StoredStudyPreference = {
      id: upserted.id,
      studentId: upserted.studentId,
      weeklyTargetMinutes: upserted.weeklyTargetMinutes,
      dailyTargetMinutes: upserted.dailyTargetMinutes,
      preferredSessionMinutes: upserted.preferredSessionMinutes,
      preferredStudyDays: upserted.preferredStudyDays as DayOfWeek[],
      restDays: upserted.restDays as DayOfWeek[],
      subjectPriorities: upserted.subjectPriorities,
      createdAt: upserted.createdAt.toISOString(),
      updatedAt: upserted.updatedAt.toISOString(),
    };
    studyPlannerMemoryStore.savePreference(result);
    return result;
  } catch {
    // Fallback to memory store
    const memPref: StoredStudyPreference = {
      id: `pref-${studentId}`,
      studentId,
      weeklyTargetMinutes: input.weeklyTargetMinutes,
      dailyTargetMinutes: input.dailyTargetMinutes,
      preferredSessionMinutes: input.preferredSessionMinutes,
      preferredStudyDays: input.preferredStudyDays,
      restDays: input.restDays,
      subjectPriorities: input.subjectPriorities,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
    studyPlannerMemoryStore.savePreference(memPref);
    return memPref;
  }
}

// =============================================================================
// RULE-BASED STUDY PLAN GENERATION ENGINE
// =============================================================================

export interface GenerateWeeklyPlanOptions {
  weekStartDate?: string; // YYYY-MM-DD
  regenerate?: boolean;
  preserveCompleted?: boolean;
}

export async function generateStudentWeeklyPlan(
  studentId: string,
  options: GenerateWeeklyPlanOptions = {}
): Promise<WeeklySchedule> {
  const preferences = await getStudentStudyPreferences(studentId);

  // 1. Determine Monday of target week
  let startMonday: Date;
  if (options.weekStartDate) {
    const parts = options.weekStartDate.split("-");
    startMonday = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  } else {
    startMonday = getMondayOfCurrentWeek();
  }
  const endSunday = new Date(startMonday);
  endSunday.setDate(startMonday.getDate() + 6);

  const startIsoDate = formatToYYYYMMDD(startMonday);
  const endIsoDate = formatToYYYYMMDD(endSunday);
  const weekTitle = `CUET Weekly Plan: ${startMonday.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} – ${endSunday.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`;

  // 2. Fetch student profile to get enrolled subjects
  let studentSubjects: { id: string; code: string; name: string }[] = [];
  try {
    const profile = await getStudentProfile(studentId);
    if (profile?.subjectPreferences && profile.subjectPreferences.length > 0) {
      studentSubjects = profile.subjectPreferences.map((sp) => ({
        id: sp.subjectCode,
        code: sp.subjectCode,
        name: sp.subjectName,
      }));
    }
  } catch {
    // Ignore error
  }

  // Fallback to top CUET catalog subjects if none selected
  if (studentSubjects.length === 0) {
    studentSubjects = CUET_SUBJECTS_CATALOG.slice(0, 4).map((s) => ({
      id: s.code,
      code: s.code,
      name: s.name,
    }));
  }

  // 3. Fetch Mistake Intelligence insights to prioritize struggling topics
  const strugglingTopics: {
    topicId: string;
    topicTitle: string;
    subjectCode: string;
    subjectName: string;
    reason: string;
  }[] = [];

  try {
    const mistakeData = await getStudentMistakesPayload(studentId);
    if (mistakeData && mistakeData.topicsToRevisit.length > 0) {
      for (const t of mistakeData.topicsToRevisit) {
        strugglingTopics.push({
          topicId: `topic-${t.topicTitle.toLowerCase().replace(/\s+/g, "-")}`,
          topicTitle: t.topicTitle,
          subjectCode: "314",
          subjectName: t.subjectName || "CUET Domain",
          reason: t.reason,
        });
      }
    }
  } catch {
    // Ignore mistake service errors
  }

  // 4. Fetch real published mock tests for test slots
  let publishedTests: { id: string; title: string; subjectId?: string }[] = [];
  try {
    const testsRes = await getStudentMockTests({ page: 1, pageSize: 10 });
    publishedTests = testsRes.tests.map((t: { id: string; title: string }) => ({ id: t.id, title: t.title }));
  } catch {
    // Fallback
    publishedTests = [
      { id: "sample-mt-phy", title: "CUET UG Physics Full Mock Test 01" },
      { id: "sample-mt-chem", title: "CUET UG Chemistry Full Mock Test 01" },
    ];
  }

  // 5. Existing Plan Check & Handling
  let existingPlan = studyPlannerMemoryStore.getActivePlan(studentId);
  try {
    const dbPlan = await prisma.studyPlan.findFirst({
      where: {
        studentId,
        status: "ACTIVE",
        weekStartDate: new Date(startIsoDate),
      },
      include: { tasks: true },
    });
    if (dbPlan) {
      existingPlan = {
        id: dbPlan.id,
        studentId: dbPlan.studentId,
        title: dbPlan.title,
        weekStartDate: formatToYYYYMMDD(dbPlan.weekStartDate),
        weekEndDate: formatToYYYYMMDD(dbPlan.weekEndDate),
        status: dbPlan.status as "ACTIVE",
        generatedAt: dbPlan.generatedAt.toISOString(),
        createdAt: dbPlan.createdAt.toISOString(),
        updatedAt: dbPlan.updatedAt.toISOString(),
      };
    }
  } catch {
    // DB fallback
  }

  const completedTasksToKeep: StoredStudyTask[] = [];
  if (existingPlan && options.regenerate) {
    // Preserve completed tasks if requested
    const oldTasks = studyPlannerMemoryStore.listTasksForPlan(existingPlan.id);
    if (options.preserveCompleted !== false) {
      for (const t of oldTasks) {
        if (t.status === "COMPLETED") {
          completedTasksToKeep.push(t);
        }
      }
    }
  }

  // Create or reuse plan record
  const planId = existingPlan ? existingPlan.id : `plan-${studentId}-${startIsoDate}`;
  const now = new Date();
  const planRecord: StoredStudyPlan = {
    id: planId,
    studentId,
    title: weekTitle,
    weekStartDate: startIsoDate,
    weekEndDate: endIsoDate,
    status: "ACTIVE",
    generatedAt: now.toISOString(),
    createdAt: existingPlan?.createdAt || now.toISOString(),
    updatedAt: now.toISOString(),
  };

  studyPlannerMemoryStore.savePlan(planRecord);
  try {
    await prisma.studyPlan.upsert({
      where: { id: planId },
      create: {
        id: planId,
        studentId,
        title: weekTitle,
        weekStartDate: new Date(startIsoDate),
        weekEndDate: new Date(endIsoDate),
        status: "ACTIVE",
      },
      update: {
        title: weekTitle,
        status: "ACTIVE",
        updatedAt: now,
      },
    });
  } catch {
    // DB fallback
  }

  // 6. Generate Rule-Based Tasks Across Active Days
  const weekDays = getWeekDays(startMonday);
  const sessionMinutes = preferences.preferredSessionMinutes || 45;
  const dailyTarget = preferences.dailyTargetMinutes || 120;
  // Calculate slots per study day
  const slotsPerDay = Math.max(1, Math.min(4, Math.floor(dailyTarget / sessionMinutes)));

  const generatedTasks: StoredStudyTask[] = [];
  let struggleIdx = 0;
  let subjectIdx = 0;

  for (const day of weekDays) {
    const isPreferredDay = preferences.preferredStudyDays.includes(day.dayOfWeek);
    const isRestDay = preferences.restDays.includes(day.dayOfWeek);

    // If day is a rest day or not preferred, do not generate automatic tasks
    if (isRestDay || !isPreferredDay) {
      continue;
    }

    // Check if there are already preserved completed tasks for this date
    const existingForDay = completedTasksToKeep.filter((t) => t.plannedDate === day.date);
    let remainingMinutesForDay = dailyTarget - existingForDay.reduce((s, t) => s + t.plannedDurationMinutes, 0);

    let slot = 0;
    while (remainingMinutesForDay >= sessionMinutes && slot < slotsPerDay) {
      slot++;
      const currentSubject = studentSubjects[subjectIdx % studentSubjects.length];
      subjectIdx++;

      // Priority Rule 1: First 2 active days get Mistake Reviews / Struggle Topics if available
      if (struggleIdx < strugglingTopics.length && (day.dayOfWeek === "MONDAY" || day.dayOfWeek === "TUESDAY")) {
        const struggle = strugglingTopics[struggleIdx++];
        const taskId = `task-${planId}-${day.date}-${slot}`;
        const task: StoredStudyTask = {
          id: taskId,
          studyPlanId: planId,
          studentId,
          title: `Mistake Review: ${struggle.topicTitle}`,
          description: `Revise key formulas & core concepts. ${struggle.reason}.`,
          taskType: "MISTAKE_REVIEW",
          subjectId: struggle.subjectCode,
          subjectName: struggle.subjectName,
          topicId: struggle.topicId,
          topicTitle: struggle.topicTitle,
          linkedMockTestId: null,
          plannedDate: day.date,
          plannedDurationMinutes: sessionMinutes,
          actualDurationMinutes: null,
          status: "PLANNED",
          completedAt: null,
          recommendationSource: "MISTAKE_INTELLIGENCE",
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
        };
        generatedTasks.push(task);
        remainingMinutesForDay -= sessionMinutes;
        continue;
      }

      // Priority Rule 2: Near weekend (Friday/Saturday), assign a Mock Test or Sectional Drill
      if ((day.dayOfWeek === "FRIDAY" || day.dayOfWeek === "SATURDAY") && publishedTests.length > 0 && slot === 1) {
        const testToAssign = publishedTests[(slot - 1) % publishedTests.length];
        const taskId = `task-${planId}-${day.date}-${slot}`;
        const duration = Math.min(remainingMinutesForDay, 60);
        const task: StoredStudyTask = {
          id: taskId,
          studyPlanId: planId,
          studentId,
          title: `Mock Test Drill: ${testToAssign.title}`,
          description: `Timed CBT simulation practice. Focus on time allocation (+5/-1 scheme).`,
          taskType: "MOCK_TEST",
          subjectId: currentSubject.code,
          subjectName: currentSubject.name,
          topicId: null,
          topicTitle: null,
          linkedMockTestId: testToAssign.id,
          mockTestTitle: testToAssign.title,
          plannedDate: day.date,
          plannedDurationMinutes: duration,
          actualDurationMinutes: null,
          status: "PLANNED",
          completedAt: null,
          recommendationSource: "MOCK_TEST_SCHEDULE",
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
        };
        generatedTasks.push(task);
        remainingMinutesForDay -= duration;
        continue;
      }

      // Default: Balanced Topic Practice & Theory Revision
      const taskType: TaskType = slot % 2 === 0 ? "TOPIC_PRACTICE" : "THEORY_REVISION";
      const taskId = `task-${planId}-${day.date}-${slot}`;
      const title =
        taskType === "THEORY_REVISION"
          ? `${currentSubject.name}: Concept Revision & NCERT Notes`
          : `${currentSubject.name}: MCQ Practice & Problem Solving`;
      const description =
        taskType === "THEORY_REVISION"
          ? `Review fundamental NCERT definitions, theorems, and high-yield questions for ${currentSubject.name}.`
          : `Solve 20-30 MCQs under timed conditions for ${currentSubject.name}.`;

      const task: StoredStudyTask = {
        id: taskId,
        studyPlanId: planId,
        studentId,
        title,
        description,
        taskType,
        subjectId: currentSubject.code,
        subjectName: currentSubject.name,
        topicId: null,
        topicTitle: null,
        linkedMockTestId: null,
        plannedDate: day.date,
        plannedDurationMinutes: sessionMinutes,
        actualDurationMinutes: null,
        status: "PLANNED",
        completedAt: null,
        recommendationSource: "SYLLABUS_ROTATION",
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };
      generatedTasks.push(task);
      remainingMinutesForDay -= sessionMinutes;
    }
  }

  // Combine preserved completed tasks + new generated tasks
  const allFinalTasks = [...completedTasksToKeep, ...generatedTasks];

  // Persist tasks in memory
  for (const t of allFinalTasks) {
    studyPlannerMemoryStore.saveTask(t);
  }

  // Attempt DB synchronization
  try {
    // Delete non-completed tasks if regenerating
    if (options.regenerate) {
      await prisma.studyTask.deleteMany({
        where: {
          studyPlanId: planId,
          status: { not: "COMPLETED" },
        },
      });
    }

    for (const t of generatedTasks) {
      await prisma.studyTask.upsert({
        where: { id: t.id },
        create: {
          id: t.id,
          studyPlanId: t.studyPlanId,
          studentId: t.studentId,
          title: t.title,
          description: t.description,
          taskType: t.taskType,
          subjectId: null, // loose coupling if code doesn't match cuid
          topicId: null,
          linkedMockTestId: null,
          plannedDate: new Date(t.plannedDate),
          plannedDurationMinutes: t.plannedDurationMinutes,
          actualDurationMinutes: t.actualDurationMinutes,
          status: t.status,
          recommendationSource: t.recommendationSource,
        },
        update: {
          title: t.title,
          description: t.description,
          plannedDate: new Date(t.plannedDate),
          plannedDurationMinutes: t.plannedDurationMinutes,
          status: t.status,
        },
      });
    }
  } catch {
    // DB fallback
  }

  return formatWeeklySchedule(planRecord, allFinalTasks, preferences);
}

// =============================================================================
// SCHEDULE & DASHBOARD DATA AGGREGATION
// =============================================================================

function formatWeeklySchedule(
  plan: StoredStudyPlan,
  tasks: StoredStudyTask[],
  preferences: StoredStudyPreference
): WeeklySchedule {
  const parts = plan.weekStartDate.split("-");
  const startMonday = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  const weekDays = getWeekDays(startMonday);
  const todayIso = formatToYYYYMMDD(new Date());

  let totalPlannedMinutes = 0;
  let totalCompletedMinutes = 0;

  const days: DaySchedule[] = weekDays.map((wd) => {
    const dayTasks = tasks.filter((t) => t.plannedDate === wd.date);
    const dayPlanned = dayTasks.reduce((s, t) => s + t.plannedDurationMinutes, 0);
    const dayCompleted = dayTasks
      .filter((t) => t.status === "COMPLETED")
      .reduce((s, t) => s + (t.actualDurationMinutes || t.plannedDurationMinutes), 0);

    totalPlannedMinutes += dayPlanned;
    totalCompletedMinutes += dayCompleted;

    const isRestDay = preferences.restDays.includes(wd.dayOfWeek);
    const isToday = wd.date === todayIso;

    return {
      date: wd.date,
      dayOfWeek: wd.dayOfWeek,
      dayLabel: wd.d.toLocaleDateString("en-IN", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
      isRestDay,
      isToday,
      tasks: dayTasks,
      totalPlannedMinutes: dayPlanned,
      totalCompletedMinutes: dayCompleted,
    };
  });

  return {
    planId: plan.id,
    planTitle: plan.title,
    weekStartDate: plan.weekStartDate,
    weekEndDate: plan.weekEndDate,
    status: plan.status,
    days,
    totalPlannedMinutes,
    totalCompletedMinutes,
  };
}

export async function getStudentStudyPlannerData(studentId: string): Promise<PlannerDashboardData> {
  const preferences = await getStudentStudyPreferences(studentId);

  // Check for active plan from memory store
  let activePlan = studyPlannerMemoryStore.getActivePlan(studentId);
  let tasks: StoredStudyTask[] = activePlan
    ? studyPlannerMemoryStore.listTasksForPlan(activePlan.id)
    : [];

  try {
    const dbPlan = await prisma.studyPlan.findFirst({
      where: {
        studentId,
        status: "ACTIVE",
      },
      orderBy: { weekStartDate: "desc" },
      include: {
        tasks: {
          orderBy: { plannedDate: "asc" },
        },
      },
    });

    if (dbPlan) {
      activePlan = {
        id: dbPlan.id,
        studentId: dbPlan.studentId,
        title: dbPlan.title,
        weekStartDate: formatToYYYYMMDD(dbPlan.weekStartDate),
        weekEndDate: formatToYYYYMMDD(dbPlan.weekEndDate),
        status: dbPlan.status as "ACTIVE",
        generatedAt: dbPlan.generatedAt.toISOString(),
        createdAt: dbPlan.createdAt.toISOString(),
        updatedAt: dbPlan.updatedAt.toISOString(),
      };

      tasks = dbPlan.tasks.map((t) => ({
        id: t.id,
        studyPlanId: t.studyPlanId,
        studentId: t.studentId,
        title: t.title,
        description: t.description,
        taskType: t.taskType as TaskType,
        subjectId: t.subjectId,
        subjectName: null,
        topicId: t.topicId,
        topicTitle: null,
        linkedMockTestId: t.linkedMockTestId,
        mockTestTitle: null,
        plannedDate: formatToYYYYMMDD(t.plannedDate),
        plannedDurationMinutes: t.plannedDurationMinutes,
        actualDurationMinutes: t.actualDurationMinutes,
        status: t.status as TaskStatus,
        completedAt: t.completedAt ? t.completedAt.toISOString() : null,
        recommendationSource: t.recommendationSource,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
      }));
    }
  } catch {
    // DB fallback - retains memory store plan & tasks
  }

  // If still no plan exists, automatically generate a default weekly plan for the current week
  if (!activePlan) {
    const schedule = await generateStudentWeeklyPlan(studentId);
    activePlan = studyPlannerMemoryStore.getActivePlan(studentId);
    tasks = activePlan ? studyPlannerMemoryStore.listTasksForPlan(activePlan.id) : [];
    return buildPlannerDashboardPayload(preferences, activePlan, tasks, schedule);
  }

  const weeklySchedule = formatWeeklySchedule(activePlan, tasks, preferences);
  return buildPlannerDashboardPayload(preferences, activePlan, tasks, weeklySchedule);
}

function buildPlannerDashboardPayload(
  preferences: StoredStudyPreference,
  activePlan: StoredStudyPlan | null,
  tasks: StoredStudyTask[],
  weeklySchedule: WeeklySchedule | null
): PlannerDashboardData {
  const todayIso = formatToYYYYMMDD(new Date());

  const completedTasks = tasks.filter((t) => t.status === "COMPLETED");
  const completedMinutes = completedTasks.reduce(
    (sum, t) => sum + (t.actualDurationMinutes || t.plannedDurationMinutes),
    0
  );
  const weeklyTargetMinutes = preferences.weeklyTargetMinutes || 720;
  const remainingMinutes = Math.max(0, weeklyTargetMinutes - completedMinutes);
  const progressPercentage = Math.min(
    100,
    Math.round((completedMinutes / weeklyTargetMinutes) * 100)
  );

  const todayTasks = tasks.filter((t) => t.plannedDate === todayIso);
  const upcomingTasks = tasks.filter((t) => t.plannedDate > todayIso && t.status !== "COMPLETED");

  // Subject Allocation
  const subjectMap = new Map<string, { minutes: number; count: number; name: string }>();
  for (const t of tasks) {
    const key = t.subjectId || "General";
    const name = t.subjectName || key;
    const existing = subjectMap.get(key) || { minutes: 0, count: 0, name };
    existing.minutes += t.plannedDurationMinutes;
    existing.count += 1;
    subjectMap.set(key, existing);
  }

  const totalPlanned = tasks.reduce((s, t) => s + t.plannedDurationMinutes, 0) || 1;
  const subjectAllocations: SubjectAllocation[] = Array.from(subjectMap.entries()).map(
    ([id, val]) => ({
      subjectId: id,
      subjectName: val.name,
      plannedMinutes: val.minutes,
      taskCount: val.count,
      percentage: Math.round((val.minutes / totalPlanned) * 100),
    })
  );

  return {
    preferences,
    activePlan,
    weeklySchedule,
    weeklyTargetMinutes,
    completedMinutes,
    remainingMinutes,
    progressPercentage,
    todayTasks,
    upcomingTasks,
    subjectAllocations,
    strugglingTopics: [],
    totalTasksCount: tasks.length,
    completedTasksCount: completedTasks.length,
  };
}

// =============================================================================
// TASK STATUS & RESCHEDULING ACTIONS
// =============================================================================

export async function updateStudyTaskStatus(
  studentId: string,
  taskId: string,
  status: TaskStatus,
  actualDurationMinutes?: number
): Promise<StoredStudyTask> {
  let task = studyPlannerMemoryStore.getTask(taskId);

  // Fallback to fetch from DB if not in memory
  if (!task) {
    try {
      const dbTask = await prisma.studyTask.findUnique({
        where: { id: taskId },
      });
      if (dbTask) {
        task = {
          id: dbTask.id,
          studyPlanId: dbTask.studyPlanId,
          studentId: dbTask.studentId,
          title: dbTask.title,
          description: dbTask.description,
          taskType: dbTask.taskType as TaskType,
          subjectId: dbTask.subjectId,
          topicId: dbTask.topicId,
          linkedMockTestId: dbTask.linkedMockTestId,
          plannedDate: formatToYYYYMMDD(dbTask.plannedDate),
          plannedDurationMinutes: dbTask.plannedDurationMinutes,
          actualDurationMinutes: dbTask.actualDurationMinutes,
          status: dbTask.status as TaskStatus,
          completedAt: dbTask.completedAt ? dbTask.completedAt.toISOString() : null,
          recommendationSource: dbTask.recommendationSource,
          createdAt: dbTask.createdAt.toISOString(),
          updatedAt: dbTask.updatedAt.toISOString(),
        };
      }
    } catch {
      // Ignore DB error
    }
  }

  if (!task) {
    throw new Error("Task not found");
  }

  if (task.studentId !== studentId) {
    throw new Error("Unauthorized: You do not own this study task");
  }

  const now = new Date();
  const updatedTask: StoredStudyTask = {
    ...task,
    status,
    actualDurationMinutes:
      actualDurationMinutes !== undefined
        ? actualDurationMinutes
        : status === "COMPLETED" && !task.actualDurationMinutes
        ? task.plannedDurationMinutes
        : task.actualDurationMinutes,
    completedAt: status === "COMPLETED" ? now.toISOString() : null,
    updatedAt: now.toISOString(),
  };

  studyPlannerMemoryStore.saveTask(updatedTask);

  try {
    await prisma.studyTask.update({
      where: { id: taskId },
      data: {
        status,
        actualDurationMinutes: updatedTask.actualDurationMinutes,
        completedAt: status === "COMPLETED" ? now : null,
        updatedAt: now,
      },
    });
  } catch {
    // DB fallback
  }

  return updatedTask;
}

export async function rescheduleStudyTask(
  studentId: string,
  taskId: string,
  newPlannedDate: string
): Promise<StoredStudyTask> {
  const task = studyPlannerMemoryStore.getTask(taskId);
  if (!task) {
    throw new Error("Task not found");
  }

  if (task.studentId !== studentId) {
    throw new Error("Unauthorized: You do not own this study task");
  }

  const now = new Date();
  const updatedTask: StoredStudyTask = {
    ...task,
    plannedDate: newPlannedDate,
    status: task.status === "COMPLETED" ? "COMPLETED" : "RESCHEDULED",
    updatedAt: now.toISOString(),
  };

  studyPlannerMemoryStore.saveTask(updatedTask);

  try {
    await prisma.studyTask.update({
      where: { id: taskId },
      data: {
        plannedDate: new Date(newPlannedDate),
        status: updatedTask.status,
        updatedAt: now,
      },
    });
  } catch {
    // DB fallback
  }

  return updatedTask;
}

export async function createCustomStudyTask(
  studentId: string,
  input: CreateCustomTaskInput
): Promise<StoredStudyTask> {
  let planId = input.studyPlanId;
  if (!planId) {
    const active = studyPlannerMemoryStore.getActivePlan(studentId);
    if (active) {
      planId = active.id;
    } else {
      const schedule = await generateStudentWeeklyPlan(studentId);
      planId = schedule.planId;
    }
  }

  const now = new Date();
  const taskId = `custom-task-${Date.now()}`;
  const newTask: StoredStudyTask = {
    id: taskId,
    studyPlanId: planId,
    studentId,
    title: input.title,
    description: input.description || null,
    taskType: input.taskType,
    subjectId: input.subjectId || null,
    topicId: input.topicId || null,
    linkedMockTestId: input.linkedMockTestId || null,
    plannedDate: input.plannedDate,
    plannedDurationMinutes: input.plannedDurationMinutes,
    actualDurationMinutes: null,
    status: "PLANNED",
    completedAt: null,
    recommendationSource: "STUDENT_CUSTOM",
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  studyPlannerMemoryStore.saveTask(newTask);

  try {
    await prisma.studyTask.create({
      data: {
        id: taskId,
        studyPlanId: planId,
        studentId,
        title: input.title,
        description: input.description,
        taskType: input.taskType,
        plannedDate: new Date(input.plannedDate),
        plannedDurationMinutes: input.plannedDurationMinutes,
        status: "PLANNED",
        recommendationSource: "STUDENT_CUSTOM",
      },
    });
  } catch {
    // DB fallback
  }

  return newTask;
}

export async function deleteStudyTask(studentId: string, taskId: string): Promise<boolean> {
  const task = studyPlannerMemoryStore.getTask(taskId);
  if (task && task.studentId !== studentId) {
    throw new Error("Unauthorized: You do not own this study task");
  }

  studyPlannerMemoryStore.deleteTask(taskId);

  try {
    await prisma.studyTask.delete({
      where: { id: taskId },
    });
  } catch {
    // DB fallback
  }

  return true;
}

// =============================================================================
// PLAN HISTORY
// =============================================================================

export async function getStudentPlanHistory(
  studentId: string,
  page = 1,
  limit = 5
): Promise<{
  plans: {
    id: string;
    title: string;
    weekStartDate: string;
    weekEndDate: string;
    totalTasks: number;
    completedTasks: number;
    completionPercentage: number;
    totalMinutesCompleted: number;
  }[];
  total: number;
  page: number;
  totalPages: number;
}> {
  const plans = studyPlannerMemoryStore.listStudentPlans(studentId);
  const tasks = studyPlannerMemoryStore.listStudentTasks(studentId);

  const formatted = plans.map((p) => {
    const planTasks = tasks.filter((t) => t.studyPlanId === p.id);
    const completedTasks = planTasks.filter((t) => t.status === "COMPLETED");
    const completionPercentage =
      planTasks.length > 0 ? Math.round((completedTasks.length / planTasks.length) * 100) : 0;
    const totalMinutesCompleted = completedTasks.reduce(
      (sum, t) => sum + (t.actualDurationMinutes || t.plannedDurationMinutes),
      0
    );

    return {
      id: p.id,
      title: p.title,
      weekStartDate: p.weekStartDate,
      weekEndDate: p.weekEndDate,
      totalTasks: planTasks.length,
      completedTasks: completedTasks.length,
      completionPercentage,
      totalMinutesCompleted,
    };
  });

  const startIndex = (page - 1) * limit;
  const paginated = formatted.slice(startIndex, startIndex + limit);

  return {
    plans: paginated,
    total: formatted.length,
    page,
    totalPages: Math.max(1, Math.ceil(formatted.length / limit)),
  };
}
