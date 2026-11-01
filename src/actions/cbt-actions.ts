"use server";

import { getServerSession } from "@/lib/auth-server";
import {
  startOrResumeAttempt,
  saveAttemptAnswer,
  submitAttempt,
} from "@/lib/cbt-service";
import {
  saveAnswerSchema,
  startAttemptSchema,
  type SaveAnswerInput,
  type AnswerStatus,
  type AttemptStatus,
} from "@/lib/validations/cbt";

export interface CBTActionResult<T = unknown> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
}

/**
 * Asserts that the user is authenticated as a student.
 */
async function assertStudentSession() {
  const session = await getServerSession();
  if (!session || !session.user?.id) {
    throw new Error("Authentication required. Please log in to take mock examinations.");
  }
  return session.user;
}

/**
 * Starts or resumes a test attempt.
 */
export async function startTestAttemptAction(
  mockTestId: string
): Promise<CBTActionResult<{ attemptId: string; isResumed: boolean }>> {
  try {
    const user = await assertStudentSession();

    const parsed = startAttemptSchema.safeParse({ mockTestId });
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues.map((i) => i.message).join(", "),
      };
    }

    const result = await startOrResumeAttempt(user.id, mockTestId);

    return {
      success: true,
      message: result.isResumed ? "Resumed in-progress test." : "Examination started.",
      data: result,
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to start examination.";
    return {
      success: false,
      error: msg,
    };
  }
}

/**
 * Saves a student's answer.
 */
export async function saveAttemptAnswerAction(
  rawInput: SaveAnswerInput
): Promise<
  CBTActionResult<{ version: number; answerStatus: AnswerStatus; updatedAt: string }>
> {
  try {
    const user = await assertStudentSession();

    const parsed = saveAnswerSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues.map((i) => i.message).join(", "),
      };
    }

    const result = await saveAttemptAnswer(user.id, parsed.data);

    return {
      success: true,
      data: result,
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to save answer.";
    return {
      success: false,
      error: msg,
    };
  }
}

/**
 * Submits a test attempt manually or upon expiration.
 */
export async function submitAttemptAction(
  attemptId: string,
  isAutoTimeout = false
): Promise<
  CBTActionResult<{ status: AttemptStatus; submittedAt: string; timeTaken: number }>
> {
  try {
    const user = await assertStudentSession();

    if (!attemptId) {
      return { success: false, error: "Attempt ID is required." };
    }

    const result = await submitAttempt(attemptId, user.id, isAutoTimeout);

    return {
      success: true,
      message: isAutoTimeout
        ? "Time expired. Examination automatically submitted."
        : "Examination submitted successfully.",
      data: result,
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to submit examination.";
    return {
      success: false,
      error: msg,
    };
  }
}

