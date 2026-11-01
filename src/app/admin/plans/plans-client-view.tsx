"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  Plus,
  Edit2,
  CheckCircle2,
  XCircle,
  Sparkles,
  ShieldCheck,
  Zap,
  BookOpen,
  Brain,
  Calendar,
  Bot,
  Eye,
  EyeOff,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/layout/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/lib/toast";
import type { StoredSubscriptionPlan } from "@/lib/entitlement-service";
import type { FeatureKey, BillingInterval } from "@/lib/validations/subscription";
import { saveSubscriptionPlanAction } from "@/actions/subscription-actions";

interface PlansClientViewProps {
  initialPlans: StoredSubscriptionPlan[];
}

const ALL_FEATURES: { key: FeatureKey; label: string; icon: React.ElementType }[] = [
  { key: "FULL_MOCK_TESTS", label: "Full-Length CUET Mock Tests", icon: Zap },
  { key: "TOPIC_PRACTICE", label: "Topic Practice & Quizzes", icon: BookOpen },
  { key: "ADVANCED_ANALYTICS", label: "Advanced Performance Analytics", icon: Brain },
  { key: "MISTAKE_INTELLIGENCE", label: "Mistake Intelligence & Weakness Engine", icon: ShieldCheck },
  { key: "STUDY_PLANNER", label: "Personalized Study Planner", icon: Calendar },
  { key: "AI_ASSISTANT", label: "AI Study Assistant & Doubts", icon: Bot },
];

