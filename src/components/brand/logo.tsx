import React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface LogoProps {
  className?: string;
  size?: "sm" | "default" | "lg" | "xl";
  href?: string;
  showTagline?: boolean;
  variant?: "horizontal" | "stacked" | "icon";
  priority?: boolean;
}

export function Logo({
  className,
  size = "default",
  href = "/",
  showTagline = false,
  variant = "horizontal",
  priority = false,
}: LogoProps) {
  // Height classes by variant and size
  const horizontalSizes = {
    sm: "h-7 sm:h-8 w-auto",
    default: "h-9 sm:h-10 w-auto",
    lg: "h-12 sm:h-14 w-auto",
    xl: "h-16 sm:h-20 w-auto",
  };

  const stackedSizes = {
    sm: "h-12 w-auto",
    default: "h-16 w-auto",
    lg: "h-24 w-auto",
    xl: "h-32 w-auto",
  };

  const iconSizes = {
    sm: "h-7 w-auto",
    default: "h-9 w-auto",
    lg: "h-12 w-auto",
    xl: "h-16 w-auto",
  };

  // Dimensions for Next.js Image component optimization
  const dimensions = {
    horizontal: {
      sm: { width: 170, height: 32 },
      default: { width: 213, height: 40 },
      lg: { width: 298, height: 56 },
      xl: { width: 426, height: 80 },
    },
    stacked: {
      sm: { width: 72, height: 48 },
      default: { width: 96, height: 64 },
      lg: { width: 144, height: 96 },
      xl: { width: 192, height: 128 },
    },
    icon: {
      sm: { width: 37, height: 28 },
      default: { width: 48, height: 36 },
      lg: { width: 64, height: 48 },
      xl: { width: 85, height: 64 },
    },
  };

  const isPriority = priority || size === "default";

  let imageContent: React.ReactNode;

  if (variant === "icon") {
    const dim = dimensions.icon[size];
    imageContent = (
      <Image
        src="/images/logo-icon.png"
        alt="MockMate"
        width={dim.width}
        height={dim.height}
        className={cn("object-contain", iconSizes[size])}
        priority={isPriority}
      />
    );
  } else if (variant === "stacked") {
    const dim = dimensions.stacked[size];
    imageContent = (
      <>
        {/* Light mode stacked logo */}
        <Image
          src="/images/logo.png"
          alt="MockMate — Prepare • Practice • Excel"
          width={dim.width}
          height={dim.height}
          className={cn("object-contain block dark:hidden", stackedSizes[size])}
          priority={isPriority}
        />
        {/* Dark mode stacked logo with high-contrast text */}
        <Image
          src="/images/logo-dark.png"
          alt="MockMate — Prepare • Practice • Excel"
          width={dim.width}
          height={dim.height}
          className={cn("object-contain hidden dark:block", stackedSizes[size])}
          priority={isPriority}
        />
      </>
    );
  } else {
    // Default: Horizontal lockup
    const dim = dimensions.horizontal[size];
    imageContent = (
      <>
        {/* Light mode horizontal logo */}
        <Image
          src="/images/logo-horizontal.png"
          alt="MockMate — Prepare • Practice • Excel"
          width={dim.width}
          height={dim.height}
          className={cn("object-contain block dark:hidden", horizontalSizes[size])}
          priority={isPriority}
        />
        {/* Dark mode horizontal logo with crisp white 'Mock' and vibrant purple 'Mate' */}
        <Image
          src="/images/logo-horizontal-dark.png"
          alt="MockMate — Prepare • Practice • Excel"
          width={dim.width}
          height={dim.height}
          className={cn("object-contain hidden dark:block", horizontalSizes[size])}
          priority={isPriority}
        />
      </>
    );
  }

  const content = (
    <div
      className={cn(
        "inline-flex items-center select-none group transition-transform duration-200 hover:scale-[1.02]",
        className
      )}
    >
      {imageContent}
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="inline-flex items-center focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
        aria-label="MockMate Home"
      >
        {content}
      </Link>
    );
  }

  return content;
}
