import React from "react";
import { redirect } from "next/navigation";
import { StudentLayout } from "@/components/layout/student-layout";
import { Container } from "@/components/layout/container";
import { getServerSession, getStudentProfile } from "@/lib/auth-server";
import { getStudentStudyPreferences } from "@/lib/study-planner-service";
import { PlannerSettingsClientView } from "./planner-settings-client-view";

export const instant = false;

export default async function PlannerSettingsPage() {
  const session = await getServerSession();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/study-planner/settings");
  }

  const profile = await getStudentProfile(session.user.id);
  if (!profile?.onboardingCompleted) {
    redirect("/onboarding");
  }

  const targetYear = profile.targetExamYear || 2026;
  const preferences = await getStudentStudyPreferences(session.user.id);

  return (
    <StudentLayout
      activeRoute="/study-planner"
      breadcrumbs={[
        { label: "Student Portal", href: "/dashboard" },
        { label: "Study Planner", href: "/study-planner" },
        { label: "Settings" },
      ]}
      user={session.user}
      targetExamYear={targetYear}
    >
      <div className="py-4 sm:py-6 bg-background">
        <Container size="sm">
          <PlannerSettingsClientView initialPreferences={preferences} />
        </Container>
      </div>
    </StudentLayout>
  );
}