export function PlansClientView({ initialPlans }: PlansClientViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<StoredSubscriptionPlan | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formPrice, setFormPrice] = useState(0);
  const [formInterval, setFormInterval] = useState<BillingInterval>("EXAM_SEASON");
  const [formIsActive, setFormIsActive] = useState(true);
  const [formIsPublic, setFormIsPublic] = useState(true);
  const [formBadge, setFormBadge] = useState("");
  const [formHighlight, setFormHighlight] = useState(false);
  const [formSortOrder, setFormSortOrder] = useState(1);

  // Entitlements form state
  const [formEntitlements, setFormEntitlements] = useState<
    {
      featureKey: FeatureKey;
      enabled: boolean;
      usageLimit: number | null;
      usagePeriod: "DAILY" | "MONTHLY" | "TOTAL" | null;
    }[]
  >([]);

  const openCreateDialog = () => {
    setEditingPlan(null);
    setFormName("");
    setFormCode("");
    setFormDescription("");
    setFormPrice(999);
    setFormInterval("EXAM_SEASON");
    setFormIsActive(true);
    setFormIsPublic(true);
    setFormBadge("");
    setFormHighlight(false);
    setFormSortOrder(initialPlans.length + 1);

    setFormEntitlements(
      ALL_FEATURES.map((f) => ({
        featureKey: f.key,
        enabled: true,
        usageLimit: f.key === "AI_ASSISTANT" ? 20 : null,
        usagePeriod: f.key === "AI_ASSISTANT" ? "DAILY" : null,
      }))
    );
    setDialogOpen(true);
  };

  const openEditDialog = (plan: StoredSubscriptionPlan) => {
    setEditingPlan(plan);
    setFormName(plan.name);
    setFormCode(plan.code);
    setFormDescription(plan.description || "");
    setFormPrice(plan.priceAmount);
    setFormInterval(plan.billingInterval);
    setFormIsActive(plan.isActive);
    setFormIsPublic(plan.isPublic);
    setFormBadge(plan.badge || "");
    setFormHighlight(plan.highlight);
    setFormSortOrder(plan.sortOrder);

    // Map entitlements
    const mapped = ALL_FEATURES.map((feat) => {
      const existing = plan.entitlements.find((e) => e.featureKey === feat.key);
      return {
        featureKey: feat.key,
        enabled: existing ? existing.enabled : true,
        usageLimit: existing?.usageLimit ?? null,
        usagePeriod: (existing?.usagePeriod as "DAILY" | "MONTHLY" | "TOTAL") ?? null,
      };
    });
    setFormEntitlements(mapped);
    setDialogOpen(true);
  };

  const handleToggleEntitlement = (key: FeatureKey, enabled: boolean) => {
    setFormEntitlements((prev) =>
      prev.map((e) => (e.featureKey === key ? { ...e, enabled } : e))
    );
  };

  const handleLimitChange = (key: FeatureKey, limit: string) => {
    const val = limit.trim() === "" ? null : parseInt(limit, 10);
    setFormEntitlements((prev) =>
      prev.map((e) =>
        e.featureKey === key
          ? { ...e, usageLimit: isNaN(val as number) ? null : val }
          : e
      )
    );
  };

  const handlePeriodChange = (key: FeatureKey, period: "DAILY" | "MONTHLY" | "TOTAL" | "") => {
    setFormEntitlements((prev) =>
      prev.map((e) =>
        e.featureKey === key
          ? { ...e, usagePeriod: period === "" ? null : period }
          : e
      )
    );
  };

  const handleSavePlan = () => {
    if (!formName.trim() || !formCode.trim()) {
      toast.error("Plan name and unique code are required.");
      return;
    }

    startTransition(async () => {
      const res = await saveSubscriptionPlanAction({
        id: editingPlan?.id,
        name: formName.trim(),
        code: formCode.trim().toUpperCase(),
        description: formDescription.trim() || undefined,
        priceAmount: Number(formPrice),
        currency: "INR",
        billingInterval: formInterval,
        isActive: formIsActive,
        isPublic: formIsPublic,
        sortOrder: Number(formSortOrder),
        badge: formBadge.trim() || undefined,
        highlight: formHighlight,
        entitlements: formEntitlements,
      });

      if (res.success) {
        toast.success(`Plan ${formName} saved successfully.`);
        setDialogOpen(false);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to save plan.");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-primary" />
            Subscription & Test Pack Plans
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure CUET mock test tiers, pricing, feature entitlement limits, and catalog visibility.
          </p>
        </div>
        <Button onClick={openCreateDialog} size="sm" className="gap-1.5">
          <Plus className="w-4 h-4" />
          Create New Plan
        </Button>
      </div>

      {/* Grid of Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {initialPlans.map((plan) => (
          <Card
            key={plan.id}
            className={`border-border flex flex-col justify-between relative shadow-xs transition-all ${
              plan.highlight ? "border-primary/50 ring-1 ring-primary/20" : ""
            }`}
          >
            {plan.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5">
                  <Sparkles className="w-3 h-3 mr-1" />
                  RECOMMENDED
                </Badge>
              </div>
            )}

            <CardHeader className="p-6 pb-4">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-[10px] font-mono">
                  {plan.code}
                </Badge>
                <div className="flex items-center gap-1.5">
                  {plan.isPublic ? (
                    <Badge variant="secondary" className="text-[10px] gap-1">
                      <Eye className="w-3 h-3 text-emerald-500" />
                      Public
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] text-muted-foreground gap-1">
                      <EyeOff className="w-3 h-3" />
                      Hidden
                    </Badge>
                  )}
                  {plan.isActive ? (
                    <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="text-[10px]">
                      Disabled
                    </Badge>
                  )}
                </div>
              </div>

              <CardTitle className="text-lg font-bold text-foreground mt-3 flex items-center justify-between">
                <span>{plan.name}</span>
                {plan.badge && (
                  <span className="text-[11px] font-normal text-muted-foreground">
                    ({plan.badge})
                  </span>
                )}
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
              <span className="text-[11px] font-semibold text-foreground uppercase tracking-wider">
                Plan Entitlements
              </span>
              <ul className="mt-3 space-y-2 text-xs">
                {plan.entitlements.map((ent) => {
                  const match = ALL_FEATURES.find((f) => f.key === ent.featureKey);
                  return (
                    <li
                      key={ent.featureKey}
                      className="flex items-center justify-between text-muted-foreground"
                    >
                      <span className="flex items-center gap-1.5">
                        {ent.enabled ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
                        )}
                        <span className={ent.enabled ? "text-foreground" : "line-through opacity-60"}>
                          {match?.label || ent.featureKey}
                        </span>
                      </span>

                      {ent.enabled && ent.usageLimit && (
                        <span className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded text-foreground">
                          {ent.usageLimit} {ent.usagePeriod?.toLowerCase()}
                        </span>
                      )}
                      {ent.enabled && !ent.usageLimit && (
                        <span className="text-[10px] text-emerald-600 font-medium">Unlimited</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </CardContent>

            <CardFooter className="p-6 pt-3 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() => openEditDialog(plan)}
              >
                <Edit2 className="w-3.5 h-3.5 mr-1.5" />
                Configure Tier
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Edit / Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              {editingPlan ? `Edit Plan: ${editingPlan.name}` : "Create Subscription Plan"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Configure commercial pricing, catalog visibility and granular feature entitlements.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            {/* Row 1: Name and Code */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-foreground">Plan Name *</label>
                <Input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="E.g., Pro Aspirant Pass"
                  className="h-8 text-xs mt-1"
                />
              </div>
              <div>
                <label className="font-semibold text-foreground">Plan Code (Unique ID) *</label>
                <Input
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                  placeholder="E.g., PRO_SEASON"
                  disabled={Boolean(editingPlan)}
                  className="h-8 text-xs mt-1 font-mono uppercase"
                />
              </div>
            </div>

            {/* Row 2: Price and Interval */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-foreground">Price (₹ INR) *</label>
                <Input
                  type="number"
                  value={formPrice}
                  onChange={(e) => setFormPrice(Number(e.target.value))}
                  className="h-8 text-xs mt-1"
                />
              </div>
              <div>
                <label className="font-semibold text-foreground">Billing Interval *</label>
                <select
                  value={formInterval}
                  onChange={(e) => setFormInterval(e.target.value as BillingInterval)}
                  className="w-full h-8 px-2 text-xs rounded-md border border-input bg-background text-foreground mt-1"
                >
                  <option value="FREE">Free Tier</option>
                  <option value="ONE_TIME">One Time</option>
                  <option value="MONTHLY">Monthly</option>
                  <option value="EXAM_SEASON">Exam Season (CUET)</option>
                  <option value="YEARLY">Yearly</option>
                </select>
              </div>
            </div>

            {/* Row 3: Description */}
            <div>
              <label className="font-semibold text-foreground">Description</label>
              <Textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Highlight key value proposition for students..."
                className="text-xs min-h-[60px] mt-1"
              />
            </div>

            {/* Row 4: Badge & Toggles */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-foreground">Badge Text</label>
                <Input
                  value={formBadge}
                  onChange={(e) => setFormBadge(e.target.value)}
                  placeholder="E.g. Most Comprehensive"
                  className="h-8 text-xs mt-1"
                />
              </div>

              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="chk-highlight"
                  checked={formHighlight}
                  onChange={(e) => setFormHighlight(e.target.checked)}
                  className="rounded border-input text-primary"
                />
                <label htmlFor="chk-highlight" className="font-medium text-foreground cursor-pointer">
                  Highlight as Popular
                </label>
              </div>

              <div className="flex items-center gap-4 pt-6">
                <div className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    id="chk-active"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="rounded border-input text-primary"
                  />
                  <label htmlFor="chk-active" className="font-medium text-foreground cursor-pointer">
                    Active
                  </label>
                </div>

                <div className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    id="chk-public"
                    checked={formIsPublic}
                    onChange={(e) => setFormIsPublic(e.target.checked)}
                    className="rounded border-input text-primary"
                  />
                  <label htmlFor="chk-public" className="font-medium text-foreground cursor-pointer">
                    Public
                  </label>
                </div>
              </div>
            </div>

            {/* Entitlements Table */}
            <div className="pt-2">
              <span className="font-semibold text-foreground">Feature Entitlements</span>
              <div className="mt-2 border border-border rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/50 border-b border-border text-muted-foreground">
                    <tr>
                      <th className="py-2 px-3">Enabled</th>
                      <th className="py-2 px-3">Feature</th>
                      <th className="py-2 px-3">Limit (Blank = Unlimited)</th>
                      <th className="py-2 px-3">Period</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {formEntitlements.map((ent) => {
                      const feat = ALL_FEATURES.find((f) => f.key === ent.featureKey);
                      return (
                        <tr key={ent.featureKey}>
                          <td className="py-2 px-3">
                            <input
                              type="checkbox"
                              checked={ent.enabled}
                              onChange={(e) =>
                                handleToggleEntitlement(ent.featureKey, e.target.checked)
                              }
                              className="rounded border-input text-primary"
                            />
                          </td>
                          <td className="py-2 px-3 font-medium text-foreground">
                            {feat?.label || ent.featureKey}
                          </td>
                          <td className="py-2 px-3">
                            <Input
                              type="number"
                              disabled={!ent.enabled}
                              value={ent.usageLimit ?? ""}
                              onChange={(e) =>
                                handleLimitChange(ent.featureKey, e.target.value)
                              }
                              placeholder="Unlimited"
                              className="h-7 w-28 text-xs"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <select
                              disabled={!ent.enabled}
                              value={ent.usagePeriod ?? ""}
                              onChange={(e) =>
                                handlePeriodChange(
                                  ent.featureKey,
                                  e.target.value as "DAILY" | "MONTHLY" | "TOTAL" | ""
                                )
                              }
                              className="h-7 px-2 text-xs rounded border border-input bg-background"
                            >
                              <option value="">None / Lifetime</option>
                              <option value="DAILY">Per Day</option>
                              <option value="MONTHLY">Per Month</option>
                              <option value="TOTAL">Total Quota</option>
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" size="sm" onClick={() => setDialogOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSavePlan} disabled={isPending}>
              Save Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
