"use server";

import { getServerSession, checkPhoneUniqueness } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface ProfileUpdateInput {
  name: string;
  phone?: string;
  stream: "SCIENCE" | "COMMERCE" | "HUMANITIES" | "OTHER";
  targetExamYear: number;
  academicStatus: string;
  subjectCodes: string[];
  universityCodes: string[];
}

export async function updateStudentProfile(input: ProfileUpdateInput) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return { success: false, error: "Authentication required to update profile" };
  }

  const userId = session.user.id;

  try {
    let normalizedPhone: string | undefined = undefined;

    if (input.phone) {
      const phoneCheck = await checkPhoneUniqueness(input.phone, userId);
      if (!phoneCheck.isAvailable) {
        return { success: false, error: phoneCheck.error };
      }
      normalizedPhone = phoneCheck.normalized;
    }

    await prisma.$transaction(async (tx) => {
      // 1. Update user name
      if (input.name) {
        await tx.user.update({
          where: { id: userId },
          data: { name: input.name.trim() },
        });
      }

      // 2. Update student profile
      const profile = await tx.studentProfile.upsert({
        where: { userId },
        create: {
          userId,
          stream: input.stream,
          targetExamYear: input.targetExamYear,
          academicStatus: input.academicStatus,
          ...(normalizedPhone ? { normalizedPhone } : {}),
          onboardingCompleted: true,
        },
        update: {
          stream: input.stream,
          targetExamYear: input.targetExamYear,
          academicStatus: input.academicStatus,
          ...(normalizedPhone ? { normalizedPhone } : {}),
        },
      });

      // 3. Update subjects if provided
      if (input.subjectCodes && input.subjectCodes.length > 0) {
        await tx.studentSubjectPreference.deleteMany({
          where: { studentProfileId: profile.id },
        });

        await tx.studentSubjectPreference.createMany({
          data: input.subjectCodes.map((code) => ({
            studentProfileId: profile.id,
            subjectCode: code,
            subjectName: code,
            category:
              code.startsWith("1") || code.startsWith("2") ? "LANGUAGE" : "DOMAIN",
          })),
        });
      }

      // 4. Update universities if provided
      if (input.universityCodes) {
        await tx.studentUniversityPreference.deleteMany({
          where: { studentProfileId: profile.id },
        });

        if (input.universityCodes.length > 0) {
          await tx.studentUniversityPreference.createMany({
            data: input.universityCodes.map((code) => ({
              studentProfileId: profile.id,
              universityCode: code,
              universityName: code,
            })),
          });
        }
      }
    });

    revalidatePath("/profile");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Your MockMate student profile was updated successfully.",
    };
  } catch (error) {
    console.error("[MOCKMATE_PROFILE] Failed to update profile:", error);
    return {
      success: false,
      error: "Unable to save profile updates. Please try again.",
    };
  }
}
