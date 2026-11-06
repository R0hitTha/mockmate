import React from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getServerSession, getStudentProfile } from "@/lib/auth-server";
import { getStudentAnalytics } from "@/lib/analytics-service";
import { StudentLayout } from "@/components/layout/student-layout";
import { Container } from "@/components/layout/container";
import { AnalyticsFilterBar } from "@/components/analytics/analytics-filter-bar";
import { PerformanceOverviewCards } from "@/components/analytics/performance-overview-cards";
import { ScoreTrendChart } from "@/components/analytics/score-trend-chart";
import { AccuracyTrendChart } from "@/components/analytics/accuracy-trend-chart";
import { SubjectPerformanceSection } from "@/components/analytics/subject-performance-section";
import { TopicPerformanceSection } from "@/components/analytics/topic-performance-section";
import { TimeManagementCard } from "@/components/analytics/time-management-card";
import { InsightsSection } from "@/components/analytics/insights-section";
import { AnalyticsEmptyState } from "@/components/analytics/analytics-empty-state";
import type { AnalyticsPeriod } from "@/lib/validations/analytics";

export const instant = false;

export const metadata: Metadata = {
  title: "Performance Analytics & Diagnostics — MockMate",
  description: "Track your CUET UG score progression, subject accuracy, time management pacing, and topic diagnostics.",
};

interface AnalyticsPageProps {
  searchParams: Promise<{
    category?: string;
    examYear?: string;
    period?: string;
  }>;
}

export default async function AnalyticsPage({ searchParams }: AnalyticsPageProps) {
  await connection();
  const session = await getServerSession();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/analytics");
  }

  const profile = await getStudentProfile(session.user.id);
  if (!profile?.onboardingCompleted) {
    redirect("/onboarding");
  }

  const params = await searchParams;
  const category = params.category || "ALL";
  const examYear = params.examYear || "ALL";
  const period = (params.period as AnalyticsPeriod) || "all";

  const analytics = await getStudentAnalytics(
    session.user.id,
    session.user.name || "CUET Aspirant",
    {
      category,
      examYear,
      period,
    }
  );

  return (
    <StudentLayout
      activeRoute="/analytics"
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "My Performance" },
      ]}
      user={{
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        role: (session.user as { role?: string }).role,
      }}
      targetExamYear={profile.targetExamYear || 2026}
    >
      <div className="py-6 sm:py-8 bg-background min-h-screen">
        <Container size="default">
          <div className="space-y-6 sm:space-y-8">
            {/* Header & Title */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                Preparation Diagnostics &amp; Analytics
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Real-time performance indicators, normalized test scores, and syllabus mastery derived from your evaluated attempts.
              </p>
            </div>

            {/* Performance Filter Bar */}
            <AnalyticsFilterBar
              currentCategory={category}
              currentExamYear={examYear}
              currentPeriod={period}
            />

            {!analytics.hasCompletedTests ? (
              /* Empty State when 0 tests completed */
              <AnalyticsEmptyState />
            ) : (
              /* Complete Performance Dashboard */
              <div className="space-y-6 sm:space-y-8">
                {/* 1. Overall Performance Cards */}
                <PerformanceOverviewCards overview={analytics.overview} />

                {/* 2. Visual Charts: Score Progression & Accuracy Curves */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ScoreTrendChart data={analytics.scoreTrend} />
                  <AccuracyTrendChart data={analytics.scoreTrend} />
                </div>

                {/* 3. Time Management Diagnostics */}
                <TimeManagementCard
                  timeData={analytics.timeManagement}
                  completedTests={analytics.overview.completedTests}
                />

                {/* 4. Subject-Wise Mastery */}
                <SubjectPerformanceSection subjects={analytics.subjects} />

                {/* 5. Topic-Level Syllabus Breakdown */}
                <TopicPerformanceSection topics={analytics.topics} />

                {/* 6. Strengths and Priority Improvement Areas */}
                <InsightsSection
                  insights={analytics.insights}
                  hasCompletedTests={analytics.hasCompletedTests}
                />
              </div>
            )}
          </div>
        </Container>
      </div>
    </StudentLayout>
  );
}
