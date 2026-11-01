import prisma from "@/lib/prisma";
import { getMockTestById } from "./mock-test-service";
import {
  cbtMemoryStore,
  type StoredTestAttempt,
  type StoredAttemptAnswer,
} from "./cbt-sample-data";
import {
  type AttemptStatus,
  type AnswerStatus,
  type SaveAnswerInput,
} from "./validations/cbt";

export interface ExamQuestionOption {
  id: string;
  optionLabel: string;
  optionText: string;
  order: number;
}

export interface ExamQuestion {
  id: string;
  questionCode: string;
  questionNumber: number;
  questionType: string;
  questionText: string;
  marks: number;
  negativeMarks: number;
  passage?: {
    title: string;
    passageText: string;
  } | null;
  options: ExamQuestionOption[];
}

export interface ExamSection {
  id: string;
  title: string;
  subjectName: string;
  subjectCode: string;
  sectionType: string;
  order: number;
  totalQuestions: number;
  questionsToAttempt: number;
  totalMarks: number;
  questions: ExamQuestion[];
}

export interface ExamPayload {
  attempt: {
    id: string;
    mockTestId: string;
    status: AttemptStatus;
    startedAt: string;
    expiresAt: string;
    totalDuration: number;
    testTitle: string;
    testCode: string;
    isOfficialPattern: boolean;
  };
  sections: ExamSection[];
  answers: Record<
    string,
    {
      id: string;
      selectedOptionId: string | null;
      selectedOptionIds: string[];
      answerPayload?: string | null;
      answerStatus: AnswerStatus;
      markedForReview: boolean;
      version: number;
      updatedAt: string;
    }
  >;
}

export interface SubmissionSummary {
  attemptId: string;
  mockTestId: string;
  testTitle: string;
  testCode: string;
  status: AttemptStatus;
  startedAt: string;
  submittedAt: string | null;
  timeTaken: number | null; // seconds
  totalQuestions: number;
  answeredCount: number;
  unansweredCount: number;
  markedForReviewCount: number;
}

/**
 * Starts a new test attempt or resumes an existing in-progress attempt.
 */
