import React from "react";
import { connection } from "next/server";
import { requireRole } from "@/lib/auth-server";
import { AdminLayout } from "@/components/layout/admin-layout";
import { AdminDashboardClientView } from "./admin-dashboard-client-view";
import { getAdminDashboardStats } from "@/lib/admin-service";

export const instant = false;

export default async function AdminDashboardPage() {
  await connection();
  const session = await requireRole([
    "SUPER_ADMIN",
    "ADMIN",
    "CONTENT_ADMIN",
    "SUPPORT_ADMIN",
    "FINANCE_ADMIN",
  ]);

  const stats = await getAdminDashboardStats();
  const user = session.user as {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string | null;
  };

  return (
    <AdminLayout
      breadcrumbs={[{ label: "Administration", href: "/admin" }, { label: "Overview" }]}
      activeRoute="/admin"
      user={user}
    >
      <AdminDashboardClientView
        stats={stats}
        userRole={user.role || "ADMIN"}
        userName={user.name || "Administrator"}
      />
    </AdminLayout>
  );
}
