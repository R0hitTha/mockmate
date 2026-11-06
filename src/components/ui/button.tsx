import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer leading-tight",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-[#1D3D75] dark:hover:bg-blue-600 shadow-xs",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-[#D6E4FA] dark:hover:bg-slate-700 shadow-xs",
        outline:
          "border border-border bg-surface hover:bg-muted text-foreground shadow-xs",
        ghost: "hover:bg-muted text-foreground",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-red-700 shadow-xs",
        success: "bg-success text-success-foreground hover:bg-emerald-700 shadow-xs",
        link: "text-primary underline-offset-4 hover:underline",
        cbt: "bg-white border-2 border-slate-300 text-slate-800 hover:border-slate-800 font-semibold shadow-xs",
      },
      size: {
        default: "min-h-9 px-4 py-2",
        sm: "min-h-8 rounded-md px-3 py-1 text-xs",
        lg: "min-h-11 rounded-lg px-6 py-2.5 text-base",
        icon: "h-9 w-9 shrink-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      isLoading = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        >
          {children}
        </Slot>
      );
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-current" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