export async function startOrResumeAttempt(
  studentId: string,
  mockTestId: string
): Promise<{ attemptId: string; isResumed: boolean }> {
  // 1. Fetch mock test (from DB or sample dataset)
  const mockTest = await getMockTestById(mockTestId, false);
  if (!mockTest) {
    throw new Error("Mock test not found.");
  }
  if (mockTest.status !== "PUBLISHED") {
    throw new Error("Cannot start test: This mock examination is not currently published.");
  }

  // 2. Try DB first
  try {
    const activeAttempt = await prisma.testAttempt.findFirst({
      where: {
        studentId,
        mockTestId: mockTest.id,
        status: "IN_PROGRESS",
      },
      orderBy: { createdAt: "desc" },
    });

    if (activeAttempt) {
      const now = new Date();
      // If active attempt is already expired, auto-submit it and allow fresh attempt
      if (now.getTime() >= activeAttempt.expiresAt.getTime()) {
        await submitAttempt(activeAttempt.id, studentId, true);
      } else {
        // Resuming active attempt
        return { attemptId: activeAttempt.id, isResumed: true };
      }
    }

    // Determine attempt number
    const previousAttemptsCount = await prisma.testAttempt.count({
      where: { studentId, mockTestId: mockTest.id },
    });

    const now = new Date();
    const durationMs = mockTest.totalDuration * 60 * 1000;
    const expiresAt = new Date(now.getTime() + durationMs);

    // Flatten all questions across all sections
    const allQuestions: Array<{ questionId: string }> = [];
    mockTest.sections.forEach((sec) => {
      sec.questions.forEach((q) => {
        allQuestions.push({ questionId: q.id });
      });
    });

    // Create attempt and initialize answers in transaction
    const newAttempt = await prisma.$transaction(async (tx) => {
      const attempt = await tx.testAttempt.create({
        data: {
          studentId,
          mockTestId: mockTest.id,
          status: "IN_PROGRESS",
          startedAt: now,
          expiresAt,
          totalQuestions: allQuestions.length,
          attemptNumber: previousAttemptsCount + 1,
        },
      });

      // Initialize answer records for all questions
      for (const q of allQuestions) {
        await tx.attemptAnswer.create({
          data: {
            attemptId: attempt.id,
            questionId: q.questionId,
            answerStatus: "NOT_VISITED",
            markedForReview: false,
            version: 1,
          },
        });
      }

      // Record started event
      await tx.attemptEvent.create({
        data: {
          attemptId: attempt.id,
          eventType: "ATTEMPT_STARTED",
          payload: JSON.stringify({ startedAt: now.toISOString(), expiresAt: expiresAt.toISOString() }),
        },
      });

      // Increment attempt counter on mock test
      await tx.mockTest.update({
        where: { id: mockTest.id },
        data: { attemptsCount: { increment: 1 } },
      });

      return attempt;
    });

    return { attemptId: newAttempt.id, isResumed: false };
  } catch (error) {
    console.warn("Prisma error in startOrResumeAttempt, falling back to in-memory store:", error);
  }

  // 3. Resilient fallback using CBT in-memory store
  const existingMemory = cbtMemoryStore.findActiveAttempt(studentId, mockTest.id);
  if (existingMemory) {
    const now = new Date();
    if (now.getTime() >= new Date(existingMemory.expiresAt).getTime()) {
      await submitAttempt(existingMemory.id, studentId, true);
    } else {
      return { attemptId: existingMemory.id, isResumed: true };
    }
  }

  const now = new Date();
  const durationMs = mockTest.totalDuration * 60 * 1000;
  const expiresAt = new Date(now.getTime() + durationMs);
  const attemptId = `att-${studentId.substring(0, 8)}-${Date.now()}`;
  const previousCount = cbtMemoryStore.countStudentAttempts(studentId, mockTest.id);

  const newStoredAttempt: StoredTestAttempt = {
    id: attemptId,
    studentId,
    mockTestId: mockTest.id,
    status: "IN_PROGRESS",
    startedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    submittedAt: null,
    timeTaken: null,
    totalQuestions: mockTest.totalQuestions,
    attemptNumber: previousCount + 1,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    answers: new Map(),
  };

  mockTest.sections.forEach((sec) => {
    sec.questions.forEach((q) => {
      newStoredAttempt.answers.set(q.id, {
        id: `ans-${attemptId}-${q.id}`,
        attemptId,
        questionId: q.id,
        selectedOptionId: null,
        selectedOptionIds: [],
        answerPayload: null,
        answerStatus: "NOT_VISITED",
        markedForReview: false,
        answeredAt: null,
        version: 1,
        updatedAt: now.toISOString(),
      });
    });
  });

  cbtMemoryStore.saveAttempt(newStoredAttempt);
  cbtMemoryStore.recordEvent({
    id: `evt-${Date.now()}`,
    attemptId,
    eventType: "ATTEMPT_STARTED",
    payload: JSON.stringify({ startedAt: now.toISOString(), expiresAt: expiresAt.toISOString() }),
    createdAt: now.toISOString(),
  });

  return { attemptId, isResumed: false };
}

/**
 * Loads the active examination payload.
 * STRICT SECURITY: Questions never contain isCorrect or explanation.
 */
