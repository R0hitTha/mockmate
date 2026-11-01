/**
 * MockMate — Evaluation & Result Engine (Phase 10)
 *
 * Implements server-authoritative, immutable, and idempotent evaluation
 * of submitted test attempts against verified question versions and
 * configured marking schemes.
 */

import { prisma } from "@/lib/prisma";
import { getMockTestById } from "@/lib/mock-test-service";
import { cbtMemoryStore } from "@/lib/cbt-sample-data";
import { resultMemoryStore } from "@/lib/evaluation-sample-data";
import type {
  TestResultData,
  TestResultSectionData,
  TestResultQuestionData,
  EvaluatedOptionSnapshot,
  ResultFilterParams,
  EvaluationStatus,
} from "./validations/evaluation";

/**
 * Evaluates a submitted test attempt.
 * Server-authoritative: completely ignores client-supplied scores.
 * Idempotent: repeated evaluations return the finalized result without duplicate generation.
 */
export async function evaluateAttempt(
  attemptId: string,
  requestingUserId: string,
  isAdmin: boolean = false,
  isReEvaluation: boolean = false
): Promise<TestResultData> {
  // 1. Idempotency Check: Check if an evaluated result already exists
  if (!isReEvaluation) {
    try {
      const existingDb = await prisma.testResult.findUnique({
        where: { attemptId },
        include: {
          sections: true,
          questions: { orderBy: { questionNumber: "asc" } },
          mockTest: true,
          student: { select: { id: true, name: true, email: true } },
        },
      });

      if (existingDb) {
        if (!isAdmin && existingDb.studentId !== requestingUserId) {
          throw new Error("Access denied: You cannot view this result.");
        }
        return mapDbResultToData(existingDb);
      }
    } catch (err: unknown) {
      const msg = (err as Error).message || "";
      if (msg.includes("Access denied")) throw err;
      // In-memory fallback
      const existingMem = resultMemoryStore.getResultByAttemptId(attemptId);
      if (existingMem) {
        if (!isAdmin && existingMem.studentId !== requestingUserId) {
          throw new Error("Access denied: You cannot view this result.");
        }
        return existingMem;
      }
    }
  }

  // 2. Fetch the attempt (Prisma with in-memory fallback)
  let attemptData: {
    id: string;
    studentId: string;
    mockTestId: string;
    status: string;
    startedAt: Date;
    expiresAt: Date;
    submittedAt: Date | null;
    timeTaken: number | null;
    studentName?: string;
    studentEmail?: string;
    answers: Array<{
      questionId: string;
      selectedOptionId: string | null;
      selectedOptionIds: string[];
      answerStatus: string;
      markedForReview: boolean;
    }>;
  } | null = null;

  try {
    const dbAttempt = await prisma.testAttempt.findUnique({
      where: { id: attemptId },
      include: {
        answers: true,
        student: { select: { id: true, name: true, email: true } },
      },
    });

    if (dbAttempt) {
      attemptData = {
        id: dbAttempt.id,
        studentId: dbAttempt.studentId,
        mockTestId: dbAttempt.mockTestId,
        status: dbAttempt.status,
        startedAt: dbAttempt.startedAt,
        expiresAt: dbAttempt.expiresAt,
        submittedAt: dbAttempt.submittedAt,
        timeTaken: dbAttempt.timeTaken,
        studentName: dbAttempt.student.name,
        studentEmail: dbAttempt.student.email,
        answers: dbAttempt.answers.map((a) => ({
          questionId: a.questionId,
          selectedOptionId: a.selectedOptionId,
          selectedOptionIds: a.selectedOptionIds,
          answerStatus: a.answerStatus,
          markedForReview: a.markedForReview,
        })),
      };
    }
  } catch {
    // Tolerated, fallback to memory
  }

  if (!attemptData) {
    const memAttempt = cbtMemoryStore.getAttempt(attemptId);
    if (!memAttempt) {
      throw new Error("Test attempt not found.");
    }
    attemptData = {
      id: memAttempt.id,
      studentId: memAttempt.studentId,
      mockTestId: memAttempt.mockTestId,
      status: memAttempt.status,
      startedAt: new Date(memAttempt.startedAt),
      expiresAt: new Date(memAttempt.expiresAt),
      submittedAt: memAttempt.submittedAt ? new Date(memAttempt.submittedAt) : null,
      timeTaken: memAttempt.timeTaken,
      answers: Array.from(memAttempt.answers.values()).map((a) => ({
        questionId: a.questionId,
        selectedOptionId: a.selectedOptionId,
        selectedOptionIds: a.selectedOptionIds,
        answerStatus: a.answerStatus,
        markedForReview: a.markedForReview,
      })),
    };
  }

  // 3. Security & Validation Checks
  if (!isAdmin && attemptData.studentId !== requestingUserId) {
    throw new Error("Access denied: You cannot evaluate another student's attempt.");
  }

  if (attemptData.status === "IN_PROGRESS") {
    throw new Error("Cannot evaluate an in-progress test attempt.");
  }

  // 4. Fetch the authoritative Mock Test definition with verified answer keys (isStudent = false)
  const mockTest = await getMockTestById(attemptData.mockTestId, false);
  if (!mockTest) {
    throw new Error("Referenced mock test could not be loaded for evaluation.");
  }

  // Index student answers by questionId
  const answerMap = new Map<
    string,
    {
      selectedOptionId: string | null;
      selectedOptionIds: string[];
      answerStatus: string;
      markedForReview: boolean;
    }
  >();
  attemptData.answers.forEach((ans) => {
    answerMap.set(ans.questionId, ans);
  });

  // 5. Evaluate section-by-section and question-by-question
  const evaluatedQuestions: TestResultQuestionData[] = [];
  const evaluatedSections: TestResultSectionData[] = [];

  let overallTotalMarks = 0;
  let overallMaxMarks = 0;
  let overallCorrect = 0;
  let overallIncorrect = 0;
  let overallUnanswered = 0;
  let questionCounter = 1;

  for (const section of mockTest.sections) {
    let sectionTotalMarks = 0;
    let sectionCorrect = 0;
    let sectionIncorrect = 0;
    let sectionUnanswered = 0;

    for (const q of section.questions) {
      const studentAns = answerMap.get(q.id);
      const isAttempted = Boolean(
        studentAns &&
          studentAns.selectedOptionId &&
          studentAns.answerStatus !== "NOT_VISITED" &&
          studentAns.answerStatus !== "NOT_ANSWERED"
      );

      const correctOpt = q.options.find((o) => o.isCorrect);
      const selectedOpt = studentAns?.selectedOptionId
        ? q.options.find((o) => o.id === studentAns.selectedOptionId)
        : null;

      let qStatus: "CORRECT" | "INCORRECT" | "UNANSWERED";
      let isCorrect = false;
      let awardedMarks = 0;
      let negativeMarksApplied = 0;

      const marksAwarded = q.marks ?? 5.0;
      const negMarks = q.negativeMarks ?? 1.0;

      if (!isAttempted || !selectedOpt) {
        qStatus = "UNANSWERED";
        isCorrect = false;
        awardedMarks = 0;
        negativeMarksApplied = 0;
        sectionUnanswered++;
      } else if (selectedOpt.id === correctOpt?.id) {
        qStatus = "CORRECT";
        isCorrect = true;
        awardedMarks = marksAwarded;
        negativeMarksApplied = 0;
        sectionCorrect++;
      } else {
        qStatus = "INCORRECT";
        isCorrect = false;
        awardedMarks = -negMarks;
        negativeMarksApplied = negMarks;
        sectionIncorrect++;
      }

      sectionTotalMarks += awardedMarks;

      const optionsSnapshot: EvaluatedOptionSnapshot[] = q.options.map((o) => ({
        id: o.id,
        optionLabel: o.optionLabel,
        optionText: o.optionText,
        isCorrect: Boolean(o.isCorrect),
        order: o.order,
      }));

      evaluatedQuestions.push({
        id: `res-q-${attemptId}-${q.id}`,
        questionId: q.id,
        questionVersionId: null,
        questionNumber: q.questionNumber || questionCounter,
        sectionId: section.id,
        sectionTitle: section.title,
        questionText: q.questionText,
        passageText: q.passage ? q.passage.passageText : null,
        questionType: q.questionType,
        selectedOptionId: selectedOpt?.id || null,
        selectedOptionIds: selectedOpt?.id ? [selectedOpt.id] : [],
        selectedOptionLabel: selectedOpt?.optionLabel || null,
        correctOptionId: correctOpt?.id || null,
        correctOptionLabel: correctOpt?.optionLabel || null,
        options: optionsSnapshot,
        status: qStatus,
        isCorrect,
        markedForReview: studentAns?.markedForReview || false,
        awardedMarks,
        maximumMarks: marksAwarded,
        negativeMarksApplied,
        explanation: q.explanation || null,
      });

      questionCounter++;
    }

    const sectionAttempted = sectionCorrect + sectionIncorrect;
    const sectionAccuracy =
      sectionAttempted > 0
        ? Math.round((sectionCorrect / sectionAttempted) * 10000) / 100
        : 0;

    // Standard CUET Section Max Marks:
    // If questionsToAttempt is defined (e.g. 40 out of 50), section max marks is questionsToAttempt * marks
    const defaultQuestionMarks = section.questions[0]?.marks ?? 5.0;
    const sectionMaxMarks =
      section.questionsToAttempt && section.questionsToAttempt > 0
        ? section.questionsToAttempt * defaultQuestionMarks
        : section.totalMarks || section.questions.length * defaultQuestionMarks;

    evaluatedSections.push({
      id: `res-sec-${attemptId}-${section.id}`,
      sectionId: section.id,
      sectionTitle: section.title,
      subjectId: section.subjectId,
      subjectName: section.subjectName,
      totalMarks: Math.round(sectionTotalMarks * 100) / 100,
      maximumMarks: Math.round(sectionMaxMarks * 100) / 100,
      correctCount: sectionCorrect,
      incorrectCount: sectionIncorrect,
      unansweredCount: sectionUnanswered,
      totalQuestions: section.questions.length,
      accuracy: sectionAccuracy,
    });

    overallTotalMarks += sectionTotalMarks;
    overallMaxMarks += sectionMaxMarks;
    overallCorrect += sectionCorrect;
    overallIncorrect += sectionIncorrect;
    overallUnanswered += sectionUnanswered;
  }

  const overallAttempted = overallCorrect + overallIncorrect;
  const overallAccuracy =
    overallAttempted > 0
      ? Math.round((overallCorrect / overallAttempted) * 10000) / 100
      : 0;

  const overallPercentage =
    overallMaxMarks > 0
      ? Math.round((overallTotalMarks / overallMaxMarks) * 10000) / 100
      : 0;

  const nowIso = new Date().toISOString();
  const evaluationVersion = isReEvaluation ? 2 : 1;
  const resultId = `res-${attemptId}`;

  const finalResultData: TestResultData = {
    id: resultId,
    attemptId: attemptData.id,
    studentId: attemptData.studentId,
    studentName: attemptData.studentName || "CUET Aspirant",
    studentEmail: attemptData.studentEmail,
    mockTestId: mockTest.id,
    testTitle: mockTest.title,
    testCode: mockTest.testCode,
    testCategory: mockTest.testType,
    examYear: mockTest.examYear,
    testVersionId: null,
    totalMarks: Math.round(overallTotalMarks * 100) / 100,
    maximumMarks: Math.round(overallMaxMarks * 100) / 100,
    percentage: overallPercentage,
    accuracy: overallAccuracy,
    correctCount: overallCorrect,
    incorrectCount: overallIncorrect,
    unansweredCount: overallUnanswered,
    totalQuestions: overallCorrect + overallIncorrect + overallUnanswered,
    timeTaken: attemptData.timeTaken,
    status: "EVALUATED" as EvaluationStatus,
    evaluatedAt: nowIso,
    evaluationVersion,
    failureReason: null,
    createdAt: nowIso,
    sections: evaluatedSections,
    questions: evaluatedQuestions,
  };

  // 6. Transactional Database Persistence
  try {
    await prisma.$transaction(async (tx) => {
      // If re-evaluating, remove previously persisted testResult
      if (isReEvaluation) {
        await tx.testResult.deleteMany({
          where: { attemptId: attemptData!.id },
        });
      }

      await tx.testResult.create({
        data: {
          id: resultId,
          attemptId: attemptData!.id,
          studentId: attemptData!.studentId,
          mockTestId: mockTest.id,
          totalMarks: finalResultData.totalMarks,
          maximumMarks: finalResultData.maximumMarks,
          percentage: finalResultData.percentage,
          accuracy: finalResultData.accuracy,
          correctCount: finalResultData.correctCount,
          incorrectCount: finalResultData.incorrectCount,
          unansweredCount: finalResultData.unansweredCount,
          totalQuestions: finalResultData.totalQuestions,
          timeTaken: finalResultData.timeTaken,
          status: "EVALUATED",
          evaluatedAt: new Date(nowIso),
          evaluationVersion,
          sections: {
            create: evaluatedSections.map((sec) => ({
              id: sec.id,
              sectionId: sec.sectionId,
              sectionTitle: sec.sectionTitle,
              subjectId: sec.subjectId,
              subjectName: sec.subjectName,
              totalMarks: sec.totalMarks,
              maximumMarks: sec.maximumMarks,
              correctCount: sec.correctCount,
              incorrectCount: sec.incorrectCount,
              unansweredCount: sec.unansweredCount,
              totalQuestions: sec.totalQuestions,
              accuracy: sec.accuracy,
            })),
          },
          questions: {
            create: evaluatedQuestions.map((q) => ({
              id: q.id,
              questionId: q.questionId,
              questionNumber: q.questionNumber,
              sectionId: q.sectionId,
              sectionTitle: q.sectionTitle,
              questionText: q.questionText,
              passageText: q.passageText,
              questionType: q.questionType,
              selectedOptionId: q.selectedOptionId,
              selectedOptionIds: q.selectedOptionIds,
              selectedOptionLabel: q.selectedOptionLabel,
              correctOptionId: q.correctOptionId,
              correctOptionLabel: q.correctOptionLabel,
              optionsJson: JSON.stringify(q.options),
              status: q.status,
              isCorrect: q.isCorrect,
              markedForReview: q.markedForReview,
              awardedMarks: q.awardedMarks,
              maximumMarks: q.maximumMarks,
              negativeMarksApplied: q.negativeMarksApplied,
              explanation: q.explanation,
            })),
          },
        },
      });
    });
  } catch (error) {
    console.warn("Prisma error in evaluateAttempt transaction, using memory store:", error);
  }

  // Always save to resilient in-memory store as well
  resultMemoryStore.saveResult(finalResultData);

  return finalResultData;
}

