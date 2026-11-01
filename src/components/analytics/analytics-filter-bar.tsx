"use client";

import React, { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Calendar, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AnalyticsFilterBarProps {
  currentCategory: string;
  currentExamYear: string;
  currentPeriod: string;
}

export function AnalyticsFilterBar({
  currentCategory,
  currentExamYear,
  currentPeriod,
}: AnalyticsFilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "ALL" || value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    startTransition(() => {
      router.push(`/analytics?${params.toString()}`);
    });
  };

  const periods = [
    { label: "All Time", value: "all" },
    { label: "Last 90 Days", value: "90d" },
    { label: "Last 30 Days", value: "30d" },
    { label: "Last 7 Days", value: "7d" },
  ];

  return (
    <div className="bg-surface border border-border rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <select
              value={currentCategory}
              disabled={isPending}
              onChange={(e) => handleFilterChange("category", e.target.value)}
              className="h-9 px-3 text-xs bg-background border border-border rounded-xl text-foreground focus:ring-1 focus:ring-primary focus:outline-hidden"
            >
              <option value="ALL">All Test Categories</option>
              <option value="FULL_SYLLABUS">Full Syllabus Mocks</option>
              <option value="SUBJECT_WISE">Subject-Wise Practice</option>
              <option value="GENERAL_TEST">General Test</option>
            </select>
          </div>

          {/* Exam Year Filter */}
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <select
              value={currentExamYear}
              disabled={isPending}
              onChange={(e) => handleFilterChange("examYear", e.target.value)}
              className="h-9 px-3 text-xs bg-background border border-border rounded-xl text-foreground focus:ring-1 focus:ring-primary focus:outline-hidden"
            >
              <option value="ALL">All Exam Years</option>
              <option value="2026">CUET UG 2026</option>
              <option value="2027">CUET UG 2027</option>
            </select>
          </div>
        </div>

        {/* Time Period Tabs */}
        <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border text-xs self-start md:self-auto">
          {periods.map((p) => {
            const isActive = currentPeriod === p.value;
            return (
              <Button
                key={p.value}
                variant={isActive ? "default" : "ghost"}
                size="sm"
                disabled={isPending}
                onClick={() => handleFilterChange("period", p.value)}
                className="h-7 px-2.5 text-xs font-medium"
              >
                {p.label}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

