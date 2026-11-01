import React from "react";
import { redirect } from "next/navigation";
import { FileCheck2 } from "lucide-react";
import { StudentLayout } from "@/components/layout/student-layout";
import { FutureModuleCard } from "@/components/dashboard/future-module-card";
import { getServerSession, getStudentProfile } from "@/lib/auth-server";

export const instant = false;

export default async function MockTestsPage() {
  const session = await getServerSession();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/tests");
  }

  const profile = await getStudentProfile(session.user.id);
  if (!profile?.onboardingCompleted) {
    redirect("/onboarding");
  }

  return (
    <StudentLayout
      activeRoute="/tests"
      breadcrumbs={[
        { label: "Student Portal", href: "/dashboard" },
        { label: "Mock Tests" },
      ]}
      user={session.user}
      targetExamYear={profile.targetExamYear}
    >
      <FutureModuleCard
        moduleName="CUET UG Full-Length Mock Examinations"
        phaseLabel="Phase 7 & Phase 9"
        description="Authentic computer-based test (CBT) examination simulator adhering strictly to the NTA CUET format, marking scheme (+5 / -1), and timed section delivery."
        icon={FileCheck2}
        capabilities={[
          "Full-length multi-subject examinations with exact NTA question palettes",
          "Timed countdown clock with automatic answer persistence",
          "Question tagging: Answered, Marked for Review, and Unvisited states",
          "Detailed post-test solutions with NCERT reference citations",
        ]}
      />
    </StudentLayout>
  );
}
