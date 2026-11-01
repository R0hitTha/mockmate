import React from "react";
import { redirect } from "next/navigation";
import { StudentLayout } from "@/components/layout/student-layout";
import { Container } from "@/components/layout/container";
import { getServerSession, getStudentProfile } from "@/lib/auth-server";
import { getStudentResults } from "@/lib/evaluation-service";
import { getStudentDashboardAnalytics } from "@/lib/analytics-service";
import { getStudentDashboardMistakeSummary } from "@/lib/mistake-service";
import { getStudentStudyPlannerData } from "@/lib/study-planner-service";
import { WelcomeBanner } from "@/components/dashboard/welcome-banner";
import { OverviewMetrics } from "@/components/dashboard/overview-metrics";
import { ContinuePreparationCard } from "@/components/dashboard/continue-preparation-card";
import { MySubjectsSection } from "@/components/dashboard/my-subjects-section";
import { RecentActivitySection } from "@/components/dashboard/recent-activity-section";
import { PerformanceSnapshotSection } from "@/components/dashboard/performance-snapshot-section";
import { DashboardMistakeCard } from "@/components/mistakes/dashboard-mistake-card";
import { DashboardStudyPlannerCard } from "@/components/planner/dashboard-study-planner-card";
import { PreparationRecommendations } from "@/components/dashboard/preparation-recommendations";
import { UpcomingDeadlines } from "@/components/dashboard/upcoming-deadlines";

export const instant = false;

export default async function DashboardPage() {
  const session = await getServerSession();

  // Route protection: Must be authenticated
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard");
  }

  // Fetch real student profile from database
  const profile = await getStudentProfile(session.user.id);

  // If student hasn't completed onboarding, redirect to onboarding flow
  if (!profile || !profile.onboardingCompleted) {
    redirect("/onboarding");
  }

  const studentName = session.user.name || "CUET Aspirant";
  const targetYear = profile.targetExamYear || 2026;
  const stream = profile.stream || "General";
  const academicStatus = profile.academicStatus;
  const subjects = profile.subjectPreferences || [];
  const universities = profile.universityPreferences || [];
  const hasGeneralTest = subjects.some((s) => s.category === "GENERAL_TEST");

  // Fetch real evaluated mock test results for metrics
  const { results: studentResults, total: testsAttempted } = await getStudentResults(
    session.user.id,
    { page: 1, limit: 10, sortBy: "date", sortOrder: "desc" }
  );

  const questionsAnswered = studentResults.reduce(
    (sum, r) => sum + r.correctCount + r.incorrectCount,
    0
  );

  const totalAttemptedQuestions = questionsAnswered;
  const totalCorrectQuestions = studentResults.reduce(
    (sum, r) => sum + r.correctCount,
    0
  );

  const averageAccuracy =
    totalAttemptedQuestions > 0
      ? Math.round((totalCorrectQuestions / totalAttemptedQuestions) * 1000) / 10
      : null;

  const activities = studentResults.map((r) => ({
    id: r.id,
    type: "MOCK_EXAM" as const,
    title: r.testTitle,
    score: r.totalMarks,
    maxScore: r.maximumMarks,
    completedAt: new Date(r.evaluatedAt).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
  }));

  const dashboardAnalytics = await getStudentDashboardAnalytics(session.user.id);
  const mistakeSummary = await getStudentDashboardMistakeSummary(session.user.id);
  const plannerData = await getStudentStudyPlannerData(session.user.id);

  return (
    <StudentLayout
      activeRoute="/dashboard"
      breadcrumbs={[
        { label: "Student Portal", href: "/dashboard" },
        { label: "Dashboard" },
      ]}
      user={{
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        role: (session.user as { role?: string }).role,
      }}
      targetExamYear={targetYear}
    >
      <div className="py-2 sm:py-4 bg-background">
        <Container size="default">
          <div className="space-y-8">
            {/* Section 1: Personalized Welcome Banner */}
            <WelcomeBanner
              name={studentName}
              targetExamYear={targetYear}
              stream={stream}
              academicStatus={academicStatus}
            />

            {/* Section 2: Real Preparation Overview Metrics */}
            <OverviewMetrics
              testsAttempted={testsAttempted}
              questionsAnswered={questionsAnswered}
              averageAccuracy={averageAccuracy}
              syllabusCoverage={null}
            />

            {/* Section 3: Continue Preparation / Next Action */}
            <ContinuePreparationCard
              enrolledSubjectCount={subjects.length}
              targetExamYear={targetYear}
            />

            {/* Two-Column Structured Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Main Column (2 spans on desktop) */}
              <div className="lg:col-span-2 space-y-8">
                {/* Section 4: My Subjects */}
                <MySubjectsSection subjects={subjects} targetExamYear={targetYear} />

                {/* Section 6: Performance Snapshot */}
                <PerformanceSnapshotSection
                  completedTests={dashboardAnalytics.completedTests}
                  averageAccuracy={dashboardAnalytics.averageAccuracy}
                  latestScore={
                    dashboardAnalytics.latestResult
                      ? {
                          testTitle: dashboardAnalytics.latestResult.testTitle,
                          totalMarks: dashboardAnalytics.latestResult.totalMarks,
                          maximumMarks: dashboardAnalytics.latestResult.maximumMarks,
                          percentage: dashboardAnalytics.latestResult.percentage,
                        }
                      : null
                  }
                  strongestSubject={
                    dashboardAnalytics.strongestSubject
                      ? {
                          subjectName: dashboardAnalytics.strongestSubject.subjectName,
                          accuracy: dashboardAnalytics.strongestSubject.accuracy,
                        }
                      : null
                  }
                  priorityImprovement={
                    dashboardAnalytics.priorityImprovement
                      ? {
                          title: dashboardAnalytics.priorityImprovement.title,
                          description: dashboardAnalytics.priorityImprovement.description,
                        }
                      : null
                  }
                />

                {/* Section 5: Recent Activity */}
                <RecentActivitySection activities={activities} />
              </div>

              {/* Sidebar Column (1 span on desktop) */}
              <div className="space-y-8">
                {/* Section: Study Planner */}
                <DashboardStudyPlannerCard
                  weeklyTargetMinutes={plannerData.weeklyTargetMinutes}
                  completedMinutes={plannerData.completedMinutes}
                  progressPercentage={plannerData.progressPercentage}
                  todayTasksCount={plannerData.todayTasks.length}
                  nextTaskTitle={plannerData.todayTasks[0]?.title || null}
                  hasActivePlan={Boolean(plannerData.activePlan)}
                />

                {/* Section: Mistake Intelligence */}
                <DashboardMistakeCard
                  pendingReviewCount={mistakeSummary.pendingReviewCount}
                  totalIncorrect={mistakeSummary.totalIncorrect}
                  recurringErrorTopicsCount={mistakeSummary.recurringErrorTopicsCount}
                  topStruggleTopic={mistakeSummary.topStruggleTopic}
                  hasMistakes={mistakeSummary.hasMistakes}
                />

                {/* Section 7: Preparation Recommendations */}
                <PreparationRecommendations
                  targetExamYear={targetYear}
                  stream={stream}
                  subjectCount={subjects.length}
                  hasGeneralTest={hasGeneralTest}
                  universityCount={universities.length}
                />

                {/* Section 8: Upcoming Key Deadlines */}
                <UpcomingDeadlines targetExamYear={targetYear} />
              </div>
            </div>
          </div>
        </Container>
      </div>
    </StudentLayout>
  );
}
