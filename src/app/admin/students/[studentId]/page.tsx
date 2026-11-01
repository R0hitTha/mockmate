import React from "react";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth-server";
import { AdminLayout } from "@/components/layout/admin-layout";
import { StudentDetailClientView } from "./student-detail-client-view";
import { getAdminStudentDetail } from "@/lib/admin-service";

export const instant = false;

interface StudentDetailPageProps {
  params: Promise<{
    studentId: string;
  }>;
}

export default async function AdminStudentDetailPage({ params }: StudentDetailPageProps) {
  const session = await requireRole([
    "SUPER_ADMIN",
    "ADMIN",
    "SUPPORT_ADMIN",
  ]);

  const { studentId } = await params;
  const student = await getAdminStudentDetail(studentId);

  if (!student) {
    notFound();
  }

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
        { label: "Students", href: "/admin/students" },
        { label: student.name },
      ]}
      activeRoute="/admin/students"
      user={user}
    >
      <StudentDetailClientView
        student={student}
        currentUserRole={user.role || "ADMIN"}
      />
    </AdminLayout>
  );
}
