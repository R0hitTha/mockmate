"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  RefreshCw,
  Plus,
  Settings,
  History,
  Bot,
  ArrowRight,
  BookOpen,
  Clock,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlannerOverviewCards } from "@/components/planner/planner-overview-cards";
import { TodayTasksSection } from "@/components/planner/today-tasks-section";
import { SubjectAllocationCard } from "@/components/planner/subject-allocation-card";
import { RescheduleModal } from "@/components/planner/reschedule-modal";
import { CustomTaskModal } from "@/components/planner/custom-task-modal";
import { RegeneratePlanDialog } from "@/components/planner/regenerate-plan-dialog";
import {
  type PlannerDashboardData,
  type StoredStudyTask,
} from "@/lib/study-planner-service";
import { getStudyPlannerDataAction } from "@/actions/planner-actions";

interface StudyPlannerClientViewProps {
  initialData: PlannerDashboardData;
  studentName: string;
  targetYear: number;
}

export function StudyPlannerClientView({
  initialData,
  studentName,
  targetYear,
}: StudyPlannerClientViewProps) {
  const [data, setData] = useState<PlannerDashboardData>(initialData);
  const [rescheduleTask, setRescheduleTask] = useState<StoredStudyTask | null>(null);
  const [isCustomTaskOpen, setIsCustomTaskOpen] = useState(false);
  const [isRegenerateOpen, setIsRegenerateOpen] = useState(false);

  const refreshData = async () => {
    try {
      const res = await getStudyPlannerDataAction();
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error("Failed to refresh planner data", err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface rounded-xl border border-border p-6 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary mb-2">
            <CalendarDays className="w-3.5 h-3.5" /> CUET UG {targetYear} Preparation Timetable
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            Welcome, {studentName}
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-1 max-w-xl">
            {data.activePlan
              ? data.activePlan.title
              : "Organize your revision, practice drills, and mock tests with structured daily goals."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCustomTaskOpen(true)}
            className="text-xs h-9 gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Add Task
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsRegenerateOpen(true)}
            className="text-xs h-9 gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Regenerate
          </Button>

          <Link href="/study-planner/weekly">
            <Button size="sm" variant="default" className="text-xs h-9 gap-1.5">
              Weekly Timetable <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Overview Cards */}
      <PlannerOverviewCards
        weeklyTargetMinutes={data.weeklyTargetMinutes}
        completedMinutes={data.completedMinutes}
        remainingMinutes={data.remainingMinutes}
        progressPercentage={data.progressPercentage}
        completedTasksCount={data.completedTasksCount}
        totalTasksCount={data.totalTasksCount}
      />

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column (2 spans): Today's Agenda & Upcoming Tasks */}
        <div className="lg:col-span-2 space-y-8">
          {/* Today's Tasks */}
          <TodayTasksSection
            todayTasks={data.todayTasks}
            onTaskUpdated={refreshData}
            onOpenRescheduleModal={(task) => setRescheduleTask(task)}
          />

          {/* Upcoming Tasks Section */}
          <div className="bg-surface rounded-xl border border-border p-6 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" /> Upcoming Sessions This Week
              </h2>
              <Link
                href="/study-planner/weekly"
                className="text-xs text-primary font-semibold hover:underline"
              >
                View 7-Day Plan
              </Link>
            </div>

            {data.upcomingTasks.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted">
                No upcoming tasks remaining for the rest of this week.
              </div>
            ) : (
              <div className="divide-y divide-border/60 mt-2">
                {data.upcomingTasks.slice(0, 5).map((task) => (
                  <div
                    key={task.id}
                    className="py-3 flex items-center justify-between gap-4 text-xs"
                  >
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <div className="font-semibold text-foreground truncate">
                        {task.title}
                      </div>
                      <div className="text-muted flex items-center gap-2 text-[11px]">
                        <span>{task.plannedDate}</span>
                        <span>•</span>
                        <span>{task.plannedDurationMinutes} mins</span>
                        {task.subjectName && (
                          <>
                            <span>•</span>
                            <span>{task.subjectName}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => setRescheduleTask(task)}
                      className="text-primary hover:underline text-[11px] font-medium shrink-0"
                    >
                      Reschedule
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 span): Subject Allocation & Quick Actions */}
        <div className="space-y-8">
          {/* Subject Allocation */}
          <SubjectAllocationCard allocations={data.subjectAllocations} />

          {/* AI Assistant Quick Callout */}
          <div className="bg-gradient-to-br from-primary/5 via-surface to-primary/10 rounded-xl border border-primary/20 p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">AI Study Assistant</h3>
                <p className="text-[11px] text-muted">Get help clarifying doubts</p>
              </div>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              Have questions about a difficult formula, revision strategy, or NCERT concept? Ask your AI study coach.
            </p>
            <Link href="/ai-assistant">
              <Button size="sm" variant="default" className="w-full text-xs gap-1.5 mt-1">
                <Bot className="w-3.5 h-3.5" /> Open AI Assistant
              </Button>
            </Link>
          </div>

          {/* Quick Links & Settings */}
          <div className="bg-surface rounded-xl border border-border p-5 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
              Planner Management
            </h4>
            <div className="space-y-1 text-xs">
              <Link
                href="/study-planner/weekly"
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted text-foreground transition-colors"
              >
                <span className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-primary" /> Full Weekly Timetable
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-muted" />
              </Link>

              <Link
                href="/study-planner/settings"
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted text-foreground transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-primary" /> Schedule &amp; Target Settings
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-muted" />
              </Link>

              <Link
                href="/study-planner/history"
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted text-foreground transition-colors"
              >
                <span className="flex items-center gap-2">
                  <History className="w-4 h-4 text-primary" /> Previous Weeks History
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-muted" />
              </Link>

              <Link
                href="/mistakes"
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted text-foreground transition-colors"
              >
                <span className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" /> Mistake Intelligence
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-muted" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <RescheduleModal
        task={rescheduleTask}
        isOpen={Boolean(rescheduleTask)}
        onClose={() => setRescheduleTask(null)}
        onSuccess={refreshData}
      />

      <CustomTaskModal
        planId={data.activePlan?.id}
        isOpen={isCustomTaskOpen}
        onClose={() => setIsCustomTaskOpen(false)}
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
