"use client";

import React from "react";
import { PieChart, BookOpen } from "lucide-react";
import { type SubjectAllocation } from "@/lib/study-planner-service";

interface SubjectAllocationCardProps {
  allocations: SubjectAllocation[];
}

export function SubjectAllocationCard({ allocations }: SubjectAllocationCardProps) {
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
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <PieChart className="w-4 h-4 text-primary" /> Subject Allocation
          </h3>
          <span className="text-xs text-muted">Weekly Distribution</span>
        </div>

        {allocations.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted">
            No active subject allocations for this plan.
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            {allocations.map((item) => (
              <div key={item.subjectId} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <BookOpen className="w-3 h-3 text-primary" /> {item.subjectName}
                  </span>
                  <span className="text-muted">
                    {formatHoursMinutes(item.plannedMinutes)} ({item.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-primary h-1.5 rounded-full"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 pt-3 border-t border-border text-[11px] text-muted leading-relaxed">
        Rule-based allocation automatically balances enrolled papers while prioritizing struggle topics.
      </div>
    </div>
  );
}
