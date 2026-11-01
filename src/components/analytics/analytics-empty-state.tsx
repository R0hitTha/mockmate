import React from "react";
import Link from "next/link";
import { BarChart3, FileCheck2, ArrowRight, Target, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/layout/card";
import { Button } from "@/components/ui/button";

export function AnalyticsEmptyState() {
  const previewFeatures = [
    {
      title: "Score Progression Curves",
      desc: "Track normalized test scores over time to see tangible preparation gains.",
      icon: BarChart3,
    },
    {
      title: "Subject & Topic Mastery",
      desc: "Identify exactly which NCERT chapters are scoring high vs. losing negative marks.",
      icon: Target,
    },
    {
      title: "Pacing & Speed Diagnostics",
      desc: "Measure mean question-resolution speed against the official CUET 54s/Q standard.",
      icon: Clock,
    },
  ];

  return (
    <Card className="border-border shadow-xs">
      <CardContent className="p-8 sm:p-12 text-center space-y-6 max-w-xl mx-auto">
        <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-xs">
          <BarChart3 className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">
            No Performance Data Recorded Yet
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Your performance diagnostics, subject mastery percentages, time management pacing, and topic insights will activate automatically after you complete your first CUET mock test.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left pt-2">
          {previewFeatures.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-1.5"
              >
                <div className="w-7 h-7 rounded-lg bg-surface border border-border flex items-center justify-center text-primary">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <h4 className="text-xs font-bold text-foreground">{f.title}</h4>
                <p className="text-[11px] text-muted-foreground leading-tight">
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>

        <div className="pt-2">
          <Link href="/mock-tests">
            <Button className="text-xs font-bold shadow-xs">
              <FileCheck2 className="w-4 h-4 mr-1.5" />
              <span>Explore CUET Mock Tests</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

