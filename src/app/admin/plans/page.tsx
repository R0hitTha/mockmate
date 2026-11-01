import React from "react";
import { requireRole } from "@/lib/auth-server";
import { AdminLayout } from "@/components/layout/admin-layout";
import { PlansClientView } from "./plans-client-view";
import { getSubscriptionPlans } from "@/lib/entitlement-service";

export const instant = false;

export default async function AdminPlansPage() {
  const session = await requireRole([
    "SUPER_ADMIN",
    "ADMIN",
    "FINANCE_ADMIN",
  ]);

  const plans = await getSubscriptionPlans(true);

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
        { label: "Subscription Plans" },
      ]}
      activeRoute="/admin/plans"
      user={user}
    >
      <PlansClientView initialPlans={plans} />
    </AdminLayout>
  );
}
