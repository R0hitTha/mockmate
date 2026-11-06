import { describe, it, expect } from "vitest";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { z } from "zod";

describe("Phase 1: Project Foundation & Architecture Tests", () => {
  it("should have correct MockMate brand and phase metadata configured", () => {
    expect(siteConfig.name).toBe("MockMate");
    expect(siteConfig.tagline).toBe("Rise Above the Competition");
    expect(siteConfig.targetExams).toContain("CUET UG 2026");
    expect(siteConfig.targetExams).toContain("CUET UG 2027");
    expect(siteConfig.currentPhase).toBe("Phase 15: Testing, Security & Production Deployment");
  });

  it("should support all three mandatory CUET sections", () => {
    const sectionIds = siteConfig.supportedSections.map((s) => s.id);
    expect(sectionIds).toContain("ia-ib");
    expect(sectionIds).toContain("ii");
    expect(sectionIds).toContain("iii");
  });

  it("should correctly merge CSS utility classes using cn()", () => {
    expect(cn("px-4 py-2", "px-6")).toBe("py-2 px-6");
    expect(cn("text-red-500", undefined, null, false && "hidden")).toBe("text-red-500");
  });

  it("should validate database URL schema format with Zod safely", () => {
    const dbUrlSchema = z.string().url().startsWith("postgresql://");
    const validUrl = "postgresql://user:pass@ep-test.neon.tech/mockmate?sslmode=require";
    const invalidUrl = "mysql://user:pass@localhost:3306/db";

    expect(dbUrlSchema.safeParse(validUrl).success).toBe(true);
    expect(dbUrlSchema.safeParse(invalidUrl).success).toBe(false);
  });
});
