import React from "react";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  className?: string;
  barClassName?: string;
  showValue?: boolean;
  label?: string;
  variant?: "default" | "success" | "warning" | "destructive";
}

export function ProgressBar({
  value,
  max = 100,
  className,
  barClassName,
  showValue = false,
  label,
  variant = "default",
}: ProgressBarProps) {
  const percentage = Math.min(Math.max(Math.round((value / max) * 100), 0), 100);

  const variantColors = {
    default: "bg-primary dark:bg-blue-500",
    success: "bg-emerald-600 dark:bg-emerald-500",
    warning: "bg-amber-500 dark:bg-amber-400",
    destructive: "bg-red-600 dark:bg-red-500",
  };

  return (
    <div className={cn("w-full space-y-1.5", className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
          {label && <span>{label}</span>}
          {showValue && (
            <span className="font-mono text-slate-500 dark:text-slate-400">
              {percentage}%
            </span>
          )}
        </div>
      )}
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className={cn(
            "h-full transition-all duration-300 ease-out rounded-full",
            variantColors[variant],
            barClassName
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
