import React from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import Link from "next/link";
import { AlertCircle, ArrowRight, BookOpen } from "lucide-react";
import { StudentLayout } from "@/components/layout/student-layout";
import { Button } from "@/components/ui/button";
import { getServerSession, getStudentProfile } from "@/lib/auth-server";
import { getStudentMistakesPayload } from "@/lib/mistake-service";
import { MistakeOverviewCards } from "@/components/mistakes/mistake-overview-cards";
import { MistakeCategoriesCard } from "@/components/mistakes/mistake-categories-card";
import { MistakeTrendChart } from "@/components/mistakes/mistake-trend-chart";
import { TopicsToRevisitSection } from "@/components/mistakes/topics-to-revisit-section";
import { MistakeRecommendationsCard } from "@/components/mistakes/mistake-recommendations-card";
import { MistakeEmptyState } from "@/components/mistakes/mistake-empty-state";

export const instant = false;

export default async function MistakesPage() {
  await connection();
  const session = await getServerSession();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/mistakes");
  }

  const profile = await getStudentProfile(session.user.id);
  if (!profile?.onboardingCompleted) {
    redirect("/onboarding");
  }

  const payload = await getStudentMistakesPayload(session.user.id);

  return (
    <StudentLayout
      activeRoute="/mistakes"
      breadcrumbs={[
        { label: "Student Portal", href: "/dashboard" },
        { label: "Mistake Intelligence" },
      ]}
      user={session.user}
      targetExamYear={profile.targetExamYear}
    >
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Mistake Intelligence
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Transform wrong answers and skipped questions from completed CUET mock exams into a structured revision engine.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button asChild className="gap-2 text-xs font-semibold h-9">
              <Link href="/mistakes/review">
                <BookOpen className="w-4 h-4" />
                <span>Open Mistake Review</span>
                {payload.overview.pendingReviewCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-white text-primary text-[10px] font-bold">
                    {payload.overview.pendingReviewCount}
                  </span>
                )}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <MistakeOverviewCards overview={payload.overview} />

        {payload.hasMistakes ? (
          <div className="space-y-6">
            {/* Targeted Recommendations */}
            <MistakeRecommendationsCard recommendations={payload.recommendations} />

            {/* Grid: Mistake Trend + Classifications */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MistakeTrendChart
                trend={payload.trend}
                hasEnoughData={payload.hasEnoughDataForTrend}
              />
              <MistakeCategoriesCard categories={payload.categoryBreakdown} />
            </div>

            {/* Recurring Topic Struggles */}
            <TopicsToRevisitSection topics={payload.topicsToRevisit} />
          </div>
        ) : (
          <MistakeEmptyState />
        )}
      </div>
    </StudentLayout>
  );
}

