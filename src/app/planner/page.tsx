import React from "react";
import { redirect } from "next/navigation";
import { CalendarDays } from "lucide-react";
import { StudentLayout } from "@/components/layout/student-layout";
import { FutureModuleCard } from "@/components/dashboard/future-module-card";
import { getServerSession, getStudentProfile } from "@/lib/auth-server";

export const instant = false;

export default async function PlannerPage() {
  const session = await getServerSession();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/planner");
  }

  const profile = await getStudentProfile(session.user.id);
  if (!profile?.onboardingCompleted) {
    redirect("/onboarding");
  }

  return (
    <StudentLayout
      activeRoute="/planner"
      breadcrumbs={[
        { label: "Student Portal", href: "/dashboard" },
        { label: "Study Planner" },
      ]}
      user={session.user}
      targetExamYear={profile.targetExamYear}
    >
      <FutureModuleCard
        moduleName="Personalized CUET Study Planner"
        phaseLabel="Phase 11"
        description="Structured study timetables and daily revision targets built around your target examination year, school schedule, and enrolled domain subjects."
        icon={CalendarDays}
        capabilities={[
          "Custom daily study targets aligned to May exam countdown",
          "Balanced time allocations between Board exam prep and CUET drills",
          "Syllabus completion milestone tracking across all chosen papers",
          "Automated revision triggers for weak and unpracticed topics",
        ]}
      />
    </StudentLayout>
  );
}
