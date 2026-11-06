import React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/layout/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { RevisionRecommendation } from "@/lib/validations/mistakes";

interface MistakeRecommendationsCardProps {
  recommendations: RevisionRecommendation[];
}

export function MistakeRecommendationsCard({
  recommendations,
}: MistakeRecommendationsCardProps) {
  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  const getPriorityBadge = (p: RevisionRecommendation["priority"]) => {
    switch (p) {
      case "HIGH":
        return <Badge className="bg-rose-600 text-white text-[10px]">Priority Action</Badge>;
      case "MEDIUM":
        return <Badge variant="secondary" className="text-[10px]">Recommended</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px] text-muted-foreground">Follow-up</Badge>;
    }
  };

  return (
    <Card className="border border-border">
      <CardHeader className="pb-3 border-b border-border/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>Targeted Revision Guidance</span>
          </CardTitle>
          <span className="text-xs text-muted-foreground">
            Derived deterministically from recent mock attempts
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className="p-4 rounded-lg border border-border/70 bg-card hover:border-primary/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <h4 className="text-xs font-semibold text-foreground">{rec.title}</h4>
                  {getPriorityBadge(rec.priority)}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {rec.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-border/50">
                <Button asChild size="sm" variant="default" className="w-full h-8 text-xs font-medium justify-between">
                  <Link href={rec.actionHref}>
                    <span>{rec.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
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

