"use server";

import { getServerSession } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import {
  completeOnboardingSchema,
  PROVISIONAL_LANGUAGES,
  PROVISIONAL_DOMAINS,
  PROVISIONAL_UNIVERSITIES,
  type CompleteOnboardingInput,
} from "@/lib/validations/onboarding";
import { checkPhoneUniqueness } from "@/lib/auth-server";

export interface OnboardingActionResult {
  success: boolean;
  message?: string;
  error?: string;
  redirectUrl?: string;
}

/**
 * Saves incremental step progress for an authenticated student during onboarding.
 * Allows save-and-resume behavior if a student leaves and returns.
 */
export async function saveStepProgress(
  step: number,
  data: Partial<CompleteOnboardingInput>
): Promise<OnboardingActionResult> {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return {
      success: false,
      error: "Authentication required to save onboarding progress",
    };
  }

  const userId = session.user.id;

  try {
    let normalizedPhone: string | undefined = undefined;
    if (data.phone) {
      const phoneCheck = await checkPhoneUniqueness(data.phone, userId);
      if (!phoneCheck.isAvailable) {
        return { success: false, error: phoneCheck.error };
      }
      normalizedPhone = phoneCheck.normalized;
    }

    await prisma.studentProfile.upsert({
      where: { userId },
      create: {
        userId,
        currentStep: step,
        ...(normalizedPhone ? { normalizedPhone } : {}),
        ...(data.academicStatus ? { academicStatus: data.academicStatus } : {}),
        ...(data.targetExamYear ? { targetExamYear: data.targetExamYear } : {}),
        ...(data.stream ? { stream: data.stream } : {}),
      },
      update: {
        currentStep: Math.max(step, 1),
        ...(normalizedPhone ? { normalizedPhone } : {}),
        ...(data.academicStatus ? { academicStatus: data.academicStatus } : {}),
        ...(data.targetExamYear ? { targetExamYear: data.targetExamYear } : {}),
        ...(data.stream ? { stream: data.stream } : {}),
      },
    });

    return { success: true, message: `Step ${step} progress saved successfully` };
  } catch (error) {
    console.error("[MOCKMATE_ONBOARDING] Failed to save step progress:", error);
    return {
      success: false,
      error: "Failed to persist step progress. Please try again.",
    };
  }
}

/**
 * Finalizes onboarding for the student:
 * - Validates complete inputs
 * - Verifies phone uniqueness against existing verified student accounts
 * - Transactionally stores profile, subject preferences, and university preferences
 * - Sets onboardingCompleted = true
 */
export async function completeStudentOnboarding(
  input: CompleteOnboardingInput
): Promise<OnboardingActionResult> {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return { success: false, error: "You must be signed in to complete onboarding" };
  }

  const userId = session.user.id;

  // Validate complete payload
  const parseResult = completeOnboardingSchema.safeParse(input);
  if (!parseResult.success) {
    const firstIssue =
      parseResult.error.issues[0]?.message || "Invalid onboarding information";
    return { success: false, error: firstIssue };
  }

  const data = parseResult.data;

  // Verify phone uniqueness
  const phoneCheck = await checkPhoneUniqueness(data.phone, userId);
  if (!phoneCheck.isAvailable || !phoneCheck.normalized) {
    return { success: false, error: phoneCheck.error || "Invalid phone number" };
  }

  const normalizedPhone = phoneCheck.normalized;

  try {
    // Map selected subject codes to names and categories
    const subjectRecords: Array<{
      subjectCode: string;
      subjectName: string;
      category: string;
    }> = [];

    // 1. Languages
    for (const code of data.languages) {
      const match = PROVISIONAL_LANGUAGES.find((l) => l.code === code);
      subjectRecords.push({
        subjectCode: code,
        subjectName: match ? match.name : `Language (${code})`,
        category: "LANGUAGE",
      });
    }

    // 2. Domains
    for (const code of data.domains) {
      const match = PROVISIONAL_DOMAINS.find((d) => d.code === code);
      subjectRecords.push({
        subjectCode: code,
        subjectName: match ? match.name : `Domain (${code})`,
        category: "DOMAIN",
      });
    }

    // 3. General Aptitude Test
    if (data.generalTest) {
      subjectRecords.push({
        subjectCode: "501",
        subjectName: "General Aptitude Test (GT)",
        category: "GENERAL_TEST",
      });
    }

    // Map universities
    const universityRecords = data.universities.map((code) => {
      const match = PROVISIONAL_UNIVERSITIES.find((u) => u.code === code);
      return {
        universityCode: code,
        universityName: match ? match.name : code,
      };
    });

    // Execute atomic transactional database write
    await prisma.$transaction(async (tx) => {
      // 1. Upsert student profile
      const profile = await tx.studentProfile.upsert({
        where: { userId },
        create: {
          userId,
          normalizedPhone,
          academicStatus: data.academicStatus,
          stream: data.stream,
          targetExamYear: data.targetExamYear,
          onboardingCompleted: true,
          currentStep: 6,
        },
        update: {
          normalizedPhone,
          academicStatus: data.academicStatus,
          stream: data.stream,
          targetExamYear: data.targetExamYear,
          onboardingCompleted: true,
          currentStep: 6,
        },
      });

      // 2. Also update User's full name if provided and not equal
      if (data.name && data.name !== session.user.name) {
        await tx.user.update({
          where: { id: userId },
          data: { name: data.name },
        });
      }

      // 3. Re-create subject preferences cleanly
      await tx.studentSubjectPreference.deleteMany({
        where: { studentProfileId: profile.id },
      });

      if (subjectRecords.length > 0) {
        await tx.studentSubjectPreference.createMany({
          data: subjectRecords.map((s) => ({
            studentProfileId: profile.id,
            subjectCode: s.subjectCode,
            subjectName: s.subjectName,
            category: s.category,
          })),
        });
      }

      // 4. Re-create university preferences cleanly
      await tx.studentUniversityPreference.deleteMany({
        where: { studentProfileId: profile.id },
      });

      if (universityRecords.length > 0) {
        await tx.studentUniversityPreference.createMany({
          data: universityRecords.map((u) => ({
            studentProfileId: profile.id,
            universityCode: u.universityCode,
            universityName: u.universityName,
          })),
        });
      }
    });

    return {
      success: true,
      message: "CUET onboarding completed successfully!",
      redirectUrl: "/dashboard",
    };
  } catch (error) {
    console.error("[MOCKMATE_ONBOARDING] Transaction failed:", error);
    return {
      success: false,
      error: "Unable to complete onboarding due to a database error. Please try again.",
    };
  }
}
