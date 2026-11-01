import React from "react";
import { requireRole } from "@/lib/auth-server";
import { AdminLayout } from "@/components/layout/admin-layout";
import { AuditLogsClientView } from "./audit-logs-client-view";
import { getAdminAuditLogs } from "@/lib/admin-service";

export const instant = false;

interface AuditLogsPageProps {
  searchParams: Promise<{
    action?: string;
    entityType?: string;
    page?: string;
    pageSize?: string;
  }>;
}

export default async function AdminAuditLogsPage({ searchParams }: AuditLogsPageProps) {
  const session = await requireRole([
    "SUPER_ADMIN",
    "ADMIN",
  ]);

  const params = await searchParams;
  const page = parseInt(params.page || "1", 10) || 1;
  const pageSize = parseInt(params.pageSize || "25", 10) || 25;

  const result = await getAdminAuditLogs({
    action: params.action,
    entityType: params.entityType,
    page,
    pageSize,
  });

  const user = session.user as {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string | null;
  };

  return (
    <AdminLayout
      breadcrumbs={[
        { label: "Administration", href: "/admin" },
        { label: "Audit Logs" },
      ]}
      activeRoute="/admin/audit-logs"
      user={user}
    >
      <AuditLogsClientView
        logs={result.logs}
        total={result.total}
        currentPage={result.page}
        totalPages={result.totalPages}
        selectedAction={params.action}
        selectedEntityType={params.entityType}
      />
    </AdminLayout>
  );
}
