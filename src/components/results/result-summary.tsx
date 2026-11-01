import React from "react";
import {
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Calendar,
  Percent,
  Target,
  FileText,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/layout/card";
import { PrintExportButton } from "./print-export-button";
import type { TestResultData } from "@/lib/validations/evaluation";

interface ResultSummaryProps {
  result: TestResultData;
}

export function ResultSummary({ result }: ResultSummaryProps) {
  const formatTime = (seconds: number | null | undefined) => {
    if (!seconds) return "N/A";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formattedDate = new Date(result.evaluatedAt).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const isPassed = result.percentage >= 40;

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero Card */}
      <Card className="border-border shadow-xs overflow-hidden print:border-none print:shadow-none">
        <div className="bg-primary/5 dark:bg-primary/10 border-b border-border/60 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="text-xs font-mono">
                {result.testCode}
              </Badge>
              <Badge
                variant={isPassed ? "default" : "secondary"}
                className="text-xs font-semibold"
              >
                {(result.testCategory || "MOCK_TEST").replace("_", " ")}
              </Badge>
              <Badge variant="outline" className="text-xs">
                CUET UG {result.examYear || 2026}
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              {result.testTitle}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                Evaluated: {formattedDate}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-primary" />
                Time Spent: {formatTime(result.timeTaken)}
              </span>
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-primary" />
                Total Questions: {result.totalQuestions}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 print:hidden">
            <PrintExportButton />
          </div>
        </div>

        {/* Score Highlights Grid */}
        <CardContent className="p-6 sm:p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {/* 1. Marks Obtained */}
            <div className="p-4 rounded-2xl bg-surface border border-border flex flex-col justify-between">
              <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
                <span>Score Obtained</span>
                <Award className="w-4 h-4 text-primary" />
              </div>
              <div className="mt-3">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl sm:text-4xl font-extrabold font-mono text-foreground">
                    {result.totalMarks}
                  </span>
                  <span className="text-sm font-medium text-muted-foreground">
                    / {result.maximumMarks}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                  <span>Net Marks (+5, -1)</span>
                </div>
              </div>
            </div>

            {/* 2. Percentage */}
            <div className="p-4 rounded-2xl bg-surface border border-border flex flex-col justify-between">
              <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
                <span>Percentage</span>
                <Percent className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              </div>
              <div className="mt-3">
                <div className="text-3xl sm:text-4xl font-extrabold font-mono text-sky-600 dark:text-sky-400">
                  {result.percentage.toFixed(1)}%
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Score / Max Marks ratio
                </p>
              </div>
            </div>

            {/* 3. Accuracy */}
            <div className="p-4 rounded-2xl bg-surface border border-border flex flex-col justify-between">
              <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
                <span>Accuracy</span>
                <Target className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="mt-3">
                <div className="text-3xl sm:text-4xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                  {result.accuracy.toFixed(1)}%
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Correct / Attempted ratio
                </p>
              </div>
            </div>

            {/* 4. Attempt Ratio */}
            <div className="p-4 rounded-2xl bg-surface border border-border flex flex-col justify-between">
              <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
                <span>Attempted</span>
                <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="mt-3">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl sm:text-4xl font-extrabold font-mono text-foreground">
                    {result.correctCount + result.incorrectCount}
                  </span>
                  <span className="text-sm font-medium text-muted-foreground">
                    / {result.totalQuestions}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {result.unansweredCount} questions left
                </p>
              </div>
            </div>
          </div>

          {/* Detailed Question Counts Bar */}
          <div className="mt-6 pt-6 border-t border-border grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="w-4 h-4" />
                <span>Correct</span>
              </div>
              <div className="mt-1 text-2xl font-bold font-mono text-emerald-800 dark:text-emerald-200">
                {result.correctCount}
              </div>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
                +{result.correctCount * 5} marks
              </span>
            </div>

            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
              <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-rose-700 dark:text-rose-300">
                <XCircle className="w-4 h-4" />
                <span>Incorrect</span>
              </div>
              <div className="mt-1 text-2xl font-bold font-mono text-rose-800 dark:text-rose-200">
                {result.incorrectCount}
              </div>
              <span className="text-[10px] text-rose-600 dark:text-rose-400">
                -{result.incorrectCount * 1} marks
              </span>
            </div>

            <div className="p-3 rounded-xl bg-muted/60 border border-border">
              <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground">
                <HelpCircle className="w-4 h-4" />
                <span>Unanswered</span>
              </div>
              <div className="mt-1 text-2xl font-bold font-mono text-foreground">
                {result.unansweredCount}
              </div>
              <span className="text-[10px] text-muted-foreground">
                0 marks
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