/**
 * Retrieves a finalized test result by result ID.
 * Strict authorization enforced: student can only view their own result unless admin.
 */
export async function getResultById(
  resultId: string,
  requestingUserId: string,
  isAdmin: boolean = false
): Promise<TestResultData | null> {
  // 1. Try DB
  try {
    const dbRes = await prisma.testResult.findUnique({
      where: { id: resultId },
      include: {
        sections: true,
        questions: { orderBy: { questionNumber: "asc" } },
        mockTest: true,
        student: { select: { id: true, name: true, email: true } },
      },
    });

    if (dbRes) {
      if (!isAdmin && dbRes.studentId !== requestingUserId) {
        throw new Error("Access denied: You are not authorized to view this result.");
      }
      return mapDbResultToData(dbRes);
    }
  } catch (err: unknown) {
    const msg = (err as Error).message || "";
    if (msg.includes("Access denied")) throw err;
  }

  // 2. Try in-memory store
  const memRes = resultMemoryStore.getResultById(resultId);
  if (memRes) {
    if (!isAdmin && memRes.studentId !== requestingUserId) {
      throw new Error("Access denied: You are not authorized to view this result.");
    }
    return memRes;
  }

  return null;
}

/**
 * Retrieves a test result by attempt ID.
 */
export async function getResultByAttemptId(
  attemptId: string,
  requestingUserId: string,
  isAdmin: boolean = false
): Promise<TestResultData | null> {
  try {
    const dbRes = await prisma.testResult.findUnique({
      where: { attemptId },
      include: {
        sections: true,
        questions: { orderBy: { questionNumber: "asc" } },
        mockTest: true,
        student: { select: { id: true, name: true, email: true } },
      },
    });

    if (dbRes) {
      if (!isAdmin && dbRes.studentId !== requestingUserId) {
        throw new Error("Access denied: You are not authorized to view this result.");
      }
      return mapDbResultToData(dbRes);
    }
  } catch (err: unknown) {
    const msg = (err as Error).message || "";
    if (msg.includes("Access denied")) throw err;
  }

  const memRes = resultMemoryStore.getResultByAttemptId(attemptId);
  if (memRes) {
    if (!isAdmin && memRes.studentId !== requestingUserId) {
      throw new Error("Access denied: You are not authorized to view this result.");
    }
    return memRes;
  }

  return null;
}

