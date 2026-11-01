"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileCheck2,
  Layers,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  Loader2,
  CheckSquare,
  Square,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { startTestAttemptAction } from "@/actions/cbt-actions";

interface InstructionsViewerProps {
  test: {
    id: string;
    title: string;
    testCode: string;
    totalDuration: number;
    totalMarks: number;
    totalQuestions: number;
    questionsToAttempt: number;
    isOfficialPattern: boolean;
    instructions?: string | null;
    sections: Array<{
      id: string;
      title: string;
      subjectName: string;
      subjectCode: string;
      sectionType: string;
      totalQuestions: number;
      questionsToAttempt: number;
      totalMarks: number;
    }>;
  };
}

export function InstructionsViewer({ test }: InstructionsViewerProps) {
  const router = useRouter();
  const [confirmed, setConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartExam = async () => {
    if (!confirmed) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await startTestAttemptAction(test.id);
      if (res.success && res.data?.attemptId) {
        router.push(`/exam/${res.data.attemptId}`);
      } else {
        setError(res.error || "Failed to start examination. Please try again.");
        setIsLoading(false);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(msg);
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-6 px-4">
      {/* Test Header Brief */}
      <div className="bg-surface border border-border rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-md">
              {test.testCode}
            </span>
            {test.isOfficialPattern && (
              <Badge variant="outline" className="border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 text-xs">
                Official NTA Pattern
              </Badge>
            )}
          </div>
          <Badge variant="outline" className="text-xs">
            Computer-Based Test (CBT)
          </Badge>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            {test.title}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Please read the examination guidelines and palette navigation rules carefully before entering the examination room.
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-border/60">
          <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/50">
            <span className="text-[11px] text-muted-foreground block font-medium">Duration</span>
            <span className="text-base sm:text-lg font-bold text-foreground mt-0.5 block font-mono">
              {test.totalDuration} Minutes
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/50">
            <span className="text-[11px] text-muted-foreground block font-medium">Total Marks</span>
            <span className="text-base sm:text-lg font-bold text-foreground mt-0.5 block font-mono">
              {test.totalMarks} Marks
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/50">
            <span className="text-[11px] text-muted-foreground block font-medium">To Attempt</span>
            <span className="text-base sm:text-lg font-bold text-foreground mt-0.5 block font-mono">
              {test.questionsToAttempt} of {test.totalQuestions} Qs
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/50">
            <span className="text-[11px] text-muted-foreground block font-medium">Marking Scheme</span>
            <span className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block font-mono">
              +5 / -1 Marks
            </span>
          </div>
        </div>
      </div>

      {/* Sections Breakdown */}
      <div className="bg-surface border border-border rounded-3xl p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-foreground flex items-center gap-2">
          <Layers className="w-4 h-4 text-primary" />
          <span>Paper Sections & Question Requirements</span>
        </h2>

        <div className="space-y-3">
          {test.sections.map((section, idx) => (
            <div
              key={section.id}
              className="p-4 rounded-2xl border border-border bg-background space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">
                  Section {idx + 1}: {section.title}
                </span>
                <span className="text-[11px] font-mono text-muted-foreground">
                  {section.subjectName} ({section.subjectCode})
                </span>
              </div>
              <p className="text-xs text-muted-foreground font-mono">
                Total {section.totalQuestions} Questions • You are required to attempt{" "}
                <strong className="text-foreground">{section.questionsToAttempt} questions</strong> •{" "}
                {section.totalMarks} Marks
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Official 5-Color Question Palette Legend */}
      <div className="bg-surface border border-border rounded-3xl p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-foreground flex items-center gap-2">
          <FileCheck2 className="w-4 h-4 text-primary" />
          <span>Question Palette Navigation Legend</span>
        </h2>
        <p className="text-xs text-muted-foreground">
          The question palette on the right side of the screen shows the status of each question using the official 5-color NTA convention:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
          <div className="p-3 rounded-2xl border border-border bg-background flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center shrink-0">
              01
            </div>
            <div>
              <span className="text-xs font-bold text-foreground block">Not Visited</span>
              <span className="text-[10px] text-muted-foreground">Question not yet viewed</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl border border-rose-500/30 bg-rose-500/5 flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-rose-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
              02
            </div>
            <div>
              <span className="text-xs font-bold text-rose-700 dark:text-rose-400 block">Not Answered</span>
              <span className="text-[10px] text-muted-foreground">Viewed without selecting answer</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
              03
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 block">Answered</span>
              <span className="text-[10px] text-muted-foreground">Response selected & saved</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl border border-purple-500/30 bg-purple-500/5 flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
              04
            </div>
            <div>
              <span className="text-xs font-bold text-purple-700 dark:text-purple-400 block">Marked for Review</span>
              <span className="text-[10px] text-muted-foreground">Unanswered & flagged for recheck</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl border border-purple-500/30 bg-purple-500/5 sm:col-span-2 md:col-span-2 flex items-center gap-3">
            <div className="relative w-7 h-7 rounded-lg bg-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
              05
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-surface" />
            </div>
            <div>
              <span className="text-xs font-bold text-purple-700 dark:text-purple-400 block">
                Answered & Marked for Review
              </span>
              <span className="text-[10px] text-muted-foreground">
                Answer is saved and will be evaluated, but flagged for later check
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* General Instructions */}
      <div className="bg-surface border border-border rounded-3xl p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-foreground flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <span>General Examination Instructions</span>
        </h2>

        <div className="text-xs text-muted-foreground space-y-2.5 leading-relaxed">
          <p>
            1. The clock will be set at the server. The countdown timer in the top right corner will display the remaining time available for you to complete the examination.
          </p>
          <p>
            2. When the timer reaches zero, the examination will end automatically. You do not need to end or submit the examination manually upon time expiry.
          </p>
          <p>
            3. All answers are automatically persisted to the server. If your browser window is accidentally closed or refreshed, your answers and remaining time are preserved.
          </p>
          <p>
            4. Click <strong>&quot;Save &amp; Next&quot;</strong> to save your answer for the current question and then go to the next question.
          </p>
          <p>
            5. Click <strong>&quot;Clear Response&quot;</strong> to deselect the chosen answer for the current question.
          </p>
          <p>
            6. Click <strong>&quot;Mark for Review &amp; Next&quot;</strong> to save your answer or flag the question for review and then move to the next question.
          </p>
        </div>
      </div>

      {/* Confirmation & Start Action */}
      <div className="bg-surface border border-border rounded-3xl p-6 shadow-xs space-y-4">
        {error && (
          <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div
          onClick={() => setConfirmed(!confirmed)}
          className="flex items-start gap-3 p-4 rounded-2xl border border-border bg-background cursor-pointer hover:border-primary/40 transition-colors select-none"
        >
          <button
            type="button"
            className="mt-0.5 text-primary shrink-0 focus:outline-hidden"
          >
            {confirmed ? (
              <CheckSquare className="w-5 h-5 fill-primary text-primary-foreground" />
            ) : (
              <Square className="w-5 h-5 text-muted-foreground" />
            )}
          </button>
          <label className="text-xs text-foreground font-medium cursor-pointer leading-relaxed">
            I have read and understood all the instructions above. I declare that I will attempt the examination fairly and abide by the computer-based testing guidelines.
          </label>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            disabled={isLoading}
            className="w-full sm:w-auto text-xs"
          >
            Return to Test Details
          </Button>

          <Button
            size="lg"
            disabled={!confirmed || isLoading}
            onClick={handleStartExam}
            className="w-full sm:w-auto font-bold text-xs h-11 px-8 shadow-md"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                <span>Entering Examination Room...</span>
              </>
            ) : (
              <>
                <span>I am Ready to Begin</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