export async function getAttemptForExam(
  attemptId: string,
  studentId: string
): Promise<ExamPayload> {
  // 1. Try DB first
  try {
    const attempt = await prisma.testAttempt.findUnique({
      where: { id: attemptId },
      include: {
        mockTest: {
          include: {
            sections: {
              include: {
                subject: true,
                questions: {
                  include: {
                    question: {
                      include: {
                        options: true,
                        passage: true,
                      },
                    },
                  },
                  orderBy: { order: "asc" },
                },
              },
              orderBy: { order: "asc" },
            },
          },
        },
        answers: true,
      },
    });

    if (attempt) {
      // Authorization Check
      if (attempt.studentId !== studentId) {
        throw new Error("Access denied: You are not authorized to view this test attempt.");
      }

      const now = new Date();
      // Server-authoritative expiration check
      if (attempt.status === "IN_PROGRESS" && now.getTime() >= attempt.expiresAt.getTime()) {
        await submitAttempt(attempt.id, studentId, true);
        attempt.status = "AUTO_SUBMITTED";
      }

      // Build answers record map
      const answersMap: ExamPayload["answers"] = {};
      attempt.answers.forEach((ans) => {
        answersMap[ans.questionId] = {
          id: ans.id,
          selectedOptionId: ans.selectedOptionId,
          selectedOptionIds: ans.selectedOptionIds,
          answerPayload: ans.answerPayload,
          answerStatus: ans.answerStatus as AnswerStatus,
          markedForReview: ans.markedForReview,
          version: ans.version,
          updatedAt: ans.updatedAt.toISOString(),
        };
      });

      // Build sanitized sections and questions
      const sanitizedSections: ExamSection[] = attempt.mockTest.sections.map((sec) => ({
        id: sec.id,
        title: sec.title,
        subjectName: sec.subject.name,
        subjectCode: sec.subject.code,
        sectionType: sec.sectionType,
        order: sec.order,
        totalQuestions: sec.totalQuestions,
        questionsToAttempt: sec.questionsToAttempt,
        totalMarks: sec.totalMarks,
        questions: sec.questions.map((mq) => {
          const q = mq.question;
          return {
            id: q.id,
            questionCode: q.questionCode,
            questionNumber: mq.questionNumber,
            questionType: q.questionType,
            questionText: q.questionText,
            marks: mq.marks,
            negativeMarks: mq.negativeMarks,
            passage: q.passage ? { title: q.passage.title, passageText: q.passage.passageText } : null,
            // SECURITY: Sanitize options so isCorrect is completely absent
            options: q.options
              .map((opt) => ({
                id: opt.id,
                optionLabel: opt.optionLabel,
                optionText: opt.optionText,
                order: opt.order,
              }))
              .sort((a, b) => a.order - b.order),
          };
        }),
      }));

      return {
        attempt: {
          id: attempt.id,
          mockTestId: attempt.mockTestId,
          status: attempt.status as AttemptStatus,
          startedAt: attempt.startedAt.toISOString(),
          expiresAt: attempt.expiresAt.toISOString(),
          totalDuration: attempt.mockTest.totalDuration,
          testTitle: attempt.mockTest.title,
          testCode: attempt.mockTest.testCode,
          isOfficialPattern: attempt.mockTest.isOfficialPattern,
        },
        sections: sanitizedSections,
        answers: answersMap,
      };
    }
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message?.includes("Access denied")) {
      throw error;
    }
    console.warn("Prisma error in getAttemptForExam, falling back to in-memory store:", error);
  }

  // 2. Fallback to in-memory store
  const stored = cbtMemoryStore.getAttempt(attemptId);
  if (!stored) {
    throw new Error("Test attempt not found.");
  }
  if (stored.studentId !== studentId) {
    throw new Error("Access denied: You are not authorized to view this test attempt.");
  }

  const now = new Date();
  if (stored.status === "IN_PROGRESS" && now.getTime() >= new Date(stored.expiresAt).getTime()) {
    stored.status = "AUTO_SUBMITTED";
    stored.submittedAt = now.toISOString();
    stored.timeTaken = Math.floor((now.getTime() - new Date(stored.startedAt).getTime()) / 1000);
    cbtMemoryStore.saveAttempt(stored);
  }

  const mockTest = (await getMockTestById(stored.mockTestId, true))!;

  const answersMap: ExamPayload["answers"] = {};
  for (const [qId, ans] of stored.answers.entries()) {
    answersMap[qId] = {
      id: ans.id,
      selectedOptionId: ans.selectedOptionId,
      selectedOptionIds: ans.selectedOptionIds,
      answerPayload: ans.answerPayload,
      answerStatus: ans.answerStatus,
      markedForReview: ans.markedForReview,
      version: ans.version,
      updatedAt: ans.updatedAt,
    };
  }

  return {
    attempt: {
      id: stored.id,
      mockTestId: stored.mockTestId,
      status: stored.status,
      startedAt: stored.startedAt,
      expiresAt: stored.expiresAt,
      totalDuration: mockTest.totalDuration,
      testTitle: mockTest.title,
      testCode: mockTest.testCode,
      isOfficialPattern: mockTest.isOfficialPattern,
    },
    sections: mockTest.sections.map((sec) => ({
      id: sec.id,
      title: sec.title,
      subjectName: sec.subjectName,
      subjectCode: sec.subjectCode,
      sectionType: sec.sectionType,
      order: sec.order,
      totalQuestions: sec.totalQuestions,
      questionsToAttempt: sec.questionsToAttempt,
      totalMarks: sec.totalMarks,
      questions: sec.questions.map((q) => ({
        id: q.id,
        questionCode: q.questionCode,
        questionNumber: q.questionNumber,
        questionType: q.questionType,
        questionText: q.questionText,
        marks: q.marks,
        negativeMarks: q.negativeMarks,
        passage: q.passage,
        options: q.options.map((opt) => ({
          id: opt.id,
          optionLabel: opt.optionLabel,
          optionText: opt.optionText,
          order: opt.order,
        })),
      })),
    })),
    answers: answersMap,
  };
}

