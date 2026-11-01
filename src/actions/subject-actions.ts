"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { CUET_SUBJECTS_CATALOG } from "@/lib/syllabus-data";

export interface ActionResult<T = unknown> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
  enrolled?: boolean;
}

/**
 * Toggles a student's enrollment in a subject for a given exam year.
 * Synchronizes with both StudentSubject and StudentSubjectPreference.
 */
export async function toggleSubjectEnrollmentAction(
  subjectSlug: string,
  targetYear: number = 2026
): Promise<ActionResult<{ subjectSlug: string; isEnrolled: boolean }>> {
  try {
    const session = await getServerSession();
    if (!session || !session.user) {
      return {
        success: false,
        error: "Please log in to add or remove subjects from your preparation list.",
      };
    }

    const userId = session.user.id;

    // Get student profile
    const profile = await prisma.studentProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return {
        success: false,
        error: "Student profile not found. Please complete your onboarding first.",
      };
    }

    // Ensure ExamYear exists
    let examYear = await prisma.examYear.findUnique({
      where: { year: targetYear },
    });

    if (!examYear) {
      examYear = await prisma.examYear.create({
        data: {
          year: targetYear,
          name: `CUET UG ${targetYear}`,
          isDefault: targetYear === 2026,
          status: "ACTIVE",
        },
      });
    }

    // Ensure Subject exists
    let subject = await prisma.subject.findUnique({
      where: { slug: subjectSlug },
    });

    if (!subject) {
      const catalogItem = CUET_SUBJECTS_CATALOG.find((s) => s.slug === subjectSlug);
      if (!catalogItem) {
        return {
          success: false,
          error: "Selected subject is not available in the CUET catalog.",
        };
      }

      // Find or create category
      let category = await prisma.subjectCategory.findUnique({
        where: { slug: catalogItem.categorySlug },
      });
      if (!category) {
        category = await prisma.subjectCategory.create({
          data: {
            slug: catalogItem.categorySlug,
            name: catalogItem.categoryName,
            code: catalogItem.categorySlug.toUpperCase().replace(/-/g, "_"),
          },
        });
      }

      subject = await prisma.subject.create({
        data: {
          code: catalogItem.code,
          name: catalogItem.name,
          slug: catalogItem.slug,
          description: catalogItem.description,
          categoryId: category.id,
          status: "ACTIVE",
        },
      });
    }

    // Check if currently enrolled in StudentSubject
    const existing = await prisma.studentSubject.findUnique({
      where: {
        studentProfileId_subjectId_examYearId: {
          studentProfileId: profile.id,
          subjectId: subject.id,
          examYearId: examYear.id,
        },
      },
    });

    if (existing) {
      // UNENROLL: Remove from StudentSubject
      await prisma.studentSubject.delete({
        where: { id: existing.id },
      });

      // Synchronize with legacy StudentSubjectPreference
      await prisma.studentSubjectPreference.deleteMany({
        where: {
          studentProfileId: profile.id,
          subjectName: subject.name,
        },
      });

      revalidatePath("/subjects");
      revalidatePath(`/subjects/${subjectSlug}`);
      revalidatePath("/dashboard");

      return {
        success: true,
        enrolled: false,
        message: `${subject.name} removed from your CUET subjects.`,
        data: { subjectSlug, isEnrolled: false },
      };
    } else {
      // ENROLL: Check maximum subjects constraint (CUET guidelines allow up to 6 subjects)
      const currentCount = await prisma.studentSubject.count({
        where: {
          studentProfileId: profile.id,
          examYearId: examYear.id,
        },
      });

      if (currentCount >= 6) {
        return {
          success: false,
          error: "You have reached the maximum limit of 6 subjects for CUET UG. Please remove one to add another.",
        };
      }

      await prisma.studentSubject.create({
        data: {
          studentProfileId: profile.id,
          subjectId: subject.id,
          examYearId: examYear.id,
        },
      });

      // Synchronize with legacy StudentSubjectPreference
      await prisma.studentSubjectPreference.upsert({
        where: {
          studentProfileId_subjectCode: {
            studentProfileId: profile.id,
            subjectCode: subject.code,
          },
        },
        update: {
          subjectName: subject.name,
          category:
            subject.slug === "english" || subject.slug === "hindi"
              ? "LANGUAGE"
              : subject.slug === "general-test"
              ? "GENERAL_TEST"
              : "DOMAIN",
        },
        create: {
          studentProfileId: profile.id,
          subjectCode: subject.code,
          subjectName: subject.name,
          category:
            subject.slug === "english" || subject.slug === "hindi"
              ? "LANGUAGE"
              : subject.slug === "general-test"
              ? "GENERAL_TEST"
              : "DOMAIN",
        },
      });

      revalidatePath("/subjects");
      revalidatePath(`/subjects/${subjectSlug}`);
      revalidatePath("/dashboard");

      return {
        success: true,
        enrolled: true,
        message: `${subject.name} added to your CUET subjects.`,
        data: { subjectSlug, isEnrolled: true },
      };
    }
  } catch (error) {
    console.error("[toggleSubjectEnrollmentAction] Error:", error);
    return {
      success: false,
      error: "Unable to update subject selection. Please try again.",
    };
  }
}
