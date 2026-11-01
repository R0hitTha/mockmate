import React from "react";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileCheck2, AlertCircle } from "lucide-react";
import { getServerSession, getStudentProfile } from "@/lib/auth-server";
import { StudentLayout } from "@/components/layout/student-layout";
import { Badge } from "@/components/ui/badge";
import { getMockTestById } from "@/lib/mock-test-service";
import { StartTestDialog } from "@/components/mock-tests/start-test-dialog";



export const instant = false;

interface StudentMockTestDetailPageProps {
  params: Promise<{
    testId: string;
  }>;
}

export async function generateMetadata({
  params,
}: StudentMockTestDetailPageProps): Promise<Metadata> {
  const { testId } = await params;
  const test = await getMockTestById(testId, true);
  return {
    title: test ? `${test.title} — MockMate` : "Mock Test Overview — MockMate",
    description: test?.description || "CUET UG mock examination paper.",
  };
}

export default async function StudentMockTestDetailPage({
  params,
}: StudentMockTestDetailPageProps) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/mock-tests`);
  }

  const profile = await getStudentProfile(session.user.id);
  if (!profile?.onboardingCompleted) {
    redirect("/onboarding");
  }

  const { testId } = await params;
  // SECURITY: Pass isStudent = true to sanitize answer keys and explanations
  const test = await getMockTestById(testId, true);

  if (!test) {
    notFound();
  }

  return (
    <StudentLayout
      activeRoute="/mock-tests"
      breadcrumbs={[
        { label: "Student Portal", href: "/dashboard" },
        { label: "Mock Test Library", href: "/mock-tests" },
        { label: test.testCode },
      ]}
      user={session.user}
      targetExamYear={profile.targetExamYear}
    >
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Top Back Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/mock-tests"
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Mock Test Library</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">
              CUET UG {test.examYear}
            </span>
          </div>
        </div>

        {/* Header Hero Card */}
        <div className="bg-surface border border-border rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-md">
              {test.testCode}
            </span>
            <Badge variant="outline" className="text-xs">
              {test.testType.replace("_", " ")}
            </Badge>
            <Badge
              variant={
                test.difficulty === "HARD"
                  ? "destructive"
                  : test.difficulty === "MEDIUM"
                  ? "secondary"
                  : "outline"
              }
              className="text-xs"
            >
              {test.difficulty} Difficulty
            </Badge>
            {test.isOfficialPattern && (
              <Badge
                variant="outline"
                className="text-xs border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5"
              >
                Official NTA Pattern
              </Badge>
            )}
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              {test.title}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed max-w-3xl">
              {test.description ||
                "Standardized computer-based examination adhering to the NTA CUET format."}
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-border/60">
            <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/50">
              <span className="text-[11px] text-muted-foreground block font-medium">Duration</span>
              <span className="text-base sm:text-lg font-bold text-foreground mt-0.5 block font-mono">
                {test.totalDuration} Minutes
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/50">
              <span className="text-[11px] text-muted-foreground block font-medium">Total Marks</span>
              <span className="text-base sm:text-lg font-bold text-foreground mt-0.5 block font-mono">
                {test.totalMarks} Marks
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/50">
              <span className="text-[11px] text-muted-foreground block font-medium">To Attempt</span>
              <span className="text-base sm:text-lg font-bold text-foreground mt-0.5 block font-mono">
                {test.questionsToAttempt} of {test.totalQuestions} Qs
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/50">
              <span className="text-[11px] text-muted-foreground block font-medium">Marking Scheme</span>
              <span className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block font-mono">
                +5 / -1 Marks
              </span>
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Sections & Instructions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Section Breakdown Card */}
            <div className="bg-surface border border-border rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-foreground">Examination Sections</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Structure and question requirements for this paper.
                  </p>
                </div>
                <Badge variant="outline" className="text-xs font-mono">
                  {test.sections.length} Section{test.sections.length !== 1 ? "s" : ""}
                </Badge>
              </div>

              <div className="space-y-3">
                {test.sections.map((section, idx) => (
                  <div
                    key={section.id}
                    className="p-4 rounded-2xl border border-border bg-background space-y-2.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <h4 className="text-sm font-bold text-foreground">{section.title}</h4>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">
                          {section.subjectName} ({section.subjectCode})
                        </Badge>
                        <Badge
                          variant={section.sectionType === "COMPULSORY" ? "secondary" : "outline"}
                          className="text-[10px]"
                        >
                          {section.sectionType}
                        </Badge>
                      </div>
                    </div>

                    {section.description && (
                      <p className="text-xs text-muted-foreground pl-8">
                        {section.description}
                      </p>
                    )}

                    <div className="pl-8 pt-1 flex flex-wrap items-center gap-4 text-xs font-mono text-muted-foreground">
                      <span>Total: {section.totalQuestions} Questions</span>
                      <span>•</span>
                      <span className="text-foreground font-semibold">
                        Must Attempt: {section.questionsToAttempt}
                      </span>
                      <span>•</span>
                      <span>Max: {section.totalMarks} Marks</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Test Instructions Card */}
            <div className="bg-surface border border-border rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-primary" />
                <h3 className="text-base font-bold text-foreground">
                  Official Examination Guidelines & Rules
                </h3>
              </div>

              <div className="text-xs text-foreground space-y-3 leading-relaxed bg-muted/20 p-5 rounded-2xl border border-border font-sans whitespace-pre-line">
                {test.instructions ||
                  `1. The test consists of multiple-choice questions (MCQs).\n2. Each correct answer carries 5 marks.\n3. Each wrong answer incurs a deduction of 1 mark (-1).\n4. Questions not answered carry 0 marks.`}
              </div>

              <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Please ensure you have an uninterrupted Internet connection and a quiet environment
                  before initiating the computer-based examination.
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: CTA & Summary Sidebar */}
          <div className="space-y-6">
            <div className="bg-surface border border-border rounded-3xl p-6 shadow-xs space-y-5 sticky top-24">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  Ready to Attempt?
                </span>
                <h3 className="text-lg font-bold text-foreground mt-0.5">
                  Launch Examination
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Once started, the timer will count down continuously according to official NTA protocol.
                </p>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between py-2 border-b border-border/60">
                  <span className="text-muted-foreground">Examination Mode</span>
                  <span className="font-semibold text-foreground">Computer-Based (CBT)</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/60">
                  <span className="text-muted-foreground">Question Optionality</span>
                  <span className="font-semibold text-foreground">
                    {test.questionsToAttempt} of {test.totalQuestions}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/60">
                  <span className="text-muted-foreground">Negative Deduction</span>
                  <span className="font-semibold text-destructive">-1 Mark per error</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/60">
                  <span className="text-muted-foreground">Language Medium</span>
                  <span className="font-semibold text-foreground">English (Standard)</span>
                </div>
              </div>

              <div className="pt-2">
                <StartTestDialog
                  testTitle={test.title}
                  testCode={test.testCode}
                  testSlug={test.slug}
                  totalDuration={test.totalDuration}
                  totalMarks={test.totalMarks}
                  questionsToAttempt={test.questionsToAttempt}
                  totalQuestions={test.totalQuestions}
                  sectionsCount={test.sections.length}
                />
              </div>

              <p className="text-[11px] text-muted-foreground text-center">
                Strict anti-leakage security enabled. Question answers remain masked until evaluation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