/**
 * Saves a student's answer with server-authoritative timer validation and version checking.
 */
export async function saveAttemptAnswer(
  studentId: string,
  input: SaveAnswerInput
): Promise<{ success: boolean; version: number; answerStatus: AnswerStatus; updatedAt: string }> {
  const {
    attemptId,
    questionId,
    selectedOptionId,
    selectedOptionIds,
    answerPayload,
    markedForReview,
    answerStatus,
    clientVersion,
  } = input;

  const incomingVersion = clientVersion ?? 1;
  const isReview = Boolean(markedForReview);

  // 1. Try DB first
  try {
    const attempt = await prisma.testAttempt.findUnique({
      where: { id: attemptId },
      include: {
        mockTest: {
          include: {
            sections: {
              include: { questions: true },
            },
          },
        },
      },
    });

    if (!attempt) {
      throw new Error("Attempt not found.");
    }
    if (attempt.studentId !== studentId) {
      throw new Error("Access denied: You cannot alter another student's test answers.");
    }
    if (attempt.status !== "IN_PROGRESS") {
      throw new Error(`Cannot save answer: This attempt is already ${attempt.status}.`);
    }

    // Server-authoritative timer check (with 5-second network latency grace)
    const now = new Date();
    if (now.getTime() > attempt.expiresAt.getTime() + 5000) {
      await submitAttempt(attemptId, studentId, true);
      throw new Error("Examination time has expired. The test has been automatically submitted.");
    }

    // Verify question belongs to the attempt
    const allValidQuestionIds = new Set(
      attempt.mockTest.sections.flatMap((s) => s.questions.map((q) => q.questionId))
    );
    if (!allValidQuestionIds.has(questionId)) {
      throw new Error("Invalid question: Question does not belong to this mock test.");
    }

    // Fetch existing answer to check version
    const existing = await prisma.attemptAnswer.findUnique({
      where: {
        attemptId_questionId: {
          attemptId,
          questionId,
        },
      },
    });

    // Stale write check
    if (existing && existing.version > incomingVersion) {
      return {
        success: true,
        version: existing.version,
        answerStatus: existing.answerStatus as AnswerStatus,
        updatedAt: existing.updatedAt.toISOString(),
      };
    }

    const nextVersion = (existing?.version || 0) + 1;

    const updated = await prisma.$transaction(async (tx) => {
      const record = await tx.attemptAnswer.upsert({
        where: {
          attemptId_questionId: {
            attemptId,
            questionId,
          },
        },
        create: {
          attemptId,
          questionId,
          selectedOptionId: selectedOptionId || null,
          selectedOptionIds: selectedOptionIds || [],
          answerPayload: answerPayload || null,
          answerStatus,
          markedForReview: isReview,
          answeredAt: selectedOptionId ? now : null,
          version: nextVersion,
        },
        update: {
          selectedOptionId: selectedOptionId || null,
          selectedOptionIds: selectedOptionIds || [],
          answerPayload: answerPayload || null,
          answerStatus,
          markedForReview: isReview,
          answeredAt: selectedOptionId ? now : null,
          version: nextVersion,
        },
      });

      await tx.attemptEvent.create({
        data: {
          attemptId,
          eventType: selectedOptionId ? "ANSWER_SAVED" : markedForReview ? "MARKED_FOR_REVIEW" : "ANSWER_CLEARED",
          payload: JSON.stringify({ questionId, selectedOptionId, answerStatus, version: nextVersion }),
        },
      });

      return record;
    });

    return {
      success: true,
      version: updated.version,
      answerStatus: updated.answerStatus as AnswerStatus,
      updatedAt: updated.updatedAt.toISOString(),
    };
  } catch (error: unknown) {
    const err = error as Error;
    if (
      err.message?.includes("Access denied") ||
      err.message?.includes("already") ||
      err.message?.includes("expired") ||
      err.message?.includes("Invalid question")
    ) {
      throw error;
    }
    console.warn("Prisma error in saveAttemptAnswer, falling back to in-memory store:", error);
  }

  // 2. Fallback to in-memory store
  const stored = cbtMemoryStore.getAttempt(attemptId);
  if (!stored) {
    throw new Error("Attempt not found.");
  }
  if (stored.studentId !== studentId) {
    throw new Error("Access denied: You cannot alter another student's test answers.");
  }
  if (stored.status !== "IN_PROGRESS") {
    throw new Error(`Cannot save answer: This attempt is already ${stored.status}.`);
  }

  const now = new Date();
  if (now.getTime() > new Date(stored.expiresAt).getTime() + 5000) {
    await submitAttempt(attemptId, studentId, true);
    throw new Error("Examination time has expired. The test has been automatically submitted.");
  }

  const existingAns = stored.answers.get(questionId);
  if (existingAns && existingAns.version > incomingVersion) {
    return {
      success: true,
      version: existingAns.version,
      answerStatus: existingAns.answerStatus,
      updatedAt: existingAns.updatedAt,
    };
  }

  const nextVersion = (existingAns?.version || 0) + 1;
  const nowIso = now.toISOString();

  const newAns: StoredAttemptAnswer = {
    id: existingAns?.id || `ans-${attemptId}-${questionId}`,
    attemptId,
    questionId,
    selectedOptionId: selectedOptionId || null,
    selectedOptionIds: selectedOptionIds || [],
    answerPayload: answerPayload || null,
    answerStatus,
    markedForReview: isReview,
    answeredAt: selectedOptionId ? nowIso : null,
    version: nextVersion,
    updatedAt: nowIso,
  };

  stored.answers.set(questionId, newAns);
  stored.updatedAt = nowIso;
  cbtMemoryStore.saveAttempt(stored);

  cbtMemoryStore.recordEvent({
    id: `evt-${Date.now()}`,
    attemptId,
    eventType: selectedOptionId ? "ANSWER_SAVED" : "ANSWER_CLEARED",
    payload: JSON.stringify({ questionId, selectedOptionId, answerStatus, version: nextVersion }),
    createdAt: nowIso,
  });

  return {
    success: true,
    version: nextVersion,
    answerStatus,
    updatedAt: nowIso,
  };
}

