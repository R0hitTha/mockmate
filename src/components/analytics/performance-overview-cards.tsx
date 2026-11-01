import React from "react";
import {
  FileCheck2,
  Percent,
  Award,
  Target,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { PerformanceOverviewMetrics } from "@/lib/validations/analytics";

interface PerformanceOverviewCardsProps {
  overview: PerformanceOverviewMetrics;
}

export function PerformanceOverviewCards({
  overview,
}: PerformanceOverviewCardsProps) {
  const cards = [
    {
      title: "Completed Mock Tests",
      value: overview.completedTests.toString(),
      subtext:
        overview.completedTests === 0
          ? "No tests completed yet"
          : `${overview.completedTests} evaluated sessions`,
      icon: FileCheck2,
      color: "text-blue-600 dark:text-blue-400 bg-blue-500/10",
    },
    {
      title: "Average Score",
      value: `${overview.averageScorePercentage.toFixed(1)}%`,
      subtext: "Mean normalized test percentage",
      icon: Percent,
      color: "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10",
    },
    {
      title: "Best Score",
      value: `${overview.bestScorePercentage.toFixed(1)}%`,
      subtext: "Peak examination score",
      icon: Award,
      color: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
    },
    {
      title: "Overall Accuracy",
      value: `${overview.averageAccuracy.toFixed(1)}%`,
      subtext: `${overview.totalQuestionsCorrect} / ${overview.totalQuestionsAttempted} attempted correct`,
      icon: Target,
      color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
    },
    {
      title: "Avg Time / Question",
      value:
        overview.averageTimePerQuestionSeconds > 0
          ? `${overview.averageTimePerQuestionSeconds}s`
          : "—",
      subtext: "Based on active exam timing",
      icon: Clock,
      color: "text-purple-600 dark:text-purple-400 bg-purple-500/10",
    },
  ];

  return (
    <div className="space-y-4">
      {/* 5-Column Overview Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.title}
              className="p-4 rounded-2xl bg-surface border border-border shadow-2xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between pb-2">
                <span className="text-[11px] font-semibold text-muted-foreground line-clamp-1">
                  {c.title}
                </span>
                <div
                  className={`w-7 h-7 rounded-lg ${c.color} flex items-center justify-center shrink-0`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="mt-2">
                <div className="text-2xl sm:text-3xl font-extrabold font-mono text-foreground tracking-tight">
                  {c.value}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                  {c.subtext}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Improvement Trend Banner (Only when >= 2 tests exist) */}
      {overview.overallTrend && (
        <div className="p-3.5 rounded-2xl bg-surface border border-border flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            {overview.overallTrend === "IMPROVING" && (
              <div className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
            )}
            {overview.overallTrend === "DECLINING" && (
              <div className="w-6 h-6 rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <TrendingDown className="w-3.5 h-3.5" />
              </div>
            )}
            {overview.overallTrend === "STABLE" && (
              <div className="w-6 h-6 rounded-lg bg-muted text-muted-foreground flex items-center justify-center shrink-0">
                <Minus className="w-3.5 h-3.5" />
              </div>
            )}

            <div className="text-muted-foreground">
              <span className="font-semibold text-foreground">
                Score Progression Trajectory:{" "}
              </span>
              {overview.overallTrend === "IMPROVING" && (
                <span>
                  Your scores are trending upward by +
                  {overview.trendPercentageDelta?.toFixed(1)}% between recent and earlier tests.
                </span>
              )}
              {overview.overallTrend === "DECLINING" && (
                <span>
                  Your scores have shown a {overview.trendPercentageDelta?.toFixed(1)}% dip in recent attempts. Target revision on weaker chapters.
                </span>
              )}
              {overview.overallTrend === "STABLE" && (
                <span>
                  Your test performance has remained steady across your recent attempts.
                </span>
              )}
            </div>
          </div>

          <Badge
            variant={
              overview.overallTrend === "IMPROVING"
                ? "default"
                : overview.overallTrend === "DECLINING"
                ? "destructive"
                : "secondary"
            }
            className="text-[10px] font-mono shrink-0"
          >
            {overview.overallTrend}
          </Badge>
        </div>
      )}
    </div>
  );
}

