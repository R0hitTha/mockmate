"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type StoredStudyTask } from "@/lib/study-planner-service";
import { rescheduleTaskAction } from "@/actions/planner-actions";

interface RescheduleModalProps {
  task: StoredStudyTask | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function RescheduleModal({
  task,
  isOpen,
  onClose,
  onSuccess,
}: RescheduleModalProps) {
  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-foreground">
            Reschedule Study Task
          </DialogTitle>
        </DialogHeader>

        <RescheduleForm
          key={task.id}
          task={task}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}

function RescheduleForm({
  task,
  onClose,
  onSuccess,
}: {
  task: StoredStudyTask;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [newDate, setNewDate] = useState<string>(task.plannedDate);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate) {
      setError("Please select a valid date");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await rescheduleTaskAction({
        taskId: task.id,
        newPlannedDate: newDate,
      });

      if (!res.success) {
        setError(res.error || "Failed to reschedule task");
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
    <form onSubmit={handleSubmit} className="space-y-4 py-2">
      <div>
        <Label className="text-xs text-muted">Task Title</Label>
        <p className="text-sm font-semibold text-foreground mt-0.5">{task.title}</p>
      </div>

      <div>
        <Label htmlFor="reschedule-date" className="text-xs font-semibold text-foreground">
          New Planned Date
        </Label>
        <Input
          id="reschedule-date"
          type="date"
          value={newDate}
          onChange={(e) => setNewDate(e.target.value)}
          className="mt-1"
          required
        />
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <DialogFooter className="gap-2 sm:gap-0">
        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" variant="default" disabled={loading}>
          {loading ? "Updating..." : "Save New Date"}
        </Button>
      </DialogFooter>
    </form>
  );
}
