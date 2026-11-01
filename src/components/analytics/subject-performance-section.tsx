import React from "react";
import { BookOpen } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/layout/card";
import { Badge } from "@/components/ui/badge";
import type { SubjectPerformanceMetric } from "@/lib/validations/analytics";

interface SubjectPerformanceSectionProps {
  subjects: SubjectPerformanceMetric[];
}

export function SubjectPerformanceSection({
  subjects,
}: SubjectPerformanceSectionProps) {
  if (!subjects || subjects.length === 0) {
    return (
      <Card className="border-border shadow-xs">
        <CardContent className="p-8 text-center text-xs text-muted-foreground">
          No subject-level performance data available yet. Complete a test containing your preferred CUET subjects to populate this section.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border shadow-xs">
      <CardHeader className="p-5 border-b border-border flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-primary" />
          <CardTitle className="text-base font-bold text-foreground">
            Subject-Wise Performance &amp; Mastery
          </CardTitle>
        </div>
        <Badge variant="outline" className="text-xs">
          {subjects.length} {subjects.length === 1 ? "Subject" : "Subjects"} Tested
        </Badge>
      </CardHeader>

      <CardContent className="p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subjects.map((sub) => {
            const isStrong = sub.status === "STRONG";
            const isNeedsPractice = sub.status === "NEEDS_PRACTICE";

            return (
              <div
                key={sub.subjectId}
                className="p-4 rounded-2xl bg-surface border border-border hover:border-primary/40 transition-colors space-y-3"
              >
                {/* Subject Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-foreground">
                      {sub.subjectName}
                    </h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {sub.testsCount} {sub.testsCount === 1 ? "test" : "tests"} evaluated • {sub.totalQuestions} questions total
                    </p>
                  </div>

                  <Badge
                    variant={isStrong ? "default" : isNeedsPractice ? "destructive" : "secondary"}
                    className="text-[10px] shrink-0 font-medium"
                  >
                    {isStrong
                      ? "Strong Area"
                      : isNeedsPractice
                      ? "Needs Revision"
                      : "Moderate"}
                  </Badge>
                </div>

                {/* Accuracy Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground text-[11px]">Accuracy</span>
                    <span className="font-mono font-bold text-foreground">
                      {sub.accuracy.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isStrong
                          ? "bg-emerald-500"
                          : isNeedsPractice
                          ? "bg-rose-500"
                          : "bg-primary"
                      }`}
                      style={{ width: `${Math.min(100, Math.max(0, sub.accuracy))}%` }}
                    />
                  </div>
                </div>

                {/* Counts & Marks Footer */}
                <div className="grid grid-cols-4 gap-2 pt-2 border-t border-border/60 text-center text-[11px]">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-300 block font-medium">
                      Correct
                    </span>
                    <span className="font-mono font-bold text-emerald-800 dark:text-emerald-200">
                      {sub.correctCount}
                    </span>
                  </div>

                  <div className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
                    <span className="text-[10px] text-rose-700 dark:text-rose-300 block font-medium">
                      Incorrect
                    </span>
                    <span className="font-mono font-bold text-rose-800 dark:text-rose-200">
                      {sub.incorrectCount}
                    </span>
                  </div>

                  <div className="p-1.5 rounded-lg bg-muted/60 border border-border">
                    <span className="text-[10px] text-muted-foreground block">
                      Left
                    </span>
                    <span className="font-mono font-bold text-foreground">
                      {sub.unansweredCount}
                    </span>
                  </div>

                  <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
                    <span className="text-[10px] text-primary block font-medium">
                      Score
                    </span>
                    <span className="font-mono font-bold text-primary">
                      {sub.totalMarks}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

