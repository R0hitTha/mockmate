import React from "react";
import { redirect } from "next/navigation";
import { Bookmark } from "lucide-react";
import { StudentLayout } from "@/components/layout/student-layout";
import { FutureModuleCard } from "@/components/dashboard/future-module-card";
import { getServerSession, getStudentProfile } from "@/lib/auth-server";

export const instant = false;

export default async function BookmarksPage() {
  const session = await getServerSession();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/bookmarks");
  }

  const profile = await getStudentProfile(session.user.id);
  if (!profile?.onboardingCompleted) {
    redirect("/onboarding");
  }

  return (
    <StudentLayout
      activeRoute="/bookmarks"
      breadcrumbs={[
        { label: "Student Portal", href: "/dashboard" },
        { label: "Bookmarks" },
      ]}
      user={session.user}
      targetExamYear={profile.targetExamYear}
    >
      <FutureModuleCard
        moduleName="Saved Questions & Revision Notebook"
        phaseLabel="Phase 12"
        description="Your personal question repository to save tricky questions, critical formulas, and high-frequency CUET problems for quick revision before exam day."
        icon={Bookmark}
        capabilities={[
          "1-click question bookmarking directly from CBT mock exams and practice drills",
          "Custom revision tags (Tricky, Formula, Repeated Mistakes, High Yield)",
          "Personal student notes and explanation highlights",
          "Exportable formula and question revision sets",
        ]}
      />
    </StudentLayout>
  );
}
