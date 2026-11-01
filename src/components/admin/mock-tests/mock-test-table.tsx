"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  Plus,
  BookOpen,
  CheckCircle2,
  Clock,
  Layers,
  Users,
  Archive,
  Eye,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  publishMockTestAction,
  archiveMockTestAction,
} from "@/actions/mock-test-actions";

export interface MockTestListItem {
  id: string;
  title: string;
  slug: string;
  testCode: string;
  description?: string | null;
  examYear: number;
  testType: string;
  status: string;
  difficulty: string;
  totalDuration: number;
  totalMarks: number;
  totalQuestions: number;
  questionsToAttempt: number;
  isOfficialPattern: boolean;
  attemptsCount: number;
  sectionsCount: number;
  subjects: string[];
  createdAt: string;
}

interface MockTestTableProps {
  initialTests: MockTestListItem[];
  stats: {
    total: number;
    published: number;
    draft: number;
    inReview: number;
    archived: number;
    totalAttempts: number;
  };
}

export function MockTestTable({ initialTests, stats }: MockTestTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [tests, setTests] = useState<MockTestListItem[]>(initialTests);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [difficultyFilter, setDifficultyFilter] = useState("ALL");

  const filteredTests = tests.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.testCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || t.status === statusFilter;
    const matchesType = typeFilter === "ALL" || t.testType === typeFilter;
    const matchesDiff = difficultyFilter === "ALL" || t.difficulty === difficultyFilter;
    return matchesSearch && matchesStatus && matchesType && matchesDiff;
  });

  const handlePublish = (testId: string) => {
    startTransition(async () => {
      const res = await publishMockTestAction(testId);
      if (res.success) {
        setTests((prev) =>
          prev.map((t) => (t.id === testId ? { ...t, status: "PUBLISHED" } : t))
        );
        router.refresh();
      }
    });
  };

  const handleArchive = (testId: string) => {
    startTransition(async () => {
      const res = await archiveMockTestAction(testId);
      if (res.success) {
        setTests((prev) =>
          prev.map((t) => (t.id === testId ? { ...t, status: "ARCHIVED" } : t))
        );
        router.refresh();
      }
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return (
          <Badge className="bg-emerald-600 text-white dark:bg-emerald-500/20 dark:text-emerald-300">
            Published
          </Badge>
        );
      case "IN_REVIEW":
        return (
          <Badge className="bg-amber-600 text-white dark:bg-amber-500/20 dark:text-amber-300">
            In Review
          </Badge>
        );
      case "DRAFT":
        return <Badge variant="secondary">Draft</Badge>;
      case "ARCHIVED":
        return <Badge variant="outline">Archived</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            CUET Mock Test Library
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Author, configure, and publish realistic NTA computer-based mock examinations.
          </p>
        </div>

        <Link href="/admin/mock-tests/new">
          <Button size="sm" className="shadow-xs font-semibold">
            <Plus className="w-4 h-4 mr-1.5" />
            Build New Mock Test
          </Button>
        </Link>
      </div>

      {/* Aggregate Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl border border-border bg-surface shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Total Mock Tests</span>
            <Layers className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">{stats.total}</p>
          <span className="text-[11px] text-muted-foreground mt-0.5 block">
            Across all CUET disciplines
          </span>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-surface shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Published & Live</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">{stats.published}</p>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 block">
            Accessible to students
          </span>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-surface shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Draft / Review</span>
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">
            {stats.draft + stats.inReview}
          </p>
          <span className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5 block">
            Pending editorial checks
          </span>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-surface shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Student Attempts</span>
            <Users className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">{stats.totalAttempts}</p>
          <span className="text-[11px] text-muted-foreground mt-0.5 block">
            Protected historical attempts
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl border border-border bg-surface shadow-xs flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title, test code (MT-...), or slug..."
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-2.5 rounded-lg border border-border bg-background text-xs"
          >
            <option value="ALL">All Statuses</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
            <option value="IN_REVIEW">In Review</option>
            <option value="ARCHIVED">Archived</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-9 px-2.5 rounded-lg border border-border bg-background text-xs"
          >
            <option value="ALL">All Categories</option>
            <option value="FULL_LENGTH">Full Length</option>
            <option value="SUBJECT_WISE">Subject Wise</option>
            <option value="GENERAL_TEST">General Test</option>
            <option value="SECTIONAL">Sectional</option>
          </select>

          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="h-9 px-2.5 rounded-lg border border-border bg-background text-xs"
          >
            <option value="ALL">All Difficulties</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
        </div>
      </div>

      {/* Mock Tests Table */}
      <div className="bg-surface border border-border rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 border-b border-border text-muted-foreground uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Test Code & Title</th>
                <th className="py-3 px-4">Category & Subject</th>
                <th className="py-3 px-4">Structure</th>
                <th className="py-3 px-4">Target Year</th>
                <th className="py-3 px-4">Attempts</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredTests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-semibold text-foreground">No mock tests found</p>
                    <p className="text-[11px] mt-0.5">
                      Adjust your search criteria or create a new mock test.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredTests.map((test) => {
                  const hasAttempts = test.attemptsCount > 0;
                  return (
                    <tr
                      key={test.id}
                      className="hover:bg-muted/20 transition-colors group"
                    >
                      <td className="py-3.5 px-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[11px] font-bold text-primary">
                              {test.testCode}
                            </span>
                            {test.isOfficialPattern && (
                              <Badge
                                variant="outline"
                                className="text-[9px] py-0 border-primary/30 text-primary"
                              >
                                NTA Pattern
                              </Badge>
                            )}
                          </div>
                          <Link
                            href={`/admin/mock-tests/${test.id}`}
                            className="font-bold text-foreground text-sm hover:text-primary transition-colors block truncate max-w-[280px] mt-0.5"
                          >
                            {test.title}
                          </Link>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            /{test.slug}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span className="inline-block px-2 py-0.5 rounded-md bg-muted text-[10px] font-semibold text-foreground">
                            {test.testType.replace("_", " ")}
                          </span>
                          <p className="text-[11px] text-muted-foreground truncate max-w-[160px]">
                            {test.subjects.join(", ") || "General"}
                          </p>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5 font-mono text-[11px]">
                          <span className="font-semibold text-foreground">
                            {test.totalQuestions} Qs ({test.questionsToAttempt} to attempt)
                          </span>
                          <p className="text-muted-foreground text-[10px]">
                            {test.totalDuration} Mins • {test.totalMarks} Marks
                          </p>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span className="font-semibold text-foreground">
                            CUET {test.examYear}
                          </span>
                          <Badge
                            variant={
                              test.difficulty === "HARD"
                                ? "destructive"
                                : test.difficulty === "MEDIUM"
                                ? "secondary"
                                : "outline"
                            }
                            className="text-[9px] block w-fit"
                          >
                            {test.difficulty}
                          </Badge>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-mono">
                          <span className="font-bold text-foreground">
                            {test.attemptsCount}
                          </span>
                          {hasAttempts && (
                            <span
                              title="Test configuration locked due to existing student attempts"
                              className="text-amber-500"
                            >
                              <Lock className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">{getStatusBadge(test.status)}</td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link href={`/admin/mock-tests/${test.id}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 text-xs"
                              title="Inspect & Edit"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                          </Link>

                          {test.status !== "PUBLISHED" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 px-2.5 text-xs text-emerald-600 hover:text-emerald-700"
                              onClick={() => handlePublish(test.id)}
                              disabled={isPending}
                              title="Publish Test"
                            >
                              Publish
                            </Button>
                          )}

                          {test.status !== "ARCHIVED" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 text-xs text-muted-foreground hover:text-destructive"
                              onClick={() => handleArchive(test.id)}
                              disabled={isPending}
                              title="Archive Test"
                            >
                              <Archive className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