/**
 * Retrieves a student's historical results with filtering, search, sorting and pagination.
 */
export async function getStudentResults(
  studentId: string,
  params: ResultFilterParams = { page: 1, limit: 10, sortBy: "date", sortOrder: "desc" }
) {
  try {
    const whereClause: Record<string, unknown> = { studentId };

    if (params.search) {
      whereClause.mockTest = {
        title: { contains: params.search, mode: "insensitive" },
      };
    }

    if (params.status) {
      whereClause.status = params.status;
    }

    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const [dbItems, total] = await Promise.all([
      prisma.testResult.findMany({
        where: whereClause,
        include: {
          sections: true,
          questions: { orderBy: { questionNumber: "asc" } },
          mockTest: true,
          student: { select: { id: true, name: true, email: true } },
        },
        orderBy: {
          createdAt: params.sortOrder === "asc" ? "asc" : "desc",
        },
        skip,
        take: limit,
      }),
      prisma.testResult.count({ where: whereClause }),
    ]);

    if (dbItems.length > 0 || total > 0) {
      return {
        results: dbItems.map((item) => mapDbResultToData(item)),
        total,
        page,
        totalPages: Math.ceil(total / limit) || 1,
      };
    }
  } catch (err) {
    console.warn("Prisma error in getStudentResults, falling back to memory store:", err);
  }

  return resultMemoryStore.getStudentResults(studentId, params);
}

