import React from "react";
import { requireRole } from "@/lib/auth-server";
import { AdminLayout } from "@/components/layout/admin-layout";
import { StudentsClientView } from "./students-client-view";
import { getAdminStudents } from "@/lib/admin-service";

export const instant = false;

interface StudentsPageProps {
  searchParams: Promise<{
    q?: string;
    status?: "ALL" | "ACTIVE" | "SUSPENDED";
    year?: string;
    page?: string;
    pageSize?: string;
  }>;
}

export default async function AdminStudentsPage({ searchParams }: StudentsPageProps) {
  const session = await requireRole([
    "SUPER_ADMIN",
    "ADMIN",
    "SUPPORT_ADMIN",
  ]);

  const params = await searchParams;
  const page = parseInt(params.page || "1", 10) || 1;
  const pageSize = parseInt(params.pageSize || "20", 10) || 20;
  const targetYear = params.year ? parseInt(params.year, 10) : undefined;

  const result = await getAdminStudents({
    search: params.q,
    status: params.status || "ALL",
    targetYear,
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
        { label: "Students" },
      ]}
      activeRoute="/admin/students"
      user={user}
    >
      <StudentsClientView
        initialStudents={result.students}
        total={result.total}
        currentPage={result.page}
        totalPages={result.totalPages}
        initialQuery={params.q}
        initialStatus={params.status}
        initialYear={targetYear}
      />
    </AdminLayout>
  );
}
