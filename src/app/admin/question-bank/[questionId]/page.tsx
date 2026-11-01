import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  History,
  FileText,
  Check,
  Sparkles,
} from "lucide-react";
import { requireRole } from "@/lib/auth-server";
import { getQuestionById, getSyllabusCascade } from "@/lib/question-service";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Badge } from "@/components/ui/badge";
import { ReviewDialog } from "@/components/admin/question-bank/review-dialog";
import { QuestionForm } from "@/components/admin/question-bank/question-form";

export const instant = false;

interface QuestionDetailPageProps {
  params: Promise<{
    questionId: string;
  }>;
}

export async function generateMetadata({
  params,
}: QuestionDetailPageProps): Promise<Metadata> {
  const { questionId } = await params;
  const question = await getQuestionById(questionId);

  return {
    title: question
      ? `${question.questionCode} — Question Bank | MockMate Admin`
      : "Question Details — MockMate Admin",
  };
}

export default async function QuestionDetailPage({ params }: QuestionDetailPageProps) {
  const session = await requireRole(["ADMIN", "CONTENT_CREATOR", "FACULTY"]);
  const { questionId } = await params;

  const question = await getQuestionById(questionId);
  if (!question) {
    notFound();
  }

  const cascadeData = await getSyllabusCascade({
    examYear: question.examYear,
    subjectSlug: question.subjectSlug,
    unitNumber: question.unitNumber,
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return (
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800 text-xs">
            Published
          </Badge>
        );
      case "APPROVED":
        return (
          <Badge className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800 text-xs">
            Approved
          </Badge>
        );
      case "IN_REVIEW":
        return (
          <Badge className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800 text-xs">
            In Peer Review
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge className="bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800 text-xs">
            Changes Requested
          </Badge>
        );
      case "ARCHIVED":
        return (
          <Badge variant="outline" className="text-muted-foreground text-xs">
            Archived
          </Badge>
        );
      case "DRAFT":
      default:
        return (
          <Badge variant="secondary" className="text-xs">
            Draft
          </Badge>
        );
    }
  };

  return (
    <AdminLayout
      activeRoute="/admin/question-bank"
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Question Bank", href: "/admin/question-bank" },
        { label: question.questionCode },
      ]}
      user={session.user}
    >
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Navigation & Status Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Link
            href="/admin/question-bank"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Question Bank</span>
          </Link>

          <div className="flex items-center gap-2">
            <ReviewDialog
              questionId={question.id}
              questionCode={question.questionCode}
              currentStatus={question.status}
            />
          </div>
        </div>

        {/* Question Overview Card */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-extrabold text-foreground">
                  {question.questionCode}
                </span>
                {getStatusBadge(question.status)}
                <Badge variant="outline" className="text-xs">
                  {question.difficulty}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                CUET UG {question.examYear} • {question.subjectName} (Code {question.subjectCode})
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-emerald-600">
                <span>+{question.marks} Marks</span>
              </div>
              <span className="text-border">|</span>
              <div className="flex items-center gap-1.5 font-semibold text-rose-600">
                <span>-{question.negativeMarks} Penalty</span>
              </div>
            </div>
          </div>

          {/* Passage if present */}
          {question.passage && (
            <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
                <FileText className="h-4 w-4" />
                <span>{question.passage.title}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line font-serif">
                {question.passage.passageText}
              </p>
            </div>
          )}

          {/* Statement */}
          <div className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-foreground leading-relaxed whitespace-pre-line">
              {question.questionText}
            </h2>

            {/* Answer Options */}
            <div className="space-y-2 pt-2">
              {question.options.map((opt) => (
                <div
                  key={opt.id}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border text-xs transition-colors ${
                    opt.isCorrect
                      ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-200"
                      : "border-border bg-background text-foreground"
                  }`}
                >
                  <span
                    className={`h-6 w-6 rounded-md flex items-center justify-center font-bold text-xs shrink-0 ${
                      opt.isCorrect
                        ? "bg-emerald-600 text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {opt.optionLabel}
                  </span>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <span className="font-medium">{opt.optionText}</span>
                  </div>
                  {opt.isCorrect && (
                    <Badge className="bg-emerald-600 text-white text-[10px] gap-1 shrink-0">
                      <Check className="h-3 w-3" />
                      Correct Answer
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Explanation */}
          {question.explanation && (
            <div className="p-4 rounded-xl border border-border/80 bg-muted/30 text-xs space-y-1.5">
              <span className="font-bold text-foreground flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-primary" />
                Step-by-Step Pedagogical Explanation:
              </span>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {question.explanation}
              </p>
            </div>
          )}

          {/* Tags */}
          {question.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-2">
              <span className="text-[11px] font-semibold text-muted-foreground mr-1">Tags:</span>
              {question.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Audit & Syllabus Indexing Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-border bg-card p-4 space-y-2.5 text-xs shadow-2xs">
            <h4 className="font-bold uppercase tracking-wider text-muted-foreground text-[10px] border-b border-border pb-1.5">
              Syllabus Indexing
            </h4>
            <div className="space-y-1.5 text-muted-foreground">
              <p>
                <strong>Unit:</strong> {question.syllabusInfo?.unitTitle} (Unit #{question.syllabusInfo?.unitNumber})
              </p>
              <p>
                <strong>Topic:</strong> {question.syllabusInfo?.topicTitle} (Topic #{question.syllabusInfo?.topicOrder})
              </p>
              {question.syllabusInfo?.subtopicTitle && (
                <p>
                  <strong>Subtopic:</strong> {question.syllabusInfo.subtopicTitle}
                </p>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 space-y-2.5 text-xs shadow-2xs">
            <h4 className="font-bold uppercase tracking-wider text-muted-foreground text-[10px] border-b border-border pb-1.5">
              Audit & Verification Details
            </h4>
            <div className="space-y-1.5 text-muted-foreground">
              <p>
                <strong>Author:</strong> {question.authorName}
              </p>
              <p>
                <strong>Last Updated:</strong> {new Date(question.updatedAt).toLocaleString("en-IN")}
              </p>
              <p>
                <strong>Test Usage Count:</strong> {question.usageCount} active sessions
              </p>
            </div>
          </div>
        </div>

        {/* Review History */}
        {question.reviews.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <div className="flex items-center gap-2 border-b border-border pb-2.5">
              <History className="h-4 w-4 text-primary" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Editorial Review History
              </h3>
            </div>

            <div className="space-y-3">
              {question.reviews.map((rev) => (
                <div key={rev.id} className="p-3 rounded-lg border border-border bg-background text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">
                      Decision: <strong className="text-primary">{rev.reviewStatus}</strong> by {rev.reviewerName}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(rev.reviewedAt).toLocaleDateString("en-IN")}
                    </span>
                  </div>
                  {rev.feedback && (
                    <p className="text-muted-foreground leading-relaxed mt-1">
                      {rev.feedback}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Edit Form Section */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
          <div className="border-b border-border pb-3">
            <h3 className="text-base font-bold text-foreground">Edit Question</h3>
            <p className="text-xs text-muted-foreground">
              Make revisions, refine options, or update pedagogical explanations.
            </p>
          </div>

          <QuestionForm
            mode="edit"
            initialData={{
              id: question.id,
              questionCode: question.questionCode,
              examYear: question.examYear,
              subjectSlug: question.subjectSlug,
              unitNumber: question.unitNumber || 1,
              topicOrder: 1,
              questionType: question.questionType as "MCQ_SINGLE" | "MCQ_MULTIPLE" | "ASSERTION_REASON" | "PASSAGE_BASED" | "TRUE_FALSE",
              questionText: question.questionText,
              passageTitle: question.passage?.title,
              passageText: question.passage?.passageText,
              difficulty: question.difficulty as "EASY" | "MEDIUM" | "HARD",
              explanation: question.explanation,
              marks: question.marks,
              negativeMarks: question.negativeMarks,
              status: question.status as "DRAFT" | "IN_REVIEW" | "APPROVED" | "PUBLISHED" | "REJECTED" | "ARCHIVED",
              tags: question.tags,
              options: question.options,
              usageCount: question.usageCount,
            }}
            cascadeData={cascadeData}
          />
        </div>
      </div>
    </AdminLayout>
  );
}
