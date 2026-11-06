import { prisma } from "@/lib/prisma";
import {
  type FeatureKey,
  type BillingInterval,
  type SavePlanInput,
  type AssignSubscriptionInput,
} from "./validations/subscription";
import { createAuditLog } from "./admin-service";

export interface StoredSubscriptionPlan {
  id: string;
  name: string;
  code: string;
  description: string | null;
  priceAmount: number;
  currency: string;
  billingInterval: BillingInterval;
  isActive: boolean;
  isPublic: boolean;
  sortOrder: number;
  badge: string | null;
  highlight: boolean;
  entitlements: {
    featureKey: string;
    enabled: boolean;
    usageLimit: number | null;
    usagePeriod: string | null;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface StoredStudentSubscription {
  id: string;
  studentId: string;
  planId: string;
  planCode: string;
  planName: string;
  status: "ACTIVE" | "EXPIRED" | "CANCELLED" | "PENDING_PAYMENT";
  startsAt: string;
  expiresAt: string | null;
  autoRenew: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

// =============================================================================
// DEFAULT SEED PLANS
// =============================================================================

export const DEFAULT_PLANS: StoredSubscriptionPlan[] = [
  {
    id: "plan-free",
    name: "Free Diagnostic",
    code: "FREE",
    description: "Experience the authentic NTA CBT simulator and get a baseline diagnostic score.",
    priceAmount: 0,
    currency: "INR",
    billingInterval: "FREE",
    isActive: true,
    isPublic: true,
    sortOrder: 1,
    badge: "Get Started",
    highlight: false,
    entitlements: [
      { featureKey: "FULL_MOCK_TESTS", enabled: true, usageLimit: 1, usagePeriod: "TOTAL" },
      { featureKey: "TOPIC_PRACTICE", enabled: true, usageLimit: 50, usagePeriod: "TOTAL" },
      { featureKey: "ADVANCED_ANALYTICS", enabled: true, usageLimit: null, usagePeriod: null },
      { featureKey: "MISTAKE_INTELLIGENCE", enabled: true, usageLimit: null, usagePeriod: null },
      { featureKey: "STUDY_PLANNER", enabled: true, usageLimit: null, usagePeriod: null },
      { featureKey: "AI_ASSISTANT", enabled: true, usageLimit: 5, usagePeriod: "DAILY" },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "plan-pro-season",
    name: "Pro Aspirant Pass",
    code: "PRO_SEASON",
    description: "Full preparation coverage with extensive mock library, deep solutions, and weakness tracking.",
    priceAmount: 1999,
    currency: "INR",
    billingInterval: "EXAM_SEASON",
    isActive: true,
    isPublic: true,
    sortOrder: 2,
    badge: "Most Comprehensive",
    highlight: true,
    entitlements: [
      { featureKey: "FULL_MOCK_TESTS", enabled: true, usageLimit: null, usagePeriod: null },
      { featureKey: "TOPIC_PRACTICE", enabled: true, usageLimit: null, usagePeriod: null },
      { featureKey: "ADVANCED_ANALYTICS", enabled: true, usageLimit: null, usagePeriod: null },
      { featureKey: "MISTAKE_INTELLIGENCE", enabled: true, usageLimit: null, usagePeriod: null },
      { featureKey: "STUDY_PLANNER", enabled: true, usageLimit: null, usagePeriod: null },
      { featureKey: "AI_ASSISTANT", enabled: true, usageLimit: 20, usagePeriod: "DAILY" },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "plan-subject-pack",
    name: "Subject Test Pack",
    code: "SUBJECT_PACK",
    description: "Specialized practice for individual high-stake domain subjects like Math or Economics.",
    priceAmount: 799,
    currency: "INR",
    billingInterval: "ONE_TIME",
    isActive: true,
    isPublic: true,
    sortOrder: 3,
    badge: "Targeted Mastery",
    highlight: false,
    entitlements: [
      { featureKey: "FULL_MOCK_TESTS", enabled: true, usageLimit: 15, usagePeriod: "TOTAL" },
      { featureKey: "TOPIC_PRACTICE", enabled: true, usageLimit: null, usagePeriod: null },
      { featureKey: "ADVANCED_ANALYTICS", enabled: true, usageLimit: null, usagePeriod: null },
      { featureKey: "MISTAKE_INTELLIGENCE", enabled: true, usageLimit: null, usagePeriod: null },
      { featureKey: "STUDY_PLANNER", enabled: true, usageLimit: null, usagePeriod: null },
      { featureKey: "AI_ASSISTANT", enabled: true, usageLimit: 10, usagePeriod: "DAILY" },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// =============================================================================
// IN-MEMORY RESILIENT STORE FOR SUBSCRIPTIONS (TEST/OFFLINE COMPAT)
// =============================================================================

class SubscriptionMemoryStore {
  private plans = new Map<string, StoredSubscriptionPlan>();
  private subscriptions = new Map<string, StoredStudentSubscription[]>(); // studentId -> subscriptions

  constructor() {
    this.reset();
  }

  reset() {
    this.plans.clear();
    this.subscriptions.clear();
    for (const p of DEFAULT_PLANS) {
      this.plans.set(p.code, { ...p });
    }
  }

  // Plans
  getPlanByCode(code: string): StoredSubscriptionPlan | null {
    return this.plans.get(code) || null;
  }

  getPlanById(id: string): StoredSubscriptionPlan | null {
    return Array.from(this.plans.values()).find((p) => p.id === id) || null;
  }

  listPlans(): StoredSubscriptionPlan[] {
    return Array.from(this.plans.values()).sort((a, b) => a.sortOrder - b.sortOrder);
  }

  savePlan(plan: StoredSubscriptionPlan) {
    this.plans.set(plan.code, plan);
  }

  // Subscriptions
  getStudentSubscriptions(studentId: string): StoredStudentSubscription[] {
    return this.subscriptions.get(studentId) || [];
  }

  addStudentSubscription(sub: StoredStudentSubscription) {
    const list = this.subscriptions.get(sub.studentId) || [];
    this.subscriptions.set(sub.studentId, [sub, ...list]);
  }
}

export const subscriptionMemoryStore = new SubscriptionMemoryStore();

// =============================================================================
// PLAN MANAGEMENT
// =============================================================================

export async function getSubscriptionPlans(includeInactive = false): Promise<StoredSubscriptionPlan[]> {
  try {
    const dbPlans = await prisma.subscriptionPlan.findMany({
      where: includeInactive ? {} : { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: { entitlements: true },
    });

    if (dbPlans.length > 0) {
      return dbPlans.map((p) => ({
        id: p.id,
        name: p.name,
        code: p.code,
        description: p.description,
        priceAmount: p.priceAmount,
        currency: p.currency,
        billingInterval: p.billingInterval as BillingInterval,
        isActive: p.isActive,
        isPublic: p.isPublic,
        sortOrder: p.sortOrder,
        badge: p.badge,
        highlight: p.highlight,
        entitlements: p.entitlements.map((e) => ({
          featureKey: e.featureKey,
          enabled: e.enabled,
          usageLimit: e.usageLimit,
          usagePeriod: e.usagePeriod,
        })),
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      }));
    }
  } catch {
    // DB fallback
  }

  const all = subscriptionMemoryStore.listPlans();
  return includeInactive ? all : all.filter((p) => p.isActive);
}

export async function saveSubscriptionPlan(
  actorUserId: string,
  input: SavePlanInput
): Promise<StoredSubscriptionPlan> {
  const now = new Date();
  const planId = input.id || `plan-${input.code.toLowerCase().replace(/_/g, "-")}`;

  const planRecord: StoredSubscriptionPlan = {
    id: planId,
    name: input.name,
    code: input.code,
    description: input.description || null,
    priceAmount: input.priceAmount,
    currency: input.currency || "INR",
    billingInterval: input.billingInterval,
    isActive: input.isActive,
    isPublic: input.isPublic,
    sortOrder: input.sortOrder,
    badge: input.badge || null,
    highlight: input.highlight,
    entitlements: input.entitlements.map((e) => ({
      featureKey: e.featureKey,
      enabled: e.enabled,
      usageLimit: e.usageLimit || null,
      usagePeriod: e.usagePeriod || null,
    })),
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  subscriptionMemoryStore.savePlan(planRecord);

  try {
    await prisma.subscriptionPlan.upsert({
      where: { code: input.code },
      create: {
        id: planId,
        name: input.name,
        code: input.code,
        description: input.description,
        priceAmount: input.priceAmount,
        currency: input.currency || "INR",
        billingInterval: input.billingInterval,
        isActive: input.isActive,
        isPublic: input.isPublic,
        sortOrder: input.sortOrder,
        badge: input.badge,
        highlight: input.highlight,
      },
      update: {
        name: input.name,
        description: input.description,
        priceAmount: input.priceAmount,
        billingInterval: input.billingInterval,
        isActive: input.isActive,
        isPublic: input.isPublic,
        sortOrder: input.sortOrder,
        badge: input.badge,
        highlight: input.highlight,
      },
    });

    // Update entitlements
    if (input.entitlements.length > 0) {
      await prisma.planEntitlement.deleteMany({ where: { planId } });
      for (const ent of input.entitlements) {
        await prisma.planEntitlement.create({
          data: {
            planId,
            featureKey: ent.featureKey,
            enabled: ent.enabled,
            usageLimit: ent.usageLimit,
            usagePeriod: ent.usagePeriod,
          },
        });
      }
    }
  } catch {
    // DB fallback
  }

  await createAuditLog(
    actorUserId,
    input.id ? "PLAN_UPDATE" : "PLAN_CREATE",
    "SUBSCRIPTION_PLAN",
    planId,
    `${input.id ? "Updated" : "Created"} subscription plan ${input.name} (${input.code})`,
    { code: input.code, price: input.priceAmount }
  );

  return planRecord;
}

// =============================================================================
// STUDENT SUBSCRIPTIONS & ENTITLEMENT GATING
// =============================================================================

export async function getStudentActiveSubscription(
  studentId: string
): Promise<StoredStudentSubscription> {
  try {
    const dbSub = await prisma.studentSubscription.findFirst({
      where: {
        studentId,
        status: "ACTIVE",
      },
      include: { plan: true },
      orderBy: { startsAt: "desc" },
    });

    if (dbSub && (!dbSub.expiresAt || new Date(dbSub.expiresAt) > new Date())) {
      return {
        id: dbSub.id,
        studentId: dbSub.studentId,
        planId: dbSub.planId,
        planCode: dbSub.plan.code,
        planName: dbSub.plan.name,
        status: "ACTIVE",
        startsAt: dbSub.startsAt.toISOString(),
        expiresAt: dbSub.expiresAt ? dbSub.expiresAt.toISOString() : null,
        autoRenew: dbSub.autoRenew,
        notes: dbSub.notes,
        createdAt: dbSub.createdAt.toISOString(),
        updatedAt: dbSub.updatedAt.toISOString(),
      };
    }
  } catch {
    // DB fallback
  }

  const memSubs = subscriptionMemoryStore.getStudentSubscriptions(studentId);
  const activeMem = memSubs.find(
    (s) => s.status === "ACTIVE" && (!s.expiresAt || new Date(s.expiresAt) > new Date())
  );
  if (activeMem) return activeMem;

  // Default to Free Plan
  const freePlan = subscriptionMemoryStore.getPlanByCode("FREE") || DEFAULT_PLANS[0];
  return {
    id: `sub-free-${studentId}`,
    studentId,
    planId: freePlan.id,
    planCode: freePlan.code,
    planName: freePlan.name,
    status: "ACTIVE",
    startsAt: new Date().toISOString(),
    expiresAt: null, // Lifetime free
    autoRenew: false,
    notes: "Default free student tier",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function assignStudentSubscription(
  actorUserId: string,
  input: AssignSubscriptionInput
): Promise<StoredStudentSubscription> {
  const plan =
    subscriptionMemoryStore.getPlanById(input.planId) ||
    subscriptionMemoryStore.getPlanByCode(input.planId) ||
    DEFAULT_PLANS[1];

  const now = new Date();
  const expiresAt = new Date();
  expiresAt.setDate(now.getDate() + input.durationDays);

  const subId = `sub-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const subRecord: StoredStudentSubscription = {
    id: subId,
    studentId: input.studentId,
    planId: plan.id,
    planCode: plan.code,
    planName: plan.name,
    status: "ACTIVE",
    startsAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    autoRenew: false,
    notes: input.notes || "Granted by Administrator",
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  subscriptionMemoryStore.addStudentSubscription(subRecord);

  try {
    await prisma.studentSubscription.create({
      data: {
        id: subId,
        studentId: input.studentId,
        planId: plan.id,
        status: "ACTIVE",
        startsAt: now,
        expiresAt,
        notes: subRecord.notes,
      },
    });
  } catch {
    // DB fallback
  }

  await createAuditLog(
    actorUserId,
    "SUBSCRIPTION_ASSIGN",
    "USER",
    input.studentId,
    `Assigned ${plan.name} to student for ${input.durationDays} days`,
    { planCode: plan.code, expiresAt: expiresAt.toISOString() }
  );

  return subRecord;
}

export async function checkStudentFeatureAccess(
  studentId: string,
  featureKey: FeatureKey
): Promise<{
  allowed: boolean;
  planName: string;
  reason?: string;
  limit?: number | null;
  period?: string | null;
}> {
  const activeSub = await getStudentActiveSubscription(studentId);
  const plan =
    subscriptionMemoryStore.getPlanByCode(activeSub.planCode) ||
    subscriptionMemoryStore.getPlanById(activeSub.planId) ||
    DEFAULT_PLANS[0];

  const entitlement = plan.entitlements.find((e) => e.featureKey === featureKey);

  if (!entitlement || !entitlement.enabled) {
    return {
      allowed: false,
      planName: plan.name,
      reason: `Feature '${featureKey}' is not included in the ${plan.name} plan.`,
    };
  }

  return {
    allowed: true,
    planName: plan.name,
    limit: entitlement.usageLimit,
    period: entitlement.usagePeriod,
  };
}

