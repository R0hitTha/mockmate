import { describe, it, expect, beforeEach } from "vitest";
import {
  isSuperAdmin,
  canManageContent,
  canManageSupport,
  canManageFinance,
  checkAdminAccess,
  createAuditLog,
  getAdminAuditLogs,
  suspendStudent,
  reactivateStudent,
  getAdminStudentDetail,
  getPlatformSettings,
  updatePlatformSetting,
  getAITelemetryStats,
  adminMemoryStore,
} from "@/lib/admin-service";
import {
  getSubscriptionPlans,
  saveSubscriptionPlan,
  getStudentActiveSubscription,
  assignStudentSubscription,
  checkStudentFeatureAccess,
  subscriptionMemoryStore,
} from "@/lib/entitlement-service";
import { activePaymentProvider } from "@/lib/payment-provider";

describe("Phase 14: Admin Management & Monetization — Architecture & Business Logic", () => {
  const adminActorId = "super_admin_test_01";
  const studentTargetId = "student_test_aspirant_01";

  beforeEach(() => {
    adminMemoryStore.reset();
    subscriptionMemoryStore.reset();
  });

  describe("1. RBAC & Domain Authorization Matrix", () => {
    it("correctly identifies super admins with backward compatibility for legacy ADMIN", () => {
      expect(isSuperAdmin("SUPER_ADMIN")).toBe(true);
      expect(isSuperAdmin("ADMIN")).toBe(true);
      expect(isSuperAdmin("CONTENT_ADMIN")).toBe(false);
      expect(isSuperAdmin("SUPPORT_ADMIN")).toBe(false);
      expect(isSuperAdmin("FINANCE_ADMIN")).toBe(false);
      expect(isSuperAdmin("STUDENT")).toBe(false);
      expect(isSuperAdmin(null)).toBe(false);
    });

    it("evaluates content domain permissions properly", () => {
      expect(canManageContent("SUPER_ADMIN")).toBe(true);
      expect(canManageContent("ADMIN")).toBe(true);
      expect(canManageContent("CONTENT_ADMIN")).toBe(true);
      expect(canManageContent("SUPPORT_ADMIN")).toBe(false);
      expect(canManageContent("FINANCE_ADMIN")).toBe(false);
      expect(canManageContent("STUDENT")).toBe(false);
    });

    it("evaluates support domain permissions properly", () => {
      expect(canManageSupport("SUPER_ADMIN")).toBe(true);
      expect(canManageSupport("ADMIN")).toBe(true);
      expect(canManageSupport("SUPPORT_ADMIN")).toBe(true);
      expect(canManageSupport("CONTENT_ADMIN")).toBe(false);
      expect(canManageSupport("FINANCE_ADMIN")).toBe(false);
      expect(canManageSupport("STUDENT")).toBe(false);
    });

    it("evaluates finance domain permissions properly", () => {
      expect(canManageFinance("SUPER_ADMIN")).toBe(true);
      expect(canManageFinance("ADMIN")).toBe(true);
      expect(canManageFinance("FINANCE_ADMIN")).toBe(true);
      expect(canManageFinance("SUPPORT_ADMIN")).toBe(false);
      expect(canManageFinance("CONTENT_ADMIN")).toBe(false);
      expect(canManageFinance("STUDENT")).toBe(false);
    });

    it("verifies multi-domain access matrix via checkAdminAccess", () => {
      expect(checkAdminAccess("SUPER_ADMIN", "ALL")).toBe(true);
      expect(checkAdminAccess("ADMIN", "ALL")).toBe(true);
      expect(checkAdminAccess("CONTENT_ADMIN", "CONTENT")).toBe(true);
      expect(checkAdminAccess("CONTENT_ADMIN", "ALL")).toBe(false);
      expect(checkAdminAccess("SUPPORT_ADMIN", "SUPPORT")).toBe(true);
      expect(checkAdminAccess("FINANCE_ADMIN", "FINANCE")).toBe(true);
      expect(checkAdminAccess("STUDENT", "ALL")).toBe(false);
    });
  });

  describe("2. System Audit Trail Logging", () => {
    it("creates, stores and retrieves audit log entries", async () => {
      const log = await createAuditLog(
        adminActorId,
        "TEST_ACTION",
        "MOCK_ENTITY",
        "mock-id-123",
        "Testing audit trail logging system",
        { testKey: "testValue", num: 42 }
      );

      expect(log.id).toBeDefined();
      expect(log.actorUserId).toBe(adminActorId);
      expect(log.action).toBe("TEST_ACTION");
      expect(log.entityType).toBe("MOCK_ENTITY");
      expect(log.summary).toContain("Testing audit trail");
      expect(log.metadata).toContain("testValue");

      const result = await getAdminAuditLogs({ action: "TEST_ACTION" });
      expect(result.total).toBe(1);
      expect(result.logs[0].id).toBe(log.id);
    });

    it("supports filtering audit logs by action and entity type", async () => {
      await createAuditLog(adminActorId, "STUDENT_SUSPEND", "USER", "user-1", "Suspended user 1");
      await createAuditLog(adminActorId, "PLAN_CREATE", "SUBSCRIPTION_PLAN", "plan-1", "Created plan 1");
      await createAuditLog(adminActorId, "SETTING_UPDATE", "PLATFORM_SETTING", "key-1", "Updated setting");

      const userLogs = await getAdminAuditLogs({ entityType: "USER" });
      expect(userLogs.total).toBe(1);
      expect(userLogs.logs[0].action).toBe("STUDENT_SUSPEND");

      const planLogs = await getAdminAuditLogs({ action: "PLAN_CREATE" });
      expect(planLogs.total).toBe(1);
      expect(planLogs.logs[0].entityType).toBe("SUBSCRIPTION_PLAN");
    });
  });

  describe("3. Student Soft Suspension & Reactivation Workflows", () => {
    it("performs soft suspension and records reason without deleting history", async () => {
      const reason = "Suspicious duplicate registration flagged by security";
      const suspended = await suspendStudent(adminActorId, {
        studentId: studentTargetId,
        reason,
      });

      expect(suspended).toBe(true);

      const detail = await getAdminStudentDetail(studentTargetId);
      expect(detail.banned).toBe(true);
      expect(detail.banReason).toBe(reason);

      // Verify audit trail entry was generated
      const auditResult = await getAdminAuditLogs({ action: "STUDENT_SUSPEND" });
      expect(auditResult.total).toBe(1);
      expect(auditResult.logs[0].entityId).toBe(studentTargetId);
      expect(auditResult.logs[0].summary).toContain(reason);
    });

    it("reactivates suspended student account and records audit event", async () => {
      // First suspend
      await suspendStudent(adminActorId, {
        studentId: studentTargetId,
        reason: "Temporary block",
      });

      // Then reactivate
      const reactivated = await reactivateStudent(adminActorId, {
        studentId: studentTargetId,
        notes: "Verified identity via support ticket #9872",
      });

      expect(reactivated).toBe(true);

      const detail = await getAdminStudentDetail(studentTargetId);
      expect(detail.banned).toBe(false);
      expect(detail.banReason).toBeNull();

      const auditResult = await getAdminAuditLogs({ action: "STUDENT_REACTIVATE" });
      expect(auditResult.total).toBe(1);
      expect(auditResult.logs[0].summary).toContain("Reactivated student account");
    });
  });

  describe("4. Subscription Plans & Entitlements Engine", () => {
    it("loads default seed plans (FREE, PRO_SEASON, SUBJECT_PACK)", async () => {
      const plans = await getSubscriptionPlans(true);
      expect(plans.length).toBeGreaterThanOrEqual(3);

      const freePlan = plans.find((p) => p.code === "FREE");
      expect(freePlan).toBeDefined();
      expect(freePlan?.priceAmount).toBe(0);

      const proPlan = plans.find((p) => p.code === "PRO_SEASON");
      expect(proPlan).toBeDefined();
      expect(proPlan?.priceAmount).toBe(1999);
      expect(proPlan?.highlight).toBe(true);
    });

    it("creates and updates subscription plans with customized entitlements", async () => {
      const newPlan = await saveSubscriptionPlan(adminActorId, {
        name: "Weekend Crash Course Mocks",
        code: "CRASH_WEEKEND",
        description: "Intensive 3-day sprint test bundle",
        priceAmount: 499,
        currency: "INR",
        billingInterval: "ONE_TIME",
        isActive: true,
        isPublic: true,
        sortOrder: 4,
        highlight: false,
        entitlements: [
          { featureKey: "FULL_MOCK_TESTS", enabled: true, usageLimit: 3, usagePeriod: "TOTAL" },
          { featureKey: "AI_ASSISTANT", enabled: false, usageLimit: null, usagePeriod: null },
          { featureKey: "MISTAKE_INTELLIGENCE", enabled: true, usageLimit: null, usagePeriod: null },
        ],
      });

      expect(newPlan.id).toBeDefined();
      expect(newPlan.code).toBe("CRASH_WEEKEND");
      expect(newPlan.priceAmount).toBe(499);
      expect(newPlan.entitlements.length).toBe(3);

      // Verify audit log for plan creation
      const auditResult = await getAdminAuditLogs({ action: "PLAN_CREATE" });
      expect(auditResult.total).toBe(1);
    });

    it("defaults unassigned students to the Free Diagnostic tier", async () => {
      const sub = await getStudentActiveSubscription(studentTargetId);
      expect(sub).toBeDefined();
      expect(sub.planCode).toBe("FREE");
      expect(sub.status).toBe("ACTIVE");
      expect(sub.expiresAt).toBeNull(); // Continuous free tier
    });

    it("assigns active subscriptions to students and updates entitlement access", async () => {
      // 1. Initially on Free
      const initialAccess = await checkStudentFeatureAccess(studentTargetId, "FULL_MOCK_TESTS");
      expect(initialAccess.allowed).toBe(true);
      expect(initialAccess.limit).toBe(1); // 1 baseline mock on Free

      // 2. Assign Pro Season Pass
      const assigned = await assignStudentSubscription(adminActorId, {
        studentId: studentTargetId,
        planId: "PRO_SEASON",
        durationDays: 90,
        notes: "Scholarship grant",
      });

      expect(assigned.status).toBe("ACTIVE");
      expect(assigned.planCode).toBe("PRO_SEASON");
      expect(assigned.expiresAt).toBeDefined();

      // 3. Check feature access now
      const proAccess = await checkStudentFeatureAccess(studentTargetId, "FULL_MOCK_TESTS");
      expect(proAccess.allowed).toBe(true);
      expect(proAccess.limit).toBeNull(); // Unlimited on Pro Season
      expect(proAccess.planName).toContain("Pro");

      // Check AI Assistant limits
      const aiAccess = await checkStudentFeatureAccess(studentTargetId, "AI_ASSISTANT");
      expect(aiAccess.allowed).toBe(true);
      expect(aiAccess.limit).toBe(20); // 20 queries daily
      expect(aiAccess.period).toBe("DAILY");
    });
  });

  describe("5. Payment Provider Abstraction (Preparation Mode)", () => {
    it("reports preparation mode active when live credentials are not set", () => {
      expect(activePaymentProvider.getProviderName()).toBe("PREPARATION_MODE");
      expect(activePaymentProvider.isLive()).toBe(false);
    });

    it("creates structured sandbox order payloads without charging real money", async () => {
      const order = await activePaymentProvider.createOrder({
        studentId: studentTargetId,
        planCode: "PRO_SEASON",
        amountInr: 1999,
        currency: "INR",
        notes: { targetExam: "CUET_2026" },
      });

      expect(order.orderId).toMatch(/^prep_ord_/);
      expect(order.amountInr).toBe(1999);
      expect(order.currency).toBe("INR");
      expect(order.status).toBe("CREATED");
      expect(order.provider).toBe("PREPARATION_MODE");
    });

    it("verifies preparation mode payments without external network calls", async () => {
      const verifyRes = await activePaymentProvider.verifyPayment({
        providerOrderId: "prep_ord_12345",
        providerPaymentId: "prep_pay_67890",
        providerSignature: "sandbox_sig_hash",
      });

      expect(verifyRes.verified).toBe(true);
      expect(verifyRes.status).toBe("SUCCESS");
      expect(verifyRes.providerPaymentId).toBe("prep_pay_67890");
    });
  });

  describe("6. Platform Settings & AI Telemetry", () => {
    it("initializes and returns default platform settings", async () => {
      const settings = await getPlatformSettings();
      expect(settings.length).toBeGreaterThanOrEqual(5);

      const examYearSetting = settings.find((s) => s.key === "CURRENT_EXAM_YEAR");
      expect(examYearSetting).toBeDefined();
      expect(examYearSetting?.value).toBe("2026");

      const aiSetting = settings.find((s) => s.key === "AI_ASSISTANT_ENABLED");
      expect(aiSetting).toBeDefined();
      expect(aiSetting?.value).toBe("true");
    });

    it("updates platform settings and logs audit event", async () => {
      const updated = await updatePlatformSetting(adminActorId, {
        key: "CURRENT_EXAM_YEAR",
        value: "2027",
        category: "EXAM",
        description: "Target exam cycle",
      });

      expect(updated).toBe(true);

      const settings = await getPlatformSettings();
      const match = settings.find((s) => s.key === "CURRENT_EXAM_YEAR");
      expect(match?.value).toBe("2027");

      const auditLogs = await getAdminAuditLogs({ action: "SETTING_UPDATE" });
      expect(auditLogs.total).toBe(1);
      expect(auditLogs.logs[0].entityId).toBe("CURRENT_EXAM_YEAR");
    });

    it("returns telemetry metrics reflecting global AI availability status", async () => {
      const stats = await getAITelemetryStats();
      expect(stats.totalQueries).toBeGreaterThan(0);
      expect(stats.averageTokensPerQuery).toBeGreaterThan(0);
      expect(stats.subjectBreakdown.length).toBeGreaterThan(0);
      expect(stats.recentQueries.length).toBeGreaterThan(0);
      expect(stats.globalEnabled).toBe(true);

      // Disable AI globally
      await updatePlatformSetting(adminActorId, {
        key: "AI_ASSISTANT_ENABLED",
        value: "false",
        category: "AI",
      });

      const updatedStats = await getAITelemetryStats();
      expect(updatedStats.globalEnabled).toBe(false);
    });
  });
});
