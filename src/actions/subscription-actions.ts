"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "@/lib/auth-server";
import {
  savePlanSchema,
  assignSubscriptionSchema,
  type SavePlanInput,
  type AssignSubscriptionInput,
  type FeatureKey,
} from "@/lib/validations/subscription";
import {
  isSuperAdmin,
  canManageFinance,
} from "@/lib/admin-service";
import {
  getSubscriptionPlans,
  saveSubscriptionPlan,
  getStudentActiveSubscription,
  assignStudentSubscription,
  checkStudentFeatureAccess,
} from "@/lib/entitlement-service";
import { activePaymentProvider } from "@/lib/payment-provider";

export async function getSubscriptionPlansAction(includeInactive = false) {
  try {
    const plans = await getSubscriptionPlans(includeInactive);
    return { success: true, data: plans };
  } catch (err: unknown) {
    return {
      success: false,
      error: (err as Error).message || "Failed to load subscription plans.",
    };
  }
}

export async function saveSubscriptionPlanAction(input: SavePlanInput) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required." };
    }
    const role = (session.user as { role?: string }).role;
    if (!isSuperAdmin(role) && !canManageFinance(role)) {
      return { success: false, error: "Access denied: Finance or Super Admin required." };
    }

    const validated = savePlanSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Invalid subscription plan data.",
      };
    }

    const plan = await saveSubscriptionPlan(session.user.id, validated.data);

    revalidatePath("/admin/plans");
    revalidatePath("/pricing");
    revalidatePath("/subscription");

    return { success: true, data: plan };
  } catch (err: unknown) {
    return {
      success: false,
      error: (err as Error).message || "Failed to save subscription plan.",
    };
  }
}

export async function getStudentActiveSubscriptionAction() {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required." };
    }

    const sub = await getStudentActiveSubscription(session.user.id);
    return { success: true, data: sub };
  } catch (err: unknown) {
    return {
      success: false,
      error: (err as Error).message || "Failed to load subscription status.",
    };
  }
}

export async function assignStudentSubscriptionAction(input: AssignSubscriptionInput) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required." };
    }
    const role = (session.user as { role?: string }).role;
    if (!isSuperAdmin(role) && !canManageFinance(role)) {
      return { success: false, error: "Access denied: Finance or Super Admin required." };
    }

    const validated = assignSubscriptionSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Invalid subscription assignment data.",
      };
    }

    const sub = await assignStudentSubscription(session.user.id, validated.data);

    revalidatePath("/admin/students");
    revalidatePath(`/admin/students/${validated.data.studentId}`);
    revalidatePath("/admin/audit-logs");

    return { success: true, data: sub };
  } catch (err: unknown) {
    return {
      success: false,
      error: (err as Error).message || "Failed to assign student subscription.",
    };
  }
}

export async function checkFeatureAccessAction(featureKey: FeatureKey) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return {
        success: true,
        data: {
          allowed: false,
          planName: "Unauthenticated",
          reason: "Sign in required to access this feature.",
        },
      };
    }

    const access = await checkStudentFeatureAccess(session.user.id, featureKey);
    return { success: true, data: access };
  } catch (err: unknown) {
    return {
      success: false,
      error: (err as Error).message || "Failed to verify feature access.",
    };
  }
}

export async function createSubscriptionOrderAction(planId: string) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required to subscribe." };
    }

    const plans = await getSubscriptionPlans();
    const plan = plans.find((p) => p.id === planId || p.code === planId);
    if (!plan) {
      return { success: false, error: "Selected subscription plan not found." };
    }

    const order = await activePaymentProvider.createOrder({
      studentId: session.user.id,
      planId: plan.id,
      amount: plan.priceAmount,
      currency: plan.currency,
    });

    return { success: true, data: order };
  } catch (err: unknown) {
    return {
      success: false,
      error: (err as Error).message || "Failed to create subscription order.",
    };
  }
}

