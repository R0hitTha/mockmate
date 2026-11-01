import React from "react";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/layout/card";
import { Badge } from "@/components/ui/badge";
import type { DiagnosticInsight } from "@/lib/validations/analytics";

interface InsightsSectionProps {
  insights: DiagnosticInsight[];
  hasCompletedTests: boolean;
}

export function InsightsSection({
  insights,
  hasCompletedTests,
}: InsightsSectionProps) {
  const strengths = insights.filter((i) => i.type === "STRENGTH");
  const improvements = insights.filter((i) => i.type === "IMPROVEMENT_AREA");

  if (!hasCompletedTests) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* 1. Strong Areas Panel */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-5 border-b border-border flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <CardTitle className="text-base font-bold text-foreground">
              Demonstrated Strengths
            </CardTitle>
          </div>
          <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px]">
            Accuracy ≥ 70%
          </Badge>
        </CardHeader>

        <CardContent className="p-5 space-y-3">
          {strengths.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground">
              Complete more questions in your preferred subjects to identify established high-accuracy strengths.
            </div>
          ) : (
            <div className="space-y-3">
              {strengths.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-foreground">
                      {item.title}
                    </span>
                    <Badge variant="outline" className="text-[10px] text-emerald-700 dark:text-emerald-300 font-mono">
                      {item.metricValue}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-[11px]">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2. Priority Improvement Areas Panel */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-5 border-b border-border flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <CardTitle className="text-base font-bold text-foreground">
              Priority Revision Areas
            </CardTitle>
          </div>
          <Badge variant="destructive" className="text-[10px]">
            Accuracy &lt; 50%
          </Badge>
        </CardHeader>

        <CardContent className="p-5 space-y-3">
          {improvements.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground">
              Great job! No high-error chapters currently fall below the 50% accuracy threshold.
            </div>
          ) : (
            <div className="space-y-3">
              {improvements.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-rose-500/5 border border-rose-500/20 space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-foreground">
                      {item.title}
                    </span>
                    <Badge variant="outline" className="text-[10px] text-rose-700 dark:text-rose-300 font-mono">
                      {item.metricValue}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-[11px]">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

