import React from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  FileCheck2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { getServerSession, getStudentProfile } from "@/lib/auth-server";
import { StudentLayout } from "@/components/layout/student-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getStudentMockTests } from "@/lib/mock-test-service";



export const instant = false;

export const metadata: Metadata = {
  title: "Mock Test Library — MockMate",
  description:
    "Official computer-based mock examinations for CUET UG 2026 and 2027 preparation.",
};

interface StudentMockTestsPageProps {
  searchParams: Promise<{
    q?: string;
    type?: string;
    difficulty?: string;
  }>;
}

export default async function StudentMockTestsPage({
  searchParams,
}: StudentMockTestsPageProps) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/mock-tests");
  }

  const profile = await getStudentProfile(session.user.id);
  if (!profile?.onboardingCompleted) {
    redirect("/onboarding");
  }

  const params = await searchParams;
  const search = params.q || "";
  const testType = params.type || "ALL";
  const difficulty = params.difficulty || "ALL";

  const { tests } = await getStudentMockTests({
    search,
    testType,
    difficulty,
    examYear: profile.targetExamYear || 2026,
    pageSize: 30,
  });

  const categories = [
    { label: "All Tests", value: "ALL" },
    { label: "Full Length", value: "FULL_LENGTH" },
    { label: "Subject-Wise", value: "SUBJECT_WISE" },
    { label: "General Test", value: "GENERAL_TEST" },
    { label: "Sectional", value: "SECTIONAL" },
  ];

  return (
    <StudentLayout
      activeRoute="/mock-tests"
      breadcrumbs={[
        { label: "Student Portal", href: "/dashboard" },
        { label: "Mock Test Library" },
      ]}
      user={session.user}
      targetExamYear={profile.targetExamYear}
    >
      <div className="space-y-6">
        {/* Banner Section */}
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-primary/10 via-primary/5 to-surface border border-primary/20 p-6 sm:p-8">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
              <Sparkles className="w-3.5 h-3.5" />
              <span>CUET UG {profile.targetExamYear || 2026} Examination Library</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              Realistic Computer-Based Mock Tests
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Standardized full-length and subject-specific examinations designed in strict accordance
              with the National Testing Agency (NTA) blueprint and rationalized NCERT Class 12 curriculum.
            </p>
          </div>
        </div>

        {/* Category Tabs & Filter Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {categories.map((cat) => {
              const isActive = testType === cat.value;
              return (
                <Link
                  key={cat.value}
                  href={`/mock-tests?${new URLSearchParams({
                    ...(cat.value !== "ALL" ? { type: cat.value } : {}),
                    ...(search ? { q: search } : {}),
                    ...(difficulty !== "ALL" ? { difficulty } : {}),
                  }).toString()}`}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "bg-surface border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {cat.label}
                </Link>
              );
            })}
          </div>

          <div className="text-xs text-muted-foreground shrink-0 font-medium">
            Showing {tests.length} available test{tests.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Tests Grid */}
        {tests.length === 0 ? (
          <div className="bg-surface border border-dashed border-border rounded-3xl p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground mx-auto">
              <FileCheck2 className="w-6 h-6 opacity-60" />
            </div>
            <h3 className="text-base font-bold text-foreground">No mock tests found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              No tests match your selected criteria. Try switching category tabs or clearing your search filters.
            </p>
            <Link href="/mock-tests">
              <Button variant="outline" size="sm" className="mt-2 text-xs">
                Reset Filters
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {tests.map((test) => {
              return (
                <div
                  key={test.id}
                  className="bg-surface border border-border rounded-2xl p-5 hover:border-primary/40 hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    {/* Card Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                          {test.testCode}
                        </span>
                        {test.isOfficialPattern && (
                          <Badge
                            variant="outline"
                            className="text-[9px] py-0 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5"
                          >
                            NTA Pattern
                          </Badge>
                        )}
                      </div>

                      <Badge
                        variant={
                          test.difficulty === "HARD"
                            ? "destructive"
                            : test.difficulty === "MEDIUM"
                            ? "secondary"
                            : "outline"
                        }
                        className="text-[10px]"
                      >
                        {test.difficulty}
                      </Badge>
                    </div>

                    {/* Test Title & Description */}
                    <div>
                      <h3 className="font-bold text-foreground text-base group-hover:text-primary transition-colors line-clamp-1">
                        {test.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                        {test.description || "Official CUET standard test paper."}
                      </p>
                    </div>

                    {/* Subjects Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {test.subjects.map((sub, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-muted text-[10px] font-medium text-foreground"
                        >
                          {sub}
                        </span>
                      ))}
                    </div>

                    {/* Key Attributes Bar */}
                    <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-muted/40 border border-border/40 text-center font-mono">
                      <div>
                        <span className="text-[10px] text-muted-foreground block font-sans">
                          Duration
                        </span>
                        <span className="text-xs font-bold text-foreground">
                          {test.totalDuration} M
                        </span>
                      </div>
                      <div className="border-x border-border/50">
                        <span className="text-[10px] text-muted-foreground block font-sans">
                          Max Marks
                        </span>
                        <span className="text-xs font-bold text-foreground">
                          {test.totalMarks}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground block font-sans">
                          To Attempt
                        </span>
                        <span className="text-xs font-bold text-foreground">
                          {test.questionsToAttempt} / {test.totalQuestions}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Action */}
                  <div className="pt-4 mt-4 border-t border-border flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                      +5 / -1 Marking
                    </span>

                    <Link href={`/mock-tests/${test.slug}`}>
                      <Button size="sm" className="h-8 text-xs font-semibold group-hover:shadow-xs">
                        <span>View Details</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-0.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
