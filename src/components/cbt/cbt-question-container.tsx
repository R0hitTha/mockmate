import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CBTQuestionContainerProps {
  questionNumber: number;
  totalQuestions?: number;
  sectionName?: string;
  marksPositive?: number;
  marksNegative?: number;
  questionText: string;
  children: React.ReactNode;
  actionBar?: React.ReactNode;
  className?: string;
}

export function CBTQuestionContainer({
  questionNumber,
  totalQuestions,
  sectionName = "Section II: Domain Subject",
  marksPositive = 5,
  marksNegative = 1,
  questionText,
  children,
  actionBar,
  className,
}: CBTQuestionContainerProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-surface shadow-xs flex flex-col overflow-hidden",
        className
      )}
    >
      {/* CBT Question Meta Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3.5 border-b border-border bg-muted/40">
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-bold text-foreground">
            Question {questionNumber} {totalQuestions && `of ${totalQuestions}`}
          </span>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span className="text-xs font-medium text-muted-foreground truncate max-w-xs">
            {sectionName}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="success" className="text-[11px] font-mono">
            +{marksPositive}
          </Badge>
          <Badge variant="destructive" className="text-[11px] font-mono">
            -{marksNegative}
          </Badge>
        </div>
      </div>

      {/* Question Text Body */}
      <div className="p-5 sm:p-7 space-y-6">
        <div className="text-sm sm:text-base text-foreground leading-relaxed font-normal">
          {questionText}
        </div>

        {/* Options List */}
        <div className="space-y-3">{children}</div>
      </div>

      {/* CBT Navigation Action Bar */}
      {actionBar && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:px-7 border-t border-border bg-muted/20 mt-auto">
          {actionBar}
        </div>
      )}
    </div>
  );
}
