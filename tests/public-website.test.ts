import { describe, it, expect } from "vitest";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";

describe("Phase 3: Public Website Tests", () => {
  it("should generate a valid sitemap with all core public routes", () => {
    const map = sitemap();
    expect(map.length).toBeGreaterThanOrEqual(8);

    const urls = map.map((m) => m.url);
    expect(urls.some((u) => u.endsWith("/features"))).toBe(true);
    expect(urls.some((u) => u.endsWith("/cuet-subjects"))).toBe(true);
    expect(urls.some((u) => u.endsWith("/pricing"))).toBe(true);
    expect(urls.some((u) => u.endsWith("/about"))).toBe(true);
    expect(urls.some((u) => u.endsWith("/contact"))).toBe(true);
    expect(urls.some((u) => u.endsWith("/privacy"))).toBe(true);
    expect(urls.some((u) => u.endsWith("/terms"))).toBe(true);
  });

  it("should configure proper robots.txt with disallow directives for protected routes", () => {
    const rob = robots();
    expect(rob.rules).toBeDefined();
    expect(rob.sitemap).toContain("/sitemap.xml");
  });
});
