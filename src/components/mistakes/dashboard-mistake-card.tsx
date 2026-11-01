import React from "react";
import Link from "next/link";
import { AlertCircle, Clock, ArrowRight, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/layout/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DashboardMistakeCardProps {
  pendingReviewCount: number;
  totalIncorrect: number;
  recurringErrorTopicsCount: number;
  topStruggleTopic?: {
    topicTitle: string;
    subjectName: string;
    incorrectCount: number;
  } | null;
  hasMistakes: boolean;
}

export function DashboardMistakeCard({
  pendingReviewCount,
  totalIncorrect,
  recurringErrorTopicsCount,
  topStruggleTopic,
  hasMistakes,
}: DashboardMistakeCardProps) {
  if (!hasMistakes) {
    return (
      <Card className="border border-border/80 shadow-xs">
        <CardHeader className="pb-3 border-b border-border/60">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-primary" />
              <span>Mistake Intelligence</span>
            </CardTitle>
            <Badge variant="outline" className="text-xs text-emerald-600 dark:text-emerald-400">
              Clean Slate
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-5 text-center">
          <CheckCircle2 className="w-8 h-8 text-emerald-600/70 mx-auto mb-2" />
          <p className="text-xs font-medium text-foreground">Zero Unreviewed Mistakes</p>
          <p className="text-[11px] text-muted-foreground mt-1">
            Complete full mock tests or practice drills to analyze question-level errors and recurring topics.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-border/80 shadow-xs hover:border-primary/30 transition-all">
      <CardHeader className="pb-3 border-b border-border/60">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>Mistake Intelligence</span>
          </CardTitle>
          {pendingReviewCount > 0 ? (
            <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border-purple-200 text-xs gap-1">
              <Clock className="w-3 h-3" />
              <span>{pendingReviewCount} Pending</span>
            </Badge>
          ) : (
            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-xs">
              All Reviewed
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="p-3 rounded-lg bg-muted/40 border border-border/60">
            <span className="text-[11px] text-muted-foreground font-medium block">Total Errors</span>
            <span className="text-xl font-bold text-foreground">{totalIncorrect}</span>
          </div>
          <div className="p-3 rounded-lg bg-muted/40 border border-border/60">
            <span className="text-[11px] text-muted-foreground font-medium block">Struggle Topics</span>
            <span className="text-xl font-bold text-foreground">{recurringErrorTopicsCount}</span>
          </div>
        </div>

        {topStruggleTopic && (
          <div className="p-3 rounded-lg bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-xs">
            <span className="text-[10px] uppercase font-bold text-rose-600 block mb-0.5">Priority Topic</span>
            <p className="font-semibold text-foreground line-clamp-1">{topStruggleTopic.topicTitle}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {topStruggleTopic.incorrectCount} mistakes in {topStruggleTopic.subjectName}
            </p>
          </div>
        )}

        <Button asChild size="sm" className="w-full h-8 text-xs font-semibold justify-between">
          <Link href="/mistakes">
            <span>Open Mistake Intelligence</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

