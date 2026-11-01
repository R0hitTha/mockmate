"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "@/lib/auth-server";
import {
  studyPreferenceSchema,
  generatePlanSchema,
  updateTaskStatusSchema,
  rescheduleTaskSchema,
  createCustomTaskSchema,
  type StudyPreferenceInput,
  type GeneratePlanInput,
  type UpdateTaskStatusInput,
  type RescheduleTaskInput,
  type CreateCustomTaskInput,
} from "@/lib/validations/planner";
import {
  getStudentStudyPlannerData,
  saveStudentStudyPreferences,
  generateStudentWeeklyPlan,
  updateStudyTaskStatus,
  rescheduleStudyTask,
  createCustomStudyTask,
  deleteStudyTask,
  getStudentPlanHistory,
} from "@/lib/study-planner-service";

export async function getStudyPlannerDataAction() {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required to access study planner." };
    }

    const data = await getStudentStudyPlannerData(session.user.id);
    return { success: true, data };
  } catch (err: unknown) {
    return {
      success: false,
      error: (err as Error).message || "Failed to load study planner data.",
    };
  }
}

export async function saveStudyPreferencesAction(input: StudyPreferenceInput) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required to save study preferences." };
    }

    const validated = studyPreferenceSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Invalid study preferences provided.",
      };
    }

    const updated = await saveStudentStudyPreferences(session.user.id, validated.data);

    revalidatePath("/study-planner");
    revalidatePath("/study-planner/settings");
    revalidatePath("/study-planner/weekly");
    revalidatePath("/dashboard");

    return { success: true, data: updated };
  } catch (err: unknown) {
    return {
      success: false,
      error: (err as Error).message || "Failed to save study preferences.",
    };
  }
}

export async function generateWeeklyPlanAction(input?: GeneratePlanInput) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required to generate a study plan." };
    }

    const validated = generatePlanSchema.safeParse(input || {});
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Invalid plan options provided.",
      };
    }

    const schedule = await generateStudentWeeklyPlan(session.user.id, {
      weekStartDate: validated.data.weekStartDate,
      regenerate: validated.data.regenerate,
      preserveCompleted: validated.data.preserveCompleted,
    });

    revalidatePath("/study-planner");
    revalidatePath("/study-planner/weekly");
    revalidatePath("/dashboard");

    return { success: true, data: schedule };
  } catch (err: unknown) {
    return {
      success: false,
      error: (err as Error).message || "Failed to generate study plan.",
    };
  }
}

export async function updateTaskStatusAction(input: UpdateTaskStatusInput) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required to update study tasks." };
    }

    const validated = updateTaskStatusSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Invalid task status data provided.",
      };
    }

    const updated = await updateStudyTaskStatus(
      session.user.id,
      validated.data.taskId,
      validated.data.status,
      validated.data.actualDurationMinutes
    );

    revalidatePath("/study-planner");
    revalidatePath("/study-planner/weekly");
    revalidatePath("/dashboard");

    return { success: true, data: updated };
  } catch (err: unknown) {
    return {
      success: false,
      error: (err as Error).message || "Failed to update task status.",
    };
  }
}

export async function rescheduleTaskAction(input: RescheduleTaskInput) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required to reschedule tasks." };
    }

    const validated = rescheduleTaskSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Invalid reschedule data provided.",
      };
    }

    const updated = await rescheduleStudyTask(
      session.user.id,
      validated.data.taskId,
      validated.data.newPlannedDate
    );

    revalidatePath("/study-planner");
    revalidatePath("/study-planner/weekly");
    revalidatePath("/dashboard");

    return { success: true, data: updated };
  } catch (err: unknown) {
    return {
      success: false,
      error: (err as Error).message || "Failed to reschedule task.",
    };
  }
}

export async function createCustomTaskAction(input: CreateCustomTaskInput) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required to add custom tasks." };
    }

    const validated = createCustomTaskSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Invalid task data provided.",
      };
    }

    const created = await createCustomStudyTask(session.user.id, validated.data);

    revalidatePath("/study-planner");
    revalidatePath("/study-planner/weekly");
    revalidatePath("/dashboard");

    return { success: true, data: created };
  } catch (err: unknown) {
    return {
      success: false,
      error: (err as Error).message || "Failed to create custom task.",
    };
  }
}

export async function deleteTaskAction(taskId: string) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required to delete tasks." };
    }

    await deleteStudyTask(session.user.id, taskId);

    revalidatePath("/study-planner");
    revalidatePath("/study-planner/weekly");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: (err as Error).message || "Failed to delete task.",
    };
  }
}

export async function getPlanHistoryAction(page = 1) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required to view plan history." };
    }

    const history = await getStudentPlanHistory(session.user.id, page);
    return { success: true, data: history };
  } catch (err: unknown) {
    return {
      success: false,
      error: (err as Error).message || "Failed to load plan history.",
    };
  }
}
