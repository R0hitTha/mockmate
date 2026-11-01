import React from "react";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  Calendar,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { getServerSession } from "@/lib/auth-server";
import { getAttemptSubmissionSummary, type SubmissionSummary } from "@/lib/cbt-service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/brand/logo";

export const instant = false;

interface SubmissionPageProps {
  params: Promise<{
    attemptId: string;
  }>;
}

export async function generateMetadata({
  params,
}: SubmissionPageProps): Promise<Metadata> {
  const { attemptId } = await params;
  return {
    title: `Submission Confirmed — MockMate`,
    description: `Test submission confirmation for attempt ${attemptId}.`,
  };
}

export default async function SubmissionPage({ params }: SubmissionPageProps) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    redirect(`/login`);
  }

  const { attemptId } = await params;
  let summary: SubmissionSummary | null = null;

  try {
    summary = await getAttemptSubmissionSummary(attemptId, session.user.id);
  } catch {
    notFound();
  }

  if (!summary) {
    notFound();
  }

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "N/A";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formattedSubmittedDate = summary.submittedAt
    ? new Date(summary.submittedAt).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "Just now";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      {/* Minimal Header */}
      <header className="h-16 border-b border-border bg-surface px-6 flex items-center justify-between shrink-0">
        <Logo size="default" href="/dashboard" />
        <Badge variant="outline" className="text-xs font-mono">
          {summary.testCode}
        </Badge>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-8">
        <div className="bg-surface border border-border rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-lg space-y-6">
          {/* Status Hero */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <Badge
                variant={summary.status === "AUTO_SUBMITTED" ? "secondary" : "default"}
                className="mb-2 text-xs"
              >
                {summary.status === "AUTO_SUBMITTED"
                  ? "Time Expired • Auto-Submitted"
                  : "Submitted by Student"}
              </Badge>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                Examination Submitted Successfully
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Your responses for <strong>{summary.testTitle}</strong> have been securely recorded.
              </p>
            </div>
          </div>

          {/* Response Breakdown Summary */}
          <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border text-xs">
              <span className="text-muted-foreground font-medium">Attempt Reference</span>
              <span className="font-mono font-bold text-foreground truncate max-w-[200px]">
                {summary.attemptId}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-background border border-border">
                <span className="text-[10px] text-muted-foreground block">Total Questions</span>
                <span className="font-bold text-foreground text-sm font-mono">
                  {summary.totalQuestions}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block font-medium">
                  Answered
                </span>
                <span className="font-bold text-emerald-800 dark:text-emerald-300 text-sm font-mono">
                  {summary.answeredCount}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30">
                <span className="text-[10px] text-rose-700 dark:text-rose-400 block font-medium">
                  Unanswered
                </span>
                <span className="font-bold text-rose-800 dark:text-rose-300 text-sm font-mono">
                  {summary.unansweredCount}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30">
                <span className="text-[10px] text-purple-700 dark:text-purple-400 block font-medium">
                  Marked Review
                </span>
                <span className="font-bold text-purple-800 dark:text-purple-300 text-sm font-mono">
                  {summary.markedForReviewCount}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-primary" />
                Time Spent: <strong>{formatDuration(summary.timeTaken)}</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                {formattedSubmittedDate}
              </span>
            </div>
          </div>

          {/* Scope Boundary Notice for Phase 10 */}
          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 text-xs space-y-1.5 text-foreground">
            <div className="flex items-center gap-2 font-bold text-primary">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Evaluation in Progress (Phase 10)</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Your test has been submitted successfully. Your result, score breakdown (+5 / -1),
              and detailed solutions will be available after evaluation.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button variant="outline" size="sm" className="w-full text-xs">
                Return to Dashboard
              </Button>
            </Link>

            <Link href="/mock-tests" className="w-full sm:w-auto">
              <Button size="sm" className="w-full text-xs font-bold shadow-xs">
                <span>Explore More Mock Tests</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="h-12 border-t border-border bg-surface px-6 flex items-center justify-center text-[11px] text-muted-foreground">
        MockMate CBT Examination Engine • Session Recorded &amp; Synchronized
      </footer>
    </div>
  );
}
