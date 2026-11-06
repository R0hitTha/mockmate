import React from "react";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import Link from "next/link";
import { ArrowLeft, FileCheck2 } from "lucide-react";
import { getServerSession } from "@/lib/auth-server";
import { getResultById, getResultByAttemptId, evaluateAttempt } from "@/lib/evaluation-service";
import { StudentLayout } from "@/components/layout/student-layout";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { ResultSummary } from "@/components/results/result-summary";
import { SectionBreakdown } from "@/components/results/section-breakdown";
import { QuestionSolutionViewer } from "@/components/results/question-solution-viewer";
import type { TestResultData } from "@/lib/validations/evaluation";

export const instant = false;

interface ResultPageProps {
  params: Promise<{
    resultId: string;
  }>;
}

export async function generateMetadata({
  params,
}: ResultPageProps): Promise<Metadata> {
  const { resultId } = await params;
  return {
    title: `Result & Scorecard — MockMate`,
    description: `Performance scorecard and detailed question solutions for attempt ${resultId}.`,
  };
}

export default async function ResultPage({ params }: ResultPageProps) {
  await connection();
  const session = await getServerSession();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { resultId } = await params;
  const isAdmin = (session.user as { role?: string }).role === "ADMIN";

  let result: TestResultData | null = null;

  try {
    // 1. Try finding by direct result ID
    result = await getResultById(resultId, session.user.id, isAdmin);

    // 2. If not found by result ID, try finding by attempt ID
    if (!result) {
      result = await getResultByAttemptId(resultId, session.user.id, isAdmin);
    }

    // 3. If still not evaluated yet, trigger server evaluation
    if (!result) {
      result = await evaluateAttempt(resultId, session.user.id, isAdmin, false);
    }
  } catch (err: unknown) {
    const msg = (err as Error).message || "";
    if (msg.includes("Access denied")) {
      redirect("/dashboard");
    }
  }

  if (!result) {
    notFound();
  }

  return (
    <StudentLayout
      activeRoute="/results"
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "My Results", href: "/results" },
        { label: result.testTitle },
      ]}
      user={{
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        role: (session.user as { role?: string }).role,
      }}
      targetExamYear={result.examYear || 2026}
    >
      <div className="py-6 sm:py-8 bg-background min-h-screen">
        <Container size="default">
          <div className="space-y-8">
            {/* Top Navigation Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 print:hidden">
              <Link href="/results">
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                  <span>Back to Results History</span>
                </Button>
              </Link>

              <div className="flex items-center gap-2">
                <Link href="/mock-tests">
                  <Button variant="outline" size="sm" className="text-xs">
                    <FileCheck2 className="w-3.5 h-3.5 mr-1.5" />
                    <span>Practice More Tests</span>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Section 1: Scorecard & Overall Performance Summary */}
            <ResultSummary result={result} />

            {/* Section 2: Section-Wise Performance Matrix */}
            <SectionBreakdown sections={result.sections} />

            {/* Section 3: Question-by-Question Solution Browser */}
            <QuestionSolutionViewer questions={result.questions} />
          </div>
        </Container>
      </div>
    </StudentLayout>
  );
}
