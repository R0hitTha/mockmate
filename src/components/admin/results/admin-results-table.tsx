"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
  Search,
  RefreshCw,
  Eye,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/layout/card";
import { reEvaluateAttemptAction } from "@/actions/evaluation-actions";
import type { TestResultData } from "@/lib/validations/evaluation";

interface AdminResultsTableProps {
  initialResults: TestResultData[];
  totalResults: number;
}

export function AdminResultsTable({
  initialResults,
  totalResults,
}: AdminResultsTableProps) {
  const [resultsList, setResultsList] = useState<TestResultData[]>(initialResults);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [isPending, startTransition] = useTransition();
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const filteredResults = resultsList.filter((r) => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchesTest =
        r.testTitle.toLowerCase().includes(q) || r.testCode.toLowerCase().includes(q);
      const matchesStudent =
        (r.studentName && r.studentName.toLowerCase().includes(q)) ||
        (r.studentEmail && r.studentEmail.toLowerCase().includes(q));
      if (!matchesTest && !matchesStudent) return false;
    }

    if (selectedYear !== "ALL" && String(r.examYear) !== selectedYear) {
      return false;
    }

    if (selectedStatus !== "ALL" && r.status !== selectedStatus) {
      return false;
    }

    return true;
  });

  const handleReEvaluate = (attemptId: string) => {
    if (!confirm("Are you sure you want to trigger a formal re-evaluation for this attempt? This will increment the evaluation version and audit log.")) {
      return;
    }

    startTransition(async () => {
      setActionMessage(null);
      const res = await reEvaluateAttemptAction(attemptId);
      if (res.success && res.data) {
        setActionMessage(`Re-evaluation completed successfully (v${res.data.evaluationVersion}).`);
        setResultsList((prev) =>
          prev.map((item) => (item.attemptId === attemptId ? res.data! : item))
        );
      } else {
        setActionMessage(`Failed to re-evaluate: ${res.error}`);
      }
    });
  };

  return (
    <Card className="border-border shadow-xs">
      <CardHeader className="p-4 sm:p-6 border-b border-border space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <span>Administrative Examination Results Audit</span>
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Audited student attempts, evaluated scorecards, and re-evaluation control.
            </p>
          </div>

          <Badge variant="outline" className="font-mono text-xs self-start sm:self-auto">
            {totalResults} Total Results
          </Badge>
        </div>

        {actionMessage && (
          <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-xs text-foreground flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-primary shrink-0" />
            <span>{actionMessage}</span>
          </div>
        )}

        {/* Filter controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
            <Input
              placeholder="Search by student name, email, or test title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="h-9 px-3 text-xs bg-background border border-border rounded-xl text-foreground"
          >
            <option value="ALL">All Exam Years</option>
            <option value="2026">CUET UG 2026</option>
            <option value="2027">CUET UG 2027</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-9 px-3 text-xs bg-background border border-border rounded-xl text-foreground"
          >
            <option value="ALL">All Evaluation Statuses</option>
            <option value="EVALUATED">Evaluated</option>
            <option value="PENDING_EVALUATION">Pending Evaluation</option>
            <option value="EVALUATION_FAILED">Evaluation Failed</option>
          </select>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {filteredResults.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-xs">
            No examination results found matching the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-muted-foreground font-medium">
                  <th className="py-3 px-4 font-semibold">Student</th>
                  <th className="py-3 px-4 font-semibold">Test Details</th>
                  <th className="py-3 px-4 text-center font-semibold">Score</th>
                  <th className="py-3 px-4 text-center font-semibold">Percentage</th>
                  <th className="py-3 px-4 text-center font-semibold">Accuracy</th>
                  <th className="py-3 px-4 text-center font-semibold">Version</th>
                  <th className="py-3 px-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredResults.map((result) => (
                  <tr key={result.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-foreground text-sm">
                        {result.studentName || "Student"}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {result.studentEmail || "student@mockmate.in"}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-foreground">
                        {result.testTitle}
                      </div>
                      <div className="text-[11px] text-muted-foreground font-mono">
                        {result.testCode} • CUET {result.examYear || 2026}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono font-bold text-foreground">
                      {result.totalMarks} / {result.maximumMarks}
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono font-bold text-sky-600 dark:text-sky-400">
                      {result.percentage.toFixed(1)}%
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {result.accuracy.toFixed(1)}%
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono">
                      <Badge variant="outline" className="text-[10px]">
                        v{result.evaluationVersion}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link href={`/results/${result.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            <span>View</span>
                          </Button>
                        </Link>

                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isPending}
                          onClick={() => handleReEvaluate(result.attemptId)}
                          className="h-8 px-2 text-xs text-amber-700 dark:text-amber-300"
                          title="Trigger Audited Re-Evaluation"
                        >
                          <RefreshCw className="w-3.5 h-3.5 mr-1" />
                          <span>Re-Evaluate</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
