import React from "react";
import { redirect } from "next/navigation";
import { StudentLayout } from "@/components/layout/student-layout";
import { Container } from "@/components/layout/container";
import { getServerSession, getStudentProfile } from "@/lib/auth-server";
import { AIChatInterface } from "@/components/ai/ai-chat-interface";

export const instant = false;

export default async function AIAssistantPage() {
  const session = await getServerSession();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/ai-assistant");
  }

  const profile = await getStudentProfile(session.user.id);
  if (!profile?.onboardingCompleted) {
    redirect("/onboarding");
  }

  const targetYear = profile.targetExamYear || 2026;

  return (
    <StudentLayout
      activeRoute="/ai-assistant"
      breadcrumbs={[
        { label: "Student Portal", href: "/dashboard" },
        { label: "AI Study Assistant" },
      ]}
      user={session.user}
      targetExamYear={targetYear}
    >
      <div className="py-4 sm:py-6 bg-background">
        <Container size="default">
          <AIChatInterface />
        </Container>
      </div>
    </StudentLayout>
  );
}
