"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Flag,
  RotateCcw,
  Send,
  Menu,
  X,
  WifiOff,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/brand/logo";
import { type ExamPayload } from "@/lib/cbt-service";
import {
  saveAttemptAnswerAction,
  submitAttemptAction,
} from "@/actions/cbt-actions";
import { type AnswerStatus } from "@/lib/validations/cbt";

interface CBTExamInterfaceProps {
  payload: ExamPayload;
}

interface LocalAnswerState {
  selectedOptionId: string | null;
  selectedOptionIds: string[];
  answerStatus: AnswerStatus;
  markedForReview: boolean;
  version: number;
}

export function CBTExamInterface({ payload }: CBTExamInterfaceProps) {
  const router = useRouter();
  const { attempt, sections } = payload;

  // Flatten questions list for overall navigation
  const allFlattenedQuestions = React.useMemo(() => {
    return sections.flatMap((sec) =>
      sec.questions.map((q) => ({
        ...q,
        sectionId: sec.id,
        sectionTitle: sec.title,
      }))
    );
  }, [sections]);

  // Active Navigation State
  const [activeSectionId, setActiveSectionId] = useState<string>(
    sections[0]?.id || ""
  );
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);
  const [isPaletteOpenMobile, setIsPaletteOpenMobile] = useState<boolean>(false);

  // Answers Map State
  const [answersMap, setAnswersMap] = useState<Record<string, LocalAnswerState>>(
    () => {
      const initial: Record<string, LocalAnswerState> = {};
      allFlattenedQuestions.forEach((q, idx) => {
        const serverAns = payload.answers[q.id];
        if (serverAns) {
          initial[q.id] = {
            selectedOptionId: serverAns.selectedOptionId,
            selectedOptionIds: serverAns.selectedOptionIds || [],
            answerStatus:
              idx === 0 && serverAns.answerStatus === "NOT_VISITED"
                ? "NOT_ANSWERED"
                : serverAns.answerStatus,
            markedForReview: serverAns.markedForReview,
            version: serverAns.version || 1,
          };
        } else {
          initial[q.id] = {
            selectedOptionId: null,
            selectedOptionIds: [],
            answerStatus: idx === 0 ? "NOT_ANSWERED" : "NOT_VISITED",
            markedForReview: false,
            version: 1,
          };
        }
      });
      return initial;
    }
  );

  // Network & Save Status
  const [saveStatus, setSaveStatus] = useState<"SAVED" | "SAVING" | "OFFLINE">("SAVED");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isTimeExpired, setIsTimeExpired] = useState(false);

  // Authoritative Server-Synced Timer
  const [remainingSeconds, setRemainingSeconds] = useState<number>(() => {
    const expiresAtMs = new Date(attempt.expiresAt).getTime();
    return Math.max(0, Math.floor((expiresAtMs - Date.now()) / 1000));
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Current Question
  const currentQuestion = allFlattenedQuestions[activeQuestionIndex];
  const currentAnswer = currentQuestion ? answersMap[currentQuestion.id] : null;

  // Handle Automatic Timeout Submission
  const handleAutoSubmit = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setIsTimeExpired(true);

    try {
      await submitAttemptAction(attempt.id, true);
      router.push(`/exam/${attempt.id}/submitted`);
    } catch {
      router.push(`/exam/${attempt.id}/submitted`);
    }
  }, [attempt.id, isSubmitting, router]);

  // Countdown timer loop
  useEffect(() => {
    timerRef.current = setInterval(() => {
      const expiresAtMs = new Date(attempt.expiresAt).getTime();
      const secondsLeft = Math.max(0, Math.floor((expiresAtMs - Date.now()) / 1000));

      setRemainingSeconds(secondsLeft);

      if (secondsLeft <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        handleAutoSubmit();
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [attempt.expiresAt, handleAutoSubmit]);

  // Format Timer HH:MM:SS
  const formatTime = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;

    const pad = (n: number) => n.toString().padStart(2, "0");
    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }
    return `${pad(minutes)}:${pad(seconds)}`;
  };

  // Initial mount: ensure first question is recorded as NOT_ANSWERED if previously NOT_VISITED
  useEffect(() => {
    const firstQ = allFlattenedQuestions[0];
    if (firstQ) {
      const ans = payload.answers[firstQ.id];
      if (!ans || ans.answerStatus === "NOT_VISITED") {
        saveAttemptAnswerAction({
          attemptId: attempt.id,
          questionId: firstQ.id,
          selectedOptionId: null,
          markedForReview: false,
          answerStatus: "NOT_ANSWERED",
          clientVersion: ans?.version || 1,
        }).catch(() => {
          // Silently tolerate
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save Answer helper
  const persistAnswer = async (
    questionId: string,
    selectedOptionId: string | null,
    markedForReview: boolean,
    targetStatus: AnswerStatus
  ) => {
    setSaveStatus("SAVING");
    const current = answersMap[questionId];
    const clientVersion = current ? current.version : 1;

    try {
      const res = await saveAttemptAnswerAction({
        attemptId: attempt.id,
        questionId,
        selectedOptionId,
        markedForReview,
        answerStatus: targetStatus,
        clientVersion,
      });

      if (res.success && res.data) {
        setAnswersMap((prev) => ({
          ...prev,
          [questionId]: {
            selectedOptionId,
            selectedOptionIds: selectedOptionId ? [selectedOptionId] : [],
            markedForReview,
            answerStatus: res.data!.answerStatus,
            version: res.data!.version,
          },
        }));
        setSaveStatus("SAVED");
      } else {
        setSaveStatus("OFFLINE");
      }
    } catch {
      setSaveStatus("OFFLINE");
    }
  };

  // Option Click Handler
  const handleSelectOption = (optionId: string) => {
    if (!currentQuestion) return;

    const isCurrentSelected = currentAnswer?.selectedOptionId === optionId;
    const newSelectedId = isCurrentSelected ? null : optionId;
    const isMarked = currentAnswer?.markedForReview || false;

    let newStatus: AnswerStatus;
    if (newSelectedId) {
      newStatus = isMarked ? "ANSWERED_AND_MARKED_FOR_REVIEW" : "ANSWERED";
    } else {
      newStatus = isMarked ? "MARKED_FOR_REVIEW" : "NOT_ANSWERED";
    }

    // Optimistic UI update
    setAnswersMap((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        selectedOptionId: newSelectedId,
        selectedOptionIds: newSelectedId ? [newSelectedId] : [],
        markedForReview: isMarked,
        answerStatus: newStatus,
        version: (prev[currentQuestion.id]?.version || 1) + 1,
      },
    }));

    persistAnswer(currentQuestion.id, newSelectedId, isMarked, newStatus);
  };

  // Action: Clear Response
  const handleClearResponse = () => {
    if (!currentQuestion) return;
    const isMarked = currentAnswer?.markedForReview || false;
    const newStatus: AnswerStatus = isMarked ? "MARKED_FOR_REVIEW" : "NOT_ANSWERED";

    setAnswersMap((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        selectedOptionId: null,
        selectedOptionIds: [],
        markedForReview: isMarked,
        answerStatus: newStatus,
        version: (prev[currentQuestion.id]?.version || 1) + 1,
      },
    }));

    persistAnswer(currentQuestion.id, null, isMarked, newStatus);
  };

  // Action: Mark For Review & Next
  const handleMarkForReviewAndNext = () => {
    if (!currentQuestion) return;
    const hasOption = Boolean(currentAnswer?.selectedOptionId);
    const newStatus: AnswerStatus = hasOption
      ? "ANSWERED_AND_MARKED_FOR_REVIEW"
      : "MARKED_FOR_REVIEW";

    setAnswersMap((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        selectedOptionId: currentAnswer?.selectedOptionId || null,
        selectedOptionIds: currentAnswer?.selectedOptionIds || [],
        markedForReview: true,
        answerStatus: newStatus,
        version: (prev[currentQuestion.id]?.version || 1) + 1,
      },
    }));

    persistAnswer(
      currentQuestion.id,
      currentAnswer?.selectedOptionId || null,
      true,
      newStatus
    );

    // Navigate to next question
    if (activeQuestionIndex < allFlattenedQuestions.length - 1) {
      jumpToQuestion(activeQuestionIndex + 1);
    }
  };

  // Action: Save & Next
  const handleSaveAndNext = () => {
    if (!currentQuestion) return;
    const hasOption = Boolean(currentAnswer?.selectedOptionId);
    const isMarked = currentAnswer?.markedForReview || false;

    let targetStatus: AnswerStatus;
    if (hasOption) {
      targetStatus = isMarked ? "ANSWERED_AND_MARKED_FOR_REVIEW" : "ANSWERED";
    } else {
      targetStatus = isMarked ? "MARKED_FOR_REVIEW" : "NOT_ANSWERED";
    }

    persistAnswer(
      currentQuestion.id,
      currentAnswer?.selectedOptionId || null,
      isMarked,
      targetStatus
    );

    if (activeQuestionIndex < allFlattenedQuestions.length - 1) {
      jumpToQuestion(activeQuestionIndex + 1);
    }
  };

  // Action: Previous Question
  const handlePreviousQuestion = () => {
    if (activeQuestionIndex > 0) {
      jumpToQuestion(activeQuestionIndex - 1);
    }
  };

  // Jump to specific question
  const jumpToQuestion = (index: number) => {
    const targetQ = allFlattenedQuestions[index];
    if (!targetQ) return;

    setActiveQuestionIndex(index);
    if (targetQ.sectionId !== activeSectionId) {
      setActiveSectionId(targetQ.sectionId);
    }
    setIsPaletteOpenMobile(false);

    // If target question was NOT_VISITED, transition to NOT_ANSWERED
    setAnswersMap((prev) => {
      const existing = prev[targetQ.id];
      if (existing && existing.answerStatus === "NOT_VISITED") {
        const updated: LocalAnswerState = {
          ...existing,
          answerStatus: "NOT_ANSWERED",
        };
        saveAttemptAnswerAction({
          attemptId: attempt.id,
          questionId: targetQ.id,
          selectedOptionId: null,
          markedForReview: false,
          answerStatus: "NOT_ANSWERED",
          clientVersion: existing.version,
        }).catch(() => {
          // Silently tolerate
        });
        return {
          ...prev,
          [targetQ.id]: updated,
        };
      }
      return prev;
    });
  };

  // Final Submit Handler
  const handleManualSubmit = async () => {
    setIsSubmitting(true);
    try {
      await submitAttemptAction(attempt.id, false);
      router.push(`/exam/${attempt.id}/submitted`);
    } catch {
      setIsSubmitting(false);
      setShowSubmitModal(false);
    }
  };

  // Compute Statistics for Palette & Confirmation Modal
  const stats = React.useMemo(() => {
    let answered = 0;
    let notAnswered = 0;
    let marked = 0;
    let answeredMarked = 0;
    let notVisited = 0;

    allFlattenedQuestions.forEach((q) => {
      const st = answersMap[q.id]?.answerStatus || "NOT_VISITED";
      switch (st) {
        case "ANSWERED":
          answered++;
          break;
        case "NOT_ANSWERED":
          notAnswered++;
          break;
        case "MARKED_FOR_REVIEW":
          marked++;
          break;
        case "ANSWERED_AND_MARKED_FOR_REVIEW":
          answeredMarked++;
          break;
        case "NOT_VISITED":
        default:
          notVisited++;
          break;
      }
    });

    return {
      total: allFlattenedQuestions.length,
      answered: answered + answeredMarked,
      pureAnswered: answered,
      notAnswered,
      marked,
      answeredMarked,
      notVisited,
    };
  }, [allFlattenedQuestions, answersMap]);

  // Determine Palette Button Style for NTA 5-Color Convention
  const getPaletteStyle = (status: AnswerStatus, isCurrent: boolean) => {
    let base = "font-bold text-xs flex items-center justify-center rounded-lg transition-all relative ";

    if (isCurrent) {
      base += "ring-2 ring-primary ring-offset-2 dark:ring-offset-background ";
    }

    switch (status) {
      case "ANSWERED":
        return base + "bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs";
      case "NOT_ANSWERED":
        return base + "bg-rose-600 text-white hover:bg-rose-700 shadow-xs";
      case "MARKED_FOR_REVIEW":
        return base + "bg-purple-600 text-white hover:bg-purple-700 shadow-xs";
      case "ANSWERED_AND_MARKED_FOR_REVIEW":
        return (
          base +
          "bg-purple-600 text-white hover:bg-purple-700 shadow-xs"
        );
      case "NOT_VISITED":
      default:
        return base + "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300";
    }
  };

  const isLowTime = remainingSeconds <= 300 && remainingSeconds > 0;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col select-none">
      {/* 1. COMPACT CBT EXAM HEADER */}
      <header className="h-14 border-b border-border bg-surface px-4 sm:px-6 flex items-center justify-between shrink-0 sticky top-0 z-30 shadow-xs">
        {/* Left Branding & Test Code */}
        <div className="flex items-center gap-3">
          <Logo size="sm" href="#" />
          <div className="hidden sm:block border-l border-border pl-3">
            <span className="font-mono text-xs font-bold text-primary block">
              {attempt.testCode}
            </span>
            <span className="text-[10px] text-muted-foreground truncate max-w-[200px] block">
              {attempt.testTitle}
            </span>
          </div>
        </div>

        {/* Center: Save State Indicator */}
        <div className="hidden md:flex items-center gap-2 text-xs font-medium">
          {saveStatus === "SAVED" ? (
            <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Responses Saved</span>
            </span>
          ) : saveStatus === "SAVING" ? (
            <span className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Saving...</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-destructive">
              <WifiOff className="w-3.5 h-3.5" />
              <span>Offline — Pending Sync</span>
            </span>
          )}
        </div>

        {/* Right: Authoritative Timer & Submit */}
        <div className="flex items-center gap-3">
          {/* Authoritative Countdown Clock */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all ${
              isLowTime
                ? "bg-rose-500/10 border-rose-500/40 text-rose-600 dark:text-rose-400 animate-pulse"
                : "bg-muted/50 border-border text-foreground"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTime(remainingSeconds)}</span>
          </div>

          {/* Submit Test Button */}
          <Button
            size="sm"
            variant="destructive"
            onClick={() => setShowSubmitModal(true)}
            className="h-8 px-3 text-xs font-bold shadow-xs"
          >
            Submit Test
          </Button>

          {/* Mobile Palette Toggle */}
          <button
            type="button"
            onClick={() => setIsPaletteOpenMobile(!isPaletteOpenMobile)}
            className="lg:hidden p-1.5 rounded-lg border border-border text-muted-foreground hover:bg-muted"
            title="Toggle Question Palette"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. SECTION NAVIGATION TABS */}
      <div className="h-11 border-b border-border bg-muted/30 px-4 sm:px-6 flex items-center gap-2 overflow-x-auto shrink-0">
        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider hidden sm:inline mr-2">
          Sections:
        </span>
        {sections.map((sec) => {
          const isActive = currentQuestion?.sectionId === sec.id;
          const sectionQuestions = allFlattenedQuestions.filter((q) => q.sectionId === sec.id);
          const answeredInSec = sectionQuestions.filter((q) => {
            const st = answersMap[q.id]?.answerStatus;
            return st === "ANSWERED" || st === "ANSWERED_AND_MARKED_FOR_REVIEW";
          }).length;

          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => {
                const firstQIdx = allFlattenedQuestions.findIndex((q) => q.sectionId === sec.id);
                if (firstQIdx !== -1) jumpToQuestion(firstQIdx);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-2 ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-surface border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <span>{sec.title}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive ? "bg-primary-foreground/20 text-white" : "bg-muted text-muted-foreground"
                }`}
              >
                {answeredInSec}/{sec.questionsToAttempt}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. MAIN EXAMINATION WORKSPACE */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Question Area & Navigation */}
        <main className="flex-1 flex flex-col overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full">
          {currentQuestion ? (
            <div className="flex-1 flex flex-col justify-between space-y-6">
              {/* Question Header Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground">
                    Question {activeQuestionIndex + 1}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    of {allFlattenedQuestions.length}
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    {currentQuestion.sectionTitle}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                    +{currentQuestion.marks}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold">
                    -{currentQuestion.negativeMarks}
                  </span>
                </div>
              </div>

              {/* Passage Area (if applicable) */}
              {currentQuestion.passage && (
                <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 text-xs leading-relaxed max-h-56 overflow-y-auto space-y-2">
                  <span className="font-bold text-foreground block">
                    Read the following passage carefully:
                  </span>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {currentQuestion.passage.passageText}
                  </p>
                </div>
              )}

              {/* Question Text */}
              <div className="text-sm sm:text-base text-foreground font-medium leading-relaxed whitespace-pre-line">
                {currentQuestion.questionText}
              </div>

              {/* Options Selection List */}
              <div className="space-y-3 pt-2">
                {currentQuestion.options.map((opt) => {
                  const isSelected = currentAnswer?.selectedOptionId === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleSelectOption(opt.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 ${
                        isSelected
                          ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                          : "border-border hover:border-primary/40 bg-surface"
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold font-mono shrink-0 transition-colors ${
                          isSelected
                            ? "bg-primary border-primary text-primary-foreground shadow-xs"
                            : "border-muted-foreground/40 bg-background text-foreground"
                        }`}
                      >
                        {opt.optionLabel}
                      </div>

                      <div className="text-xs sm:text-sm text-foreground leading-relaxed flex-1">
                        {opt.optionText}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons Bar */}
              <div className="pt-6 border-t border-border flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearResponse}
                    disabled={!currentAnswer?.selectedOptionId}
                    className="text-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                    Clear Response
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleMarkForReviewAndNext}
                    className="text-xs text-purple-700 dark:text-purple-300"
                  >
                    <Flag className="w-3.5 h-3.5 mr-1.5" />
                    Mark for Review & Next
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousQuestion}
                    disabled={activeQuestionIndex === 0}
                    className="text-xs"
                  >
                    <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                    Previous
                  </Button>

                  <Button
                    size="sm"
                    onClick={handleSaveAndNext}
                    className="text-xs font-bold shadow-xs px-4"
                  >
                    <span>Save & Next</span>
                    <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No questions found in this section.
            </div>
          )}
        </main>

        {/* Right: Desktop Question Palette Sidebar */}
        <aside className="w-80 border-l border-border bg-surface shrink-0 hidden lg:flex flex-col justify-between">
          <div className="p-4 border-b border-border flex items-center justify-between bg-muted/20">
            <span className="text-xs font-bold uppercase tracking-wider text-foreground">
              Question Palette
            </span>
            <Badge variant="outline" className="text-[10px] font-mono">
              {stats.answered}/{stats.total} Answered
            </Badge>
          </div>

          {/* Palette Grid */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="grid grid-cols-5 gap-2">
              {allFlattenedQuestions.map((q, idx) => {
                const ans = answersMap[q.id];
                const status: AnswerStatus = ans?.answerStatus || "NOT_VISITED";
                const isCurrent = idx === activeQuestionIndex;
                const hasDot = status === "ANSWERED_AND_MARKED_FOR_REVIEW";

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => jumpToQuestion(idx)}
                    className={getPaletteStyle(status, isCurrent) + " h-9 w-full"}
                  >
                    <span>{idx + 1}</span>
                    {hasDot && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-400 rounded-full border border-purple-700" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Legend Summary */}
          <div className="p-4 border-t border-border bg-muted/20 space-y-2 text-[11px]">
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-emerald-600 shrink-0" />
                <span className="text-muted-foreground truncate">
                  Answered: <strong>{stats.pureAnswered}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-rose-600 shrink-0" />
                <span className="text-muted-foreground truncate">
                  Not Answered: <strong>{stats.notAnswered}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-purple-600 shrink-0" />
                <span className="text-muted-foreground truncate">
                  Review: <strong>{stats.marked}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-purple-600 relative shrink-0">
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                </span>
                <span className="text-muted-foreground truncate">
                  Ans &amp; Review: <strong>{stats.answeredMarked}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2 col-span-2">
                <span className="w-3 h-3 rounded-sm bg-slate-200 dark:bg-slate-800 shrink-0" />
                <span className="text-muted-foreground truncate">
                  Not Visited: <strong>{stats.notVisited}</strong>
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Mobile Collapsible Palette Drawer */}
      {isPaletteOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setIsPaletteOpenMobile(false)}
          />
          <div className="fixed inset-y-0 right-0 w-72 bg-surface border-l border-border p-4 flex flex-col z-50 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                Question Palette
              </span>
              <button
                type="button"
                onClick={() => setIsPaletteOpenMobile(false)}
                className="p-1 rounded-md text-muted-foreground hover:bg-muted"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
              <div className="grid grid-cols-5 gap-2">
                {allFlattenedQuestions.map((q, idx) => {
                  const ans = answersMap[q.id];
                  const status: AnswerStatus = ans?.answerStatus || "NOT_VISITED";
                  const isCurrent = idx === activeQuestionIndex;
                  const hasDot = status === "ANSWERED_AND_MARKED_FOR_REVIEW";

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => jumpToQuestion(idx)}
                      className={getPaletteStyle(status, isCurrent) + " h-9 w-full"}
                    >
                      <span>{idx + 1}</span>
                      {hasDot && (
                        <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-400 rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. SUBMIT CONFIRMATION MODAL */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-surface border border-border rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-border bg-muted/20">
              <h3 className="text-lg font-bold text-foreground">
                Confirm Examination Submission
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Review your response summary before final submission.
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-muted/40 border border-border/50">
                  <span className="text-[10px] text-muted-foreground block">Total Questions</span>
                  <span className="font-bold text-foreground text-sm">{stats.total}</span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block font-medium">
                    Answered
                  </span>
                  <span className="font-bold text-emerald-800 dark:text-emerald-300 text-sm">
                    {stats.answered}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30">
                  <span className="text-[10px] text-rose-700 dark:text-rose-400 block font-medium">
                    Not Answered / Visited
                  </span>
                  <span className="font-bold text-rose-800 dark:text-rose-300 text-sm">
                    {stats.notAnswered + stats.notVisited}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30">
                  <span className="text-[10px] text-purple-700 dark:text-purple-400 block font-medium">
                    Marked for Review
                  </span>
                  <span className="font-bold text-purple-800 dark:text-purple-300 text-sm">
                    {stats.marked + stats.answeredMarked}
                  </span>
                </div>
              </div>

              {stats.notAnswered + stats.notVisited > 0 && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    You have <strong>{stats.notAnswered + stats.notVisited}</strong> unanswered question(s).
                    Unanswered questions will receive 0 marks.
                  </span>
                </div>
              )}

              <p className="text-[11px] text-muted-foreground text-center">
                Once submitted, you will not be able to change any responses.
              </p>
            </div>

            <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSubmitModal(false)}
                disabled={isSubmitting}
                className="text-xs"
              >
                Return to Exam
              </Button>

              <Button
                size="sm"
                variant="destructive"
                onClick={handleManualSubmit}
                disabled={isSubmitting}
                className="text-xs font-bold"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm Final Submission</span>
                    <Send className="w-3.5 h-3.5 ml-1.5" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 5. AUTO-SUBMISSION ON EXPIRATION OVERLAY */}
      {isTimeExpired && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-surface border border-border rounded-3xl p-8 max-w-md text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 mx-auto flex items-center justify-center">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Examination Time Has Expired</h3>
            <p className="text-xs text-muted-foreground">
              Your allocated testing window has completed. The examination engine is securely transmitting your final responses.
            </p>
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-primary pt-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Finalizing submission...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