/**
 * Submits an attempt manually or automatically upon timer expiration.
 * Idempotent operation: multiple calls will not corrupt data.
 */
export async function submitAttempt(
  attemptId: string,
  studentId: string,
  isAutoTimeout = false
): Promise<{ success: boolean; status: AttemptStatus; submittedAt: string; timeTaken: number }> {
  const terminalStatus: AttemptStatus = isAutoTimeout ? "AUTO_SUBMITTED" : "SUBMITTED";

  // 1. Try DB first
  try {
    const attempt = await prisma.testAttempt.findUnique({
      where: { id: attemptId },
    });

    if (!attempt) {
      throw new Error("Attempt not found.");
    }
    if (attempt.studentId !== studentId) {
      throw new Error("Access denied: You cannot submit another student's test.");
    }

    // Idempotent: already submitted
    if (attempt.status === "SUBMITTED" || attempt.status === "AUTO_SUBMITTED") {
      return {
        success: true,
        status: attempt.status as AttemptStatus,
        submittedAt: attempt.submittedAt?.toISOString() || new Date().toISOString(),
        timeTaken: attempt.timeTaken || 0,
      };
    }

    const now = new Date();
    const timeTaken = Math.max(0, Math.floor((now.getTime() - attempt.startedAt.getTime()) / 1000));

    await prisma.$transaction(async (tx) => {
      await tx.testAttempt.update({
        where: { id: attemptId },
        data: {
          status: terminalStatus,
          submittedAt: now,
          timeTaken,
        },
      });

      await tx.attemptEvent.create({
        data: {
          attemptId,
          eventType: terminalStatus,
          payload: JSON.stringify({
            submittedAt: now.toISOString(),
            timeTaken,
            isAutoTimeout,
          }),
        },
      });
    });

    return {
      success: true,
      status: terminalStatus,
      submittedAt: now.toISOString(),
      timeTaken,
    };
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message?.includes("Access denied")) {
      throw error;
    }
    console.warn("Prisma error in submitAttempt, falling back to in-memory store:", error);
  }

  // 2. Fallback to in-memory store
  const stored = cbtMemoryStore.getAttempt(attemptId);
  if (!stored) {
    throw new Error("Attempt not found.");
  }
  if (stored.studentId !== studentId) {
    throw new Error("Access denied: You cannot submit another student's test.");
  }

  if (stored.status === "SUBMITTED" || stored.status === "AUTO_SUBMITTED") {
    return {
      success: true,
      status: stored.status,
      submittedAt: stored.submittedAt || new Date().toISOString(),
      timeTaken: stored.timeTaken || 0,
    };
  }

  const now = new Date();
  const timeTaken = Math.max(
    0,
    Math.floor((now.getTime() - new Date(stored.startedAt).getTime()) / 1000)
  );

  stored.status = terminalStatus;
  stored.submittedAt = now.toISOString();
  stored.timeTaken = timeTaken;
  stored.updatedAt = now.toISOString();
  cbtMemoryStore.saveAttempt(stored);

  cbtMemoryStore.recordEvent({
    id: `evt-${Date.now()}`,
    attemptId,
    eventType: terminalStatus,
    payload: JSON.stringify({
      submittedAt: now.toISOString(),
      timeTaken,
      isAutoTimeout,
    }),
    createdAt: now.toISOString(),
  });

  return {
    success: true,
    status: terminalStatus,
    submittedAt: now.toISOString(),
    timeTaken,
  };
}