/**
 * Retrieves all results for admin management with filters.
 */
export async function getAdminResults(
  params: ResultFilterParams = { page: 1, limit: 10, sortBy: "date", sortOrder: "desc" }
) {
  try {
    const whereClause: Record<string, unknown> = {};

    if (params.search) {
      whereClause.OR = [
        { mockTest: { title: { contains: params.search, mode: "insensitive" } } },
        { student: { name: { contains: params.search, mode: "insensitive" } } },
        { student: { email: { contains: params.search, mode: "insensitive" } } },
      ];
    }

    if (params.status) {
      whereClause.status = params.status;
    }

    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const [dbItems, total] = await Promise.all([
      prisma.testResult.findMany({
        where: whereClause,
        include: {
          sections: true,
          questions: { orderBy: { questionNumber: "asc" } },
          mockTest: true,
          student: { select: { id: true, name: true, email: true } },
        },
        orderBy: {
          createdAt: params.sortOrder === "asc" ? "asc" : "desc",
        },
        skip,
        take: limit,
      }),
      prisma.testResult.count({ where: whereClause }),
    ]);

    if (dbItems.length > 0 || total > 0) {
      return {
        results: dbItems.map((item) => mapDbResultToData(item)),
        total,
        page,
        totalPages: Math.ceil(total / limit) || 1,
      };
    }
  } catch (err) {
    console.warn("Prisma error in getAdminResults, falling back to memory store:", err);
  }

  return resultMemoryStore.getAllResults(params);
}

