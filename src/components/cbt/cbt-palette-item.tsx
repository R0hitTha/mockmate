import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type CBTPaletteStatus =
  "unvisited" | "not-answered" | "answered" | "marked" | "answered-and-marked";

const paletteItemVariants = cva(
  "relative inline-flex items-center justify-center font-mono text-xs font-bold rounded-md transition-all duration-150 select-none cursor-pointer border",
  {
    variants: {
      status: {
        unvisited:
          "bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 hover:border-slate-400",
        "not-answered":
          "bg-red-500 text-white border-red-600 shadow-2xs hover:bg-red-600",
        answered:
          "bg-emerald-600 text-white border-emerald-700 shadow-2xs hover:bg-emerald-700",
        marked:
          "bg-purple-600 text-white border-purple-700 shadow-2xs hover:bg-purple-700",
        "answered-and-marked":
          "bg-purple-700 text-white border-purple-800 shadow-2xs hover:bg-purple-800",
      },
      size: {
        sm: "w-7 h-7 text-[10px]",
        default: "w-9 h-9 text-xs",
        lg: "w-11 h-11 text-sm",
      },
      isCurrent: {
        true: "ring-2 ring-blue-600 ring-offset-2 dark:ring-offset-slate-900 font-extrabold scale-105 z-10",
        false: "",
      },
    },
    defaultVariants: {
      status: "unvisited",
      size: "default",
      isCurrent: false,
    },
  }
);

export interface CBTPaletteItemProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof paletteItemVariants> {
  number: number | string;
}

export function CBTPaletteItem({
  number,
  status = "unvisited",
  size = "default",
  isCurrent = false,
  className,
  ...props
}: CBTPaletteItemProps) {
  return (
    <button
      type="button"
      className={cn(paletteItemVariants({ status, size, isCurrent }), className)}
      aria-label={`Question ${number} - Status: ${status}`}
      {...props}
    >
      <span>{number}</span>
      {status === "answered-and-marked" && (
        <span
          className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border border-white flex items-center justify-center text-[7px]"
          title="Answered and Marked for Review"
        >
          <Check className="w-2 h-2 text-white stroke-[3]" />
        </span>
      )}
    </button>
  );
}
