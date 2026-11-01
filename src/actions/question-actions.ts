"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import {
  QuestionSchema,
  QuestionReviewSchema,
  BulkImportRowSchema,
  QuestionInput,
  QuestionReviewInput,
  BulkImportRow,
} from "@/lib/validations/question";

export interface QuestionActionResult<T = unknown> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
}

/**
 * Asserts that the authenticated user has administrative or content-management privileges.
 */
async function assertAdminSession() {
  const session = await getServerSession();
  if (!session || !session.user) {
    throw new Error("Authentication required. Please sign in to access the Question Bank.");
  }
  const role = (session.user as { role?: string }).role || "STUDENT";
  if (role !== "ADMIN" && role !== "CONTENT_CREATOR" && role !== "FACULTY") {
    throw new Error("Access denied: You do not have permission to manage questions.");
  }
  return session.user;
}

/**
 * Create a new CUET Question in the question bank.
 */
export async function createQuestionAction(
  rawInput: QuestionInput
): Promise<QuestionActionResult<{ questionId: string; questionCode: string }>> {
  try {
    const user = await assertAdminSession();

    // 1. Zod Validation
    const parsed = QuestionSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Invalid question input.",
      };
    }
    const data = parsed.data;

    // 2. Resolve ExamYear
    let examYear = await prisma.examYear.findUnique({
      where: { year: data.examYear },
    });
    if (!examYear) {
      examYear = await prisma.examYear.create({
        data: {
          year: data.examYear,
          name: `CUET UG ${data.examYear}`,
          isDefault: data.examYear === 2026,
        },
      });
    }

    // 3. Resolve Subject
    const subject = await prisma.subject.findUnique({
      where: { slug: data.subjectSlug },
      include: {
        syllabusVersions: {
          where: { examYearId: examYear.id },
          include: {
            units: {
              where: { unitNumber: data.unitNumber },
              include: {
                topics: {
                  where: { order: data.topicOrder },
                  include: { subtopics: true },
                },
              },
            },
          },
        },
      },
    });

    if (!subject) {
      return {
        success: false,
        error: `Subject "${data.subjectSlug}" does not exist in the curriculum catalog.`,
      };
    }

    const syllabusVersion = subject.syllabusVersions[0];
    const unit = syllabusVersion?.units[0];
    const topic = unit?.topics[0];
    const subtopic = data.subtopicOrder ? topic?.subtopics[data.subtopicOrder - 1] : undefined;

    // 4. Generate unique Question Code
    const subjectPrefix = subject.code || subject.slug.slice(0, 3).toUpperCase();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const questionCode = data.questionCode || `Q-${subjectPrefix}-${data.examYear}-${Date.now().toString().slice(-4)}${randomSuffix}`;

    // 5. Handle Passage if passageText provided
    let passageId = data.passageId;
    if (!passageId && data.passageText && data.passageText.trim().length > 10) {
      const passage = await prisma.questionPassage.create({
        data: {
          title: data.passageTitle || `Passage for ${questionCode}`,
          passageText: data.passageText,
          subjectId: subject.id,
        },
      });
      passageId = passage.id;
    }

    // 6. Create Question & Options in a transaction
    const question = await prisma.$transaction(async (tx) => {
      const q = await tx.question.create({
        data: {
          questionCode,
          examYearId: examYear.id,
          subjectId: subject.id,
          syllabusVersionId: syllabusVersion?.id,
          unitId: unit?.id,
          topicId: topic?.id,
          subtopicId: subtopic?.id,
          passageId,
          questionType: data.questionType,
          questionText: data.questionText,
          difficulty: data.difficulty,
          explanation: data.explanation || null,
          marks: data.marks,
          negativeMarks: data.negativeMarks,
          status: data.status,
          publishedAt: data.status === "PUBLISHED" ? new Date() : null,
          createdById: user.id,
          options: {
            create: data.options.map((opt, idx) => ({
              optionLabel: opt.optionLabel,
              optionText: opt.optionText,
              isCorrect: opt.isCorrect,
              order: opt.order || idx + 1,
            })),
          },
        },
      });

      // Link tags
      if (data.tags && data.tags.length > 0) {
        for (const tagName of data.tags) {
          const slug = tagName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
          const tag = await tx.questionTag.upsert({
            where: { slug },
            update: {},
            create: { name: tagName, slug },
          });

          await tx.questionTagRelation.create({
            data: {
              questionId: q.id,
              tagId: tag.id,
            },
          });
        }
      }

      return q;
    });

    revalidatePath("/admin/question-bank");
    return {
      success: true,
      message: `Question ${questionCode} created successfully (${data.status}).`,
      data: { questionId: question.id, questionCode },
    };
  } catch (error) {
    console.error("[createQuestionAction] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create question.",
    };
  }
}

