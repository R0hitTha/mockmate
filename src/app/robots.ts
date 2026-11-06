import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = siteConfig.url;

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/admin/",
        "/dashboard/",
        "/profile/",
        "/onboarding/",
        "/exam/",
        "/results/",
        "/mistakes/",
        "/study-planner/",
        "/ai-assistant/",
        "/subscription/",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
