/**
 * Centralized design tokens and theme values for MockMate.
 * Strictly enforces a cohesive, calm, professional Navy-Blue aesthetic.
 */

export const themeTokens = {
  colors: {
    brand: {
      primary: "#244B8F", // Refined Royal Navy Blue
      primaryHover: "#1D3D75",
      primaryDark: "#3B82F6",
      navyText: "#172B4D",
      lightAccent: "#EAF1FC",
      lightAccentHover: "#D6E4FA",
    },
    neutral: {
      background: "#F8FAFC",
      surface: "#FFFFFF",
      muted: "#F1F5F9",
      secondaryText: "#64748B",
      border: "#E2E8F0",
      borderDark: "#334155",
      darkBg: "#0B132B",
      darkSurface: "#1C2541",
    },
    feedback: {
      success: "#16A34A",
      successBg: "#DCFCE7",
      successText: "#166534",
      warning: "#D97706",
      warningBg: "#FEF3C7",
      warningText: "#92400E",
      error: "#DC2626",
      errorBg: "#FEE2E2",
      errorText: "#991B1B",
      info: "#0284C7",
      infoBg: "#E0F2FE",
      infoText: "#075985",
    },
    cbt: {
      unvisited: {
        bg: "#F1F5F9",
        border: "#CBD5E1",
        text: "#475569",
        label: "Not Visited",
      },
      notAnswered: {
        bg: "#FEE2E2",
        border: "#EF4444",
        text: "#991B1B",
        label: "Not Answered",
      },
      answered: {
        bg: "#DCFCE7",
        border: "#22C55E",
        text: "#166534",
        label: "Answered",
      },
      markedForReview: {
        bg: "#F3E8FF",
        border: "#A855F7",
        text: "#6B21A8",
        label: "Marked for Review",
      },
      answeredAndMarked: {
        bg: "#EDE9FE",
        border: "#7C3AED",
        text: "#5B21B6",
        label: "Answered & Marked for Review",
      },
    },
  },
  typography: {
    fontSans:
      "var(--font-geist-sans), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontMono: "var(--font-geist-mono), monospace",
    scale: {
      h1: "text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight",
      h2: "text-2xl sm:text-3xl font-bold tracking-tight",
      h3: "text-xl sm:text-2xl font-bold tracking-tight",
      h4: "text-lg font-semibold tracking-tight",
      bodyLarge: "text-lg text-slate-700 dark:text-slate-200 leading-relaxed",
      body: "text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed",
      bodySmall: "text-xs sm:text-sm text-slate-500 dark:text-slate-400",
      caption: "text-xs font-medium text-slate-400 tracking-wide uppercase",
    },
  },
  radius: {
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    full: "rounded-full",
  },
  shadows: {
    subtle: "shadow-xs border border-slate-200 dark:border-slate-800",
    card: "shadow-sm border border-slate-200/90 dark:border-slate-800",
    dropdown: "shadow-md border border-slate-200 dark:border-slate-800",
    modal: "shadow-xl border border-slate-200 dark:border-slate-800",
  },
  transitions: {
    fast: "transition-all duration-150 ease-out",
    normal: "transition-all duration-200 ease-in-out",
  },
} as const;
