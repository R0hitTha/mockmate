import React from "react";
import { Clock, Timer } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/layout/card";
import { Badge } from "@/components/ui/badge";
import type { TimeManagementAnalytics } from "@/lib/validations/analytics";

interface TimeManagementCardProps {
  timeData: TimeManagementAnalytics;
  completedTests: number;
}

export function TimeManagementCard({
  timeData,
  completedTests,
}: TimeManagementCardProps) {
  if (completedTests === 0) {
    return null;
  }

  return (
    <Card className="border-border shadow-xs">
      <CardHeader className="p-5 border-b border-border flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          <CardTitle className="text-base font-bold text-foreground">
            Time Management &amp; Pacing Diagnostics
          </CardTitle>
        </div>
        <Badge variant="outline" className="text-xs font-mono">
          NTA CUET Standard: ~54s / Question
        </Badge>
      </CardHeader>

      <CardContent className="p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* 1. Total Time Spent */}
          <div className="p-4 rounded-xl bg-surface border border-border flex flex-col justify-between">
            <span className="text-[11px] font-medium text-muted-foreground">
              Total Examination Time
            </span>
            <div className="mt-2">
              <div className="text-2xl font-bold font-mono text-foreground">
                {timeData.totalTimeSpentMinutes} mins
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Across {completedTests} completed {completedTests === 1 ? "test" : "tests"}
              </p>
            </div>
          </div>

          {/* 2. Average Duration per Test */}
          <div className="p-4 rounded-xl bg-surface border border-border flex flex-col justify-between">
            <span className="text-[11px] font-medium text-muted-foreground">
              Average Test Duration
            </span>
            <div className="mt-2">
              <div className="text-2xl font-bold font-mono text-foreground">
                {timeData.averageTimePerTestMinutes} mins
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Out of 45-60 min test limits
              </p>
            </div>
          </div>

          {/* 3. Average Speed per Question */}
          <div className="p-4 rounded-xl bg-surface border border-border flex flex-col justify-between">
            <span className="text-[11px] font-medium text-muted-foreground">
              Mean Resolution Speed
            </span>
            <div className="mt-2">
              <div className="text-2xl font-bold font-mono text-primary">
                {timeData.averageTimePerQuestionSeconds > 0
                  ? `${timeData.averageTimePerQuestionSeconds}s / Q`
                  : "—"}
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Total time / attempted questions
              </p>
            </div>
          </div>
        </div>

        {/* Pacing Assessment Banner */}
        <div className="p-3.5 rounded-xl bg-muted/40 border border-border flex items-start gap-2.5 text-xs">
          <Timer className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <div className="space-y-0.5 text-muted-foreground">
            <span className="font-semibold text-foreground">Pacing Assessment: </span>
            <span>{timeData.paceDescription}. In CUET UG domain tests (40 questions in 45 minutes), maintaining an average resolution time under 65 seconds allows a 2-minute final review window.</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