/**
 * Retrieves the post-submission confirmation summary.
 * STRICT SECURITY: Never leaks results, correct answers, or evaluations in Phase 9.
 */
export async function getAttemptSubmissionSummary(
  attemptId: string,
  studentId: string
): Promise<SubmissionSummary> {
  // 1. Try DB first
  try {
    const attempt = await prisma.testAttempt.findUnique({
      where: { id: attemptId },
      include: {
        mockTest: true,
        answers: true,
      },
    });

    if (attempt) {
      if (attempt.studentId !== studentId) {
        throw new Error("Access denied.");
      }

      let answeredCount = 0;
      let markedForReviewCount = 0;

      attempt.answers.forEach((ans) => {
        if (ans.selectedOptionId || ans.answerStatus === "ANSWERED" || ans.answerStatus === "ANSWERED_AND_MARKED_FOR_REVIEW") {
          answeredCount++;
        }
        if (ans.markedForReview || ans.answerStatus === "MARKED_FOR_REVIEW" || ans.answerStatus === "ANSWERED_AND_MARKED_FOR_REVIEW") {
          markedForReviewCount++;
        }
      });

      return {
        attemptId: attempt.id,
        mockTestId: attempt.mockTestId,
        testTitle: attempt.mockTest.title,
        testCode: attempt.mockTest.testCode,
        status: attempt.status as AttemptStatus,
        startedAt: attempt.startedAt.toISOString(),
        submittedAt: attempt.submittedAt?.toISOString() || null,
        timeTaken: attempt.timeTaken,
        totalQuestions: attempt.totalQuestions,
        answeredCount,
        unansweredCount: Math.max(0, attempt.totalQuestions - answeredCount),
        markedForReviewCount,
      };
    }
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message?.includes("Access denied")) throw error;
    console.warn("Prisma error in getAttemptSubmissionSummary, falling back to in-memory store:", error);
  }

  // 2. Fallback to in-memory store
  const stored = cbtMemoryStore.getAttempt(attemptId);
  if (!stored) {
    throw new Error("Attempt not found.");
  }
  if (stored.studentId !== studentId) {
    throw new Error("Access denied.");
  }

  const mockTest = (await getMockTestById(stored.mockTestId, false))!;

  let answeredCount = 0;
  let markedForReviewCount = 0;

  for (const ans of stored.answers.values()) {
    if (ans.selectedOptionId || ans.answerStatus === "ANSWERED" || ans.answerStatus === "ANSWERED_AND_MARKED_FOR_REVIEW") {
      answeredCount++;
    }
    if (ans.markedForReview || ans.answerStatus === "MARKED_FOR_REVIEW" || ans.answerStatus === "ANSWERED_AND_MARKED_FOR_REVIEW") {
      markedForReviewCount++;
    }
  }

  return {
    attemptId: stored.id,
    mockTestId: stored.mockTestId,
    testTitle: mockTest.title,
    testCode: mockTest.testCode,
    status: stored.status,
    startedAt: stored.startedAt,
    submittedAt: stored.submittedAt,
    timeTaken: stored.timeTaken,
    totalQuestions: stored.totalQuestions,
    answeredCount,
    unansweredCount: Math.max(0, stored.totalQuestions - answeredCount),
    markedForReviewCount,
  };
}
