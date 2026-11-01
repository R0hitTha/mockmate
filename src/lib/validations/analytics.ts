import { z } from "zod";

export const analyticsPeriodSchema = z.enum(["7d", "30d", "90d", "all"]);
export type AnalyticsPeriod = z.infer<typeof analyticsPeriodSchema>;

export const analyticsFilterSchema = z.object({
  category: z.string().optional().default("ALL"),
  examYear: z.string().optional().default("ALL"),
  period: analyticsPeriodSchema.optional().default("all"),
});

export type AnalyticsFilterInput = z.infer<typeof analyticsFilterSchema>;

export interface PerformanceOverviewMetrics {
  completedTests: number;
  averageScorePercentage: number;
  bestScorePercentage: number;
  averageAccuracy: number;
  averageTimePerQuestionSeconds: number;
  totalTimeSpentSeconds: number;
  totalQuestionsAttempted: number;
  totalQuestionsCorrect: number;
  totalQuestionsIncorrect: number;
  totalQuestionsUnanswered: number;
  overallTrend: "IMPROVING" | "DECLINING" | "STABLE" | null;
  trendPercentageDelta: number | null;
}

export interface ScoreTrendPoint {
  resultId: string;
  attemptId: string;
  testTitle: string;
  testCode: string;
  date: string;
  formattedDate: string;
  totalMarks: number;
  maximumMarks: number;
  percentage: number;
  accuracy: number;
  timeTakenSeconds: number | null;
}

export interface SubjectPerformanceMetric {
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
  accuracy: number;
  percentage: number;
  status: "STRONG" | "MODERATE" | "NEEDS_PRACTICE";
}

export interface TopicPerformanceMetric {
  subjectName: string;
  unitNumber?: number;
  unitTitle?: string;
  topicTitle: string;
  attemptedCount: number;
  correctCount: number;
  incorrectCount: number;
  accuracy: number;
  sampleSize: number;
  status: "STRONG" | "MODERATE" | "NEEDS_PRACTICE" | "INSUFFICIENT_DATA";
}

export interface DiagnosticInsight {
  id: string;
  type: "STRENGTH" | "IMPROVEMENT_AREA";
  title: string;
  subjectName: string;
  description: string;
  metricLabel: string;
  metricValue: string;
  sampleCount: number;
}

export interface TimeManagementAnalytics {
  totalTimeSpentMinutes: number;
  averageTimePerTestMinutes: number;
  averageTimePerQuestionSeconds: number;
  paceDescription: string;
}

export interface StudentAnalyticsPayload {
  studentId: string;
  studentName: string;
  filters: {
    category: string;
    examYear: string;
    period: AnalyticsPeriod;
  };
  overview: PerformanceOverviewMetrics;
  scoreTrend: ScoreTrendPoint[];
  subjects: SubjectPerformanceMetric[];
  topics: TopicPerformanceMetric[];
  insights: DiagnosticInsight[];
  timeManagement: TimeManagementAnalytics;
  hasEnoughDataForTrends: boolean;
  hasCompletedTests: boolean;
}

