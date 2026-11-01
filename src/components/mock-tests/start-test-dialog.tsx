"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Play,
  X,
  Clock,
  Award,
  Layers,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface StartTestDialogProps {
  testTitle: string;
  testCode: string;
  totalDuration: number;
  totalMarks: number;
  questionsToAttempt: number;
  totalQuestions: number;
  sectionsCount: number;
}

export function StartTestDialog({
  testTitle,
  testCode,
  totalDuration,
  totalMarks,
  questionsToAttempt,
  totalQuestions,
  sectionsCount,
}: StartTestDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        size="lg"
        onClick={() => setIsOpen(true)}
        className="w-full sm:w-auto font-bold shadow-md text-sm h-11 px-6 bg-primary hover:bg-primary/90 text-primary-foreground"
      >
        <Play className="w-4 h-4 mr-2 fill-current" />
        Start Examination
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-surface border border-border rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-border bg-muted/20 relative">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="absolute right-4 top-4 p-1.5 rounded-xl text-muted-foreground hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                  {testCode}
                </span>
                <Badge variant="outline" className="text-[10px]">
                  CBT Simulation
                </Badge>
              </div>

              <h3 className="text-lg font-bold text-foreground pr-6 leading-snug">
                {testTitle}
              </h3>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5">
              {/* CBT Engine Coming Notice */}
              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-2">
                <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  <span>Phase 9 Live CBT Engine Preview</span>
                </div>
                <p className="text-xs text-foreground leading-relaxed">
                  This mock examination has been formulated and validated in the MockMate Test Library
                  (Phase 8). The interactive <strong>Computer-Based Test (CBT) Examination Engine</strong>{" "}
                  featuring the live countdown clock, question palette, response auto-save, and instant evaluation
                  is scheduled for deployment in <strong>Phase 9</strong>.
                </p>
              </div>

              {/* Verified Exam Specifications */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Exam Parameters Configured
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-xl bg-muted/40 border border-border/50 flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-primary shrink-0" />
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Duration</span>
                      <span className="font-bold text-foreground">{totalDuration} Minutes</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-muted/40 border border-border/50 flex items-center gap-2.5">
                    <Award className="w-4 h-4 text-primary shrink-0" />
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Max Score</span>
                      <span className="font-bold text-foreground">{totalMarks} Marks</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-muted/40 border border-border/50 flex items-center gap-2.5">
                    <Layers className="w-4 h-4 text-primary shrink-0" />
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Questions</span>
                      <span className="font-bold text-foreground">
                        {questionsToAttempt} of {totalQuestions} ({sectionsCount} Sec)
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-muted/40 border border-border/50 flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Marking</span>
                      <span className="font-bold text-foreground">+5 / -1 Negative</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-muted-foreground flex items-center gap-2 bg-muted/20 p-2.5 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>All questions and optionality rules are compiled and verified for launch.</span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-xs"
              >
                Close Preview
              </Button>

              <Link href="/mock-tests">
                <Button size="sm" className="text-xs">
                  <span>Browse More Tests</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
