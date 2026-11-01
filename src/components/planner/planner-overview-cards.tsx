"use client";

import React from "react";
import { Clock, CheckCircle2, Target, TrendingUp } from "lucide-react";

interface PlannerOverviewCardsProps {
  weeklyTargetMinutes: number;
  completedMinutes: number;
  remainingMinutes: number;
  progressPercentage: number;
  completedTasksCount: number;
  totalTasksCount: number;
}

export function PlannerOverviewCards({
  weeklyTargetMinutes,
  completedMinutes,
  remainingMinutes,
  progressPercentage,
  completedTasksCount,
  totalTasksCount,
}: PlannerOverviewCardsProps) {
  const formatHoursMinutes = (totalMins: number) => {
    const hrs = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    if (hrs === 0) return `${mins}m`;
    if (mins === 0) return `${hrs}h`;
    return `${hrs}h ${mins}m`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Weekly Target */}
      <div className="bg-surface rounded-xl border border-border p-5 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted tracking-wider uppercase">Weekly Target</span>
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Target className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-foreground tracking-tight">
            {formatHoursMinutes(weeklyTargetMinutes)}
          </div>
          <div className="text-xs text-muted mt-1">
            Planned across active study days
          </div>
        </div>
      </div>

      {/* 2. Completed Study Time */}
      <div className="bg-surface rounded-xl border border-border p-5 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted tracking-wider uppercase">Completed Time</span>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-emerald-600 tracking-tight">
            {formatHoursMinutes(completedMinutes)}
          </div>
          <div className="text-xs text-muted mt-1">
            {completedTasksCount} of {totalTasksCount} tasks completed
          </div>
        </div>
      </div>

      {/* 3. Remaining Study Target */}
      <div className="bg-surface rounded-xl border border-border p-5 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted tracking-wider uppercase">Remaining Target</span>
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-foreground tracking-tight">
            {formatHoursMinutes(remainingMinutes)}
          </div>
          <div className="text-xs text-muted mt-1">
            {remainingMinutes === 0 ? "Goal reached this week!" : "To stay on track for CUET"}
          </div>
        </div>
      </div>

      {/* 4. Weekly Progress */}
      <div className="bg-surface rounded-xl border border-border p-5 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted tracking-wider uppercase">Weekly Goal</span>
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-foreground tracking-tight">{progressPercentage}%</span>
            <span className="text-xs text-muted font-medium">Target Pace</span>
          </div>
          <div className="w-full bg-border rounded-full h-2 mt-2 overflow-hidden">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, progressPercentage)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
