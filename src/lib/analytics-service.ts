/**
 * MockMate — Performance Analytics Service (Phase 11)
 *
 * Derives comprehensive, server-authoritative learning analytics from actual
 * student test attempts, evaluated scorecards, and syllabus hierarchies.
 * Strictly avoids fake percentiles, fabricated rankings, or arbitrary predictions.
 */

import { prisma } from "@/lib/prisma";
import { resultMemoryStore } from "@/lib/evaluation-sample-data";
import { SAMPLE_QUESTIONS } from "@/lib/question-sample-data";
import type {
  StudentAnalyticsPayload,
  AnalyticsFilterInput,
  ScoreTrendPoint,
  SubjectPerformanceMetric,
  TopicPerformanceMetric,
  DiagnosticInsight,
  PerformanceOverviewMetrics,
  TimeManagementAnalytics,
} from "./validations/analytics";
import type { TestResultData } from "./validations/evaluation";

/**
 * Computes the full analytics payload for an authenticated student.
 */
export async function getStudentAnalytics(
  studentId: string,
  studentName: string = "CUET Aspirant",
  filters: AnalyticsFilterInput = { category: "ALL", examYear: "ALL", period: "all" }
): Promise<StudentAnalyticsPayload> {
  // 1. Fetch student's evaluated results (DB with in-memory fallback)
  let allResults: TestResultData[] = [];

  try {
    const dbResults = await prisma.testResult.findMany({
      where: {
        studentId,
        status: "EVALUATED",
      },
      include: {
        sections: true,
        questions: { orderBy: { questionNumber: "asc" } },
        mockTest: {
          include: {
            examYear: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    if (dbResults.length > 0) {
      allResults = dbResults.map((r) => ({
        id: r.id,
        attemptId: r.attemptId,
        studentId: r.studentId,
        studentName,
        mockTestId: r.mockTestId,
        testTitle: r.mockTest?.title || "CUET Mock Examination",
        testCode: r.mockTest?.testCode || "MOCK-TEST",
        testCategory: r.mockTest?.testType || "FULL_SYLLABUS",
        examYear: r.mockTest?.examYear?.year || 2026,
        totalMarks: r.totalMarks,
        maximumMarks: r.maximumMarks,
        percentage: r.percentage,
        accuracy: r.accuracy,
        correctCount: r.correctCount,
        incorrectCount: r.incorrectCount,
        unansweredCount: r.unansweredCount,
        totalQuestions: r.totalQuestions,
        timeTaken: r.timeTaken,
        status: "EVALUATED",
        evaluatedAt: r.evaluatedAt ? r.evaluatedAt.toISOString() : r.createdAt.toISOString(),
        evaluationVersion: r.evaluationVersion,
        createdAt: r.createdAt.toISOString(),
        sections: (r.sections || []).map((sec) => ({
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
        questions: (r.questions || []).map((q) => {
          let parsedOptions = [];
          try {
            parsedOptions = JSON.parse(q.optionsJson || "[]");
          } catch {
            parsedOptions = [];
          }
          return {
            id: q.id,
            questionId: q.questionId,
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
            status: q.status as "CORRECT" | "INCORRECT" | "UNANSWERED",
            isCorrect: q.isCorrect,
            markedForReview: q.markedForReview,
            awardedMarks: q.awardedMarks,
            maximumMarks: q.maximumMarks,
            negativeMarksApplied: q.negativeMarksApplied,
            explanation: q.explanation,
          };
        }),
      }));
    }
  } catch (err) {
    console.warn("Prisma error in getStudentAnalytics, using memory store:", err);
  }

  // If DB returned nothing, check in-memory store
  if (allResults.length === 0) {
    const mem = resultMemoryStore.getStudentResults(studentId, {
      page: 1,
      limit: 100,
      sortBy: "date",
      sortOrder: "asc",
    });
    allResults = mem.results.filter((r) => r.status === "EVALUATED");
  }

  // 2. Apply Filters
  const now = Date.now();
  const filteredResults = allResults.filter((r) => {
    // Category filter
    if (filters.category && filters.category !== "ALL") {
      if (r.testCategory !== filters.category) return false;
    }

    // Exam year filter
    if (filters.examYear && filters.examYear !== "ALL") {
      if (String(r.examYear) !== filters.examYear) return false;
    }

    // Time period filter
    if (filters.period && filters.period !== "all") {
      const resultTime = new Date(r.createdAt).getTime();
      let maxAgeMs = Infinity;
      if (filters.period === "7d") maxAgeMs = 7 * 24 * 60 * 60 * 1000;
      else if (filters.period === "30d") maxAgeMs = 30 * 24 * 60 * 60 * 1000;
      else if (filters.period === "90d") maxAgeMs = 90 * 24 * 60 * 60 * 1000;

      if (now - resultTime > maxAgeMs) return false;
    }

    return true;
  });

  // Sort filtered results chronologically ascending
  filteredResults.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const completedTests = filteredResults.length;
  const hasCompletedTests = completedTests > 0;
  const hasEnoughDataForTrends = completedTests >= 2;

  // 3. Compute Overview Metrics
  let totalScorePercentageSum = 0;
  let bestScorePercentage = 0;
  let totalQuestionsAttempted = 0;
  let totalQuestionsCorrect = 0;
  let totalQuestionsIncorrect = 0;
  let totalQuestionsUnanswered = 0;
  let totalTimeSpentSeconds = 0;

  filteredResults.forEach((r) => {
    totalScorePercentageSum += r.percentage;
    if (r.percentage > bestScorePercentage) {
      bestScorePercentage = r.percentage;
    }
    totalQuestionsAttempted += r.correctCount + r.incorrectCount;
    totalQuestionsCorrect += r.correctCount;
    totalQuestionsIncorrect += r.incorrectCount;
    totalQuestionsUnanswered += r.unansweredCount;
    if (r.timeTaken) {
      totalTimeSpentSeconds += r.timeTaken;
    }
  });

  const averageScorePercentage = hasCompletedTests
    ? Math.round((totalScorePercentageSum / completedTests) * 10) / 10
    : 0;

  const averageAccuracy =
    totalQuestionsAttempted > 0
      ? Math.round((totalQuestionsCorrect / totalQuestionsAttempted) * 1000) / 10
      : 0;

  const averageTimePerQuestionSeconds =
    totalQuestionsAttempted > 0
      ? Math.round(totalTimeSpentSeconds / totalQuestionsAttempted)
      : 0;

  // Trend calculation (comparing recent half vs older half)
  let overallTrend: "IMPROVING" | "DECLINING" | "STABLE" | null = null;
  let trendPercentageDelta: number | null = null;

  if (hasEnoughDataForTrends) {
    const half = Math.floor(completedTests / 2);
    const olderSlice = filteredResults.slice(0, half);
    const newerSlice = filteredResults.slice(half);

    const olderAvg =
      olderSlice.reduce((sum, r) => sum + r.percentage, 0) / olderSlice.length;
    const newerAvg =
      newerSlice.reduce((sum, r) => sum + r.percentage, 0) / newerSlice.length;

    trendPercentageDelta = Math.round((newerAvg - olderAvg) * 10) / 10;
    if (trendPercentageDelta >= 2.0) {
      overallTrend = "IMPROVING";
    } else if (trendPercentageDelta <= -2.0) {
      overallTrend = "DECLINING";
    } else {
      overallTrend = "STABLE";
    }
  }

  const overview: PerformanceOverviewMetrics = {
    completedTests,
    averageScorePercentage,
    bestScorePercentage,
    averageAccuracy,
    averageTimePerQuestionSeconds,
    totalTimeSpentSeconds,
    totalQuestionsAttempted,
    totalQuestionsCorrect,
    totalQuestionsIncorrect,
    totalQuestionsUnanswered,
    overallTrend,
    trendPercentageDelta,
  };

  // 4. Score & Accuracy Trend Points
  const scoreTrend: ScoreTrendPoint[] = filteredResults.map((r) => {
    const dateObj = new Date(r.createdAt);
    const formattedDate = dateObj.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });

    return {
      resultId: r.id,
      attemptId: r.attemptId,
      testTitle: r.testTitle,
      testCode: r.testCode,
      date: r.createdAt,
      formattedDate,
      totalMarks: r.totalMarks,
      maximumMarks: r.maximumMarks,
      percentage: r.percentage,
      accuracy: r.accuracy,
      timeTakenSeconds: r.timeTaken || null,
    };
  });

  // 5. Time Management Analytics
  const totalTimeSpentMinutes = Math.round(totalTimeSpentSeconds / 60);
  const averageTimePerTestMinutes = hasCompletedTests
    ? Math.round(totalTimeSpentSeconds / completedTests / 60)
    : 0;

  let paceDescription = "Pace data available after completing tests";
  if (averageTimePerQuestionSeconds > 0) {
    if (averageTimePerQuestionSeconds < 45) {
      paceDescription = "Rapid pace — fast question resolution";
    } else if (averageTimePerQuestionSeconds <= 75) {
      paceDescription = "Balanced pace — aligns with standard CUET examination timing (54s / question)";
    } else {
      paceDescription = "Deliberate pace — consider speed drills for calculation-heavy sections";
    }
  }

  const timeManagement: TimeManagementAnalytics = {
    totalTimeSpentMinutes,
    averageTimePerTestMinutes,
    averageTimePerQuestionSeconds,
    paceDescription,
  };

  // 6. Subject-Wise Analytics
  const subjectMap = new Map<
    string,
    {
      subjectId: string;
      subjectName: string;
      testsCount: number;
      totalQuestions: number;
      attemptedCount: number;
      correctCount: number;
      incorrectCount: number;
      unansweredCount: number;
      totalMarks: number;
      maximumMarks: number;
    }
  >();

  filteredResults.forEach((r) => {
    const subjectsInThisTest = new Set<string>();

    r.sections.forEach((sec) => {
      const key = sec.subjectName || sec.subjectId;
      const existing = subjectMap.get(key) || {
        subjectId: sec.subjectId,
        subjectName: sec.subjectName,
        testsCount: 0,
        totalQuestions: 0,
        attemptedCount: 0,
        correctCount: 0,
        incorrectCount: 0,
        unansweredCount: 0,
        totalMarks: 0,
        maximumMarks: 0,
      };

      if (!subjectsInThisTest.has(key)) {
        existing.testsCount += 1;
        subjectsInThisTest.add(key);
      }

      existing.totalQuestions += sec.totalQuestions;
      existing.correctCount += sec.correctCount;
      existing.incorrectCount += sec.incorrectCount;
      existing.unansweredCount += sec.unansweredCount;
      existing.attemptedCount += sec.correctCount + sec.incorrectCount;
      existing.totalMarks += sec.totalMarks;
      existing.maximumMarks += sec.maximumMarks;

      subjectMap.set(key, existing);
    });
  });

  const subjects: SubjectPerformanceMetric[] = Array.from(subjectMap.values()).map(
    (s) => {
      const accuracy =
        s.attemptedCount > 0
          ? Math.round((s.correctCount / s.attemptedCount) * 1000) / 10
          : 0;

      const percentage =
        s.maximumMarks > 0
          ? Math.round((s.totalMarks / s.maximumMarks) * 1000) / 10
          : 0;

      let status: "STRONG" | "MODERATE" | "NEEDS_PRACTICE" = "MODERATE";
      if (s.attemptedCount >= 2) {
        if (accuracy >= 70.0) status = "STRONG";
        else if (accuracy < 50.0) status = "NEEDS_PRACTICE";
      }

      return {
        subjectId: s.subjectId,
        subjectName: s.subjectName,
        testsCount: s.testsCount,
        totalQuestions: s.totalQuestions,
        attemptedCount: s.attemptedCount,
        correctCount: s.correctCount,
        incorrectCount: s.incorrectCount,
        unansweredCount: s.unansweredCount,
        totalMarks: Math.round(s.totalMarks * 10) / 10,
        maximumMarks: Math.round(s.maximumMarks * 10) / 10,
        accuracy,
        percentage,
        status,
      };
    }
  );

  // 7. Topic-Wise Analytics (Syllabus Mapping)
  // Build lookup index of sample questions by questionCode and text
  const questionMetadataMap = new Map<
    string,
    { subjectName: string; unitNumber?: number; topicTitle: string }
  >();

  SAMPLE_QUESTIONS.forEach((q) => {
    const subjectName = q.subjectSlug.toUpperCase();
    let topicTitle = "General Core Concepts";
    if (q.tags && q.tags[1]) {
      topicTitle = q.tags[1];
    } else if (q.tags && q.tags[0]) {
      topicTitle = q.tags[0];
    }

    questionMetadataMap.set(q.questionCode, {
      subjectName,
      unitNumber: q.unitNumber,
      topicTitle,
    });
  });

  const topicMap = new Map<
    string,
    {
      subjectName: string;
      unitNumber?: number;
      topicTitle: string;
      attemptedCount: number;
      correctCount: number;
      incorrectCount: number;
    }
  >();

  filteredResults.forEach((r) => {
    r.questions.forEach((q) => {
      // Determine topic
      let topicMeta = questionMetadataMap.get(q.questionId);
      if (!topicMeta) {
        // Fallback topic from section Title
        topicMeta = {
          subjectName: q.sectionTitle.includes(":")
            ? q.sectionTitle.split(":")[0].trim()
            : "Core Syllabus",
          topicTitle: q.sectionTitle.includes(":")
            ? q.sectionTitle.split(":")[1].trim()
            : q.sectionTitle,
        };
      }

      const key = `${topicMeta.subjectName}::${topicMeta.topicTitle}`;
      const existing = topicMap.get(key) || {
        subjectName: topicMeta.subjectName,
        unitNumber: topicMeta.unitNumber,
        topicTitle: topicMeta.topicTitle,
        attemptedCount: 0,
        correctCount: 0,
        incorrectCount: 0,
      };

      if (q.status === "CORRECT") {
        existing.attemptedCount += 1;
        existing.correctCount += 1;
      } else if (q.status === "INCORRECT") {
        existing.attemptedCount += 1;
        existing.incorrectCount += 1;
      }

      topicMap.set(key, existing);
    });
  });

  const topics: TopicPerformanceMetric[] = Array.from(topicMap.values())
    .filter((t) => t.attemptedCount > 0)
    .map((t) => {
      const accuracy =
        t.attemptedCount > 0
          ? Math.round((t.correctCount / t.attemptedCount) * 1000) / 10
          : 0;

      let status: "STRONG" | "MODERATE" | "NEEDS_PRACTICE" | "INSUFFICIENT_DATA" =
        "INSUFFICIENT_DATA";

      // Minimum sample requirement: At least 2 questions attempted
      if (t.attemptedCount >= 2) {
        if (accuracy >= 75.0) status = "STRONG";
        else if (accuracy < 50.0) status = "NEEDS_PRACTICE";
        else status = "MODERATE";
      }

      return {
        subjectName: t.subjectName,
        unitNumber: t.unitNumber,
        topicTitle: t.topicTitle,
        attemptedCount: t.attemptedCount,
        correctCount: t.correctCount,
        incorrectCount: t.incorrectCount,
        accuracy,
        sampleSize: t.attemptedCount,
        status,
      };
    });

  // 8. Diagnostic Insights (Strengths & Improvement Areas)
  const insights: DiagnosticInsight[] = [];

  // Check subjects for strengths and improvements
  subjects.forEach((s) => {
    if (s.attemptedCount >= 2) {
      if (s.accuracy >= 70.0) {
        insights.push({
          id: `ins-str-${s.subjectId}`,
          type: "STRENGTH",
          title: `Strong Performance in ${s.subjectName}`,
          subjectName: s.subjectName,
          description: `You have demonstrated consistent mastery in ${s.subjectName} with ${s.accuracy}% accuracy across ${s.attemptedCount} attempted questions.`,
          metricLabel: "Accuracy",
          metricValue: `${s.accuracy}%`,
          sampleCount: s.attemptedCount,
        });
      } else if (s.accuracy < 50.0) {
        insights.push({
          id: `ins-imp-${s.subjectId}`,
          type: "IMPROVEMENT_AREA",
          title: `Revision Needed in ${s.subjectName}`,
          subjectName: s.subjectName,
          description: `Your accuracy in ${s.subjectName} is currently ${s.accuracy}%, with ${s.incorrectCount} incorrect responses out of ${s.attemptedCount} questions. Focused NCERT revision is recommended.`,
          metricLabel: "Accuracy",
          metricValue: `${s.accuracy}%`,
          sampleCount: s.attemptedCount,
        });
      }
    }
  });

  // Check topics for insights
  topics.forEach((t) => {
    if (t.status === "STRONG") {
      insights.push({
        id: `ins-top-str-${t.topicTitle.replace(/\s+/g, "-")}`,
        type: "STRENGTH",
        title: `High Accuracy: ${t.topicTitle}`,
        subjectName: t.subjectName,
        description: `Excellent conceptual grasp of ${t.topicTitle} with ${t.accuracy}% accuracy (${t.correctCount} correct out of ${t.sampleSize} questions).`,
        metricLabel: "Topic Accuracy",
        metricValue: `${t.accuracy}%`,
        sampleCount: t.sampleSize,
      });
    } else if (t.status === "NEEDS_PRACTICE") {
      insights.push({
        id: `ins-top-imp-${t.topicTitle.replace(/\s+/g, "-")}`,
        type: "IMPROVEMENT_AREA",
        title: `Priority Practice: ${t.topicTitle}`,
        subjectName: t.subjectName,
        description: `Recent attempts indicate ${t.incorrectCount} mistakes out of ${t.sampleSize} questions in ${t.topicTitle}. Dedicated chapter practice will improve your net score.`,
        metricLabel: "Topic Accuracy",
        metricValue: `${t.accuracy}%`,
        sampleCount: t.sampleSize,
      });
    }
  });

  return {
    studentId,
    studentName,
    filters,
    overview,
    scoreTrend,
    subjects,
    topics,
    insights,
    timeManagement,
    hasEnoughDataForTrends,
    hasCompletedTests,
  };
}

/**
 * Fast helper for the student dashboard to populate snapshot metrics.
 */
export async function getStudentDashboardAnalytics(studentId: string) {
  const analytics = await getStudentAnalytics(studentId);

  const latestResult =
    analytics.scoreTrend.length > 0
      ? analytics.scoreTrend[analytics.scoreTrend.length - 1]
      : null;

  const strongestSubject =
    analytics.subjects.length > 0
      ? [...analytics.subjects].sort((a, b) => b.accuracy - a.accuracy)[0]
      : null;

  const priorityImprovement =
    analytics.insights.find((i) => i.type === "IMPROVEMENT_AREA") || null;

  return {
    completedTests: analytics.overview.completedTests,
    averageAccuracy: analytics.overview.averageAccuracy,
    averageScorePercentage: analytics.overview.averageScorePercentage,
    latestResult,
    strongestSubject,
    priorityImprovement,
    hasCompletedTests: analytics.hasCompletedTests,
  };
}
