import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Check, ArrowRight, ShieldCheck } from "lucide-react";
import { PublicLayout } from "@/components/layout/public-layout";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/layout/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Test Packs & Pricing — MockMate",
  description:
    "Explore transparent MockMate plans for CUET UG preparation. Free diagnostic mocks, comprehensive test passes, and domain subject packs.",
};

export default function PricingPage() {
  const plans = [
    {
      name: "Free Diagnostic",
      badge: "Get Started",
      description:
        "Experience the authentic NTA CBT simulator and get a baseline diagnostic score.",
      price: "₹0",
      cadence: "Free Forever",
      highlight: false,
      features: [
        "1 Full-Length CUET Mock per registered subject",
        "Chapter-level diagnostic tests",
        "Official NTA CBT test engine simulation",
        "Instant score report (+5 / -1 marking)",
        "Basic question solution keys",
      ],
      buttonText: "Start Free Practice",
      buttonVariant: "outline" as const,
      href: "/register",
    },
    {
      name: "Pro Aspirant Pass",
      badge: "Most Comprehensive",
      description:
        "Full preparation coverage with extensive mock library, deep solutions, and weakness tracking.",
      price: "Indicative Tier",
      cadence: "Full Examination Season Access",
      highlight: true,
      features: [
        "50+ Full-Length CUET Mock Examinations",
        "500+ Chapter-wise and Topic-wise practice sets",
        "Step-by-step conceptual derivations & explanations",
        "Automated weak-topic detection and error logs",
        "Detailed pacing analytics vs 60s per-question budget",
        "Unlimited mock test review and bookmarking",
      ],
      buttonText: "Join Early Access",
      buttonVariant: "default" as const,
      href: "/register",
    },
    {
      name: "Subject Test Pack",
      badge: "Targeted Mastery",
      description:
        "Specialized practice for individual high-stake domain subjects like Math or Economics.",
      price: "Modular Pack",
      cadence: "Per Subject Access",
      highlight: false,
      features: [
        "15+ Subject-specific full mocks",
        "All chapter-wise unit tests for that domain",
        "Detailed solutions and formula cheat-sheets",
        "Ideal for targeted domain score boosters",
      ],
      buttonText: "Explore Subject Packs",
      buttonVariant: "outline" as const,
      href: "/register",
    },
  ];

  return (
    <PublicLayout>
      <div className="py-12 border-b border-border bg-gradient-to-b from-surface to-background">
        <Container size="lg">
          <PageHeader
            title="Transparent, Student-First Pricing"
            description="Start preparing for free with genuine diagnostic mock exams. Upgrade only when you want comprehensive test series access."
            badge={<Badge variant="default">CUET 2026 / 2027</Badge>}
          />
        </Container>
      </div>

      <div className="py-14 sm:py-20 bg-background">
        <Container size="lg" className="space-y-12">
          {/* Indicative Notice Banner */}
          <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/70 dark:bg-blue-950/40 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-900 dark:text-blue-300 leading-relaxed">
              <span className="font-bold">Transparent Notice: </span>
              Payment gateways are not active during this development phase. All
              registered students currently have full access to free diagnostic mocks.
              Final commercial pricing and subscription tiers will be finalized in the
              monetization milestone.
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
            {plans.map((plan, idx) => (
              <Card
                key={idx}
                className={`flex flex-col justify-between relative overflow-hidden ${
                  plan.highlight
                    ? "border-primary ring-2 ring-primary/20 shadow-lg"
                    : "shadow-xs"
                }`}
              >
                {plan.highlight && (
                  <div className="bg-primary text-primary-foreground text-center py-1 text-[11px] font-bold uppercase tracking-wider">
                    Recommended for Full Preparation
                  </div>
                )}

                <CardHeader className="p-6">
                  <div className="flex items-center justify-between">
                    <Badge variant={plan.highlight ? "default" : "secondary"}>
                      {plan.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl font-bold mt-2">{plan.name}</CardTitle>
                  <CardDescription className="text-xs leading-relaxed mt-1">
                    {plan.description}
                  </CardDescription>

                  <div className="pt-4 border-t border-border/80 mt-4">
                    <span className="text-2xl sm:text-3xl font-extrabold text-foreground font-mono">
                      {plan.price}
                    </span>
                    <p className="text-xs text-muted-foreground mt-0.5">{plan.cadence}</p>
                  </div>
                </CardHeader>

                <CardContent className="p-6 pt-0 space-y-3">
                  <p className="text-xs font-semibold text-foreground uppercase tracking-wider">
                    What is included:
                  </p>
                  <ul className="space-y-2.5">
                    {plan.features.map((feature, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2.5 text-xs text-foreground"
                      >
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="leading-snug">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="p-6 pt-0 mt-auto">
                  <Button
                    variant={plan.buttonVariant}
                    className="w-full justify-center"
                    asChild
                  >
                    <Link href={plan.href}>
                      {plan.buttonText}
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </Container>
      </div>
    </PublicLayout>
  );
}
