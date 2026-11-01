import React from "react";
import { redirect } from "next/navigation";
import { BarChart3 } from "lucide-react";
import { StudentLayout } from "@/components/layout/student-layout";
import { FutureModuleCard } from "@/components/dashboard/future-module-card";
import { getServerSession, getStudentProfile } from "@/lib/auth-server";

export const instant = false;

export default async function AnalyticsPage() {
  const session = await getServerSession();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/analytics");
  }

  const profile = await getStudentProfile(session.user.id);
  if (!profile?.onboardingCompleted) {
    redirect("/onboarding");
  }

  return (
    <StudentLayout
      activeRoute="/analytics"
      breadcrumbs={[
        { label: "Student Portal", href: "/dashboard" },
        { label: "My Performance" },
      ]}
      user={session.user}
      targetExamYear={profile.targetExamYear}
    >
      <FutureModuleCard
        moduleName="Comprehensive Performance & Mistake Analytics"
        phaseLabel="Phase 10"
        description="Deep diagnostics analyzing your test scores, subject accuracy, time management patterns, and mistake patterns to unlock higher percentile bands."
        icon={BarChart3}
        capabilities={[
          "Historical score progression curves per CUET test paper",
          "Mistake Intelligence categorizing conceptual vs calculation errors",
          "Time-per-question analysis identifying speed bottlenecks",
          "Percentile benchmarking against thousands of CUET aspirants nationwide",
        ]}
      />
    </StudentLayout>
  );
}
