"use client";

import React, { useState, useTransition, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Eye,
  Archive,
  FileQuestion,
  ChevronLeft,
  ChevronRight,
  FileText,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QuestionListItem } from "@/lib/question-service";
import { archiveQuestionAction } from "@/actions/question-actions";

interface QuestionTableProps {
  initialQuestions: QuestionListItem[];
  total: number;
  currentPage: number;
  totalPages: number;
  availableSubjects: { slug: string; name: string; code: string }[];
}

export function QuestionTable({
  initialQuestions,
  total,
  currentPage,
  totalPages,
  availableSubjects,
}: QuestionTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [subjectFilter, setSubjectFilter] = useState("ALL");
  const [difficultyFilter, setDifficultyFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const [archivedIds, setArchivedIds] = useState<Set<string>>(new Set());
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const questions = useMemo(() => {
    return initialQuestions.map((q) =>
      archivedIds.has(q.id) ? { ...q, status: "ARCHIVED" } : q
    );
  }, [initialQuestions, archivedIds]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters(1);
  };

  const applyFilters = (page: number) => {
    const params = new URLSearchParams();
    if (page > 1) params.set("page", page.toString());
    if (search.trim()) params.set("q", search.trim());
    if (statusFilter !== "ALL") params.set("status", statusFilter);
    if (subjectFilter !== "ALL") params.set("subject", subjectFilter);
    if (difficultyFilter !== "ALL") params.set("difficulty", difficultyFilter);
    if (typeFilter !== "ALL") params.set("type", typeFilter);

    router.push(`/admin/question-bank?${params.toString()}`);
  };

  const handleArchive = (id: string, code: string) => {
    if (!confirm(`Are you sure you want to archive question ${code}? It will be removed from active mock exam pools.`)) {
      return;
    }

    startTransition(async () => {
      const res = await archiveQuestionAction(id);
      if (res.success) {
        setArchivedIds((prev) => new Set([...prev, id]));
        setActionMessage(`Question ${code} archived successfully.`);
        setTimeout(() => setActionMessage(null), 3000);
      } else {
        alert(res.error || "Failed to archive question.");
      }
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return (
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800 text-[10px]">
            Published
          </Badge>
        );
      case "APPROVED":
        return (
          <Badge className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800 text-[10px]">
            Approved
          </Badge>
        );
      case "IN_REVIEW":
        return (
          <Badge className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800 text-[10px]">
            In Review
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge className="bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800 text-[10px]">
            Changes Requested
          </Badge>
        );
      case "ARCHIVED":
        return (
          <Badge variant="outline" className="text-muted-foreground text-[10px]">
            Archived
          </Badge>
        );
      case "DRAFT":
      default:
        return (
          <Badge variant="secondary" className="text-[10px]">
            Draft
          </Badge>
        );
    }
  };

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case "EASY":
        return <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">Easy</span>;
      case "HARD":
        return <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">Hard</span>;
      case "MEDIUM":
      default:
        return <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">Medium</span>;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "MCQ_SINGLE":
        return "Single MCQ";
      case "MCQ_MULTIPLE":
        return "Multi-Select";
      case "ASSERTION_REASON":
        return "Assertion & Reason";
      case "PASSAGE_BASED":
        return "Passage-Based";
      case "TRUE_FALSE":
        return "True / False";
      default:
        return type;
    }
  };

  return (
    <div className="space-y-4">
      {actionMessage && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs font-semibold text-emerald-700 dark:text-emerald-300">
          {actionMessage}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search question code, statement keywords, or explanation..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs h-9"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setTimeout(() => applyFilters(1), 0);
              }}
              className="h-9 px-2.5 rounded-lg border border-border bg-background text-xs text-foreground"
            >
              <option value="ALL">All Statuses</option>
              <option value="PUBLISHED">Published</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="APPROVED">Approved</option>
              <option value="DRAFT">Draft</option>
              <option value="REJECTED">Rejected</option>
              <option value="ARCHIVED">Archived</option>
            </select>

            {/* Subject Filter */}
            <select
              value={subjectFilter}
              onChange={(e) => {
                setSubjectFilter(e.target.value);
                setTimeout(() => applyFilters(1), 0);
              }}
              className="h-9 px-2.5 rounded-lg border border-border bg-background text-xs text-foreground max-w-[150px] truncate"
            >
              <option value="ALL">All Subjects</option>
              {availableSubjects.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>

            {/* Difficulty Filter */}
            <select
              value={difficultyFilter}
              onChange={(e) => {
                setDifficultyFilter(e.target.value);
                setTimeout(() => applyFilters(1), 0);
              }}
              className="h-9 px-2.5 rounded-lg border border-border bg-background text-xs text-foreground"
            >
              <option value="ALL">All Difficulties</option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>

            {/* Question Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setTimeout(() => applyFilters(1), 0);
              }}
              className="h-9 px-2.5 rounded-lg border border-border bg-background text-xs text-foreground"
            >
              <option value="ALL">All Formats</option>
              <option value="MCQ_SINGLE">Single MCQ</option>
              <option value="ASSERTION_REASON">Assertion-Reason</option>
              <option value="PASSAGE_BASED">Passage-Based</option>
              <option value="MCQ_MULTIPLE">Multi-Select</option>
              <option value="TRUE_FALSE">True/False</option>
            </select>

            <Button type="submit" size="sm" className="h-9 text-xs px-3 font-semibold">
              Filter
            </Button>
          </div>
        </form>
      </div>

      {/* Questions Data Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Code / Format</th>
                <th className="py-3 px-4 min-w-[260px]">Question Statement</th>
                <th className="py-3 px-4">Subject & Syllabus</th>
                <th className="py-3 px-4">Difficulty</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Marks</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {questions.length > 0 ? (
                questions.map((q) => (
                  <tr key={q.id} className="hover:bg-muted/20 transition-colors">
                    {/* Code & Format */}
                    <td className="py-3.5 px-4 align-top whitespace-nowrap">
                      <div className="font-mono font-bold text-foreground text-[11px]">
                        {q.questionCode}
                      </div>
                      <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        {q.hasPassage && <FileText className="h-3 w-3 text-primary shrink-0" />}
                        <span>{getTypeLabel(q.questionType)}</span>
                      </div>
                    </td>

                    {/* Question Statement */}
                    <td className="py-3.5 px-4 align-top">
                      <Link
                        href={`/admin/question-bank/${q.id}`}
                        className="font-medium text-foreground hover:text-primary transition-colors line-clamp-2 leading-relaxed"
                      >
                        {q.questionText}
                      </Link>
                      {q.tags && q.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {q.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="text-[9px] px-1.5 py-0.2 rounded bg-muted text-muted-foreground border border-border/50"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>

                    {/* Subject & Syllabus */}
                    <td className="py-3.5 px-4 align-top">
                      <div className="font-semibold text-foreground truncate max-w-[150px]">
                        {q.subjectName}
                      </div>
                      <div className="text-[10px] text-muted-foreground truncate max-w-[180px]">
                        {q.unitTitle ? `${q.unitTitle}` : `Unit ${q.unitNumber || 1}`}
                      </div>
                    </td>

                    {/* Difficulty */}
                    <td className="py-3.5 px-4 align-top whitespace-nowrap">
                      {getDifficultyBadge(q.difficulty)}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 align-top whitespace-nowrap">
                      {getStatusBadge(q.status)}
                    </td>

                    {/* Marks */}
                    <td className="py-3.5 px-4 align-top whitespace-nowrap font-mono text-[11px]">
                      <span className="text-emerald-600 font-semibold">+{q.marks}</span>
                      <span className="text-muted-foreground"> / </span>
                      <span className="text-rose-600 font-semibold">-{q.negativeMarks}</span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 align-top text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <Link href={`/admin/question-bank/${q.id}`}>
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            <span>View</span>
                          </Button>
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleArchive(q.id, q.questionCode)}
                          disabled={isPending || q.status === "ARCHIVED"}
                          title={q.status === "ARCHIVED" ? "Already archived" : "Archive question"}
                          className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-40"
                        >
                          <Archive className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    <FileQuestion className="h-9 w-9 mx-auto mb-2 text-muted-foreground/50" />
                    <p className="font-semibold text-sm">No questions matched the filters</p>
                    <p className="text-xs mt-1">Try resetting the search terms or status filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="py-3 px-4 bg-muted/20 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Total <strong>{total}</strong> questions across CUET UG question pools
          </span>

          <div className="flex items-center gap-2">
            <span>
              Page {currentPage} of {Math.max(1, totalPages)}
            </span>
            <div className="inline-flex gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-7 w-7 p-0"
                disabled={currentPage <= 1 || isPending}
                onClick={() => applyFilters(currentPage - 1)}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 w-7 p-0"
                disabled={currentPage >= totalPages || isPending}
                onClick={() => applyFilters(currentPage + 1)}
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
