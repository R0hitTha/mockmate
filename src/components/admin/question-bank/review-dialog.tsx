"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  Send,
  AlertCircle,
  Loader2,
  ShieldCheck,
  FileCheck2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { reviewQuestionAction } from "@/actions/question-actions";

interface ReviewDialogProps {
  questionId: string;
  questionCode: string;
  currentStatus: string;
  onSuccess?: (newStatus: string) => void;
}

export function ReviewDialog({
  questionId,
  questionCode,
  currentStatus,
  onSuccess,
}: ReviewDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<"APPROVED" | "REJECTED" | "PUBLISHED">("APPROVED");
  const [feedback, setFeedback] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (
      (reviewStatus === "REJECTED") &&
      (!feedback || feedback.trim().length < 5)
    ) {
      setErrorMessage("Reviewer feedback is mandatory when requesting changes or rejecting.");
      return;
    }

    startTransition(async () => {
      const res = await reviewQuestionAction(questionId, {
        reviewStatus,
        feedback: feedback.trim() || undefined,
      });

      if (res.success && res.data?.newStatus) {
        onSuccess?.(res.data.newStatus);
        setIsOpen(false);
        router.refresh();
      } else {
        setErrorMessage(res.error || "Failed to update review status.");
      }
    });
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="h-8 text-xs font-semibold gap-1.5 border-primary/40 text-primary hover:bg-primary/5"
      >
        <FileCheck2 className="h-3.5 w-3.5" />
        <span>Review Question</span>
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl space-y-4">
            <div className="border-b border-border pb-3">
              <h3 className="text-sm font-bold text-foreground">
                Editorial Review: {questionCode}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Current status: <strong className="uppercase">{currentStatus}</strong>
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground block">
                  Select Review Decision
                </label>

                <div className="grid grid-cols-1 gap-2">
                  <label
                    className={`flex items-center gap-3 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                      reviewStatus === "PUBLISHED"
                        ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-300"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    <input
                      type="radio"
                      name="decision"
                      value="PUBLISHED"
                      checked={reviewStatus === "PUBLISHED"}
                      onChange={() => setReviewStatus("PUBLISHED")}
                      className="text-emerald-600"
                    />
                    <div className="space-y-0.5">
                      <span className="font-bold flex items-center gap-1.5">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                        Publish Immediately
                      </span>
                      <p className="text-[10px] text-muted-foreground">
                        Question meets all NTA standards and goes live in mock exam generation pools.
                      </p>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-3 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                      reviewStatus === "APPROVED"
                        ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-300"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    <input
                      type="radio"
                      name="decision"
                      value="APPROVED"
                      checked={reviewStatus === "APPROVED"}
                      onChange={() => setReviewStatus("APPROVED")}
                      className="text-blue-600"
                    />
                    <div className="space-y-0.5">
                      <span className="font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
                        Approve (Pending Release)
                      </span>
                      <p className="text-[10px] text-muted-foreground">
                        Content verified, approved for inclusion in upcoming test batches.
                      </p>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-3 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                      reviewStatus === "REJECTED"
                        ? "border-rose-500 bg-rose-50/50 dark:bg-rose-950/30 text-rose-900 dark:text-rose-300"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    <input
                      type="radio"
                      name="decision"
                      value="REJECTED"
                      checked={reviewStatus === "REJECTED"}
                      onChange={() => setReviewStatus("REJECTED")}
                      className="text-rose-600"
                    />
                    <div className="space-y-0.5">
                      <span className="font-bold flex items-center gap-1.5">
                        <XCircle className="h-3.5 w-3.5 text-rose-600" />
                        Request Changes / Reject
                      </span>
                      <p className="text-[10px] text-muted-foreground">
                        Requires revision from author (mandatory feedback below).
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Reviewer Notes & Feedback {reviewStatus === "REJECTED" ? "*" : "(Optional)"}
                </label>
                <Textarea
                  rows={3}
                  placeholder={
                    reviewStatus === "REJECTED"
                      ? "Detail what needs to be fixed (e.g. calculation error in option B, typo in question text)..."
                      : "Optional notes for the author or audit history..."
                  }
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  disabled={isPending}
                  className="text-xs"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  size="sm"
                  disabled={isPending}
                  className="text-xs font-semibold px-4 gap-1.5"
                >
                  {isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                  <span>Confirm Decision</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

