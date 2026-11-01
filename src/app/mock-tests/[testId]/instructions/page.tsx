import React from "react";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getServerSession, getStudentProfile } from "@/lib/auth-server";
import { getMockTestById } from "@/lib/mock-test-service";
import { InstructionsViewer } from "@/components/exam/instructions-viewer";

export const instant = false;

interface InstructionsPageProps {
  params: Promise<{
    testId: string;
  }>;
}

export async function generateMetadata({
  params,
}: InstructionsPageProps): Promise<Metadata> {
  const { testId } = await params;
  const test = await getMockTestById(testId, true);
  return {
    title: test ? `Instructions: ${test.title} — MockMate` : "Examination Instructions — MockMate",
  };
}

export default async function InstructionsPage({ params }: InstructionsPageProps) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/mock-tests`);
  }

  const profile = await getStudentProfile(session.user.id);
  if (!profile?.onboardingCompleted) {
    redirect("/onboarding");
  }

  const { testId } = await params;
  const test = await getMockTestById(testId, true);

  if (!test || test.status !== "PUBLISHED") {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center">
      <InstructionsViewer
        test={{
          id: test.id,
          title: test.title,
          testCode: test.testCode,
          totalDuration: test.totalDuration,
          totalMarks: test.totalMarks,
          totalQuestions: test.totalQuestions,
          questionsToAttempt: test.questionsToAttempt,
          isOfficialPattern: test.isOfficialPattern,
          instructions: test.instructions,
          sections: test.sections.map((s) => ({
            id: s.id,
            title: s.title,
            subjectName: s.subjectName,
            subjectCode: s.subjectCode,
            sectionType: s.sectionType,
            totalQuestions: s.totalQuestions,
            questionsToAttempt: s.questionsToAttempt,
            totalMarks: s.totalMarks,
          })),
        }}
      />
    </div>
  );
}

