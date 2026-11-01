import { describe, it, expect } from "vitest";
import { themeTokens } from "@/config/theme";
import { buttonVariants } from "@/components/ui/button";
import { badgeVariants } from "@/components/ui/badge";

describe("Phase 2: Design System & Tokens Verification", () => {
  it("should have correct MockMate brand hex values defined", () => {
    expect(themeTokens.colors.brand.primary).toBe("#244B8F");
    expect(themeTokens.colors.brand.navyText).toBe("#172B4D");
    expect(themeTokens.colors.brand.lightAccent).toBe("#EAF1FC");
    expect(themeTokens.colors.neutral.background).toBe("#F8FAFC");
    expect(themeTokens.colors.feedback.success).toBe("#16A34A");
    expect(themeTokens.colors.feedback.warning).toBe("#D97706");
    expect(themeTokens.colors.feedback.error).toBe("#DC2626");
  });

  it("should define all 5 standard NTA CBT question palette states", () => {
    const cbtStates = Object.keys(themeTokens.colors.cbt);
    expect(cbtStates).toContain("unvisited");
    expect(cbtStates).toContain("notAnswered");
    expect(cbtStates).toContain("answered");
    expect(cbtStates).toContain("markedForReview");
    expect(cbtStates).toContain("answeredAndMarked");
  });

  it("should generate proper classes for button variants", () => {
    const defaultClasses = buttonVariants({ variant: "default" });
    expect(defaultClasses).toContain("bg-primary");

    const secondaryClasses = buttonVariants({ variant: "secondary" });
    expect(secondaryClasses).toContain("bg-secondary");

    const cbtClasses = buttonVariants({ variant: "cbt" });
    expect(cbtClasses).toContain("border-slate-300");

    const smClasses = buttonVariants({ size: "sm" });
    expect(smClasses).toContain("h-8");
  });

  it("should generate proper classes for badge variants", () => {
    const successBadge = badgeVariants({ variant: "success" });
    expect(successBadge).toContain("bg-emerald-50");

    const cbtBadge = badgeVariants({ variant: "cbt" });
    expect(cbtBadge).toContain("font-mono");
  });
});
