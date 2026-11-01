"use server";

import { getServerSession } from "@/lib/auth-server";
import { evaluateAttempt } from "@/lib/evaluation-service";

export async function evaluateAttemptAction(attemptId: string) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized. Please log in." };
    }

    const isAdmin = (session.user as { role?: string }).role === "ADMIN";
    const result = await evaluateAttempt(attemptId, session.user.id, isAdmin, false);

    return {
      success: true,
      data: result,
    };
  } catch (error: unknown) {
    const message = (error as Error).message || "Failed to evaluate test attempt.";
    return {
      success: false,
      error: message,
    };
  }
}

export async function reEvaluateAttemptAction(attemptId: string) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized. Please log in." };
    }

    const isAdmin = (session.user as { role?: string }).role === "ADMIN";
    if (!isAdmin) {
      return { success: false, error: "Forbidden: Admin privileges required." };
    }

    const result = await evaluateAttempt(attemptId, session.user.id, true, true);

    return {
      success: true,
      data: result,
    };
  } catch (error: unknown) {
    const message = (error as Error).message || "Failed to re-evaluate attempt.";
    return {
      success: false,
      error: message,
    };
  }
}

