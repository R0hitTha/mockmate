import React from "react";
import { requireRole } from "@/lib/auth-server";
import { AdminLayout } from "@/components/layout/admin-layout";
import { AIUsageClientView } from "./ai-usage-client-view";
import { getAITelemetryStats } from "@/lib/admin-service";

export const instant = false;

export default async function AdminAIUsagePage() {
  const session = await requireRole([
    "SUPER_ADMIN",
    "ADMIN",
  ]);

  const stats = await getAITelemetryStats();

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
        { label: "AI Usage Telemetry" },
      ]}
      activeRoute="/admin/ai-usage"
      user={user}
    >
      <AIUsageClientView stats={stats} />
    </AdminLayout>
  );
}
