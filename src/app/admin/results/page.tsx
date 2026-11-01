import React from "react";
import type { Metadata } from "next";
import { requireRole } from "@/lib/auth-server";
import { getAdminResults } from "@/lib/evaluation-service";
import { AdminLayout } from "@/components/layout/admin-layout";
import { AdminResultsTable } from "@/components/admin/results/admin-results-table";

export const instant = false;

export const metadata: Metadata = {
  title: "Admin Results Management — MockMate",
  description: "Administrative audit and re-evaluation control for student test attempts.",
};

export default async function AdminResultsPage() {
  const session = await requireRole([
    "ADMIN",
    "SUPER_ADMIN",
    "SUPPORT_ADMIN",
    "CONTENT_ADMIN",
  ]);

  const { results, total } = await getAdminResults({
    page: 1,
    limit: 100,
    sortBy: "date",
    sortOrder: "desc",
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
        { label: "Results & Attempts" },
      ]}
      activeRoute="/admin/results"
      user={user}
    >
      <AdminResultsTable initialResults={results} totalResults={total} />
    </AdminLayout>
  );
}