/**
 * Update an existing CUET Question.
 * Guards against destructive changes if the question has already been used in tests.
 */
export async function updateQuestionAction(
  id: string,
  rawInput: QuestionInput
): Promise<QuestionActionResult<{ questionId: string }>> {
  try {
    const user = await assertAdminSession();

    // 1. Zod Validation
    const parsed = QuestionSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Invalid question updates.",
      };
    }
    const data = parsed.data;

    // 2. Check Question Existence & Usage Safeguard
    const existing = await prisma.question.findUnique({
      where: { id },
      include: { options: true },
    });

    if (!existing) {
      return { success: false, error: "Question record not found." };
    }

    if (existing.usageCount > 0 && existing.status === "PUBLISHED") {
      // Historical result safeguard: If a question is already locked in submitted tests,
      // prevent changing the correct answer key
      const currentCorrect = existing.options.find((o) => o.isCorrect)?.optionLabel;
      const newCorrect = data.options.find((o) => o.isCorrect)?.optionLabel;
      if (currentCorrect !== newCorrect) {
        return {
          success: false,
          error: `Safeguard active: This question has already been used in ${existing.usageCount} test attempts. Modifying the correct answer key (${currentCorrect} -> ${newCorrect}) would alter historical scoring. Please archive this question and create a new version.`,
        };
      }
    }

    // 3. Update Question and Replace Options in transaction
    await prisma.$transaction(async (tx) => {
      // Update core fields
      await tx.question.update({
        where: { id },
        data: {
          questionText: data.questionText,
          difficulty: data.difficulty,
          explanation: data.explanation || null,
          marks: data.marks,
          negativeMarks: data.negativeMarks,
          status: data.status,
          publishedAt: data.status === "PUBLISHED" && !existing.publishedAt ? new Date() : existing.publishedAt,
          updatedById: user.id,
        },
      });

      // Delete and recreate options
      await tx.questionOption.deleteMany({ where: { questionId: id } });
      await tx.questionOption.createMany({
        data: data.options.map((opt, idx) => ({
          questionId: id,
          optionLabel: opt.optionLabel,
          optionText: opt.optionText,
          isCorrect: opt.isCorrect,
          order: opt.order || idx + 1,
        })),
      });

      // Update tags
      if (data.tags) {
        await tx.questionTagRelation.deleteMany({ where: { questionId: id } });
        for (const tagName of data.tags) {
          const slug = tagName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
          const tag = await tx.questionTag.upsert({
            where: { slug },
            update: {},
            create: { name: tagName, slug },
          });

          await tx.questionTagRelation.create({
            data: { questionId: id, tagId: tag.id },
          });
        }
      }
    });

    revalidatePath("/admin/question-bank");
    revalidatePath(`/admin/question-bank/${id}`);

    return {
      success: true,
      message: `Question updated successfully.`,
      data: { questionId: id },
    };
  } catch (error) {
    console.error("[updateQuestionAction] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update question.",
    };
  }
}

/**
 * Review, Approve, Reject, or Publish a Question
 */
