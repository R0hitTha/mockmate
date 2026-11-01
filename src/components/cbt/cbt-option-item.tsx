"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface CBTOptionItemProps {
  label: "A" | "B" | "C" | "D" | string;
  text: string;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

export function CBTOptionItem({
  label,
  text,
  selected = false,
  disabled = false,
  onClick,
  className,
}: CBTOptionItemProps) {
  return (
    <div
      onClick={!disabled ? onClick : undefined}
      role="radio"
      aria-checked={selected}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (!disabled && (e.key === " " || e.key === "Enter")) {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={cn(
        "flex items-start gap-3.5 p-3.5 sm:p-4 rounded-xl border text-sm transition-all duration-150 select-none cursor-pointer",
        selected
          ? "border-primary bg-blue-50/70 dark:bg-blue-950/40 text-slate-900 dark:text-white font-medium ring-1 ring-primary"
          : "border-border bg-surface hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-muted/40",
        disabled && "opacity-50 pointer-events-none cursor-not-allowed",
        className
      )}
    >
      <div
        className={cn(
          "w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 transition-colors",
          selected
            ? "bg-primary text-primary-foreground shadow-2xs"
            : "bg-muted text-muted-foreground border border-border"
        )}
      >
        {label}
      </div>

      <div className="flex-1 pt-0.5 leading-relaxed">{text}</div>
    </div>
  );
}
