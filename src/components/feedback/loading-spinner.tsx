import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "default" | "lg";
  label?: string;
}

export function LoadingSpinner({
  className,
  size = "default",
  label,
}: LoadingSpinnerProps) {
  const sizeMap = {
    sm: "w-4 h-4",
    default: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400">
      <Loader2
        className={cn(
          "animate-spin text-primary dark:text-blue-400",
          sizeMap[size],
          className
        )}
        aria-hidden="true"
      />
      {label && <span className="text-xs font-medium">{label}</span>}
      <span className="sr-only">{label || "Loading..."}</span>
    </div>
  );
}
