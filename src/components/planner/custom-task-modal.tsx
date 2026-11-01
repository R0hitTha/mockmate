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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createCustomTaskAction } from "@/actions/planner-actions";
import { type TaskType } from "@/lib/validations/planner";

interface CustomTaskModalProps {
  planId?: string;
  defaultDate?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CustomTaskModal({
  planId,
  defaultDate,
  isOpen,
  onClose,
  onSuccess,
}: CustomTaskModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-foreground">
            Add Custom Study Task
          </DialogTitle>
        </DialogHeader>

        <CustomTaskForm
          key={defaultDate || "default"}
          planId={planId}
          defaultDate={defaultDate}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}

function CustomTaskForm({
  planId,
  defaultDate,
  onClose,
  onSuccess,
}: {
  planId?: string;
  defaultDate?: string;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const todayStr = defaultDate || new Date().toISOString().split("T")[0];

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [taskType, setTaskType] = useState<TaskType>("CUSTOM_TASK");
  const [plannedDate, setPlannedDate] = useState(todayStr);
  const [duration, setDuration] = useState("45");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || title.length < 3) {
      setError("Title must be at least 3 characters");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await createCustomTaskAction({
        studyPlanId: planId,
        title: title.trim(),
        description: description.trim() || undefined,
        taskType,
        plannedDate,
        plannedDurationMinutes: Number(duration) || 45,
      });

      if (!res.success) {
        setError(res.error || "Failed to add task");
      } else {
        setTitle("");
        setDescription("");
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
        <Label htmlFor="task-title" className="text-xs font-semibold text-foreground">
          Task Title *
        </Label>
        <Input
          id="task-title"
          placeholder="e.g. Physics Formula Sheet Revision"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1"
          required
        />
      </div>

      <div>
        <Label htmlFor="task-type" className="text-xs font-semibold text-foreground">
          Task Type
        </Label>
        <Select
          value={taskType}
          onValueChange={(val) => setTaskType(val as TaskType)}
        >
          <SelectTrigger id="task-type" className="mt-1">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="THEORY_REVISION">Theory Revision</SelectItem>
            <SelectItem value="TOPIC_PRACTICE">Topic Practice</SelectItem>
            <SelectItem value="MISTAKE_REVIEW">Mistake Review</SelectItem>
            <SelectItem value="MOCK_TEST">Mock Test</SelectItem>
            <SelectItem value="SECTIONAL_TEST">Sectional Test</SelectItem>
            <SelectItem value="CUSTOM_TASK">Custom Study Task</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="task-date" className="text-xs font-semibold text-foreground">
            Planned Date *
          </Label>
          <Input
            id="task-date"
            type="date"
            value={plannedDate}
            onChange={(e) => setPlannedDate(e.target.value)}
            className="mt-1"
            required
          />
        </div>

        <div>
          <Label htmlFor="task-duration" className="text-xs font-semibold text-foreground">
            Duration (mins)
          </Label>
          <Input
            id="task-duration"
            type="number"
            min="10"
            max="240"
            step="5"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="mt-1"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="task-desc" className="text-xs font-semibold text-foreground">
          Description / Notes (Optional)
        </Label>
        <Textarea
          id="task-desc"
          placeholder="Key subtopics or chapters to focus on..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 text-xs"
          rows={2}
        />
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <DialogFooter className="gap-2 sm:gap-0">
        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" variant="default" disabled={loading}>
          {loading ? "Adding..." : "Add to Plan"}
        </Button>
      </DialogFooter>
    </form>
  );
}
