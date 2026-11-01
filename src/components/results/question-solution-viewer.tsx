"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Filter,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/layout/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { TestResultQuestionData } from "@/lib/validations/evaluation";

interface QuestionSolutionViewerProps {
  questions: TestResultQuestionData[];
}

type FilterType = "ALL" | "CORRECT" | "INCORRECT" | "UNANSWERED" | "MARKED";

export function QuestionSolutionViewer({ questions }: QuestionSolutionViewerProps) {
  const [filter, setFilter] = useState<FilterType>("ALL");
  const [activeQuestionId, setActiveQuestionId] = useState<string>(
    questions[0]?.id || ""
  );

  // Filter questions based on selected tab
  const filteredQuestions = questions.filter((q) => {
    switch (filter) {
      case "CORRECT":
        return q.status === "CORRECT";
      case "INCORRECT":
        return q.status === "INCORRECT";
      case "UNANSWERED":
        return q.status === "UNANSWERED";
      case "MARKED":
        return q.markedForReview;
      case "ALL":
      default:
        return true;
    }
  });

  // Ensure current active question is within filtered set or fallback to first
  const currentQuestion =
    filteredQuestions.find((q) => q.id === activeQuestionId) ||
    filteredQuestions[0] ||
    questions[0];

  const currentIndex = filteredQuestions.findIndex((q) => q.id === currentQuestion?.id);

  const handlePrev = () => {
    if (currentIndex > 0) {
      setActiveQuestionId(filteredQuestions[currentIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (currentIndex < filteredQuestions.length - 1) {
      setActiveQuestionId(filteredQuestions[currentIndex + 1].id);
    }
  };

  const counts = {
    all: questions.length,
    correct: questions.filter((q) => q.status === "CORRECT").length,
    incorrect: questions.filter((q) => q.status === "INCORRECT").length,
    unanswered: questions.filter((q) => q.status === "UNANSWERED").length,
    marked: questions.filter((q) => q.markedForReview).length,
  };

  if (!questions || questions.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground text-xs">
        No question solutions available for this attempt.
      </div>
    );
  }

  return (
    <Card className="border-border shadow-xs">
      <CardHeader className="p-4 sm:p-6 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <span>Question-by-Question Solution &amp; Review</span>
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Review your responses, correct keys, marks breakdown, and detailed explanations.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-muted/60 p-1 rounded-xl border border-border text-xs print:hidden">
          <Button
            variant={filter === "ALL" ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilter("ALL")}
            className="h-7 px-2.5 text-xs font-medium"
          >
            All ({counts.all})
          </Button>

          <Button
            variant={filter === "CORRECT" ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilter("CORRECT")}
            className="h-7 px-2.5 text-xs font-medium text-emerald-700 dark:text-emerald-300 hover:text-emerald-800"
          >
            Correct ({counts.correct})
          </Button>

          <Button
            variant={filter === "INCORRECT" ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilter("INCORRECT")}
            className="h-7 px-2.5 text-xs font-medium text-rose-700 dark:text-rose-300 hover:text-rose-800"
          >
            Incorrect ({counts.incorrect})
          </Button>

          <Button
            variant={filter === "UNANSWERED" ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilter("UNANSWERED")}
            className="h-7 px-2.5 text-xs font-medium"
          >
            Unanswered ({counts.unanswered})
          </Button>

          {counts.marked > 0 && (
            <Button
              variant={filter === "MARKED" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter("MARKED")}
              className="h-7 px-2.5 text-xs font-medium text-purple-700 dark:text-purple-300"
            >
              Marked ({counts.marked})
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-6">
        {/* Question Palette Number Grid */}
        <div className="space-y-2 print:hidden">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span className="flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              <span>Select Question ({filteredQuestions.length} shown)</span>
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 p-3 rounded-2xl bg-muted/30 border border-border max-h-36 overflow-y-auto">
            {filteredQuestions.map((q) => {
              const isSelected = q.id === currentQuestion?.id;
              let statusClass = "bg-muted/80 text-muted-foreground border-border";

              if (q.status === "CORRECT") {
                statusClass =
                  "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30";
              } else if (q.status === "INCORRECT") {
                statusClass =
                  "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30";
              }

              return (
                <button
                  key={q.id}
                  onClick={() => setActiveQuestionId(q.id)}
                  className={cn(
                    "w-8 h-8 rounded-lg text-xs font-mono font-bold border transition-all flex items-center justify-center relative",
                    statusClass,
                    isSelected && "ring-2 ring-primary ring-offset-2 scale-105 shadow-xs"
                  )}
                  title={`Question ${q.questionNumber}: ${q.status}`}
                >
                  {q.questionNumber}
                  {q.markedForReview && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-purple-600 border border-background" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Question Display */}
        {currentQuestion && (
          <div className="space-y-6 pt-2">
            {/* Question Header & Meta */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold font-mono text-primary bg-primary/10 px-2.5 py-1 rounded-lg">
                  Q{currentQuestion.questionNumber}
                </span>
                <span className="text-xs font-medium text-muted-foreground">
                  {currentQuestion.sectionTitle}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {currentQuestion.markedForReview && (
                  <Badge variant="outline" className="text-xs text-purple-700 dark:text-purple-300 border-purple-500/30 flex items-center gap-1">
                    <Bookmark className="w-3 h-3" />
                    <span>Marked for Review</span>
                  </Badge>
                )}

                {currentQuestion.status === "CORRECT" && (
                  <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Correct (+{currentQuestion.awardedMarks})</span>
                  </Badge>
                )}

                {currentQuestion.status === "INCORRECT" && (
                  <Badge variant="destructive" className="text-xs flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Incorrect ({currentQuestion.awardedMarks})</span>
                  </Badge>
                )}

                {currentQuestion.status === "UNANSWERED" && (
                  <Badge variant="secondary" className="text-xs flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Unanswered (0)</span>
                  </Badge>
                )}
              </div>
            </div>

            {/* Passage (if present) */}
            {currentQuestion.passageText && (
              <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-primary" />
                  <span>Reading Comprehension Passage</span>
                </div>
                <div className="text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                  {currentQuestion.passageText}
                </div>
              </div>
            )}

            {/* Question Text */}
            <div className="text-sm sm:text-base font-medium text-foreground leading-relaxed whitespace-pre-wrap">
              {currentQuestion.questionText}
            </div>

            {/* Options List */}
            <div className="space-y-3 pt-2">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Options &amp; Evaluated Keys:
              </div>

              <div className="space-y-2">
                {currentQuestion.options.map((opt) => {
                  const isStudentSelected = currentQuestion.selectedOptionId === opt.id;
                  const isCorrectAnswer = opt.isCorrect;

                  let borderClass = "border-border bg-surface";
                  if (isCorrectAnswer) {
                    borderClass =
                      "border-emerald-500 bg-emerald-500/10 dark:bg-emerald-950/20";
                  } else if (isStudentSelected && !isCorrectAnswer) {
                    borderClass =
                      "border-rose-500 bg-rose-500/10 dark:bg-rose-950/20";
                  }

                  return (
                    <div
                      key={opt.id}
                      className={cn(
                        "p-3.5 rounded-xl border text-xs sm:text-sm flex items-start justify-between gap-3 transition-colors",
                        borderClass
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={cn(
                            "w-6 h-6 rounded-md font-mono font-bold text-xs flex items-center justify-center shrink-0 border",
                            isCorrectAnswer
                              ? "bg-emerald-600 text-white border-emerald-600"
                              : isStudentSelected
                              ? "bg-rose-600 text-white border-rose-600"
                              : "bg-muted/80 text-muted-foreground border-border"
                          )}
                        >
                          {opt.optionLabel}
                        </span>
                        <span className="text-foreground leading-relaxed pt-0.5">
                          {opt.optionText}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                        {isStudentSelected && (
                          <Badge
                            variant={isCorrectAnswer ? "default" : "destructive"}
                            className="text-[10px] font-semibold"
                          >
                            Your Answer
                          </Badge>
                        )}
                        {isCorrectAnswer && (
                          <Badge
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-semibold"
                          >
                            Correct Answer
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Explanation & Solution */}
            {currentQuestion.explanation && (
              <div className="p-4 rounded-2xl bg-primary/5 dark:bg-primary/10 border border-primary/20 space-y-2 mt-4">
                <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Step-by-Step Solution &amp; Academic Explanation</span>
                </div>
                <div className="text-xs sm:text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                  {currentQuestion.explanation}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-border print:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="text-xs flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous Question</span>
              </Button>

              <span className="text-xs text-muted-foreground font-mono">
                {currentIndex + 1} of {filteredQuestions.length}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                disabled={currentIndex === filteredQuestions.length - 1}
                className="text-xs flex items-center gap-1.5"
              >
                <span>Next Question</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
