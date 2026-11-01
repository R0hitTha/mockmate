import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { ShieldCheck, Target, Sparkles, ArrowRight, GraduationCap } from "lucide-react";
import { PublicLayout } from "@/components/layout/public-layout";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/layout/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "About MockMate — Mission & Academic Principles",
  description:
    "Learn about MockMate's mission: building an authentic, CUET-only examination simulation and preparation platform for Indian students.",
};

export default function AboutPage() {
  const corePrinciples = [
    {
      title: "CUET-Only Focus",
      icon: Target,
      description:
        "We believe multi-exam platforms dilute preparation quality. MockMate is built from the ground up strictly for CUET UG, respecting its unique syllabus, question constraints, and NTA scoring formula.",
    },
    {
      title: "Realistic Exam Simulation",
      icon: ShieldCheck,
      description:
        "Paper practice cannot teach computer-based test pacing. We provide an authentic CBT interface with question palette states, timers, and marking schemes identical to the actual examination center.",
    },
    {
      title: "Actionable Feedback Loop",
      icon: Sparkles,
      description:
        "Scores alone do not teach. MockMate connects your test attempt directly to detailed, step-by-step verified explanations and automated topic-level weakness identification.",
    },
    {
      title: "Calm, Professional Experience",
      icon: GraduationCap,
      description:
        "Serious entrance examinations require focused preparation. We reject noisy gamification, loud streaks, and cluttered interfaces in favor of a clean, distraction-free study environment.",
    },
  ];

  return (
    <PublicLayout>
      <div className="py-12 border-b border-border bg-gradient-to-b from-surface to-background">
        <Container size="lg">
          <PageHeader
            title="About MockMate"
            description="Our mission is to help Indian students approach the Common University Entrance Test (CUET UG) with clarity, authentic practice, and measurable confidence."
            badge={<Badge variant="default">Academic Mission</Badge>}
          />
        </Container>
      </div>

      <div className="py-14 sm:py-20 bg-background">
        <Container size="lg" className="space-y-16">
          {/* Mission Narrative */}
          <div className="max-w-3xl mx-auto space-y-6 text-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Why We Built MockMate
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              With the introduction of the Common University Entrance Test (CUET UG) by
              the Ministry of Education and the National Testing Agency, admissions to
              central, state, and participating universities have become centralized. Yet,
              most existing test platforms merely adapted question banks originally built
              for JEE, NEET, or state boards.
            </p>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              MockMate was conceived with a clear conviction: CUET aspirants deserve a
              dedicated, authentic, and calm digital platform where every mock test
              reflects the true NTA computer-based environment, every question has a
              verified step-by-step explanation, and every attempt provides clear guidance
              on what to revise next.
            </p>
          </div>

          {/* Core Values Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {corePrinciples.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Card key={idx} hoverEffect>
                  <CardContent className="p-6 space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-foreground">{item.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Academic Integrity Commitment */}
          <div className="p-8 sm:p-10 rounded-2xl border border-border bg-surface space-y-4">
            <h3 className="text-lg font-bold text-foreground tracking-tight">
              Our Commitment to Exam Integrity and Accuracy
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Every question published in the MockMate question library is aligned with
              the Class 12 NCERT curriculum and verified against official NTA syllabus
              specifications. We operate with server-authoritative scoring to prevent
              answer leaks and ensure that your mock score reflects true examination
              readiness.
            </p>
            <div className="pt-2">
              <Button asChild size="sm">
                <Link href="/register">
                  Start Practicing with MockMate
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Link>
              </Button>
            </div>
          </div>
        </Container>
      </div>
    </PublicLayout>
  );
}