/**
 * Helper to map Prisma DB result records into typed TestResultData
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDbResultToData(db: any): TestResultData {
  return {
    id: db.id,
    attemptId: db.attemptId,
    studentId: db.studentId,
    studentName: db.student?.name || "CUET Aspirant",
    studentEmail: db.student?.email,
    mockTestId: db.mockTestId,
    testTitle: db.mockTest?.title || "CUET Mock Examination",
    testCode: db.mockTest?.testCode || "MOCK-TEST",
    testCategory: db.mockTest?.testType || "FULL_SYLLABUS",
    examYear: db.mockTest?.examYear || 2026,
    testVersionId: db.testVersionId,
    totalMarks: db.totalMarks,
    maximumMarks: db.maximumMarks,
    percentage: db.percentage,
    accuracy: db.accuracy,
    correctCount: db.correctCount,
    incorrectCount: db.incorrectCount,
    unansweredCount: db.unansweredCount,
    totalQuestions: db.totalQuestions,
    timeTaken: db.timeTaken,
    status: db.status as EvaluationStatus,
    evaluatedAt: db.evaluatedAt ? db.evaluatedAt.toISOString() : db.createdAt.toISOString(),
    evaluationVersion: db.evaluationVersion,
    failureReason: db.failureReason,
    createdAt: db.createdAt.toISOString(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sections: (db.sections || []).map((sec: any) => ({
      id: sec.id,
      sectionId: sec.sectionId,
      sectionTitle: sec.sectionTitle,
      subjectId: sec.subjectId,
      subjectName: sec.subjectName,
      totalMarks: sec.totalMarks,
      maximumMarks: sec.maximumMarks,
      correctCount: sec.correctCount,
      incorrectCount: sec.incorrectCount,
      unansweredCount: sec.unansweredCount,
      totalQuestions: sec.totalQuestions,
      accuracy: sec.accuracy,
    })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    questions: (db.questions || []).map((q: any) => {
      let parsedOptions: EvaluatedOptionSnapshot[] = [];
      try {
        parsedOptions = JSON.parse(q.optionsJson || "[]");
      } catch {
        parsedOptions = [];
      }
      return {
        id: q.id,
        questionId: q.questionId,
        questionVersionId: q.questionVersionId,
        questionNumber: q.questionNumber,
        sectionId: q.sectionId,
        sectionTitle: q.sectionTitle,
        questionText: q.questionText,
        passageText: q.passageText,
        questionType: q.questionType,
        selectedOptionId: q.selectedOptionId,
        selectedOptionIds: q.selectedOptionIds || [],
        selectedOptionLabel: q.selectedOptionLabel,
        correctOptionId: q.correctOptionId,
        correctOptionLabel: q.correctOptionLabel,
        options: parsedOptions,
        status: q.status,
        isCorrect: q.isCorrect,
        markedForReview: q.markedForReview,
        awardedMarks: q.awardedMarks,
        maximumMarks: q.maximumMarks,
        negativeMarksApplied: q.negativeMarksApplied,
        explanation: q.explanation,
      };
    }),
  };
}
