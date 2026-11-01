import React from "react";
import Link from "next/link";
import { BarChart3, LineChart, Target, Zap, Clock, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/layout/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function PerformanceSnapshotSection() {
  const analyticsFeatures = [
    {
      title: "Score Progression",
      desc: "Track score trends across successive test attempts",
      icon: LineChart,
    },
    {
      title: "Accuracy by Subject",
      desc: "Identify strong vs high-risk weak chapters",
      icon: Target,
    },
    {
      title: "Time vs Accuracy",
      desc: "Identify time-consuming question traps",
      icon: Clock,
    },
    {
      title: "Percentile Benchmark",
      desc: "Compare performance with CUET test-takers nationwide",
      icon: Zap,
    },
  ];

  return (
    <Card className="border-border shadow-2xs">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground">Performance Snapshot</h2>
          </div>
          <Badge
            variant="outline"
            className="text-[10px] text-muted-foreground font-normal"
          >
            Awaiting Test Attempts
          </Badge>
        </div>

        {/* Empty Analytics State */}
        <div className="py-6 px-4 rounded-xl bg-muted/30 border border-border/80 text-center space-y-3">
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-xs font-bold text-foreground">
              Analytics Unlock After Your First Mock Test
            </h3>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              We do not fabricate performance charts or synthetic percentiles. Detailed
              diagnostic curves and mistake analysis will generate automatically after
              your test attempts in Phase 9 and 10.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 max-w-xl mx-auto text-left">
            {analyticsFeatures.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="p-2.5 rounded-lg border border-border/80 bg-card space-y-1 shadow-2xs"
                >
                  <Icon className="w-3.5 h-3.5 text-primary" />
                  <div className="text-[11px] font-bold text-foreground">
                    {item.title}
                  </div>
                  <div className="text-[9px] text-muted-foreground leading-tight">
                    {item.desc}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2">
            <Button variant="outline" size="sm" asChild className="text-xs">
              <Link href="/analytics">
                <span>View Analytics Roadmap</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
