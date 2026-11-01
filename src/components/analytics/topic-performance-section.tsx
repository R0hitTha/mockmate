import React from "react";
import { Layers, AlertCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/layout/card";
import { Badge } from "@/components/ui/badge";
import type { TopicPerformanceMetric } from "@/lib/validations/analytics";

interface TopicPerformanceSectionProps {
  topics: TopicPerformanceMetric[];
}

export function TopicPerformanceSection({
  topics,
}: TopicPerformanceSectionProps) {
  if (!topics || topics.length === 0) {
    return (
      <Card className="border-border shadow-xs">
        <CardContent className="p-8 text-center text-xs text-muted-foreground">
          No topic-level syllabus data recorded yet. Topic insights become available once questions mapped to NCERT chapters are attempted.
        </CardContent>
      </Card>
    );
  }

  // Group topics by Subject
  const groupedBySubject = new Map<string, TopicPerformanceMetric[]>();
  topics.forEach((t) => {
    const arr = groupedBySubject.get(t.subjectName) || [];
    arr.push(t);
    groupedBySubject.set(t.subjectName, arr);
  });

  return (
    <Card className="border-border shadow-xs">
      <CardHeader className="p-5 border-b border-border flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-primary" />
          <CardTitle className="text-base font-bold text-foreground">
            Topic-Level Syllabus Diagnostics
          </CardTitle>
        </div>
        <span className="text-xs text-muted-foreground">
          Derived from NCERT syllabus mapping
        </span>
      </CardHeader>

      <CardContent className="p-5 space-y-6">
        {Array.from(groupedBySubject.entries()).map(([subjectName, subjectTopics]) => (
          <div key={subjectName} className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <span>{subjectName} Topics</span>
              <span className="text-[10px] font-normal text-muted-foreground">
                ({subjectTopics.length})
              </span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {subjectTopics.map((topic, idx) => {
                const isInsufficient = topic.status === "INSUFFICIENT_DATA";
                const isStrong = topic.status === "STRONG";
                const isNeedsPractice = topic.status === "NEEDS_PRACTICE";

                return (
                  <div
                    key={`${topic.topicTitle}-${idx}`}
                    className="p-3.5 rounded-xl border border-border bg-surface flex flex-col justify-between gap-3 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        {topic.unitNumber && (
                          <span className="text-[10px] font-mono text-muted-foreground block">
                            Unit {topic.unitNumber}
                          </span>
                        )}
                        <h5 className="font-semibold text-foreground text-sm leading-snug">
                          {topic.topicTitle}
                        </h5>
                      </div>

                      <Badge
                        variant={
                          isStrong
                            ? "default"
                            : isNeedsPractice
                            ? "destructive"
                            : "outline"
                        }
                        className="text-[10px] shrink-0 font-medium"
                      >
                        {isStrong
                          ? "Strong"
                          : isNeedsPractice
                          ? "Revision Advised"
                          : isInsufficient
                          ? "Low Sample"
                          : "Moderate"}
                      </Badge>
                    </div>

                    <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground">
                        {topic.sampleSize} {topic.sampleSize === 1 ? "question" : "questions"} attempted
                      </span>

                      {isInsufficient ? (
                        <span className="text-muted-foreground italic text-[10px] flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 text-muted-foreground" />
                          <span>More practice needed</span>
                        </span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-700 dark:text-emerald-300 font-mono font-medium">
                            {topic.correctCount}✔
                          </span>
                          <span className="text-rose-700 dark:text-rose-300 font-mono font-medium">
                            {topic.incorrectCount}✘
                          </span>
                          <span className="font-mono font-bold text-foreground">
                            {topic.accuracy.toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

