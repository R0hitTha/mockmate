"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
  CreditCard,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  Zap,
  ArrowRight,
  Sparkles,
  Award,
  Layers,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/layout/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/lib/toast";
import type { StoredSubscriptionPlan, StoredStudentSubscription } from "@/lib/entitlement-service";

interface SubscriptionClientViewProps {
  currentSubscription: StoredStudentSubscription;
  availablePlans: StoredSubscriptionPlan[];
  studentName: string;
}

export function SubscriptionClientView({
  currentSubscription,
  availablePlans,
  studentName,
}: SubscriptionClientViewProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] = useState<StoredSubscriptionPlan | null>(null);
  const [orderModalOpen, setOrderModalOpen] = useState(false);

  const handleStartUpgrade = (plan: StoredSubscriptionPlan) => {
    setSelectedPlanForUpgrade(plan);
    setOrderModalOpen(true);
  };

  const handleSimulateOrder = () => {
    startTransition(async () => {
      // Simulate sandbox order initialization
      await new Promise((r) => setTimeout(r, 800));
      toast.info(
        `[PREPARATION MODE] Order for ${selectedPlanForUpgrade?.name} initiated (₹${selectedPlanForUpgrade?.priceAmount}). Live payment gateway credentials are not yet configured.`,
        { duration: 5000 }
      );
      setOrderModalOpen(false);
    });
  };

  const isFreePlan = currentSubscription.planCode === "FREE";

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-primary" />
            My Subscription & Entitlements
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review your active CUET test series entitlements, expiry dates, and upgrade options.
          </p>
        </div>

        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard">
            Back to Dashboard
          </Link>
        </Button>
      </div>

      {/* Active Subscription Status Card */}
      <Card className="border-border shadow-xs overflow-hidden">
        <div className="bg-primary/5 p-6 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                  Current Active Plan
                </span>
                <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Active Status
                </Badge>
              </div>
              <h2 className="text-2xl font-bold text-foreground mt-1">
                {currentSubscription.planName}
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Account: {studentName} &bull; Code: {currentSubscription.planCode}
              </p>
            </div>

            <div className="text-left sm:text-right">
              <div className="text-xs text-muted-foreground">Access Validity</div>
              <div className="text-sm font-semibold text-foreground mt-0.5 flex items-center sm:justify-end gap-1.5">
                <Calendar className="w-4 h-4 text-primary shrink-0" />
                <span>
                  {currentSubscription.expiresAt
                    ? `Expires ${new Date(currentSubscription.expiresAt).toLocaleDateString()}`
                    : "Continuous Free Access"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <CardContent className="p-6">
          <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">
            Active Feature Entitlements
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg border border-border bg-muted/20 text-xs">
              <div className="flex items-center gap-2 font-medium text-foreground">
                <Zap className="w-4 h-4 text-primary" />
                <span>CUET Full Mocks</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                {isFreePlan ? "1 Baseline Diagnostic Mock" : "Unlimited Official CBT Mocks"}
              </p>
            </div>

            <div className="p-3 rounded-lg border border-border bg-muted/20 text-xs">
              <div className="flex items-center gap-2 font-medium text-foreground">
                <Award className="w-4 h-4 text-emerald-500" />
                <span>Speed & Scorecards</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Instant +5 / -1 Marking & 60s Pacing Analysis
              </p>
            </div>

            <div className="p-3 rounded-lg border border-border bg-muted/20 text-xs">
              <div className="flex items-center gap-2 font-medium text-foreground">
                <Layers className="w-4 h-4 text-blue-500" />
                <span>Mistake Intelligence</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Weakness Tagging & Review Workflows
              </p>
            </div>

            <div className="p-3 rounded-lg border border-border bg-muted/20 text-xs">
              <div className="flex items-center gap-2 font-medium text-foreground">
                <Calendar className="w-4 h-4 text-purple-500" />
                <span>Study Planner</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Automated Daily Syllabus Task Generation
              </p>
            </div>

            <div className="p-3 rounded-lg border border-border bg-muted/20 text-xs">
              <div className="flex items-center gap-2 font-medium text-foreground">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>AI Study Assistant</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                {isFreePlan ? "5 queries per day" : "20 queries per day included"}
              </p>
            </div>

            <div className="p-3 rounded-lg border border-border bg-muted/20 text-xs">
              <div className="flex items-center gap-2 font-medium text-foreground">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Exam Guarantee</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Official NTA CUET UG 2026/2027 Pattern
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Options (if on Free or wanting longer pass) */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Upgrade Preparation Pass
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Unlock the complete CUET mock test library and comprehensive doubt clearing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {availablePlans
            .filter((p) => p.code !== currentSubscription.planCode && p.isPublic && p.isActive)
            .map((plan) => (
              <Card
                key={plan.id}
                className={`border-border flex flex-col justify-between shadow-xs ${
                  plan.highlight ? "border-primary/50 ring-1 ring-primary/20" : ""
                }`}
              >
                <CardHeader className="p-6 pb-4">
                  <div className="flex items-center justify-between">
                    <Badge variant={plan.highlight ? "default" : "secondary"}>
                      {plan.badge || "Featured"}
                    </Badge>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {plan.code}
                    </span>
                  </div>

                  <CardTitle className="text-lg font-bold text-foreground mt-3">
                    {plan.name}
                  </CardTitle>

                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-2xl font-black text-foreground">
                      ₹{plan.priceAmount.toLocaleString()}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      / {plan.billingInterval.toLowerCase().replace(/_/g, " ")}
                    </span>
                  </div>

                  {plan.description && (
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                      {plan.description}
                    </p>
                  )}
                </CardHeader>

                <CardContent className="px-6 py-4 border-t border-border flex-1">
                  <ul className="space-y-2 text-xs">
                    {plan.entitlements.map((ent) => (
                      <li key={ent.featureKey} className="flex items-center gap-2 text-foreground">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>
                          {ent.featureKey.replace(/_/g, " ")}
                          {ent.usageLimit ? ` (${ent.usageLimit} ${ent.usagePeriod?.toLowerCase()})` : " (Unlimited)"}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="p-6 pt-3 border-t border-border">
                  <Button
                    className="w-full text-xs"
                    onClick={() => handleStartUpgrade(plan)}
                  >
                    Select Plan
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
        </div>
      </div>

      {/* Preparation Mode Dialog */}
      <Dialog open={orderModalOpen} onOpenChange={setOrderModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              Payment Gateway Preparation Mode
            </DialogTitle>
            <DialogDescription className="text-xs">
              Order simulation for {selectedPlanForUpgrade?.name} (₹{selectedPlanForUpgrade?.priceAmount}).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300">
              <p className="leading-relaxed">
                MockMate is currently operating in <strong>Preparation Mode</strong>.
                No real payment gateway (Razorpay/Stripe) credentials have been enabled in this environment.
              </p>
            </div>

            <div className="space-y-1.5 text-muted-foreground">
              <div className="flex justify-between">
                <span>Selected Plan:</span>
                <strong className="text-foreground">{selectedPlanForUpgrade?.name}</strong>
              </div>
              <div className="flex justify-between">
                <span>Total Amount:</span>
                <strong className="text-foreground">₹{selectedPlanForUpgrade?.priceAmount}</strong>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <Badge variant="outline" className="text-[10px]">SANDBOX_ORDER_PREVIEW</Badge>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" size="sm" onClick={() => setOrderModalOpen(false)}>
              Close
            </Button>
            <Button size="sm" onClick={handleSimulateOrder} disabled={isPending}>
              Simulate Sandbox Checkout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
