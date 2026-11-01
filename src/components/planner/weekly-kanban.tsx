"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Circle,
  Clock,
  Plus,
  MoreVertical,
  Calendar,
  AlertCircle,
  FileCheck2,
  Layers,
  BookOpen,
  Coffee,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  type WeeklySchedule,
  type DaySchedule,
  type StoredStudyTask,
  type TaskStatus,
} from "@/lib/study-planner-service";
import { updateTaskStatusAction, deleteTaskAction } from "@/actions/planner-actions";

interface WeeklyKanbanProps {
  schedule: WeeklySchedule;
  onRefresh?: () => void;
  onOpenRescheduleModal?: (task: StoredStudyTask) => void;
  onOpenCustomTaskModal?: (date: string) => void;
}

export function WeeklyKanban({
  schedule,
  onRefresh,
  onOpenRescheduleModal,
  onOpenCustomTaskModal,
}: WeeklyKanbanProps) {
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
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Failed to update status", err);
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
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Failed to skip task", err);
    } finally {
      setLoadingTaskId(null);
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this study task?")) return;
    setLoadingTaskId(taskId);
    try {
      await deleteTaskAction(taskId);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Failed to delete task", err);
    } finally {
      setLoadingTaskId(null);
    }
  };

  const getTaskTypeBadge = (taskType: string) => {
    switch (taskType) {
      case "MISTAKE_REVIEW":
        return (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-700 border-amber-300 text-[10px] px-1.5 py-0 font-medium">
            <AlertCircle className="w-2.5 h-2.5 mr-0.5 inline" /> Mistake
          </Badge>
        );
      case "MOCK_TEST":
        return (
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-[10px] px-1.5 py-0 font-medium">
            <FileCheck2 className="w-2.5 h-2.5 mr-0.5 inline" /> Test
          </Badge>
        );
      case "TOPIC_PRACTICE":
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-700 border-blue-300 text-[10px] px-1.5 py-0 font-medium">
            <Layers className="w-2.5 h-2.5 mr-0.5 inline" /> Drill
          </Badge>
        );
      case "THEORY_REVISION":
        return (
          <Badge variant="outline" className="bg-purple-500/10 text-purple-700 border-purple-300 text-[10px] px-1.5 py-0 font-medium">
            <BookOpen className="w-2.5 h-2.5 mr-0.5 inline" /> Theory
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-muted/30 text-foreground border-border text-[10px] px-1.5 py-0 font-medium">
            Custom
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* 7-Day Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4 items-start">
        {schedule.days.map((day: DaySchedule) => {
          return (
            <div
              key={day.date}
              className={`rounded-xl border flex flex-col min-h-[380px] p-3 transition-colors ${
                day.isToday
                  ? "bg-primary/5 border-primary/40 shadow-xs"
                  : day.isRestDay
                  ? "bg-muted/20 border-dashed border-border"
                  : "bg-surface border-border"
              }`}
            >
              {/* Day Header */}
              <div className="flex items-center justify-between pb-2.5 border-b border-border mb-2.5">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-foreground">
                      {day.dayLabel}
                    </span>
                    {day.isToday && (
                      <span className="w-2 h-2 rounded-full bg-primary" title="Today" />
                    )}
                  </div>
                  <span className="text-[11px] text-muted font-medium">
                    {day.isRestDay
                      ? "Rest Day"
                      : `${day.totalPlannedMinutes} mins planned`}
                  </span>
                </div>

                {!day.isRestDay && onOpenCustomTaskModal && (
                  <button
                    onClick={() => onOpenCustomTaskModal(day.date)}
                    className="p-1 rounded-md hover:bg-muted text-muted hover:text-foreground transition-colors"
                    title="Add task to this day"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Tasks List */}
              <div className="flex-1 space-y-2.5">
                {day.isRestDay && day.tasks.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4 text-muted">
                    <Coffee className="w-6 h-6 mb-2 text-muted/60" />
                    <span className="text-xs font-medium">Scheduled Rest</span>
                    <span className="text-[11px] text-muted/80 mt-0.5">
                      Relax or do light reading
                    </span>
                  </div>
                ) : day.tasks.length === 0 ? (
                  <div className="h-32 flex flex-col items-center justify-center text-center p-3 text-muted">
                    <Calendar className="w-5 h-5 mb-1 text-muted/40" />
                    <span className="text-xs font-medium">No tasks</span>
                    {onOpenCustomTaskModal && (
                      <button
                        onClick={() => onOpenCustomTaskModal(day.date)}
                        className="text-[11px] text-primary hover:underline mt-1 font-medium"
                      >
                        + Add Session
                      </button>
                    )}
                  </div>
                ) : (
                  day.tasks.map((task) => {
                    const isCompleted = task.status === "COMPLETED";
                    const isSkipped = task.status === "SKIPPED";
                    const isLoading = loadingTaskId === task.id;

                    return (
                      <div
                        key={task.id}
                        className={`rounded-lg border p-2.5 transition-all text-left relative flex flex-col justify-between ${
                          isCompleted
                            ? "bg-emerald-500/5 border-emerald-300/40 opacity-75"
                            : isSkipped
                            ? "bg-muted/30 border-dashed border-border opacity-60"
                            : "bg-surface-elevated border-border shadow-2xs hover:border-primary/40"
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-start justify-between gap-1">
                            <button
                              onClick={() => handleStatusToggle(task)}
                              disabled={isLoading}
                              className="mt-0.5 text-muted hover:text-primary transition-colors shrink-0"
                              title={isCompleted ? "Mark Incomplete" : "Mark Complete"}
                            >
                              {isCompleted ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <Circle className="w-4 h-4" />
                              )}
                            </button>

                            <div className="flex-1 min-w-0 mx-1">
                              <p
                                className={`text-xs font-semibold leading-tight line-clamp-2 ${
                                  isCompleted ? "line-through text-muted" : "text-foreground"
                                }`}
                              >
                                {task.title}
                              </p>
                            </div>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="p-0.5 rounded hover:bg-muted text-muted hover:text-foreground">
                                  <MoreVertical className="w-3.5 h-3.5" />
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
                                <DropdownMenuItem
                                  onClick={() => handleDelete(task.id)}
                                  className="text-destructive"
                                >
                                  Delete Task
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          <div className="flex flex-wrap items-center gap-1 pt-1">
                            {getTaskTypeBadge(task.taskType)}
                            <span className="text-[10px] text-muted inline-flex items-center gap-0.5">
                              <Clock className="w-2.5 h-2.5" /> {task.plannedDurationMinutes}m
                            </span>
                          </div>
                        </div>

                        {/* Direct action link if applicable */}
                        <div className="mt-2 pt-1.5 border-t border-border/40 flex items-center justify-between text-[11px]">
                          {task.taskType === "MISTAKE_REVIEW" ? (
                            <Link
                              href="/mistakes/review"
                              className="text-amber-700 font-medium hover:underline text-[10px]"
                            >
                              Open Review &rarr;
                            </Link>
                          ) : task.taskType === "MOCK_TEST" ? (
                            <Link
                              href="/mock-tests"
                              className="text-primary font-medium hover:underline text-[10px]"
                            >
                              Launch CBT &rarr;
                            </Link>
                          ) : (
                            <span className="text-[10px] text-muted">
                              {isCompleted ? "Done" : isSkipped ? "Skipped" : "Planned"}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
