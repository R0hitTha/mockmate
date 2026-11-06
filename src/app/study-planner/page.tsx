import React from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { StudentLayout } from "@/components/layout/student-layout";
import { Container } from "@/components/layout/container";
import { getServerSession, getStudentProfile } from "@/lib/auth-server";
import { getStudentStudyPlannerData } from "@/lib/study-planner-service";
import { StudyPlannerClientView } from "./study-planner-client-view";

export const instant = false;

export default async function StudyPlannerPage() {
  await connection();
  const session = await getServerSession();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/study-planner");
  }

  const profile = await getStudentProfile(session.user.id);
  if (!profile?.onboardingCompleted) {
    redirect("/onboarding");
  }

  const targetYear = profile.targetExamYear || 2026;
  const initialData = await getStudentStudyPlannerData(session.user.id);

  return (
    <StudentLayout
      activeRoute="/study-planner"
      breadcrumbs={[
        { label: "Student Portal", href: "/dashboard" },
        { label: "Study Planner" },
      ]}
      user={session.user}
      targetExamYear={targetYear}
    >
      <div className="py-4 sm:py-6 bg-background">
        <Container size="default">
          <StudyPlannerClientView
            initialData={initialData}
            studentName={session.user.name || "Student"}
            targetYear={targetYear}
          />
        </Container>
      </div>
    </StudentLayout>
  );
}
