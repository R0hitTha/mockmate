import React from "react";
import Link from "next/link";
import {
  BarChart3,
  Target,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Award,
} from "lucide-react";
import { Card, CardContent } from "@/components/layout/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface PerformanceSnapshotProps {
  completedTests?: number;
  averageAccuracy?: number | null;
  latestScore?: {
    testTitle: string;
    totalMarks: number;
    maximumMarks: number;
    percentage: number;
  } | null;
  strongestSubject?: {
    subjectName: string;
    accuracy: number;
  } | null;
  priorityImprovement?: {
    title: string;
    description: string;
  } | null;
}

export function PerformanceSnapshotSection({
  completedTests = 0,
  averageAccuracy = null,
  latestScore = null,
  strongestSubject = null,
  priorityImprovement = null,
}: PerformanceSnapshotProps) {
  const hasTests = completedTests > 0;

  return (
    <Card className="border-border shadow-2xs">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground">Performance Snapshot</h2>
          </div>
          <Badge
            variant={hasTests ? "default" : "outline"}
            className="text-[10px] font-normal"
          >
            {hasTests ? `${completedTests} Tests Evaluated` : "Awaiting Test Attempts"}
          </Badge>
        </div>

        {hasTests ? (
          /* Active Performance Summary */
          <div className="space-y-4 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Latest Evaluated Score */}
              {latestScore && (
                <div className="p-3.5 rounded-xl bg-surface border border-border space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium">
                    <span>Latest Score</span>
                    <Award className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-bold font-mono text-foreground">
                      {latestScore.totalMarks} / {latestScore.maximumMarks}
                    </span>
                    <span className="text-xs font-mono font-bold text-primary">
                      ({latestScore.percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {latestScore.testTitle}
                  </p>
                </div>
              )}

              {/* Overall Accuracy */}
              <div className="p-3.5 rounded-xl bg-surface border border-border space-y-1">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium">
                  <span>Overall Accuracy</span>
                  <Target className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  {averageAccuracy !== null ? `${averageAccuracy.toFixed(1)}%` : "—"}
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Across all submitted tests
                </p>
              </div>
            </div>

            {/* Diagnostic Signals (Strongest Subject / Revision Area) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {strongestSubject && (
                <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Strongest: {strongestSubject.subjectName}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-tight">
                    Demonstrating {strongestSubject.accuracy}% accuracy across attempted questions.
                  </p>
                </div>
              )}

              {priorityImprovement && (
                <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/20 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-rose-800 dark:text-rose-300 text-[11px]">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>Focus Revision: {priorityImprovement.title}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-tight line-clamp-1">
                    {priorityImprovement.description}
                  </p>
                </div>
              )}
            </div>

            {/* CTA to Full Analytics */}
            <div className="pt-1 flex items-center justify-between border-t border-border/60">
              <span className="text-[11px] text-muted-foreground">
                View detailed curves, subject mastery, and time management
              </span>
              <Button size="sm" asChild variant="ghost" className="h-8 px-2 text-xs font-semibold text-primary">
                <Link href="/analytics">
                  <span>View Full Analytics</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          /* Empty Analytics State */
          <div className="py-6 px-4 rounded-xl bg-muted/30 border border-border/80 text-center space-y-3">
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-xs font-bold text-foreground">
                Analytics Unlock After Your First Mock Test
              </h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                MockMate generates real, transparent learning analytics from your actual test submissions without synthetic scores or fake rankings.
              </p>
            </div>

            <div className="pt-2">
              <Button variant="outline" size="sm" asChild className="text-xs">
                <Link href="/mock-tests">
                  <span>Start Your First Mock Test</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Link>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
