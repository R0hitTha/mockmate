import React from "react";
import type { Metadata } from "next";
import { requireRole } from "@/lib/auth-server";
import { AdminLayout } from "@/components/layout/admin-layout";
import { CsvImportView } from "@/components/admin/question-bank/csv-import";

export const instant = false;

export const metadata: Metadata = {
  title: "Bulk Question Import — MockMate Admin",
  description: "Upload and validate bulk question datasets from CSV into the CUET UG question bank.",
};

export default async function BulkImportPage() {
  const session = await requireRole(["ADMIN", "CONTENT_CREATOR", "FACULTY"]);

  return (
    <AdminLayout
      activeRoute="/admin/question-bank/import"
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Question Bank", href: "/admin/question-bank" },
        { label: "Bulk CSV Import" },
      ]}
      user={session.user}
    >
      <CsvImportView />
    </AdminLayout>
  );
}

