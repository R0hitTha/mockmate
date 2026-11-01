import React from "react";
import Link from "next/link";
import { CalendarDays, Clock, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/layout/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface UpcomingDeadlinesProps {
  targetExamYear: number;
}

export function UpcomingDeadlines({ targetExamYear }: UpcomingDeadlinesProps) {
  const milestones = [
    {
      title: "NTA CUET Information Bulletin Release",
      dateRange: "February 2026",
      status: "Tentative",
      badgeVariant: "outline" as const,
      desc: "Release of official syllabus, test structure, and list of participating universities.",
    },
    {
      title: "CUET Online Application Window",
      dateRange: "February – March 2026",
      status: "Upcoming",
      badgeVariant: "secondary" as const,
      desc: "Submission of online examination application form on exams.nta.ac.in.",
    },
    {
      title: "Advanced City Intimation Slip",
      dateRange: "First Week of May 2026",
      status: "Upcoming",
      badgeVariant: "secondary" as const,
      desc: "Allotment of examination city to facilitate travel arrangements.",
    },
    {
      title: `CUET UG ${targetExamYear} Examination Window`,
      dateRange: "May 15 – May 31, 2026",
      status: "Major Milestone",
      badgeVariant: "default" as const,
      desc: "Official NTA computer-based examination window conducted across multiple shifts.",
    },
  ];

  return (
    <Card className="border-border shadow-2xs">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground">
              Key CUET UG {targetExamYear} Milestones
            </h2>
          </div>
          <span className="text-[11px] text-muted-foreground font-medium">
            Official NTA Timeline
          </span>
        </div>

        <div className="space-y-3">
          {milestones.map((m) => (
            <div
              key={m.title}
              className="p-3.5 rounded-xl border border-border/80 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground">{m.title}</span>
                  <Badge variant={m.badgeVariant} className="text-[9px] px-1.5 py-0">
                    {m.status}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground">{m.desc}</p>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-semibold text-primary shrink-0 self-start sm:self-center">
                <Clock className="w-3.5 h-3.5" />
                <span>{m.dateRange}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border">
          <span className="text-[11px] text-muted-foreground">
            Personal test booking and revision schedules will integrate in Phase 11 (Study
            Planner).
          </span>
          <Button variant="ghost" size="sm" asChild className="text-xs h-8">
            <Link href="/cuet-subjects">
              <span>View Official Exam Format</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
