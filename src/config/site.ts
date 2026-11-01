export const siteConfig = {
  name: "MockMate",
  tagline: "Rise Above the Competition",
  description:
    "A focused, high-precision CUET UG preparation platform providing realistic CBT mock tests, instant scoring, and actionable performance insights.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  currentPhase: "Phase 1: Project Initialization & Architecture",
  targetExams: ["CUET UG 2026", "CUET UG 2027"],
  supportedSections: [
    { id: "ia-ib", name: "Section IA & IB: Languages" },
    { id: "ii", name: "Section II: Domain Subjects" },
    { id: "iii", name: "Section III: General Test" },
  ],
  links: {
    github: "https://github.com/mockmate",
  },
} as const;

export type SiteConfig = typeof siteConfig;
