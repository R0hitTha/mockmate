import React from "react";
import { FileCheck2, HelpCircle, Target, Award, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/layout/card";
import { Badge } from "@/components/ui/badge";

export interface OverviewMetricsProps {
  testsAttempted?: number;
  questionsAnswered?: number;
  averageAccuracy?: number | null;
  syllabusCoverage?: number | null;
}

export function OverviewMetrics({
  testsAttempted = 0,
  questionsAnswered = 0,
  averageAccuracy = null,
  syllabusCoverage = null,
}: OverviewMetricsProps) {
  const metrics = [
    {
      title: "Mock Tests Attempted",
      value: testsAttempted.toString(),
      subtext:
        testsAttempted === 0 ? "No mock tests attempted yet" : "Completed CBT attempts",
      icon: FileCheck2,
      iconColor: "text-blue-600 bg-blue-50 dark:bg-blue-950 dark:text-blue-300",
      status: "real",
    },
    {
      title: "Questions Practiced",
      value: questionsAnswered.toString(),
      subtext:
        questionsAnswered === 0 ? "No questions practiced yet" : "Questions answered",
      icon: HelpCircle,
      iconColor: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950 dark:text-indigo-300",
      status: "real",
    },
    {
      title: "Average Accuracy",
      value: averageAccuracy !== null ? `${averageAccuracy}%` : "—",
      subtext:
        averageAccuracy !== null
          ? "Across all mock tests"
          : "Available after first test (Phase 9)",
      icon: Target,
      iconColor:
        "text-emerald-600 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-300",
      status: "pending",
    },
    {
      title: "Syllabus Coverage",
      value: syllabusCoverage !== null ? `${syllabusCoverage}%` : "—",
      subtext:
        syllabusCoverage !== null
          ? "Calculated from drills"
          : "Syllabus mapping in Phase 6",
      icon: Award,
      iconColor: "text-amber-600 bg-amber-50 dark:bg-amber-950 dark:text-amber-300",
      status: "pending",
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Preparation Overview
        </h2>
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Real records only • No synthetic statistics</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <Card
              key={m.title}
              className="border-border shadow-2xs hover:border-border/80 transition-colors"
            >
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${m.iconColor}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  {m.status === "pending" && (
                    <Badge
                      variant="outline"
                      className="text-[10px] text-muted-foreground font-normal"
                    >
                      Upcoming Phase
                    </Badge>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="text-2xl font-black text-foreground tracking-tight">
                    {m.value}
                  </div>
                  <div className="text-xs font-semibold text-foreground truncate">
                    {m.title}
                  </div>
                  <div className="text-[11px] text-muted-foreground truncate">
                    {m.subtext}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
