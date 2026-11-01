import React from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface CBTTimerProps {
  totalSeconds: number;
  className?: string;
  isUrgent?: boolean;
}

export function CBTTimer({ totalSeconds, className, isUrgent = false }: CBTTimerProps) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, "0");

  const formattedTime =
    hours > 0
      ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
      : `${pad(minutes)}:${pad(seconds)}`;

  const isLowTime = isUrgent || totalSeconds < 300; // < 5 mins
  const isWarning = totalSeconds < 600 && !isLowTime; // < 10 mins

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono text-sm font-bold shadow-xs select-none",
        isLowTime
          ? "bg-red-50 text-red-700 border-red-300 dark:bg-red-950/60 dark:text-red-300 dark:border-red-900 animate-pulse"
          : isWarning
            ? "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900"
            : "bg-surface text-foreground border-border",
        className
      )}
      aria-label={`Time remaining: ${formattedTime}`}
    >
      <Clock className="w-4 h-4 shrink-0" />
      <span>{formattedTime}</span>
    </div>
  );
}
