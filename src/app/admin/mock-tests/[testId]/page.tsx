import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";
import { requireRole } from "@/lib/auth-server";
import { AdminLayout } from "@/components/layout/admin-layout";
import { MockTestBuilder } from "@/components/admin/mock-tests/mock-test-builder";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getMockTestById, getAvailableQuestionsForTestBuilder } from "@/lib/mock-test-service";
import { getSubjects, getExamYears } from "@/lib/syllabus-service";



export const instant = false;

interface MockTestDetailPageProps {
  params: Promise<{
    testId: string;
  }>;
}

export async function generateMetadata({
  params,
}: MockTestDetailPageProps): Promise<Metadata> {
  const { testId } = await params;
  const test = await getMockTestById(testId, false);
  return {
    title: test ? `${test.title} — MockMate Admin` : "Mock Test Details — MockMate Admin",
  };
}

export default async function AdminMockTestDetailPage({
  params,
}: MockTestDetailPageProps) {
  const session = await requireRole(["ADMIN", "CONTENT_CREATOR", "FACULTY"]);
  const { testId } = await params;

  const [test, subjects, examYears, availableQuestions] = await Promise.all([
    getMockTestById(testId, false),
    getSubjects(),
    getExamYears(),
    getAvailableQuestionsForTestBuilder({ limit: 60 }),
  ]);

  if (!test) {
    notFound();
  }

  const isLocked = test.attemptsCount > 0;

  return (
    <AdminLayout
      activeRoute="/admin/mock-tests"
      breadcrumbs={[
        { label: "Admin Portal", href: "/admin" },
        { label: "Mock Test Library", href: "/admin/mock-tests" },
        { label: test.testCode },
      ]}
      user={session.user}
    >
      <div className="space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/mock-tests"
              className="p-2 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-primary">{test.testCode}</span>
                <Badge
                  variant={
                    test.status === "PUBLISHED"
                      ? "default"
                      : test.status === "IN_REVIEW"
                      ? "secondary"
                      : "outline"
                  }
                  className="text-[10px]"
                >
                  {test.status}
                </Badge>
                {test.isOfficialPattern && (
                  <Badge variant="outline" className="text-[10px] text-primary border-primary/30">
                    Official CUET Pattern
                  </Badge>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground mt-0.5">
                {test.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/mock-tests/${test.slug}`} target="_blank">
              <Button variant="outline" size="sm" className="text-xs">
                View Student Preview
              </Button>
            </Link>
          </div>
        </div>

        {/* Lock Banner if Attempts Exist */}
        {isLocked && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-amber-800 dark:text-amber-300">
            <Lock className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-bold">Test Locked — Historical Student Attempts Recorded</p>
              <p className="mt-0.5">
                This mock test has {test.attemptsCount} student attempt(s) recorded in the database.
                To protect student rank, scores, and historical evaluation integrity, the question
                assignment, marking scheme, and test structure cannot be destructively altered.
              </p>
            </div>
          </div>
        )}

        {/* Overview Metadata Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl border border-border bg-surface">
            <span className="text-xs text-muted-foreground block">Allocated Time</span>
            <span className="text-xl font-bold text-foreground mt-1 block">
              {test.totalDuration} Mins
            </span>
          </div>

          <div className="p-4 rounded-2xl border border-border bg-surface">
            <span className="text-xs text-muted-foreground block">Max Marks</span>
            <span className="text-xl font-bold text-foreground mt-1 block">
              {test.totalMarks} Marks
            </span>
          </div>

          <div className="p-4 rounded-2xl border border-border bg-surface">
            <span className="text-xs text-muted-foreground block">Questions</span>
            <span className="text-xl font-bold text-foreground mt-1 block">
              {test.totalQuestions} ({test.questionsToAttempt} to attempt)
            </span>
          </div>

          <div className="p-4 rounded-2xl border border-border bg-surface">
            <span className="text-xs text-muted-foreground block">Academic Target</span>
            <span className="text-xl font-bold text-foreground mt-1 block">
              CUET {test.examYear}
            </span>
          </div>
        </div>

        {/* Test Builder / Editor Interface */}
        <div className="pt-2">
          <MockTestBuilder
            subjects={subjects.map((s) => ({
              id: s.id,
              name: s.name,
              code: s.code,
              slug: s.slug,
            }))}
            examYears={examYears.map((y) => ({
              id: y.id,
              year: y.year,
            }))}
            availableQuestions={availableQuestions}
            initialData={test}
          />
        </div>
      </div>
    </AdminLayout>
  );
}
