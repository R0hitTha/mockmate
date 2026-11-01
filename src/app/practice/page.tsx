import React from "react";
import { redirect } from "next/navigation";
import { BookOpen } from "lucide-react";
import { StudentLayout } from "@/components/layout/student-layout";
import { FutureModuleCard } from "@/components/dashboard/future-module-card";
import { getServerSession, getStudentProfile } from "@/lib/auth-server";

export const instant = false;

export default async function PracticePage() {
  const session = await getServerSession();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/practice");
  }

  const profile = await getStudentProfile(session.user.id);
  if (!profile?.onboardingCompleted) {
    redirect("/onboarding");
  }

  return (
    <StudentLayout
      activeRoute="/practice"
      breadcrumbs={[
        { label: "Student Portal", href: "/dashboard" },
        { label: "Subject Practice" },
      ]}
      user={session.user}
      targetExamYear={profile.targetExamYear}
    >
      <FutureModuleCard
        moduleName="Topic-Wise & Chapter-Wise Practice Drills"
        phaseLabel="Phase 6 & Phase 8"
        description="Focused practice drills across your enrolled CUET languages, domain subjects, and general aptitude papers with instant step-by-step explanations."
        icon={BookOpen}
        capabilities={[
          "Micro-drills categorized by NCERT Class 12 chapters and topics",
          "Custom drill builder: select question quantity, timer, and difficulty",
          "Immediate answer checking with complete mathematical & conceptual solutions",
          "Continuous mastery tracking per syllabus subtopic",
        ]}
      />
    </StudentLayout>
  );
}
