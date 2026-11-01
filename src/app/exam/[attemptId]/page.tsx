import React from "react";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-server";
import { getAttemptForExam, type ExamPayload } from "@/lib/cbt-service";
import { CBTExamInterface } from "@/components/exam/cbt-exam-interface";

export const instant = false;

interface ExamPageProps {
  params: Promise<{
    attemptId: string;
  }>;
}

export async function generateMetadata({
  params,
}: ExamPageProps): Promise<Metadata> {
  const { attemptId } = await params;
  return {
    title: `Examination Room — MockMate CBT Engine`,
    description: `Active computer-based test examination session for attempt ${attemptId}.`,
  };
}

export default async function ExamPage({ params }: ExamPageProps) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/exam`);
  }

  const { attemptId } = await params;

  let payload: ExamPayload | null = null;
  let isAccessDenied = false;

  try {
    payload = await getAttemptForExam(attemptId, session.user.id);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "";
    if (msg.includes("Access denied")) {
      isAccessDenied = true;
    } else {
      notFound();
    }
  }

  if (isAccessDenied) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background text-foreground">
        <div className="p-8 rounded-3xl border border-destructive/30 bg-destructive/10 max-w-md text-center space-y-3">
          <h2 className="text-lg font-bold text-destructive">Unauthorized Access</h2>
          <p className="text-xs text-muted-foreground">
            You do not have permission to view or participate in this test attempt.
          </p>
        </div>
      </div>
    );
  }

  if (!payload) {
    notFound();
  }

  // If attempt has already reached a terminal state, redirect to submission confirmation
  if (payload.attempt.status === "SUBMITTED" || payload.attempt.status === "AUTO_SUBMITTED") {
    redirect(`/exam/${attemptId}/submitted`);
  }

  return <CBTExamInterface payload={payload} />;
}
