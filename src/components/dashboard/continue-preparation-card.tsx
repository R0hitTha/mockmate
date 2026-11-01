import React from "react";
import Link from "next/link";
import { BookOpen, ArrowRight, Sparkles, CheckCircle2, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/layout/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface ContinuePreparationCardProps {
  enrolledSubjectCount: number;
  targetExamYear: number;
}

export function ContinuePreparationCard({
  enrolledSubjectCount,
  targetExamYear,
}: ContinuePreparationCardProps) {
  return (
    <Card className="border-border shadow-xs overflow-hidden bg-gradient-to-br from-card via-card to-blue-50/30 dark:to-blue-950/20">
      <CardContent className="p-6 sm:p-7 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-foreground">
                  Your CUET UG {targetExamYear} Practice Pipeline
                </h3>
                <Badge variant="secondary" className="text-[10px] font-semibold">
                  {enrolledSubjectCount} Papers Ready
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Your preparation profile is configured with authentic CUET examination
                papers.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button size="sm" asChild className="text-xs font-semibold">
              <Link href="/profile">
                <span>Configure Subjects</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          <div className="p-3.5 rounded-xl border border-border bg-card/60 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>NCERT Class 12 Alignment</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Every question will map directly to the NTA CUET syllabus and NCERT
              textbooks.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-border bg-card/60 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
              <Clock className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Full CBT Simulator</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Authentic computer-based examination screen with exact palettes (+5 / -1
              marks).
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-border bg-card/60 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
              <BookOpen className="w-4 h-4 text-purple-600 shrink-0" />
              <span>Deep Explanations</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Step-by-step solutions with concept recaps for all questions in upcoming
              Phase 7.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
