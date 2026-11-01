"use client";

import React, { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Layers } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MistakeReviewFiltersProps {
  currentSubject?: string;
  currentTopic?: string;
  currentCategory?: string;
  currentStatus?: string;
  currentSortBy?: string;
  availableSubjects: string[];
  availableTopics: string[];
}

export function MistakeReviewFilters({
  currentSubject = "ALL",
  currentTopic = "ALL",
  currentCategory = "ALL",
  currentStatus = "ALL",
  currentSortBy = "recent",
  availableSubjects,
  availableTopics,
}: MistakeReviewFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleFilterChange = (key: string, value: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === "ALL" || !value) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      params.set("page", "1"); // Reset pagination on filter change
      router.push(`/mistakes/review?${params.toString()}`);
    });
  };

  const handleReset = () => {
    startTransition(() => {
      router.push("/mistakes/review");
    });
  };

  const hasActiveFilters =
    (currentSubject && currentSubject !== "ALL") ||
    (currentTopic && currentTopic !== "ALL") ||
    (currentCategory && currentCategory !== "ALL") ||
    (currentStatus && currentStatus !== "ALL") ||
    currentSortBy !== "recent";

  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-xs space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-foreground">Filter Mistake Archive</span>
          {isPending && <span className="text-[10px] text-muted-foreground animate-pulse">Filtering...</span>}
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-7 px-2.5 text-xs text-muted-foreground hover:text-foreground self-start sm:self-auto"
          >
            Reset Filters
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {/* Status Filter */}
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-muted-foreground">Review Status</label>
          <select
            value={currentStatus}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="w-full h-8 text-xs rounded-md border border-input bg-background px-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING_REVIEW">Pending Review</option>
            <option value="REVIEWED">Reviewed</option>
            <option value="MASTERED">Mastered</option>
          </select>
        </div>

        {/* Mistake Type Filter */}
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-muted-foreground">Mistake Type</label>
          <select
            value={currentCategory}
            onChange={(e) => handleFilterChange("category", e.target.value)}
            className="w-full h-8 text-xs rounded-md border border-input bg-background px-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="ALL">All Mistake Types</option>
            <option value="INCORRECT">Incorrect Answers Only</option>
            <option value="UNANSWERED">Unanswered / Skipped</option>
            <option value="REPEATED_ERROR">Repeated Errors (&ge; 2)</option>
          </select>
        </div>

        {/* Subject Filter */}
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-muted-foreground">Subject</label>
          <select
            value={currentSubject}
            onChange={(e) => handleFilterChange("subject", e.target.value)}
            className="w-full h-8 text-xs rounded-md border border-input bg-background px-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="ALL">All Subjects</option>
            {availableSubjects.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        </div>

        {/* Topic Filter */}
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-muted-foreground">Topic</label>
          <select
            value={currentTopic}
            onChange={(e) => handleFilterChange("topic", e.target.value)}
            className="w-full h-8 text-xs rounded-md border border-input bg-background px-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="ALL">All Topics</option>
            {availableTopics.map((top) => (
              <option key={top} value={top}>
                {top}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Order */}
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-muted-foreground">Sort By</label>
          <select
            value={currentSortBy}
            onChange={(e) => handleFilterChange("sortBy", e.target.value)}
            className="w-full h-8 text-xs rounded-md border border-input bg-background px-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="recent">Most Recent Attempt</option>
            <option value="oldest">Oldest Attempt</option>
            <option value="most_repeated">Most Repeated Errors</option>
            <option value="subject">Subject Name</option>
          </select>
        </div>
      </div>
    </div>
  );
}

