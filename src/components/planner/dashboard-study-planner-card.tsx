"use client";

import React from "react";
import Link from "next/link";
import { CalendarDays, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardStudyPlannerCardProps {
  weeklyTargetMinutes: number;
  completedMinutes: number;
  progressPercentage: number;
  todayTasksCount: number;
  nextTaskTitle?: string | null;
  hasActivePlan: boolean;
}

export function DashboardStudyPlannerCard({
  weeklyTargetMinutes,
  completedMinutes,
  progressPercentage,
  todayTasksCount,
  nextTaskTitle,
  hasActivePlan,
}: DashboardStudyPlannerCardProps) {
  const formatHoursMinutes = (totalMins: number) => {
    const hrs = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    if (hrs === 0) return `${mins}m`;
    if (mins === 0) return `${hrs}h`;
    return `${hrs}h ${mins}m`;
  };

  return (
    <div className="bg-surface rounded-xl border border-border p-6 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <CalendarDays className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">CUET Study Planner</h3>
              <p className="text-[11px] text-muted">Weekly timetable &amp; targets</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-primary">{progressPercentage}%</span>
        </div>

        {hasActivePlan ? (
          <div className="mt-4 space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted">Target Progress</span>
                <span className="font-semibold text-foreground">
                  {formatHoursMinutes(completedMinutes)} / {formatHoursMinutes(weeklyTargetMinutes)}
                </span>
              </div>
              <div className="w-full bg-border rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, progressPercentage)}%` }}
                />
              </div>
            </div>

            <div className="bg-muted/30 rounded-lg p-3 border border-border/60 text-xs">
              <div className="text-[11px] text-muted font-medium uppercase tracking-wider">
                Today&apos;s Focus
              </div>
              {todayTasksCount > 0 ? (
                <div className="mt-1 font-semibold text-foreground flex items-center justify-between">
                  <span className="line-clamp-1">{nextTaskTitle || `${todayTasksCount} sessions scheduled`}</span>
                  <span className="text-xs text-primary shrink-0 ml-2">
                    {todayTasksCount} planned
                  </span>
                </div>
              ) : (
                <div className="mt-1 text-muted flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>No tasks remaining today</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-muted">
            <p>No active study plan generated yet.</p>
            <p className="text-[11px] mt-1">Generate a structured timetable tailored to your CUET subjects.</p>
          </div>
        )}
      </div>

      <div className="mt-5 pt-3 border-t border-border flex items-center justify-between">
        <Link href="/ai-assistant" className="text-xs text-muted hover:text-foreground">
          Ask AI Assistant
        </Link>
        <Link href="/study-planner">
          <Button size="sm" variant="default" className="text-xs h-8 gap-1">
            {hasActivePlan ? "View Planner" : "Create Plan"} <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
