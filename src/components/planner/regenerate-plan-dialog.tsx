"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { generateWeeklyPlanAction } from "@/actions/planner-actions";
import { RefreshCw, AlertTriangle } from "lucide-react";

interface RegeneratePlanDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function RegeneratePlanDialog({
  isOpen,
  onClose,
  onSuccess,
}: RegeneratePlanDialogProps) {
  const [preserveCompleted, setPreserveCompleted] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await generateWeeklyPlanAction({
        regenerate: true,
        preserveCompleted,
      });

      if (!res.success) {
        setError(res.error || "Failed to regenerate study plan");
      } else {
        onClose();
        if (onSuccess) onSuccess();
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 mb-2">
            <RefreshCw className="w-5 h-5" />
          </div>
          <DialogTitle className="text-base font-bold text-foreground">
            Regenerate Weekly Study Plan?
          </DialogTitle>
          <DialogDescription className="text-xs text-muted leading-relaxed">
            This will recalculate your weekly tasks using your latest mock test results, syllabus progress, and updated mistake intelligence patterns.
          </DialogDescription>
        </DialogHeader>

        <div className="py-3 space-y-3">
          <div className="flex items-center space-x-2 bg-muted/30 p-3 rounded-lg border border-border">
            <Checkbox
              id="preserve-completed"
              checked={preserveCompleted}
              onCheckedChange={(checked) => setPreserveCompleted(Boolean(checked))}
            />
            <Label
              htmlFor="preserve-completed"
              className="text-xs font-medium text-foreground cursor-pointer"
            >
              Preserve already completed tasks (Recommended)
            </Label>
          </div>

          <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-500/10 p-3 rounded-lg border border-amber-300">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Uncompleted pending tasks will be refreshed and balanced across your active study days.
            </span>
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="button" variant="default" onClick={handleRegenerate} disabled={loading}>
            {loading ? "Generating..." : "Regenerate Plan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
