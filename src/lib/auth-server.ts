import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizeIndianPhoneNumber } from "@/lib/phone";

/**
 * Retrieves the current Better Auth session from request headers in Server Components / Actions
 */
export async function getServerSession() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    return session;
  } catch (error: unknown) {
    // If Next.js signals dynamic bailout/prerender rejection or redirect, rethrow so Next.js handles it
    if (
      typeof error === "object" &&
      error !== null &&
      ("digest" in error || "message" in error)
    ) {
      const err = error as { digest?: string; message?: string };
      if (
        err.digest === "HANGING_PROMISE_REJECTION" ||
        err.digest?.startsWith("NEXT_") ||
        err.message?.includes("prerender")
      ) {
        throw error;
      }
    }
    console.error("[MOCKMATE_AUTH] Failed to fetch server session:", error);
    return null;
  }
}

/**
 * Requires an authenticated user session. Redirects to /login if unauthenticated.
 */
export async function requireAuth(returnUrl: string = "/dashboard") {
  const session = await getServerSession();
  if (!session || !session.user) {
    redirect(`/login?callbackUrl=${encodeURIComponent(returnUrl)}`);
  }
  return session;
}

/**
 * Checks authorization role on the server.
 */
export async function requireRole(allowedRoles: string | string[]) {
  const session = await requireAuth();
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  const userRole = (session.user as { role?: string }).role || "STUDENT";

  if (!roles.includes(userRole)) {
    redirect("/dashboard?error=unauthorized");
  }

  return session;
}

/**
 * Validates whether a normalized phone number is already verified with another user's student profile.
 * Policy: Prevents duplicate student profiles under different Google/email accounts with the same verified phone number.
 * Privacy rule: Does not expose the identity, name, or email of the existing account.
 */
export async function checkPhoneUniqueness(
  rawPhone: string,
  excludeUserId?: string
): Promise<{ isAvailable: boolean; normalized?: string; error?: string }> {
  const validation = normalizeIndianPhoneNumber(rawPhone);
  if (!validation.isValid || !validation.normalized) {
    return {
      isAvailable: false,
      error: validation.error || "Invalid mobile number format",
    };
  }

  const normalized = validation.normalized;

  try {
    // Check if another student has this normalized phone number as verified
    const existing = await prisma.studentProfile.findFirst({
      where: {
        normalizedPhone: normalized,
        phoneVerified: true,
        ...(excludeUserId ? { userId: { not: excludeUserId } } : {}),
      },
      select: {
        id: true,
      },
    });

    if (existing) {
      return {
        isAvailable: false,
        normalized,
        error:
          "This phone number is already registered and verified with another MockMate student profile. Please sign in with your verified account or contact support.",
      };
    }

    return {
      isAvailable: true,
      normalized,
    };
  } catch (dbError) {
    console.error("[MOCKMATE_DB] Error querying phone uniqueness:", dbError);
    // In dev or offline database fallback, return valid format
    return {
      isAvailable: true,
      normalized,
    };
  }
}

/**
 * Fetches the student profile for an authenticated user
 */
export async function getStudentProfile(userId: string) {
  try {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        subjectPreferences: true,
        universityPreferences: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            emailVerified: true,
            image: true,
            role: true,
          },
        },
      },
    });
    return profile;
  } catch (error) {
    console.error("[MOCKMATE_DB] Failed to load student profile:", error);
    return null;
  }
}
