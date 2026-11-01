"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  RefreshCw,
  Plus,
  ArrowLeft,
  Settings,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { WeeklyKanban } from "@/components/planner/weekly-kanban";
import { RescheduleModal } from "@/components/planner/reschedule-modal";
import { CustomTaskModal } from "@/components/planner/custom-task-modal";
import { RegeneratePlanDialog } from "@/components/planner/regenerate-plan-dialog";
import {
  type PlannerDashboardData,
  type StoredStudyTask,
} from "@/lib/study-planner-service";
import { getStudyPlannerDataAction } from "@/actions/planner-actions";

interface WeeklyPlannerClientViewProps {
  initialData: PlannerDashboardData;
  targetYear: number;
}

export function WeeklyPlannerClientView({
  initialData,
}: WeeklyPlannerClientViewProps) {
  const [data, setData] = useState<PlannerDashboardData>(initialData);
  const [rescheduleTask, setRescheduleTask] = useState<StoredStudyTask | null>(null);
  const [customTaskDate, setCustomTaskDate] = useState<string | null>(null);
  const [isRegenerateOpen, setIsRegenerateOpen] = useState(false);

  const refreshData = async () => {
    try {
      const res = await getStudyPlannerDataAction();
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error("Failed to refresh schedule", err);
    }
  };

  const formatHoursMinutes = (totalMins: number) => {
    const hrs = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    if (hrs === 0) return `${mins}m`;
    if (mins === 0) return `${hrs}h`;
    return `${hrs}h ${mins}m`;
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Link
            href="/study-planner"
            className="p-2 rounded-lg border border-border hover:bg-muted text-muted hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-primary" /> Weekly Study Timetable
            </h1>
            <p className="text-xs text-muted mt-0.5">
              {data.activePlan ? data.activePlan.title : "Weekly Preparation Schedule"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCustomTaskDate(new Date().toISOString().split("T")[0])}
            className="text-xs h-8 gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add Task
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsRegenerateOpen(true)}
            className="text-xs h-8 gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Regenerate
          </Button>

          <Link href="/study-planner/settings">
            <Button variant="outline" size="sm" className="text-xs h-8 gap-1">
              <Settings className="w-3.5 h-3.5" /> Settings
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Summary Pill Bar */}
      <div className="bg-surface rounded-xl border border-border p-4 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-semibold text-foreground">
            <Clock className="w-4 h-4 text-primary" />
            Planned: {formatHoursMinutes(data.weeklySchedule?.totalPlannedMinutes || 0)}
          </span>
          <span className="text-border">|</span>
          <span className="flex items-center gap-1.5 font-semibold text-emerald-600">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Completed: {formatHoursMinutes(data.completedMinutes)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-muted">Target Completion:</span>
          <span className="font-bold text-foreground">{data.progressPercentage}%</span>
          <div className="w-24 bg-border rounded-full h-1.5 overflow-hidden ml-1">
            <div
              className="bg-primary h-1.5 rounded-full"
              style={{ width: `${Math.min(100, data.progressPercentage)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 7-Day Kanban / Schedule */}
      {data.weeklySchedule && (
        <WeeklyKanban
          schedule={data.weeklySchedule}
          onRefresh={refreshData}
          onOpenRescheduleModal={(task) => setRescheduleTask(task)}
          onOpenCustomTaskModal={(date) => setCustomTaskDate(date)}
        />
      )}

      {/* Modals */}
      <RescheduleModal
        task={rescheduleTask}
        isOpen={Boolean(rescheduleTask)}
        onClose={() => setRescheduleTask(null)}
        onSuccess={refreshData}
      />

      <CustomTaskModal
        planId={data.activePlan?.id}
        defaultDate={customTaskDate || undefined}
        isOpen={Boolean(customTaskDate)}
        onClose={() => setCustomTaskDate(null)}
        onSuccess={refreshData}
      />

      <RegeneratePlanDialog
        isOpen={isRegenerateOpen}
        onClose={() => setIsRegenerateOpen(false)}
        onSuccess={refreshData}
      />
    </div>
  );
}
