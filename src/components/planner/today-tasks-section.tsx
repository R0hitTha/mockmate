"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Circle,
  Clock,
  BookOpen,
  Calendar,
  AlertCircle,
  FileCheck2,
  Layers,
  Sparkles,
  ArrowRight,
  MoreVertical,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type StoredStudyTask, type TaskStatus } from "@/lib/study-planner-service";
import { updateTaskStatusAction } from "@/actions/planner-actions";

interface TodayTasksSectionProps {
  todayTasks: StoredStudyTask[];
  onTaskUpdated?: () => void;
  onOpenRescheduleModal?: (task: StoredStudyTask) => void;
}

export function TodayTasksSection({
  todayTasks,
  onTaskUpdated,
  onOpenRescheduleModal,
}: TodayTasksSectionProps) {
  const [loadingTaskId, setLoadingTaskId] = useState<string | null>(null);

  const handleStatusToggle = async (task: StoredStudyTask) => {
    const nextStatus: TaskStatus = task.status === "COMPLETED" ? "PLANNED" : "COMPLETED";
    setLoadingTaskId(task.id);
    try {
      await updateTaskStatusAction({
        taskId: task.id,
        status: nextStatus,
        actualDurationMinutes: nextStatus === "COMPLETED" ? task.plannedDurationMinutes : undefined,
      });
      if (onTaskUpdated) onTaskUpdated();
    } catch (err) {
      console.error("Failed to update task", err);
    } finally {
      setLoadingTaskId(null);
    }
  };

  const handleSkip = async (task: StoredStudyTask) => {
    setLoadingTaskId(task.id);
    try {
      await updateTaskStatusAction({
        taskId: task.id,
        status: "SKIPPED",
      });
      if (onTaskUpdated) onTaskUpdated();
    } catch (err) {
      console.error("Failed to skip task", err);
    } finally {
      setLoadingTaskId(null);
    }
  };

  const getTaskTypeBadge = (taskType: string) => {
    switch (taskType) {
      case "MISTAKE_REVIEW":
        return (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-700 border-amber-300 font-medium">
            <AlertCircle className="w-3 h-3 mr-1 inline" /> Mistake Review
          </Badge>
        );
      case "MOCK_TEST":
        return (
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 font-medium">
            <FileCheck2 className="w-3 h-3 mr-1 inline" /> Mock Test Drill
          </Badge>
        );
      case "TOPIC_PRACTICE":
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-700 border-blue-300 font-medium">
            <Layers className="w-3 h-3 mr-1 inline" /> Practice Drill
          </Badge>
        );
      case "THEORY_REVISION":
        return (
          <Badge variant="outline" className="bg-purple-500/10 text-purple-700 border-purple-300 font-medium">
            <BookOpen className="w-3 h-3 mr-1 inline" /> Theory Revision
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-muted/30 text-foreground border-border font-medium">
            Study Task
          </Badge>
        );
    }
  };

  return (
    <div className="bg-surface rounded-xl border border-border p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border gap-2">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" /> Today&apos;s Study Agenda
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Focus sessions planned for today based on your target syllabus &amp; error patterns
          </p>
        </div>
        <Link
          href="/study-planner/weekly"
          className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1 self-start sm:self-auto"
        >
          View Full Week <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {todayTasks.length === 0 ? (
        <div className="py-10 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-muted/20 flex items-center justify-center text-muted mb-3">
            <Calendar className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-foreground">No tasks scheduled for today</p>
          <p className="text-xs text-muted mt-1 max-w-sm">
            Today is either your configured rest day or you have completed all sessions. Enjoy your rest or add a custom drill.
          </p>
          <div className="mt-4 flex gap-3">
            <Link href="/study-planner/weekly">
              <Button size="sm" variant="outline">
                Open Weekly Schedule
              </Button>
            </Link>
            <Link href="/mock-tests">
              <Button size="sm" variant="default">
                Take a Mock Test
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-border/60 mt-2">
          {todayTasks.map((task) => {
            const isCompleted = task.status === "COMPLETED";
            const isSkipped = task.status === "SKIPPED";
            const isLoading = loadingTaskId === task.id;

            return (
              <div
                key={task.id}
                className={`py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                  isCompleted ? "opacity-60 bg-emerald-500/5 rounded-lg px-3 -mx-3" : ""
                }`}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <button
                    onClick={() => handleStatusToggle(task)}
                    disabled={isLoading}
                    className="mt-0.5 text-muted hover:text-primary transition-colors shrink-0"
                    title={isCompleted ? "Mark Incomplete" : "Mark Complete"}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>

                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-sm font-semibold tracking-tight ${
                          isCompleted ? "line-through text-muted" : "text-foreground"
                        }`}
                      >
                        {task.title}
                      </span>
                      {getTaskTypeBadge(task.taskType)}
                      {task.recommendationSource === "MISTAKE_INTELLIGENCE" && (
                        <span className="inline-flex items-center text-[11px] font-medium text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full">
                          <Sparkles className="w-2.5 h-2.5 mr-1" /> Smart Recommendation
                        </span>
                      )}
                    </div>

                    {task.description && (
                      <p className="text-xs text-muted leading-relaxed line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-xs text-muted pt-1">
                      <span className="inline-flex items-center gap-1 font-medium">
                        <Clock className="w-3.5 h-3.5 text-primary" /> {task.plannedDurationMinutes} mins
                      </span>
                      {task.subjectName && (
                        <span className="inline-flex items-center gap-1">
                          • {task.subjectName}
                        </span>
                      )}
                      {isSkipped && (
                        <span className="text-amber-600 font-medium">
                          (Skipped)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {task.taskType === "MISTAKE_REVIEW" ? (
                    <Link href="/mistakes/review">
                      <Button size="sm" variant="outline" className="text-xs h-8">
                        Open Review
                      </Button>
                    </Link>
                  ) : task.taskType === "MOCK_TEST" ? (
                    <Link href="/mock-tests">
                      <Button size="sm" variant="default" className="text-xs h-8">
                        Start Test
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      size="sm"
                      variant={isCompleted ? "outline" : "default"}
                      onClick={() => handleStatusToggle(task)}
                      disabled={isLoading}
                      className="text-xs h-8"
                    >
                      {isCompleted ? "Completed" : "Mark Done"}
                    </Button>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1.5 rounded-md hover:bg-muted text-muted hover:text-foreground">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleStatusToggle(task)}>
                        {isCompleted ? "Mark Planned" : "Mark Completed"}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSkip(task)}>
                        Mark Skipped
                      </DropdownMenuItem>
                      {onOpenRescheduleModal && (
                        <DropdownMenuItem onClick={() => onOpenRescheduleModal(task)}>
                          Reschedule Task
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
