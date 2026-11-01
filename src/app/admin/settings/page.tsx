import React from "react";
import { requireRole } from "@/lib/auth-server";
import { AdminLayout } from "@/components/layout/admin-layout";
import { SettingsClientView } from "./settings-client-view";
import { getPlatformSettings } from "@/lib/admin-service";

export const instant = false;

export default async function AdminSettingsPage() {
  const session = await requireRole([
    "SUPER_ADMIN",
    "ADMIN",
  ]);

  const settings = await getPlatformSettings();

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
        { label: "Platform Settings" },
      ]}
      activeRoute="/admin/settings"
      user={user}
    >
      <SettingsClientView initialSettings={settings} />
    </AdminLayout>
  );
}
