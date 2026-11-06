import React from "react";
import Link from "next/link";
import { AlertTriangle, Layers, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/layout/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { TopicRevisitItem } from "@/lib/validations/mistakes";

interface TopicsToRevisitSectionProps {
  topics: TopicRevisitItem[];
}

export function TopicsToRevisitSection({ topics }: TopicsToRevisitSectionProps) {
  if (!topics || topics.length === 0) {
    return (
      <Card className="border border-border">
        <CardContent className="p-8 text-center">
          <Layers className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-sm font-medium text-foreground">No Recurring Topic Errors</p>
          <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1">
            As you complete mock exams, topics where you encounter repeated mistakes or concept gaps will appear here with evidence-backed practice recommendations.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (status: TopicRevisitItem["status"]) => {
    switch (status) {
      case "CONCEPT_GAP":
        return (
          <Badge className="bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-900/40 text-[10px]">
            Possible Concept Gap
          </Badge>
        );
      case "REPEATED_STRUGGLE":
        return (
          <Badge className="bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-900/40 text-[10px]">
            Recurring Struggle
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-[10px] text-muted-foreground">
            Limited Evidence (N &lt; 3)
          </Badge>
        );
    }
  };

  return (
    <Card className="border border-border">
      <CardHeader className="pb-3 border-b border-border/60">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Topics Requiring Focused Revision</span>
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {topics.length} Identified Topics
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5">
        <div className="space-y-3">
          {topics.map((t, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-lg border border-border/70 bg-card hover:border-primary/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-foreground">{t.topicTitle}</span>
                  <Badge variant="secondary" className="text-[10px] uppercase font-mono">
                    {t.subjectName}
                  </Badge>
                  {getStatusBadge(t.status)}
                </div>
                <p className="text-xs text-muted-foreground">{t.reason}</p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground pt-0.5">
                  <span>
                    Attempted: <strong className="text-foreground">{t.attemptedCount}</strong>
                  </span>
                  <span>
                    Incorrect: <strong className="text-rose-600">{t.incorrectCount}</strong>
                  </span>
                  <span>
                    Accuracy: <strong className="text-foreground">{t.accuracy}%</strong>
                  </span>
                  <span>
                    Sample Size: <strong className="text-foreground">N={t.sampleSize}</strong>
                  </span>
                </div>
              </div>

              <div className="shrink-0 flex items-center sm:self-center">
                <Button asChild size="sm" variant="outline" className="h-8 text-xs font-medium gap-1.5 w-full sm:w-auto">
                  <Link href={`/mistakes/review?topic=${encodeURIComponent(t.topicTitle)}`}>
                    <span>Review Topic</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

