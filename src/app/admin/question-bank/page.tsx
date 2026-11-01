import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Plus, UploadCloud, FileQuestion, CheckCircle2, Clock, FileEdit } from "lucide-react";
import { requireRole } from "@/lib/auth-server";
import { getQuestionBankStats, getQuestions } from "@/lib/question-service";
import { CUET_SUBJECTS_CATALOG } from "@/lib/syllabus-data";
import { AdminLayout } from "@/components/layout/admin-layout";
import { QuestionTable } from "@/components/admin/question-bank/question-table";
import { Button } from "@/components/ui/button";

export const instant = false;

export const metadata: Metadata = {
  title: "Question Bank Management — MockMate Admin",
  description: "Centralized repository for creating, reviewing, editing, and publishing CUET UG questions.",
};

interface QuestionBankPageProps {
  searchParams: Promise<{
    page?: string;
    q?: string;
    status?: string;
    subject?: string;
    difficulty?: string;
    type?: string;
  }>;
}

export default async function QuestionBankPage({ searchParams }: QuestionBankPageProps) {
  // Enforce server-side role check
  const session = await requireRole(["ADMIN", "CONTENT_CREATOR", "FACULTY"]);

  const params = await searchParams;
  const page = params.page ? parseInt(params.page, 10) : 1;
  const search = params.q;
  const status = params.status;
  const subjectSlug = params.subject;
  const difficulty = params.difficulty;
  const questionType = params.type;

  const [stats, { questions, total, totalPages }] = await Promise.all([
    getQuestionBankStats(),
    getQuestions({
      page,
      limit: 10,
      search,
      status,
      subjectSlug,
      difficulty,
      questionType,
    }),
  ]);

  const availableSubjects = CUET_SUBJECTS_CATALOG.map((s) => ({
    slug: s.slug,
    name: s.name,
    code: s.code,
  }));

  return (
    <AdminLayout
      activeRoute="/admin/question-bank"
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Question Bank" },
      ]}
      user={session.user}
    >
      <div className="space-y-6">
        {/* Header & Primary Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              CUET UG Question Bank
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Centralized repository for question authoring, syllabus alignment, peer reviews, and test publishing.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/admin/question-bank/import">
              <Button variant="outline" size="sm" className="h-9 text-xs gap-1.5 font-semibold">
                <UploadCloud className="h-4 w-4" />
                <span>Bulk CSV Import</span>
              </Button>
            </Link>

            <Link href="/admin/question-bank/new">
              <Button size="sm" className="h-9 text-xs gap-1.5 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs">
                <Plus className="h-4 w-4" />
                <span>Create Question</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Real Database Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Total Questions */}
          <div className="rounded-xl border border-border bg-card p-4 space-y-1 shadow-2xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[11px] font-bold uppercase tracking-wider">Total Questions</span>
              <FileQuestion className="h-4 w-4 text-primary" />
            </div>
            <div className="text-2xl font-extrabold text-foreground">{stats.total}</div>
            <p className="text-[10px] text-muted-foreground">Across all subjects & years</p>
          </div>

          {/* Published */}
          <div className="rounded-xl border border-border bg-card p-4 space-y-1 shadow-2xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[11px] font-bold uppercase tracking-wider">Published</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-600">{stats.published}</div>
            <p className="text-[10px] text-muted-foreground">Live in student mock pools</p>
          </div>

          {/* In Review */}
          <div className="rounded-xl border border-border bg-card p-4 space-y-1 shadow-2xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[11px] font-bold uppercase tracking-wider">In Peer Review</span>
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
            <div className="text-2xl font-extrabold text-amber-600">{stats.inReview}</div>
            <p className="text-[10px] text-muted-foreground">Awaiting editorial sign-off</p>
          </div>

          {/* Drafts */}
          <div className="rounded-xl border border-border bg-card p-4 space-y-1 shadow-2xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[11px] font-bold uppercase tracking-wider">Drafts</span>
              <FileEdit className="h-4 w-4 text-slate-500" />
            </div>
            <div className="text-2xl font-extrabold text-foreground">{stats.draft}</div>
            <p className="text-[10px] text-muted-foreground">Unfinished or pending edit</p>
          </div>
        </div>

        {/* Question Bank Table */}
        <QuestionTable
          initialQuestions={questions}
          total={total}
          currentPage={page}
          totalPages={totalPages}
          availableSubjects={availableSubjects}
        />
      </div>
    </AdminLayout>
  );
}