export async function reviewQuestionAction(
  id: string,
  rawReview: QuestionReviewInput
): Promise<QuestionActionResult<{ newStatus: string }>> {
  try {
    const user = await assertAdminSession();

    const parsed = QuestionReviewSchema.safeParse(rawReview);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Invalid review feedback.",
      };
    }

    const { reviewStatus, feedback } = parsed.data;

    const question = await prisma.question.findUnique({
      where: { id },
      include: { options: true },
    });

    if (!question) {
      return { success: false, error: "Question not found." };
    }

    // Determine target status
    let targetStatus = question.status;
    if (reviewStatus === "APPROVED") targetStatus = "APPROVED";
    else if (reviewStatus === "REJECTED" || reviewStatus === "CHANGES_REQUESTED") targetStatus = "REJECTED";
    else if (reviewStatus === "PUBLISHED") {
      // Validate publish readiness
      const hasCorrect = question.options.some((o) => o.isCorrect);
      if (!hasCorrect) {
        return { success: false, error: "Cannot publish: Question has no correct answer marked." };
      }
      if (!question.explanation || question.explanation.length < 5) {
        return { success: false, error: "Cannot publish: Comprehensive explanation is required for published questions." };
      }
      targetStatus = "PUBLISHED";
    }

    await prisma.$transaction(async (tx) => {
      // Record review audit log
      await tx.questionReview.create({
        data: {
          questionId: id,
          reviewerId: user.id,
          reviewStatus,
          feedback: feedback || null,
        },
      });

      // Update question status
      await tx.question.update({
        where: { id },
        data: {
          status: targetStatus,
          publishedAt: targetStatus === "PUBLISHED" ? new Date() : question.publishedAt,
          updatedById: user.id,
        },
      });
    });

    revalidatePath("/admin/question-bank");
    revalidatePath(`/admin/question-bank/${id}`);

    return {
      success: true,
      message: `Question status updated to ${targetStatus}.`,
      data: { newStatus: targetStatus },
    };
  } catch (error) {
    console.error("[reviewQuestionAction] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to record question review.",
    };
  }
}

/**
 * Safely archive a question (soft deletion)
 */
export async function archiveQuestionAction(
  id: string
): Promise<QuestionActionResult> {
  try {
    const user = await assertAdminSession();

    await prisma.question.update({
      where: { id },
      data: {
        status: "ARCHIVED",
        updatedById: user.id,
      },
    });

    revalidatePath("/admin/question-bank");
    revalidatePath(`/admin/question-bank/${id}`);

    return {
      success: true,
      message: "Question archived successfully. It will no longer appear in student practice pools.",
    };
  } catch (error) {
    console.error("[archiveQuestionAction] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to archive question.",
    };
  }
}

/**
 * Bulk import validated question rows from CSV
 */
export async function bulkImportQuestionsAction(
  rows: BulkImportRow[]
): Promise<QuestionActionResult<{ importedCount: number; skippedCount: number; errors: string[] }>> {
  try {
    await assertAdminSession();

    if (!Array.isArray(rows) || rows.length === 0) {
      return { success: false, error: "No rows provided for import." };
    }

    let importedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const parsed = BulkImportRowSchema.safeParse(row);

      if (!parsed.success) {
        skippedCount++;
        errors.push(`Row ${i + 1}: ${parsed.error.issues[0]?.message}`);
        continue;
      }

      const validRow = parsed.data;

      // Build options array from row
      const options = [
        { optionLabel: "A", optionText: validRow.optionA, isCorrect: validRow.correctAnswer.toUpperCase() === "A", order: 1 },
        { optionLabel: "B", optionText: validRow.optionB, isCorrect: validRow.correctAnswer.toUpperCase() === "B", order: 2 },
      ];

      if (validRow.optionC) {
        options.push({ optionLabel: "C", optionText: validRow.optionC, isCorrect: validRow.correctAnswer.toUpperCase() === "C", order: 3 });
      }
      if (validRow.optionD) {
        options.push({ optionLabel: "D", optionText: validRow.optionD, isCorrect: validRow.correctAnswer.toUpperCase() === "D", order: 4 });
      }

      const res = await createQuestionAction({
        examYear: validRow.examYear,
        subjectSlug: validRow.subjectCodeOrSlug.toLowerCase(),
        unitNumber: validRow.unitNumber,
        topicOrder: validRow.topicOrder,
        questionType: validRow.questionType,
        questionText: validRow.questionText,
        difficulty: validRow.difficulty,
        explanation: validRow.explanation,
        marks: validRow.marks,
        negativeMarks: validRow.negativeMarks,
        status: "DRAFT", // Bulk imported questions default to DRAFT for safety
        options,
        tags: validRow.tags ? validRow.tags.split(",").map((t) => t.trim()).filter(Boolean) : ["Bulk Import"],
      });

      if (res.success) {
        importedCount++;
      } else {
        skippedCount++;
        errors.push(`Row ${i + 1}: ${res.error}`);
      }
    }

    revalidatePath("/admin/question-bank");

    return {
      success: true,
      message: `Bulk import completed: ${importedCount} imported, ${skippedCount} skipped.`,
      data: { importedCount, skippedCount, errors },
    };
  } catch (error) {
    console.error("[bulkImportQuestionsAction] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to execute bulk import.",
    };
  }
}
