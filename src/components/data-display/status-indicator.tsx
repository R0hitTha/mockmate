import React from "react";
import { cn } from "@/lib/utils";

export type StatusType =
  "online" | "offline" | "pending" | "in-progress" | "completed" | "error";

interface StatusIndicatorProps {
  status: StatusType;
  label?: string;
  className?: string;
  pulse?: boolean;
}

export function StatusIndicator({
  status,
  label,
  className,
  pulse = false,
}: StatusIndicatorProps) {
  const statusStyles: Record<
    StatusType,
    { dot: string; text: string; defaultLabel: string }
  > = {
    online: {
      dot: "bg-emerald-500",
      text: "text-emerald-700 dark:text-emerald-400",
      defaultLabel: "Online",
    },
    completed: {
      dot: "bg-emerald-500",
      text: "text-emerald-700 dark:text-emerald-400",
      defaultLabel: "Completed",
    },
    "in-progress": {
      dot: "bg-blue-600",
      text: "text-blue-700 dark:text-blue-400",
      defaultLabel: "In Progress",
    },
    pending: {
      dot: "bg-amber-500",
      text: "text-amber-700 dark:text-amber-400",
      defaultLabel: "Pending",
    },
    offline: {
      dot: "bg-slate-400",
      text: "text-slate-600 dark:text-slate-400",
      defaultLabel: "Offline",
    },
    error: {
      dot: "bg-red-500",
      text: "text-red-700 dark:text-red-400",
      defaultLabel: "Error",
    },
  };

  const current = statusStyles[status];

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <span className="relative flex h-2.5 w-2.5">
        {pulse && (
          <span
            className={cn(
              "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
              current.dot
            )}
          />
        )}
        <span
          className={cn("relative inline-flex rounded-full h-2.5 w-2.5", current.dot)}
        />
      </span>
      {(label || current.defaultLabel) && (
        <span className={cn("text-xs font-medium", current.text)}>
          {label || current.defaultLabel}
        </span>
      )}
    </div>
  );
}
