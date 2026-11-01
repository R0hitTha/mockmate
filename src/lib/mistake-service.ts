import { prisma } from "@/lib/prisma";
import { resultMemoryStore } from "@/lib/evaluation-sample-data";
import { cbtMemoryStore } from "@/lib/cbt-sample-data";
import { SAMPLE_QUESTIONS } from "@/lib/question-sample-data";
import {
  MistakeFilterSchema,
  type MistakeItem,
  type MistakeFilterInput,
  type MistakeOverviewMetrics,
  type MistakeCategoryStat,
  type TopicRevisitItem,
  type MistakeTrendPoint,
  type RevisionRecommendation,
  type StudentMistakesPayload,
  type UpdateMistakeStatusInput,
  type MistakeReviewStatus,
  type MistakeErrorReason,
  type MistakeCategory,
  type MistakeOptionSnapshot,
} from "@/lib/validations/mistakes";

// -----------------------------------------------------------------------------
// Resilient In-Memory Fallback Store for Mistake Reviews and Bookmarks
// -----------------------------------------------------------------------------

export interface StoredMistakeReview {
  id: string;
  studentId: string;
  attemptId: string;
  questionId: string;
  resultQuestionId: string | null;
  status: MistakeReviewStatus;
  errorReason: MistakeErrorReason | null;
  notes: string | null;
  reviewedAt: string | null;
  masteredAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StoredQuestionBookmark {
  id: string;
  studentId: string;
  questionId: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

class MistakeMemoryStore {
  private reviews = new Map<string, StoredMistakeReview>();
  private bookmarks = new Map<string, StoredQuestionBookmark>();

  private getReviewKey(studentId: string, attemptId: string, questionId: string) {
    return `${studentId}::${attemptId}::${questionId}`;
  }

  private getBookmarkKey(studentId: string, questionId: string) {
    return `${studentId}::${questionId}`;
  }

  saveReview(review: StoredMistakeReview) {
    const key = this.getReviewKey(review.studentId, review.attemptId, review.questionId);
    this.reviews.set(key, review);
  }

  getReview(studentId: string, attemptId: string, questionId: string): StoredMistakeReview | null {
    const key = this.getReviewKey(studentId, attemptId, questionId);
    return this.reviews.get(key) || null;
  }

  listStudentReviews(studentId: string): StoredMistakeReview[] {
    return Array.from(this.reviews.values()).filter((r) => r.studentId === studentId);
  }

  saveBookmark(bookmark: StoredQuestionBookmark) {
    const key = this.getBookmarkKey(bookmark.studentId, bookmark.questionId);
    this.bookmarks.set(key, bookmark);
  }

  removeBookmark(studentId: string, questionId: string): boolean {
    const key = this.getBookmarkKey(studentId, questionId);
    return this.bookmarks.delete(key);
  }

  getBookmark(studentId: string, questionId: string): StoredQuestionBookmark | null {
    const key = this.getBookmarkKey(studentId, questionId);
    return this.bookmarks.get(key) || null;
  }

  listStudentBookmarks(studentId: string): StoredQuestionBookmark[] {
    return Array.from(this.bookmarks.values()).filter((b) => b.studentId === studentId);
  }

  clear() {
    this.reviews.clear();
    this.bookmarks.clear();
  }
}

export const mistakeMemoryStore = new MistakeMemoryStore();

// -----------------------------------------------------------------------------
// Helper: Build Question & Topic Metadata Index
// -----------------------------------------------------------------------------

function getQuestionMetadataMap() {
  const map = new Map<
    string,
    {
      subjectName: string;
      subjectCode: string;
      unitNumber?: number;
      topicTitle: string;
      questionCode: string;
    }
  >();

  SAMPLE_QUESTIONS.forEach((q) => {
    const subjectName = q.subjectSlug.toUpperCase();
    const subjectCode = q.subjectSlug === "physics" ? "314" : q.subjectSlug === "mathematics" ? "319" : "501";
    let topicTitle = "General Core Concepts";
    if (q.tags && q.tags[1]) {
      topicTitle = q.tags[1];
    } else if (q.tags && q.tags[0]) {
      topicTitle = q.tags[0];
    }

    const val = {
      subjectName,
      subjectCode,
      unitNumber: q.unitNumber,
      topicTitle,
      questionCode: q.questionCode,
    };

    map.set(q.questionCode, val);
    map.set(`mock-q-${q.questionCode}`, val);
  });

  return map;
}

// -----------------------------------------------------------------------------
// Core Extraction: Extract Raw Mistake Items from Evaluated Results
// -----------------------------------------------------------------------------

interface RawAttemptMistakeData {
  attemptId: string;
  testId: string;
  testTitle: string;
  testCode: string;
  attemptDate: string;
  attemptTimeTakenSeconds: number | null;
  isAutoSubmitted: boolean;
  questionId: string;
  questionNumber: number;
  sectionTitle: string;
  subjectName: string;
  questionText: string;
  passageText: string | null;
  questionType: string;
  options: MistakeOptionSnapshot[];
  selectedOptionId: string | null;
  selectedOptionLabel: string | null;
  correctOptionId: string | null;
  correctOptionLabel: string | null;
  explanation: string | null;
  resultStatus: "INCORRECT" | "UNANSWERED";
  awardedMarks: number;
  negativeMarksApplied: number;
}

async function fetchStudentEvaluatedMistakes(studentId: string): Promise<RawAttemptMistakeData[]> {
  const rawList: RawAttemptMistakeData[] = [];

  // 1. Try DB query
  try {
    const dbResults = await prisma.testResult.findMany({
      where: {
        studentId,
        status: "EVALUATED",
      },
      include: {
        attempt: true,
        mockTest: true,
        questions: {
          where: {
            status: { in: ["INCORRECT", "UNANSWERED"] },
          },
          orderBy: { questionNumber: "asc" },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    if (dbResults && dbResults.length > 0) {
      dbResults.forEach((res) => {
        const isAuto = res.attempt?.status === "AUTO_SUBMITTED";
        res.questions.forEach((q) => {
          let parsedOptions: MistakeOptionSnapshot[] = [];
          try {
            parsedOptions = JSON.parse(q.optionsJson || "[]");
          } catch {
            parsedOptions = [];
          }

          rawList.push({
            attemptId: res.attemptId,
            testId: res.mockTestId,
            testTitle: res.mockTest?.title || "CUET Mock Examination",
            testCode: res.mockTest?.testCode || "MT-CUET",
            attemptDate: res.createdAt.toISOString(),
            attemptTimeTakenSeconds: res.timeTaken,
            isAutoSubmitted: isAuto,
            questionId: q.questionId,
            questionNumber: q.questionNumber,
            sectionTitle: q.sectionTitle,
            subjectName: q.sectionTitle.includes(":") ? q.sectionTitle.split(":")[0].trim() : "Core Subject",
            questionText: q.questionText,
            passageText: q.passageText,
            questionType: q.questionType,
            options: parsedOptions,
            selectedOptionId: q.selectedOptionId,
            selectedOptionLabel: q.selectedOptionLabel,
            correctOptionId: q.correctOptionId,
            correctOptionLabel: q.correctOptionLabel,
            explanation: q.explanation,
            resultStatus: q.status as "INCORRECT" | "UNANSWERED",
            awardedMarks: q.awardedMarks,
            negativeMarksApplied: q.negativeMarksApplied,
          });
        });
      });
      return rawList;
    }
  } catch (err) {
    // Database query failed, fall back to memory store
    console.warn("Prisma error in fetchStudentEvaluatedMistakes, falling back to memory store:", err);
  }

  // 2. Memory Store Fallback
  const memResults = resultMemoryStore.getStudentResults(studentId);
  memResults.results.forEach((res) => {
    const memAttempt = cbtMemoryStore.getAttempt(res.attemptId);
    const isAuto = memAttempt?.status === "AUTO_SUBMITTED";

    res.questions.forEach((q) => {
      if (q.status === "INCORRECT" || q.status === "UNANSWERED") {
        rawList.push({
          attemptId: res.attemptId,
          testId: res.mockTestId,
          testTitle: res.testTitle,
          testCode: res.testCode,
          attemptDate: res.createdAt,
          attemptTimeTakenSeconds: res.timeTaken ?? null,
          isAutoSubmitted: isAuto,
          questionId: q.questionId,
          questionNumber: q.questionNumber,
          sectionTitle: q.sectionTitle,
          subjectName: q.sectionTitle.includes(":") ? q.sectionTitle.split(":")[0].trim() : "Core Subject",
          questionText: q.questionText,
          passageText: q.passageText ?? null,
          questionType: q.questionType,
          options: q.options || [],
          selectedOptionId: q.selectedOptionId ?? null,
          selectedOptionLabel: q.selectedOptionLabel ?? null,
          correctOptionId: q.correctOptionId ?? null,
          correctOptionLabel: q.correctOptionLabel ?? null,
          explanation: q.explanation ?? null,
          resultStatus: q.status as "INCORRECT" | "UNANSWERED",
          awardedMarks: q.awardedMarks,
          negativeMarksApplied: q.negativeMarksApplied,
        });
      }
    });
  });

  return rawList;
}

// -----------------------------------------------------------------------------
// Core Processor: Build Fully Classified Mistake Items for Student
// -----------------------------------------------------------------------------

async function getProcessedStudentMistakes(studentId: string) {
  const rawMistakes = await fetchStudentEvaluatedMistakes(studentId);
  const metadataMap = getQuestionMetadataMap();

  // Load reviews & bookmarks for this student
  const reviewsMap = new Map<string, StoredMistakeReview>();
  const bookmarksSet = new Set<string>();

  try {
    const dbReviews = await prisma.mistakeReview.findMany({
      where: { studentId },
    });
    dbReviews.forEach((r) => {
      reviewsMap.set(`${r.attemptId}::${r.questionId}`, {
        id: r.id,
        studentId: r.studentId,
        attemptId: r.attemptId,
        questionId: r.questionId,
        resultQuestionId: r.resultQuestionId,
        status: r.status as MistakeReviewStatus,
        errorReason: r.errorReason as MistakeErrorReason | null,
        notes: r.notes,
        reviewedAt: r.reviewedAt?.toISOString() || null,
        masteredAt: r.masteredAt?.toISOString() || null,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      });
    });

    const dbBookmarks = await prisma.questionBookmark.findMany({
      where: { studentId },
    });
    dbBookmarks.forEach((b) => bookmarksSet.add(b.questionId));
  } catch {
    // Fall back to memory store
    mistakeMemoryStore.listStudentReviews(studentId).forEach((r) => {
      reviewsMap.set(`${r.attemptId}::${r.questionId}`, r);
    });
    mistakeMemoryStore.listStudentBookmarks(studentId).forEach((b) => {
      bookmarksSet.add(b.questionId);
    });
  }

  // 1. Calculate global occurrences for repeated mistakes
  const questionMistakeCountMap = new Map<string, number>();
  const topicStatsMap = new Map<
    string,
    {
      subjectName: string;
      topicTitle: string;
      unitNumber?: number;
      attemptedCount: number;
      incorrectCount: number;
      unansweredCount: number;
    }
  >();

  // Fetch all evaluated questions of this student to calculate topic accuracy accurately
  const allStudentEvaluatedQuestions: Array<{
    questionId: string;
    sectionTitle: string;
    status: string;
  }> = [];

  try {
    const dbResults = await prisma.testResult.findMany({
      where: { studentId, status: "EVALUATED" },
      include: { questions: { select: { questionId: true, sectionTitle: true, status: true } } },
    });
    dbResults.forEach((res) => {
      res.questions.forEach((q) => {
        allStudentEvaluatedQuestions.push(q);
      });
    });
  } catch {
    const memResults = resultMemoryStore.getStudentResults(studentId);
    memResults.results.forEach((res) => {
      res.questions.forEach((q) => {
        allStudentEvaluatedQuestions.push({
          questionId: q.questionId,
          sectionTitle: q.sectionTitle,
          status: q.status,
        });
      });
    });
  }

  allStudentEvaluatedQuestions.forEach((q) => {
    let meta = metadataMap.get(q.questionId);
    if (!meta) {
      meta = {
        subjectName: q.sectionTitle.includes(":") ? q.sectionTitle.split(":")[0].trim() : "Core Subject",
        subjectCode: "CUET",
        topicTitle: q.sectionTitle.includes(":") ? q.sectionTitle.split(":")[1].trim() : q.sectionTitle,
        questionCode: q.questionId,
      };
    }

    const topicKey = `${meta.subjectName}::${meta.topicTitle}`;
    const existing = topicStatsMap.get(topicKey) || {
      subjectName: meta.subjectName,
      topicTitle: meta.topicTitle,
      unitNumber: meta.unitNumber,
      attemptedCount: 0,
      incorrectCount: 0,
      unansweredCount: 0,
    };

    if (q.status === "CORRECT") {
      existing.attemptedCount += 1;
    } else if (q.status === "INCORRECT") {
      existing.attemptedCount += 1;
      existing.incorrectCount += 1;
    } else if (q.status === "UNANSWERED") {
      existing.unansweredCount += 1;
    }

    topicStatsMap.set(topicKey, existing);
  });

  rawMistakes.forEach((m) => {
    questionMistakeCountMap.set(m.questionId, (questionMistakeCountMap.get(m.questionId) || 0) + 1);
  });

  // 2. Build classified mistake items
  const processedItems: MistakeItem[] = rawMistakes.map((m) => {
    let meta = metadataMap.get(m.questionId);
    if (!meta) {
      meta = {
        subjectName: m.subjectName,
        subjectCode: "CUET",
        topicTitle: m.sectionTitle.includes(":") ? m.sectionTitle.split(":")[1].trim() : m.sectionTitle,
        questionCode: m.questionId,
      };
    }

    const topicKey = `${meta.subjectName}::${meta.topicTitle}`;
    const topicStats = topicStatsMap.get(topicKey);
    const repeatedCountForQuestion = questionMistakeCountMap.get(m.questionId) || 1;
    const repeatedCountForTopic = topicStats?.incorrectCount || 1;

    const review = reviewsMap.get(`${m.attemptId}::${m.questionId}`);
    const reviewStatus: MistakeReviewStatus = review?.status || "PENDING_REVIEW";
    const reviewedAt = review?.reviewedAt || null;
    const masteredAt = review?.masteredAt || null;
    const studentNotes = review?.notes || null;
    const studentErrorReason = review?.errorReason || null;
    const isBookmarked = bookmarksSet.has(m.questionId);

    // Dynamic Classifications
    const categories: MistakeItem["categories"] = [];

    // Category 1: Incorrect Answer
    if (m.resultStatus === "INCORRECT") {
      categories.push({
        category: "INCORRECT",
        label: "Incorrect Answer",
        description: "Submitted answer did not match the official CUET key.",
        evidence: `Selected option marked incorrect; -${m.negativeMarksApplied} negative mark applied.`,
      });
    }

    // Category 2: Unanswered Question
    if (m.resultStatus === "UNANSWERED") {
      categories.push({
        category: "UNANSWERED",
        label: "Unanswered Question",
        description: "Question was unattempted or skipped during the mock exam.",
        evidence: "Zero response recorded prior to test submission.",
      });
    }

    // Category 3: Repeated Question Error
    if (repeatedCountForQuestion >= 2 && m.resultStatus === "INCORRECT") {
      categories.push({
        category: "REPEATED_QUESTION_ERROR",
        label: "Repeated Question Error",
        description: "This exact question was missed across multiple test attempts.",
        evidence: `Missed in ${repeatedCountForQuestion} distinct test attempts.`,
        confidenceLevel: "HIGH",
      });
    }

    // Category 4: Recurring Topic Error
    if (repeatedCountForTopic >= 2 && m.resultStatus === "INCORRECT") {
      categories.push({
        category: "REPEATED_TOPIC_ERROR",
        label: "Recurring Topic Error",
        description: "Multiple errors recorded within this specific syllabus topic.",
        evidence: `${repeatedCountForTopic} questions incorrect in ${meta.topicTitle}.`,
        confidenceLevel: repeatedCountForTopic >= 3 ? "HIGH" : "MODERATE",
      });
    }

    // Category 5: Possible Concept Gap (Enforces minimum sample threshold N >= 3)
    if (topicStats && topicStats.attemptedCount >= 3) {
      const topicAccuracy =
        topicStats.attemptedCount > 0
          ? Math.round(( (topicStats.attemptedCount - topicStats.incorrectCount) / topicStats.attemptedCount) * 100)
          : 0;

      if (topicAccuracy < 50.0 && m.resultStatus === "INCORRECT") {
        categories.push({
          category: "CONCEPT_GAP",
          label: "Possible Concept Gap",
          description: "Struggling performance observed across multiple questions in this topic.",
          evidence: `${topicStats.incorrectCount} of ${topicStats.attemptedCount} attempted questions incorrect (${topicAccuracy}% accuracy; sample size N=${topicStats.attemptedCount}).`,
          confidenceLevel: topicStats.attemptedCount >= 5 ? "HIGH" : "MODERATE",
        });
      }
    }

    // Category 6: Time Pressure (Evidence-based only)
    if (m.isAutoSubmitted && m.resultStatus === "UNANSWERED") {
      categories.push({
        category: "TIME_PRESSURE",
        label: "Time Pressure",
        description: "Examination timer ran out before this question was reached.",
        evidence: "Attempt concluded with automatic expiration status (AUTO_SUBMITTED).",
      });
    } else if (studentErrorReason === "TIME_PRESSURE") {
      categories.push({
        category: "TIME_PRESSURE",
        label: "Time Pressure",
        description: "Marked by student during revision review.",
        evidence: "Student tagged this error as time pressure during revision review.",
      });
    }

    // Category 7: Careless Error (Explicit student signal only)
    if (studentErrorReason === "CARELESS" || studentErrorReason === "CALCULATION_ERROR" || studentErrorReason === "MISREAD_QUESTION") {
      categories.push({
        category: "CARELESS_ERROR",
        label: studentErrorReason === "CALCULATION_ERROR" ? "Calculation Slip" : studentErrorReason === "MISREAD_QUESTION" ? "Misread Question" : "Careless Error",
        description: "Identified and flagged by the student during post-exam review.",
        evidence: "Explicit reason tagged by student in revision notebook.",
      });
    }

    return {
      id: `${m.attemptId}::${m.questionId}`,
      attemptId: m.attemptId,
      testId: m.testId,
      testTitle: m.testTitle,
      testCode: m.testCode,
      attemptDate: m.attemptDate,
      attemptTimeTakenSeconds: m.attemptTimeTakenSeconds,
      isAutoSubmitted: m.isAutoSubmitted,
      questionId: m.questionId,
      questionNumber: m.questionNumber,
      sectionTitle: m.sectionTitle,
      subjectName: meta.subjectName,
      subjectCode: meta.subjectCode,
      topicTitle: meta.topicTitle,
      unitNumber: meta.unitNumber,
      questionType: m.questionType,
      questionText: m.questionText,
      passageText: m.passageText,
      options: m.options,
      selectedOptionId: m.selectedOptionId,
      selectedOptionLabel: m.selectedOptionLabel,
      correctOptionId: m.correctOptionId,
      correctOptionLabel: m.correctOptionLabel,
      explanation: m.explanation,
      resultStatus: m.resultStatus,
      awardedMarks: m.awardedMarks,
      negativeMarksApplied: m.negativeMarksApplied,
      reviewStatus,
      reviewedAt,
      masteredAt,
      studentNotes,
      studentErrorReason,
      isBookmarked,
      categories,
      repeatedCountForQuestion,
      repeatedCountForTopic,
    };
  });

  return { processedItems, topicStatsMap, bookmarksSet, rawMistakes };
}

// -----------------------------------------------------------------------------
// Service: Get Full Mistake Intelligence Payload for Dashboard
// -----------------------------------------------------------------------------

export async function getStudentMistakesPayload(
  studentId: string
): Promise<StudentMistakesPayload> {
  const { processedItems, topicStatsMap, bookmarksSet } = await getProcessedStudentMistakes(studentId);

  // 3. Compute Overview Metrics
  const totalIncorrect = processedItems.filter((i) => i.resultStatus === "INCORRECT").length;
  const totalUnanswered = processedItems.filter((i) => i.resultStatus === "UNANSWERED").length;
  const uniqueQuestionsSet = new Set(processedItems.map((i) => i.questionId));
  const pendingReviewCount = processedItems.filter((i) => i.reviewStatus === "PENDING_REVIEW").length;
  const reviewedCount = processedItems.filter((i) => i.reviewStatus === "REVIEWED").length;
  const masteredCount = processedItems.filter((i) => i.reviewStatus === "MASTERED").length;
  const bookmarkedCount = bookmarksSet.size;

  // 4. Topics to Revisit Analysis
  const topicsToRevisit: TopicRevisitItem[] = [];
  topicStatsMap.forEach((stats) => {
    if (stats.incorrectCount > 0 || stats.unansweredCount > 0) {
      const accuracy =
        stats.attemptedCount > 0
          ? Math.round(((stats.attemptedCount - stats.incorrectCount) / stats.attemptedCount) * 1000) / 10
          : 0;

      let status: "CONCEPT_GAP" | "REPEATED_STRUGGLE" | "LIMITED_EVIDENCE" = "LIMITED_EVIDENCE";
      let reason = "Limited sample size available for definitive diagnostic evaluation.";

      if (stats.attemptedCount >= 3) {
        if (accuracy < 50.0) {
          status = "CONCEPT_GAP";
          reason = `Low accuracy (${accuracy}%) across ${stats.attemptedCount} attempted questions suggests recurring conceptual difficulty.`;
        } else if (stats.incorrectCount >= 2) {
          status = "REPEATED_STRUGGLE";
          reason = `Multiple errors (${stats.incorrectCount} incorrect) recorded across attempts.`;
        }
      } else if (stats.incorrectCount >= 2) {
        status = "REPEATED_STRUGGLE";
        reason = `${stats.incorrectCount} mistakes observed across early question attempts.`;
      }

      topicsToRevisit.push({
        subjectName: stats.subjectName,
        topicTitle: stats.topicTitle,
        unitNumber: stats.unitNumber,
        attemptedCount: stats.attemptedCount,
        incorrectCount: stats.incorrectCount,
        unansweredCount: stats.unansweredCount,
        accuracy,
        sampleSize: stats.attemptedCount,
        reason,
        status,
      });
    }
  });

  // Sort topics to revisit: Concept Gaps first, then lowest accuracy, then highest sample size
  topicsToRevisit.sort((a, b) => {
    if (a.status === "CONCEPT_GAP" && b.status !== "CONCEPT_GAP") return -1;
    if (b.status === "CONCEPT_GAP" && a.status !== "CONCEPT_GAP") return 1;
    return a.accuracy - b.accuracy || b.sampleSize - a.sampleSize;
  });

  const recurringErrorTopicsCount = topicsToRevisit.filter(
    (t) => t.status === "CONCEPT_GAP" || t.status === "REPEATED_STRUGGLE"
  ).length;

  const overview: MistakeOverviewMetrics = {
    totalIncorrect,
    totalUnanswered,
    totalUniqueQuestions: uniqueQuestionsSet.size,
    pendingReviewCount,
    reviewedCount,
    masteredCount,
    recurringErrorTopicsCount,
    bookmarkedCount,
  };

  // 5. Category Breakdown (Only show categories with actual data)
  const categoryCounts: Record<MistakeCategory, number> = {
    INCORRECT: totalIncorrect,
    UNANSWERED: totalUnanswered,
    CONCEPT_GAP: processedItems.filter((i) => i.categories.some((c) => c.category === "CONCEPT_GAP")).length,
    REPEATED_TOPIC_ERROR: processedItems.filter((i) => i.categories.some((c) => c.category === "REPEATED_TOPIC_ERROR")).length,
    REPEATED_QUESTION_ERROR: processedItems.filter((i) => i.categories.some((c) => c.category === "REPEATED_QUESTION_ERROR")).length,
    TIME_PRESSURE: processedItems.filter((i) => i.categories.some((c) => c.category === "TIME_PRESSURE")).length,
    CARELESS_ERROR: processedItems.filter((i) => i.categories.some((c) => c.category === "CARELESS_ERROR")).length,
  };

  const categoryBreakdown: MistakeCategoryStat[] = [
    {
      category: "INCORRECT" as MistakeCategory,
      label: "Incorrect Answers",
      count: categoryCounts.INCORRECT,
      description: "Direct wrong answers resulting in negative marks.",
    },
    {
      category: "UNANSWERED" as MistakeCategory,
      label: "Unanswered Questions",
      count: categoryCounts.UNANSWERED,
      description: "Skipped questions with zero response recorded.",
    },
    {
      category: "REPEATED_TOPIC_ERROR" as MistakeCategory,
      label: "Recurring Topic Errors",
      count: categoryCounts.REPEATED_TOPIC_ERROR,
      description: "Multiple errors recorded within the same syllabus topic.",
    },
    {
      category: "REPEATED_QUESTION_ERROR" as MistakeCategory,
      label: "Repeated Question Errors",
      count: categoryCounts.REPEATED_QUESTION_ERROR,
      description: "Same question answered incorrectly across separate mock tests.",
    },
    {
      category: "CONCEPT_GAP" as MistakeCategory,
      label: "Possible Concept Gaps",
      count: categoryCounts.CONCEPT_GAP,
      description: "Sub-50% accuracy with verified sample size (N >= 3).",
    },
    {
      category: "TIME_PRESSURE" as MistakeCategory,
      label: "Time Pressure",
      count: categoryCounts.TIME_PRESSURE,
      description: "Unanswered questions upon auto-submit timer expiration.",
    },
    {
      category: "CARELESS_ERROR" as MistakeCategory,
      label: "Careless / Calculation Slips",
      count: categoryCounts.CARELESS_ERROR,
      description: "Student-reported calculation or misreading errors.",
    },
  ].filter((c) => c.count > 0);

  // 6. Chronological Mistake Trend
  const dateMap = new Map<string, { incorrectCount: number; unansweredCount: number; reviewedCount: number }>();
  processedItems.forEach((m) => {
    const day = m.attemptDate.split("T")[0];
    const cur = dateMap.get(day) || { incorrectCount: 0, unansweredCount: 0, reviewedCount: 0 };
    if (m.resultStatus === "INCORRECT") cur.incorrectCount += 1;
    if (m.resultStatus === "UNANSWERED") cur.unansweredCount += 1;
    if (m.reviewStatus === "REVIEWED" || m.reviewStatus === "MASTERED") cur.reviewedCount += 1;
    dateMap.set(day, cur);
  });

  const trend: MistakeTrendPoint[] = Array.from(dateMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, vals]) => ({
      date,
      formattedDate: new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      incorrectCount: vals.incorrectCount,
      unansweredCount: vals.unansweredCount,
      reviewedCount: vals.reviewedCount,
    }));

  const hasEnoughDataForTrend = trend.length >= 2;

  // 7. Actionable Revision Recommendations
  const recommendations: RevisionRecommendation[] = [];

  if (pendingReviewCount > 0) {
    recommendations.push({
      id: "rec-pending",
      title: `Review ${pendingReviewCount} Pending Mistakes`,
      description: "Work through your unreviewed mistakes and study step-by-step solutions to build conceptual clarity.",
      actionLabel: "Start Review",
      actionHref: "/mistakes/review?status=PENDING_REVIEW",
      priority: "HIGH",
      category: "PENDING_MISTAKES",
    });
  }

  const topStruggle = topicsToRevisit[0];
  if (topStruggle && (topStruggle.status === "CONCEPT_GAP" || topStruggle.status === "REPEATED_STRUGGLE")) {
    recommendations.push({
      id: "rec-topic",
      title: `Reinforce ${topStruggle.topicTitle}`,
      description: `You have ${topStruggle.incorrectCount} mistakes recorded in ${topStruggle.subjectName}. Practice focused questions in this area.`,
      actionLabel: "Review Topic Mistakes",
      actionHref: `/mistakes/review?topic=${encodeURIComponent(topStruggle.topicTitle)}`,
      priority: "HIGH",
      category: "RECURRING_TOPIC",
    });
  }

  if (totalUnanswered > 0) {
    recommendations.push({
      id: "rec-unanswered",
      title: `Analyze ${totalUnanswered} Skipped Questions`,
      description: "Inspect unanswered questions to verify whether they were skipped due to concept difficulty or pacing.",
      actionLabel: "Inspect Skipped",
      actionHref: "/mistakes/review?category=UNANSWERED",
      priority: "MEDIUM",
      category: "UNANSWERED_PACING",
    });
  }

  if (reviewedCount > 0 && masteredCount < reviewedCount) {
    recommendations.push({
      id: "rec-mastered",
      title: `Mark Tested Mastery (${reviewedCount - masteredCount} questions)`,
      description: "Re-solve previously reviewed questions. If you can solve them without hints, mark them as Mastered.",
      actionLabel: "View Reviewed",
      actionHref: "/mistakes/review?status=REVIEWED",
      priority: "LOW",
      category: "REVISIT_REVIEWED",
    });
  }

  return {
    overview,
    categoryBreakdown,
    topicsToRevisit: topicsToRevisit.slice(0, 10),
    trend,
    hasEnoughDataForTrend,
    recommendations,
    hasMistakes: processedItems.length > 0,
  };
}

// -----------------------------------------------------------------------------
// Service: Query Mistakes with Filtering, Sorting & Pagination for /mistakes/review
// -----------------------------------------------------------------------------

export async function getStudentMistakesList(
  studentId: string,
  filters: MistakeFilterInput = {}
) {
  const parsedFilters = MistakeFilterSchema.parse(filters);
  const payload = await getStudentMistakesPayload(studentId);
  const { processedItems, rawMistakes } = await getProcessedStudentMistakes(studentId);
  const metadataMap = getQuestionMetadataMap();

  let items: MistakeItem[] = [...processedItems];

  // Apply filters
  if (parsedFilters.subject && parsedFilters.subject !== "ALL") {
    items = items.filter(
      (i) => i.subjectName.toLowerCase() === parsedFilters.subject!.toLowerCase()
    );
  }

  if (parsedFilters.topic && parsedFilters.topic !== "ALL") {
    items = items.filter(
      (i) => i.topicTitle.toLowerCase() === parsedFilters.topic!.toLowerCase()
    );
  }

  if (parsedFilters.testId && parsedFilters.testId !== "ALL") {
    items = items.filter((i) => i.testId === parsedFilters.testId);
  }

  if (parsedFilters.status && parsedFilters.status !== "ALL") {
    items = items.filter((i) => i.reviewStatus === parsedFilters.status);
  }

  if (parsedFilters.category && parsedFilters.category !== "ALL") {
    if (parsedFilters.category === "INCORRECT") {
      items = items.filter((i) => i.resultStatus === "INCORRECT");
    } else if (parsedFilters.category === "UNANSWERED") {
      items = items.filter((i) => i.resultStatus === "UNANSWERED");
    } else if (parsedFilters.category === "REPEATED_ERROR") {
      items = items.filter((i) => i.repeatedCountForQuestion >= 2);
    }
  }

  // Apply sorting
  if (parsedFilters.sortBy === "oldest") {
    items.sort((a, b) => new Date(a.attemptDate).getTime() - new Date(b.attemptDate).getTime());
  } else if (parsedFilters.sortBy === "most_repeated") {
    items.sort((a, b) => b.repeatedCountForQuestion - a.repeatedCountForQuestion);
  } else if (parsedFilters.sortBy === "subject") {
    items.sort((a, b) => a.subjectName.localeCompare(b.subjectName));
  } else {
    // "recent" default
    items.sort((a, b) => new Date(b.attemptDate).getTime() - new Date(a.attemptDate).getTime());
  }

  // Pagination
  const page = parsedFilters.page || 1;
  const limit = parsedFilters.limit || 10;
  const total = items.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const offset = (page - 1) * limit;
  const paginatedItems = items.slice(offset, offset + limit);

  // Available subjects and topics for filter dropdowns
  const availableSubjects = Array.from(new Set(rawMistakes.map((m) => {
    const meta = metadataMap.get(m.questionId);
    return meta ? meta.subjectName : m.subjectName;
  })));

  const availableTopics = Array.from(new Set(rawMistakes.map((m) => {
    const meta = metadataMap.get(m.questionId);
    return meta ? meta.topicTitle : m.sectionTitle;
  })));

  return {
    items: paginatedItems,
    total,
    page,
    limit,
    totalPages,
    availableSubjects,
    availableTopics,
    overview: payload.overview,
  };
}

// -----------------------------------------------------------------------------
// Service: Update Mistake Review Status
// -----------------------------------------------------------------------------

export async function updateMistakeReviewStatus(
  studentId: string,
  input: UpdateMistakeStatusInput
): Promise<StoredMistakeReview> {
  const { attemptId, questionId, status, errorReason, notes } = input;
  const now = new Date();
  const reviewedAt = status === "REVIEWED" || status === "MASTERED" ? now : null;
  const masteredAt = status === "MASTERED" ? now : null;

  // 1. Try DB
  try {
    // Verify attempt ownership
    const attempt = await prisma.testAttempt.findUnique({
      where: { id: attemptId },
      select: { studentId: true },
    });

    if (attempt && attempt.studentId !== studentId) {
      throw new Error("Access denied: You cannot modify another student's mistake review.");
    }

    const updated = await prisma.mistakeReview.upsert({
      where: {
        studentId_attemptId_questionId: {
          studentId,
          attemptId,
          questionId,
        },
      },
      update: {
        status,
        errorReason: errorReason || null,
        notes: notes || null,
        reviewedAt: reviewedAt || undefined,
        masteredAt: masteredAt || undefined,
        updatedAt: now,
      },
      create: {
        studentId,
        attemptId,
        questionId,
        status,
        errorReason: errorReason || null,
        notes: notes || null,
        reviewedAt,
        masteredAt,
      },
    });

    return {
      id: updated.id,
      studentId: updated.studentId,
      attemptId: updated.attemptId,
      questionId: updated.questionId,
      resultQuestionId: updated.resultQuestionId,
      status: updated.status as MistakeReviewStatus,
      errorReason: updated.errorReason as MistakeErrorReason | null,
      notes: updated.notes,
      reviewedAt: updated.reviewedAt?.toISOString() || null,
      masteredAt: updated.masteredAt?.toISOString() || null,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  } catch (err: unknown) {
    const msg = (err as Error).message || "";
    if (msg.includes("Access denied")) throw err;
    console.warn("Prisma error in updateMistakeReviewStatus, falling back to memory store:", err);
  }

  // 2. Memory Store Fallback
  const memAttempt = cbtMemoryStore.getAttempt(attemptId);
  if (memAttempt && memAttempt.studentId !== studentId) {
    throw new Error("Access denied: You cannot modify another student's mistake review.");
  }

  const existing = mistakeMemoryStore.getReview(studentId, attemptId, questionId);
  const reviewRecord: StoredMistakeReview = {
    id: existing?.id || `rev-${Date.now()}-${questionId}`,
    studentId,
    attemptId,
    questionId,
    resultQuestionId: null,
    status,
    errorReason: errorReason || null,
    notes: notes || null,
    reviewedAt: reviewedAt?.toISOString() || existing?.reviewedAt || null,
    masteredAt: masteredAt?.toISOString() || existing?.masteredAt || null,
    createdAt: existing?.createdAt || now.toISOString(),
    updatedAt: now.toISOString(),
  };

  mistakeMemoryStore.saveReview(reviewRecord);
  return reviewRecord;
}

// -----------------------------------------------------------------------------
// Service: Toggle Question Bookmark
// -----------------------------------------------------------------------------

export async function toggleQuestionBookmark(
  studentId: string,
  questionId: string,
  notes?: string | null
): Promise<{ isBookmarked: boolean }> {
  // 1. Try DB
  try {
    const existing = await prisma.questionBookmark.findUnique({
      where: {
        studentId_questionId: {
          studentId,
          questionId,
        },
      },
    });

    if (existing) {
      await prisma.questionBookmark.delete({
        where: { id: existing.id },
      });
      return { isBookmarked: false };
    } else {
      await prisma.questionBookmark.create({
        data: {
          studentId,
          questionId,
          notes: notes || null,
        },
      });
      return { isBookmarked: true };
    }
  } catch (err) {
    console.warn("Prisma error in toggleQuestionBookmark, using memory store:", err);
  }

  // 2. Memory Store Fallback
  const existingMem = mistakeMemoryStore.getBookmark(studentId, questionId);
  if (existingMem) {
    mistakeMemoryStore.removeBookmark(studentId, questionId);
    return { isBookmarked: false };
  } else {
    mistakeMemoryStore.saveBookmark({
      id: `bmk-${Date.now()}-${questionId}`,
      studentId,
      questionId,
      notes: notes || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return { isBookmarked: true };
  }
}

// -----------------------------------------------------------------------------
// Service: List Student Bookmarked Questions
// -----------------------------------------------------------------------------

export async function getStudentBookmarks(
  studentId: string,
  page: number = 1,
  limit: number = 10
) {
  const metadataMap = getQuestionMetadataMap();
  let bookmarkedQuestionIds: Array<{ questionId: string; notes: string | null; createdAt: string }> = [];

  try {
    const dbBmk = await prisma.questionBookmark.findMany({
      where: { studentId },
      orderBy: { createdAt: "desc" },
    });
    bookmarkedQuestionIds = dbBmk.map((b) => ({
      questionId: b.questionId,
      notes: b.notes,
      createdAt: b.createdAt.toISOString(),
    }));
  } catch {
    bookmarkedQuestionIds = mistakeMemoryStore.listStudentBookmarks(studentId).map((b) => ({
      questionId: b.questionId,
      notes: b.notes,
      createdAt: b.createdAt,
    }));
  }

  // Enrich with sample question data if available
  const items = bookmarkedQuestionIds.map((b) => {
    const meta = metadataMap.get(b.questionId);
    const sampleQ = SAMPLE_QUESTIONS.find((q) => q.questionCode === b.questionId);

    return {
      questionId: b.questionId,
      notes: b.notes,
      createdAt: b.createdAt,
      subjectName: meta?.subjectName || "CUET Subject",
      topicTitle: meta?.topicTitle || "Key Topic",
      questionText: sampleQ?.questionText || `Question Reference: ${b.questionId}`,
      questionType: sampleQ?.questionType || "MCQ_SINGLE",
      explanation: sampleQ?.explanation || null,
      options: sampleQ?.options || [],
    };
  });

  const total = items.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const offset = (page - 1) * limit;

  return {
    items: items.slice(offset, offset + limit),
    total,
    page,
    limit,
    totalPages,
  };
}

// -----------------------------------------------------------------------------
// Service: Compact Dashboard Summary for /dashboard
// -----------------------------------------------------------------------------

export async function getStudentDashboardMistakeSummary(studentId: string) {
  const payload = await getStudentMistakesPayload(studentId);

  return {
    hasMistakes: payload.hasMistakes,
    pendingReviewCount: payload.overview.pendingReviewCount,
    totalIncorrect: payload.overview.totalIncorrect,
    recurringErrorTopicsCount: payload.overview.recurringErrorTopicsCount,
    topStruggleTopic: payload.topicsToRevisit[0] || null,
    topRecommendation: payload.recommendations[0] || null,
  };
}

