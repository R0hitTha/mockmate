import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-xl border p-4 text-sm flex gap-3 items-start",
  {
    variants: {
      variant: {
        info: "border-sky-200 bg-sky-50/70 text-sky-900 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-200",
        success:
          "border-emerald-200 bg-emerald-50/70 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200",
        warning:
          "border-amber-200 bg-amber-50/70 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200",
        destructive:
          "border-red-200 bg-red-50/70 text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  }
);

const icons = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  destructive: AlertCircle,
};

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertVariants> {
  title?: string;
  onClose?: () => void;
}

export function Alert({
  className,
  variant = "info",
  title,
  children,
  onClose,
  ...props
}: AlertProps) {
  const Icon = icons[variant || "info"];

  return (
    <div role="alert" className={cn(alertVariants({ variant }), className)} {...props}>
      <Icon className="w-5 h-5 shrink-0 mt-0.5" />
      <div className="flex-1 space-y-1">
        {title && <h5 className="font-semibold leading-snug tracking-tight">{title}</h5>}
        <div className="text-xs leading-relaxed opacity-90">{children}</div>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss alert"
          className="shrink-0 p-1 rounded-md opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
