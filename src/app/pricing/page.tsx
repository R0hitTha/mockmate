import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Check, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
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
import { getSubscriptionPlans } from "@/lib/entitlement-service";

export const instant = false;

export const metadata: Metadata = {
  title: "Test Packs & Pricing — MockMate",
  description:
    "Explore transparent MockMate plans for CUET UG preparation. Free diagnostic mocks, comprehensive test passes, and domain subject packs.",
};

const FEATURE_LABELS: Record<string, string> = {
  FULL_MOCK_TESTS: "Full-Length CUET Mock Tests",
  TOPIC_PRACTICE: "Chapter & Topic Practice Questions",
  ADVANCED_ANALYTICS: "Speed & Accuracy Analytics (+5/-1 Scoring)",
  MISTAKE_INTELLIGENCE: "Weak-Topic Detection & Mistake Bank",
  STUDY_PLANNER: "Daily Syllabus Goal Tracker & Study Planner",
  AI_ASSISTANT: "24/7 AI CUET Study Assistant & Doubt Solver",
};

export default async function PricingPage() {
  const dbPlans = await getSubscriptionPlans(false);
  const plans = dbPlans.filter((p) => p.isPublic && p.isActive);

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
          {/* Payment Gateway Preparation Mode Banner */}
          <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/70 dark:bg-blue-950/40 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-900 dark:text-blue-300 leading-relaxed">
              <span className="font-bold">Monetization Preparation Mode: </span>
              MockMate enforces strict access control through server-side feature entitlements.
              All payment integrations run in sandboxed preparation mode with zero live credit card charges.
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
            {plans.map((plan) => {
              const isFree = plan.priceAmount === 0 || plan.billingInterval === "FREE";
              const priceDisplay = isFree ? "₹0" : `₹${plan.priceAmount.toLocaleString()}`;
              const cadenceDisplay = isFree
                ? "Free Forever"
                : `Per ${plan.billingInterval.toLowerCase().replace(/_/g, " ")}`;

              return (
                <Card
                  key={plan.id}
                  className={`flex flex-col justify-between relative overflow-hidden transition-all ${
                    plan.highlight
                      ? "border-primary ring-2 ring-primary/20 shadow-lg"
                      : "shadow-xs border-border"
                  }`}
                >
                  {plan.highlight && (
                    <div className="bg-primary text-primary-foreground text-center py-1 text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      Recommended for Full Preparation
                    </div>
                  )}

                  <CardHeader className="p-6">
                    <div className="flex items-center justify-between">
                      <Badge variant={plan.highlight ? "default" : "secondary"}>
                        {plan.badge || (isFree ? "Starter" : "Pro")}
                      </Badge>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {plan.code}
                      </span>
                    </div>

                    <CardTitle className="text-xl font-bold mt-2 text-foreground">
                      {plan.name}
                    </CardTitle>
                    {plan.description && (
                      <CardDescription className="text-xs leading-relaxed mt-1">
                        {plan.description}
                      </CardDescription>
                    )}

                    <div className="pt-4 border-t border-border mt-4">
                      <span className="text-2xl sm:text-3xl font-extrabold text-foreground font-mono">
                        {priceDisplay}
                      </span>
                      <p className="text-xs text-muted-foreground mt-0.5">{cadenceDisplay}</p>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6 pt-0 space-y-3">
                    <p className="text-xs font-semibold text-foreground uppercase tracking-wider">
                      Included Entitlements:
                    </p>
                    <ul className="space-y-2.5">
                      {plan.entitlements.map((ent) => {
                        const label = FEATURE_LABELS[ent.featureKey] || ent.featureKey;
                        const limitSuffix =
                          ent.enabled && ent.usageLimit
                            ? ` (${ent.usageLimit} ${ent.usagePeriod?.toLowerCase() || ""})`
                            : "";

                        return (
                          <li
                            key={ent.featureKey}
                            className="flex items-start gap-2.5 text-xs text-foreground"
                          >
                            <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span className="leading-snug">
                              {label}
                              {limitSuffix}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </CardContent>

                  <CardFooter className="p-6 pt-0 mt-auto">
                    <Button
                      variant={plan.highlight ? "default" : "outline"}
                      className="w-full justify-center"
                      asChild
                    >
                      <Link href={isFree ? "/register" : "/subscription"}>
                        {isFree ? "Start Free Practice" : "Upgrade to Pro"}
                        <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </Container>
      </div>
    </PublicLayout>
  );
}
