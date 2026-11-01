"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "@/lib/auth-server";
import {
  suspendStudentSchema,
  reactivateStudentSchema,
  updateStudentRoleSchema,
  studentFilterSchema,
  platformSettingSchema,
  type SuspendStudentInput,
  type ReactivateStudentInput,
  type UpdateStudentRoleInput,
  type StudentFilterInput,
  type PlatformSettingInput,
} from "@/lib/validations/admin";
import {
  isSuperAdmin,
  canManageSupport,
  getAdminDashboardStats,
  getAdminStudents,
  getAdminStudentDetail,
  suspendStudent,
  reactivateStudent,
  updateUserRole,
  getAdminAuditLogs,
  getPlatformSettings,
  updatePlatformSetting,
  getAITelemetryStats,
} from "@/lib/admin-service";

export async function getAdminDashboardDataAction() {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required." };
    }
    const role = (session.user as { role?: string }).role;
    if (role === "STUDENT") {
      return { success: false, error: "Access denied. Administrative role required." };
    }

    const data = await getAdminDashboardStats();
    return { success: true, data };
  } catch (err: unknown) {
    return {
      success: false,
      error: (err as Error).message || "Failed to load admin dashboard data.",
    };
  }
}

export async function getAdminStudentsAction(filters?: Partial<StudentFilterInput>) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required." };
    }
    const role = (session.user as { role?: string }).role;
    if (!canManageSupport(role)) {
      return { success: false, error: "Access denied: Support or Super Admin required." };
    }

    const validated = studentFilterSchema.safeParse(filters || {});
    const input = validated.success
      ? validated.data
      : { page: 1, pageSize: 20, status: "ALL" as const };

    const data = await getAdminStudents(input);
    return { success: true, data };
  } catch (err: unknown) {
    return {
      success: false,
      error: (err as Error).message || "Failed to fetch student directory.",
    };
  }
}

export async function getAdminStudentDetailAction(studentId: string) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required." };
    }
    const role = (session.user as { role?: string }).role;
    if (!canManageSupport(role)) {
      return { success: false, error: "Access denied: Support or Super Admin required." };
    }

    const data = await getAdminStudentDetail(studentId);
    return { success: true, data };
  } catch (err: unknown) {
    return {
      success: false,
      error: (err as Error).message || "Failed to fetch student details.",
    };
  }
}

export async function suspendStudentAction(input: SuspendStudentInput) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required." };
    }
    const role = (session.user as { role?: string }).role;
    if (!canManageSupport(role)) {
      return { success: false, error: "Access denied: Support or Super Admin required." };
    }

    const validated = suspendStudentSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Invalid suspension data.",
      };
    }

    await suspendStudent(session.user.id, validated.data);

    revalidatePath("/admin/students");
    revalidatePath(`/admin/students/${validated.data.studentId}`);
    revalidatePath("/admin/audit-logs");

    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: (err as Error).message || "Failed to suspend student account.",
    };
  }
}

export async function reactivateStudentAction(input: ReactivateStudentInput) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required." };
    }
    const role = (session.user as { role?: string }).role;
    if (!canManageSupport(role)) {
      return { success: false, error: "Access denied: Support or Super Admin required." };
    }

    const validated = reactivateStudentSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Invalid reactivation data.",
      };
    }

    await reactivateStudent(session.user.id, validated.data);

    revalidatePath("/admin/students");
    revalidatePath(`/admin/students/${validated.data.studentId}`);
    revalidatePath("/admin/audit-logs");

    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: (err as Error).message || "Failed to reactivate student account.",
    };
  }
}

export async function updateUserRoleAction(input: UpdateStudentRoleInput) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required." };
    }
    const role = (session.user as { role?: string }).role;
    if (!isSuperAdmin(role)) {
      return { success: false, error: "Access denied: Super Admin authorization required." };
    }

    // Disallow self-modification of role
    if (session.user.id === input.userId) {
      return { success: false, error: "Cannot modify your own administrative role." };
    }

    const validated = updateStudentRoleSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Invalid role data.",
      };
    }

    await updateUserRole(session.user.id, validated.data);

    revalidatePath("/admin/students");
    revalidatePath("/admin/audit-logs");

    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: (err as Error).message || "Failed to update user role.",
    };
  }
}

export async function getAdminAuditLogsAction(options: {
  page?: number;
  pageSize?: number;
  action?: string;
  entityType?: string;
}) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required." };
    }
    const role = (session.user as { role?: string }).role;
    if (!isSuperAdmin(role)) {
      return { success: false, error: "Access denied: Super Admin required to view audit logs." };
    }

    const logs = await getAdminAuditLogs(options);
    return { success: true, data: logs };
  } catch (err: unknown) {
    return {
      success: false,
      error: (err as Error).message || "Failed to fetch audit logs.",
    };
  }
}

export async function getPlatformSettingsAction() {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required." };
    }
    const role = (session.user as { role?: string }).role;
    if (!isSuperAdmin(role)) {
      return { success: false, error: "Access denied: Super Admin required to view settings." };
    }

    const settings = await getPlatformSettings();
    return { success: true, data: settings };
  } catch (err: unknown) {
    return {
      success: false,
      error: (err as Error).message || "Failed to load platform settings.",
    };
  }
}

export async function updatePlatformSettingAction(input: PlatformSettingInput) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required." };
    }
    const role = (session.user as { role?: string }).role;
    if (!isSuperAdmin(role)) {
      return { success: false, error: "Access denied: Super Admin required to update settings." };
    }

    const validated = platformSettingSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Invalid setting data.",
      };
    }

    await updatePlatformSetting(session.user.id, validated.data);

    revalidatePath("/admin/settings");
    revalidatePath("/admin/audit-logs");

    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: (err as Error).message || "Failed to update platform setting.",
    };
  }
}

export async function getAITelemetryStatsAction() {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required." };
    }
    const role = (session.user as { role?: string }).role;
    if (!isSuperAdmin(role)) {
      return { success: false, error: "Access denied: Super Admin required to view AI telemetry." };
    }

    const data = await getAITelemetryStats();
    return { success: true, data };
  } catch (err: unknown) {
    return {
      success: false,
      error: (err as Error).message || "Failed to load AI telemetry stats.",
    };
  }
}
