import React from "react";
import Link from "next/link";
import { Clock, History, FileText, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/layout/card";
import { Button } from "@/components/ui/button";

export interface ActivityItem {
  id: string;
  type: "MOCK_EXAM" | "PRACTICE_DRILL";
  title: string;
  score?: number;
  maxScore?: number;
  completedAt: string;
}

export interface RecentActivitySectionProps {
  activities?: ActivityItem[];
}

export function RecentActivitySection({ activities = [] }: RecentActivitySectionProps) {
  return (
    <Card className="border-border shadow-2xs">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground">Recent Activity</h2>
          </div>
          <span className="text-xs text-muted-foreground font-medium">
            {activities.length} Recorded
          </span>
        </div>

        {activities.length === 0 ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-10 h-10 rounded-xl bg-muted text-muted-foreground flex items-center justify-center mx-auto">
              <Clock className="w-5 h-5" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <p className="text-xs font-bold text-foreground">
                No recent practice activity
              </p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Your completed full-length mock examinations, practice drills, and
                scorecards will be recorded here once Phase 7 and 9 testing starts.
              </p>
            </div>
            <div className="pt-1">
              <Button variant="outline" size="sm" asChild className="text-xs">
                <Link href="/cuet-subjects">
                  <span>Explore CUET Test Pattern</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {activities.map((act) => (
              <Link
                key={act.id}
                href={`/results/${act.id}`}
                className="p-3 rounded-lg border border-border flex items-center justify-between text-xs hover:border-primary/50 hover:bg-muted/30 transition-all group block"
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-primary group-hover:scale-105 transition-transform" />
                  <div>
                    <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {act.title}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {act.completedAt}
                    </div>
                  </div>
                </div>
                {act.score !== undefined && act.maxScore !== undefined && (
                  <div className="text-right">
                    <span className="font-bold text-foreground font-mono">
                      {act.score} / {act.maxScore}
                    </span>
                    <span className="block text-[10px] text-primary">
                      View Result →
                    </span>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
