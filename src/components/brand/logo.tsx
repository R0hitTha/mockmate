import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "default" | "lg";
  href?: string;
  showTagline?: boolean;
}

export function Logo({
  className,
  size = "default",
  href = "/",
  showTagline = false,
}: LogoProps) {
  const iconSizes = {
    sm: "w-7 h-7 text-sm rounded-lg",
    default: "w-9 h-9 text-base rounded-xl",
    lg: "w-11 h-11 text-lg rounded-xl",
  };

  const textSizes = {
    sm: "text-base font-bold tracking-tight",
    default: "text-xl font-extrabold tracking-tight",
    lg: "text-2xl font-black tracking-tight",
  };

  const content = (
    <div className={cn("inline-flex items-center gap-2.5 select-none group", className)}>
      <div
        className={cn(
          "bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-xs transition-transform group-hover:scale-105 duration-200",
          iconSizes[size]
        )}
      >
        M
      </div>
      <div className="flex flex-col justify-center">
        <span
          className={cn(
            "text-foreground leading-snug font-bold tracking-tight",
            textSizes[size]
          )}
        >
          Mock<span className="text-primary dark:text-blue-400">Mate</span>
        </span>
        {showTagline && (
          <span className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground leading-normal mt-0.5">
            CUET UG Exam Prep
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="inline-block focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
      >
        {content}
      </Link>
    );
  }

  return content;
}
