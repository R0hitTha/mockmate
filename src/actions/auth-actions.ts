"use server";

import { auth } from "@/lib/auth";
import { forgotPasswordSchema, resetPasswordSchema } from "@/lib/validations/auth";
import { headers } from "next/headers";

export interface AuthActionResult {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Handles password reset request with privacy-safe generic messaging
 * to prevent account enumeration.
 */
export async function requestPasswordReset(email: string): Promise<AuthActionResult> {
  const result = forgotPasswordSchema.safeParse({ email });
  if (!result.success) {
    return {
      success: false,
      error: "Please enter a valid email address.",
    };
  }

  try {
    const reqHeaders = await headers();
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.BETTER_AUTH_URL ||
      "http://localhost:3000";

    await auth.api.requestPasswordReset({
      headers: reqHeaders,
      body: {
        email: result.data.email,
        redirectTo: `${appUrl}/reset-password`,
      },
    });

    // Always return a generic success message to prevent user enumeration
    return {
      success: true,
      message:
        "If an account exists for this email address, you will receive password reset instructions shortly.",
    };
  } catch (error) {
    console.error("[MOCKMATE_AUTH] Password reset request failed:", error);
    // Generic response even on internal error for security, with log
    return {
      success: true,
      message:
        "If an account exists for this email address, you will receive password reset instructions shortly.",
    };
  }
}

/**
 * Executes a password reset using the time-limited verification token
 */
export async function executePasswordReset(
  token: string,
  newPassword: string,
  confirmPassword: string
): Promise<AuthActionResult> {
  const parseResult = resetPasswordSchema.safeParse({
    token,
    password: newPassword,
    confirmPassword,
  });

  if (!parseResult.success) {
    const firstIssue =
      parseResult.error.issues[0]?.message || "Invalid password parameters";
    return {
      success: false,
      error: firstIssue,
    };
  }

  try {
    const reqHeaders = await headers();
    await auth.api.resetPassword({
      headers: reqHeaders,
      body: {
        newPassword: parseResult.data.password,
        token: parseResult.data.token,
      },
    });

    return {
      success: true,
      message: "Your password has been successfully reset. You can now log in.",
    };
  } catch (error: unknown) {
    console.error("[MOCKMATE_AUTH] Password reset execution error:", error);
    const msg =
      error instanceof Error
        ? error.message
        : "The reset link has expired or is invalid. Please request a new link.";
    return {
      success: false,
      error: msg,
    };
  }
}
