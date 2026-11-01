"use client";

import React, { useState, useTransition } from "react";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  HelpCircle,
  Bookmark,
  MessageSquare,
  Tag,
  Info,
  Clock,
} from "lucide-react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/layout/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { MistakeItem, MistakeReviewStatus, MistakeErrorReason } from "@/lib/validations/mistakes";
import { updateMistakeStatusAction, toggleBookmarkAction } from "@/actions/mistake-actions";

interface MistakeReviewCardProps {
  item: MistakeItem;
}

export function MistakeReviewCard({ item }: MistakeReviewCardProps) {
  const [reviewStatus, setReviewStatus] = useState<MistakeReviewStatus>(item.reviewStatus);
  const [errorReason, setErrorReason] = useState<MistakeErrorReason | null>(item.studentErrorReason);
  const [notes, setNotes] = useState<string>(item.studentNotes || "");
  const [isBookmarked, setIsBookmarked] = useState<boolean>(item.isBookmarked);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isSaving, startSaving] = useTransition();

  const handleStatusChange = (newStatus: MistakeReviewStatus) => {
    startSaving(async () => {
      setReviewStatus(newStatus);
      await updateMistakeStatusAction({
        attemptId: item.attemptId,
        questionId: item.questionId,
        status: newStatus,
        errorReason,
        notes: notes || null,
      });
    });
  };

  const handleErrorReasonChange = (reason: MistakeErrorReason | null) => {
    startSaving(async () => {
      setErrorReason(reason);
      await updateMistakeStatusAction({
        attemptId: item.attemptId,
        questionId: item.questionId,
        status: reviewStatus,
        errorReason: reason,
        notes: notes || null,
      });
    });
  };

  const handleSaveNotes = () => {
    startSaving(async () => {
      await updateMistakeStatusAction({
        attemptId: item.attemptId,
        questionId: item.questionId,
        status: reviewStatus,
        errorReason,
        notes: notes || null,
      });
      setIsEditingNotes(false);
    });
  };

  const handleToggleBookmark = () => {
    startSaving(async () => {
      const res = await toggleBookmarkAction({
        questionId: item.questionId,
        notes: notes || null,
      });
      if (res.success && res.isBookmarked !== undefined) {
        setIsBookmarked(res.isBookmarked);
      }
    });
  };

  const getStatusBadge = (st: MistakeReviewStatus) => {
    switch (st) {
      case "MASTERED":
        return (
          <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-medium gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Mastered</span>
          </Badge>
        );
      case "REVIEWED":
        return (
          <Badge className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-medium gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Reviewed</span>
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="border-purple-300 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-[11px] font-medium gap-1">
            <Clock className="w-3 h-3" />
            <span>Pending Review</span>
          </Badge>
        );
    }
  };

  return (
    <Card className="border border-border shadow-xs hover:border-primary/30 transition-all overflow-hidden">
      {/* Header Metadata */}
      <CardHeader className="p-4 sm:p-5 bg-muted/20 border-b border-border/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="font-mono text-xs">
              Q{item.questionNumber}
            </Badge>
            <Badge variant="outline" className="text-xs uppercase font-semibold">
              {item.subjectName}
            </Badge>
            <span className="text-xs text-muted-foreground font-medium">•</span>
            <span className="text-xs font-medium text-foreground">{item.topicTitle}</span>
            <span className="text-xs text-muted-foreground font-medium">•</span>
            <span className="text-xs text-muted-foreground">{item.testTitle}</span>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {getStatusBadge(reviewStatus)}

            {/* Bookmark button */}
            <Button
              variant={isBookmarked ? "default" : "outline"}
              size="sm"
              onClick={handleToggleBookmark}
              disabled={isSaving}
              className={`h-7 px-2 text-xs gap-1 ${
                isBookmarked ? "bg-amber-600 hover:bg-amber-700 text-white" : "text-muted-foreground"
              }`}
              title={isBookmarked ? "Remove Bookmark" : "Bookmark this Question"}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? "fill-current" : ""}`} />
              <span className="hidden sm:inline">{isBookmarked ? "Saved" : "Bookmark"}</span>
            </Button>
          </div>
        </div>

        {/* Evidence Classifications */}
        <div className="flex items-center gap-2 flex-wrap pt-2">
          {item.categories.map((cat, idx) => (
            <div
              key={idx}
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted/80 text-foreground border border-border/60"
              title={cat.evidence}
            >
              <Info className="w-3 h-3 text-muted-foreground" />
              <span>{cat.label}</span>
              {cat.confidenceLevel && (
                <span className="text-[9px] text-muted-foreground font-mono">({cat.confidenceLevel})</span>
              )}
            </div>
          ))}

          {item.repeatedCountForQuestion >= 2 && (
            <Badge variant="outline" className="text-[10px] text-purple-600 dark:text-purple-400 border-purple-300">
              Missed in {item.repeatedCountForQuestion} mock tests
            </Badge>
          )}
        </div>
      </CardHeader>

      {/* Question & Options Body */}
      <CardContent className="p-4 sm:p-6 space-y-5">
        {/* Optional Passage */}
        {item.passageText && (
          <div className="p-3.5 rounded-lg bg-muted/30 border border-border/70 text-xs text-muted-foreground leading-relaxed">
            <span className="font-semibold text-foreground block mb-1">Passage Context:</span>
            {item.passageText}
          </div>
        )}

        {/* Question Text */}
        <div className="text-sm font-medium text-foreground leading-relaxed">
          {item.questionText}
        </div>

        {/* Options List */}
        <div className="space-y-2">
          {item.options.map((opt) => {
            const isStudentSelection = item.selectedOptionId === opt.id;
            const isCorrectAnswer = opt.isCorrect || item.correctOptionId === opt.id;

            let cardStyle = "border-border/70 bg-card hover:bg-muted/30 text-foreground";
            let indicator = null;

            if (isCorrectAnswer) {
              cardStyle = "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200 font-medium";
              indicator = (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Correct Answer</span>
                </span>
              );
            } else if (isStudentSelection) {
              cardStyle = "border-rose-500 bg-rose-50/50 dark:bg-rose-950/20 text-rose-900 dark:text-rose-200 font-medium";
              indicator = (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Your Submitted Answer</span>
                </span>
              );
            }

            return (
              <div
                key={opt.id}
                className={`p-3 rounded-lg border transition-all flex items-start justify-between gap-3 text-xs ${cardStyle}`}
              >
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-muted/60 flex items-center justify-center font-bold text-[11px] shrink-0">
                    {opt.optionLabel}
                  </span>
                  <span className="pt-0.5 leading-relaxed">{opt.optionText}</span>
                </div>
                <div className="shrink-0">{indicator}</div>
              </div>
            );
          })}
        </div>

        {/* Unanswered Notice if applicable */}
        {item.resultStatus === "UNANSWERED" && (
          <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 shrink-0" />
            <span>You skipped or left this question unanswered during this examination attempt.</span>
          </div>
        )}

        {/* Explanation & Solution */}
        <div className="p-4 rounded-lg bg-muted/40 border border-border/80 space-y-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-primary" />
            <h5 className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Step-by-Step Solution & Explanation
            </h5>
          </div>

          {item.explanation ? (
            <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {item.explanation}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground italic">
              Explanation not currently available for this question.
            </p>
          )}
        </div>

        {/* Student Self-Tagging & Notes */}
        <div className="pt-2 border-t border-border/60 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Self-Reported Error Reason:</span>
            </div>

            <select
              value={errorReason || ""}
              onChange={(e) => handleErrorReasonChange((e.target.value as MistakeErrorReason) || null)}
              disabled={isSaving}
              className="h-7 text-xs rounded border border-input bg-background px-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">Select reason...</option>
              <option value="CONCEPT_GAP">Concept Gap / Unfamiliar Theory</option>
              <option value="CARELESS">Careless Mistake</option>
              <option value="CALCULATION_ERROR">Calculation Slip</option>
              <option value="MISREAD_QUESTION">Misread Question or Option</option>
              <option value="TIME_PRESSURE">Rushed Under Time Pressure</option>
              <option value="OTHER">Other Reason</option>
            </select>
          </div>

          {/* Student Revision Notes */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>My Revision Notes:</span>
              </div>
              {!isEditingNotes && (
                <button
                  type="button"
                  onClick={() => setIsEditingNotes(true)}
                  className="text-[11px] text-primary hover:underline font-medium"
                >
                  {notes ? "Edit Note" : "+ Add Note"}
                </button>
              )}
            </div>

            {isEditingNotes ? (
              <div className="space-y-2">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Record your formula reminder, mistake reason, or key learning point..."
                  className="w-full h-18 text-xs p-2.5 rounded-md border border-input bg-background text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <div className="flex items-center justify-end gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsEditingNotes(false)}
                    className="h-6 px-2 text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveNotes}
                    disabled={isSaving}
                    className="h-6 px-2.5 text-xs font-semibold"
                  >
                    Save Note
                  </Button>
                </div>
              </div>
            ) : notes ? (
              <p className="text-xs text-foreground bg-muted/30 p-2.5 rounded border border-border/60">
                {notes}
              </p>
            ) : null}
          </div>
        </div>
      </CardContent>

      {/* Review Actions Footer */}
      <CardFooter className="p-3 sm:p-4 bg-muted/10 border-t border-border/60 flex flex-wrap items-center justify-between gap-3">
        <div className="text-[11px] text-muted-foreground">
          Attempted: {new Date(item.attemptDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {reviewStatus !== "PENDING_REVIEW" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStatusChange("PENDING_REVIEW")}
              disabled={isSaving}
              className="h-7 text-xs text-muted-foreground"
            >
              Reset to Pending
            </Button>
          )}

          {reviewStatus !== "REVIEWED" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStatusChange("REVIEWED")}
              disabled={isSaving}
              className="h-7 text-xs text-blue-600 dark:text-blue-400 border-blue-200 hover:bg-blue-50"
            >
              Mark as Reviewed
            </Button>
          )}

          {reviewStatus !== "MASTERED" && (
            <Button
              size="sm"
              onClick={() => handleStatusChange("MASTERED")}
              disabled={isSaving}
              className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
            >
              Mark as Mastered
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

