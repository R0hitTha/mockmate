import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  BookOpen,
  Sparkles,
  Target,
} from "lucide-react";
import { PublicLayout } from "@/components/layout/public-layout";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Features — MockMate CUET UG Preparation Platform",
  description:
    "Explore the complete suite of MockMate preparation tools: authentic CBT simulation, topic-wise practice, step-by-step solutions, and weakness diagnostics.",
};

export default function FeaturesPage() {
  const featuresList = [
    {
      id: "cbt-engine",
      title: "Authentic Computer-Based Test (CBT) Engine",
      badge: "Core Feature",
      icon: Clock,
      description:
        "Engineered to mirror the official NTA examination portal. Experience identical question palette states, section navigators, active timers, and response review mechanisms.",
      highlights: [
        "Server-authoritative timer prevents client manipulation",
        "Persistent auto-save protects answers across network drops",
        "Clear status indicators: Answered, Not Answered, Marked for Review",
        "Official CUET scoring engine: +5 marks per correct, -1 per incorrect",
      ],
    },
    {
      id: "topic-practice",
      title: "Subject-Wise and Chapter-Wise Practice",
      badge: "Targeted Prep",
      icon: BookOpen,
      description:
        "Focus on specific syllabus units rather than whole papers. Isolate difficult chapters like Calculus, Organic Chemistry, Macroeconomics, or Reading Comprehension.",
      highlights: [
        "Mapped strictly to Class 12 NCERT & NTA syllabus",
        "Configurable question counts (10, 20, 40 questions)",
        "Instant conceptual feedback after submitting each unit",
        "Helps build confidence before attempting full-length timed mocks",
      ],
    },
    {
      id: "solutions",
      title: "Step-by-Step Verified Solutions",
      badge: "In-Depth Explanations",
      icon: Sparkles,
      description:
        "Every question is paired with a verified explanation. Understand not just what the correct answer is, but why alternative options are incorrect.",
      highlights: [
        "Complete step-by-step mathematical derivations",
        "Grammatical rules and vocabulary rationales for language questions",
        "Diagrammatic aids and formula callouts",
        "Option-by-option elimination guidance",
      ],
    },
    {
      id: "analytics",
      title: "Actionable Performance Analytics",
      badge: "Evidence-Based",
      icon: BarChart3,
      description:
        "Turn raw attempt records into clear progress charts. Understand your speed, accuracy, and score evolution across multiple attempts.",
      highlights: [
        "Accuracy percentage broken down by subject and chapter",
        "Pacing metrics showing time spent per question vs 60s NTA budget",
        "Negative marking impact analysis showing marks lost to guesses",
        "Attempt history archive with question bookmarking",
      ],
    },
    {
      id: "weakness",
      title: "Automated Weak Topic Flagging",
      badge: "Targeted Improvement",
      icon: AlertCircle,
      description:
        "Identify specific concepts where negative marks occur repeatedly. MockMate surfaces your highest-leverage revision priorities.",
      highlights: [
        "Identifies chapters with sub-70% accuracy",
        "Flags high-penalty topics for immediate revision",
        "Recommends targeted practice tests to close gaps",
        "Eliminates wasted time on already-mastered concepts",
      ],
    },
    {
      id: "custom-tests",
      title: "Custom Mock Test Builder",
      badge: "Flexible Practice",
      icon: Target,
      description:
        "Assemble personalized test papers by selecting specific chapters, difficulty levels, and time limits to match your study schedule.",
      highlights: [
        "Mix and match multiple domain subjects into a combined mock",
        "Select targeted difficulty: Foundational, Moderate, Advanced",
        "Custom question counts to fit 30-minute revision sessions",
        "Ideal for weekend revision and pre-board review",
      ],
    },
  ];

  return (
    <PublicLayout>
      <div className="py-12 border-b border-border bg-gradient-to-b from-surface to-background">
        <Container size="lg">
          <PageHeader
            title="MockMate Preparation Features"
            description="Explore the tools, analytics, and examination engines built specifically for CUET UG aspirants."
            badge={<Badge variant="default">Comprehensive Platform</Badge>}
            actions={
              <Button asChild>
                <Link href="/register">Start Free Mock Test</Link>
              </Button>
            }
          />
        </Container>
      </div>

      <div className="py-14 sm:py-20 bg-background">
        <Container size="lg" className="space-y-12">
          {featuresList.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.id}
                id={feature.id}
                className="p-6 sm:p-10 rounded-2xl border border-border bg-surface shadow-xs scroll-mt-24"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                  <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <Badge variant="secondary" className="text-[10px]">
                          {feature.badge}
                        </Badge>
                        <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight mt-1">
                          {feature.title}
                        </h2>
                      </div>
                    </div>

                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-3">
                      {feature.highlights.map((item, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2 text-xs text-foreground"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="leading-snug">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 rounded-xl border border-border bg-muted/40 space-y-3">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Module Status
                    </span>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">CUET Alignment</span>
                        <span className="font-semibold text-emerald-600">
                          NTA Calibrated
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Access Model</span>
                        <span className="font-semibold text-foreground">
                          Free Diagnostic Available
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Scoring Mode</span>
                        <span className="font-semibold text-foreground">
                          Server-Authoritative
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="w-full text-xs mt-2"
                    >
                      <Link href="/register">Experience in Mock Test</Link>
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </Container>
      </div>
    </PublicLayout>
  );
}
