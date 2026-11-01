import React from "react";
import type { Metadata } from "next";
import { requireRole } from "@/lib/auth-server";
import { AdminLayout } from "@/components/layout/admin-layout";
import { MockTestTable } from "@/components/admin/mock-tests/mock-test-table";
import { getMockTestStats, getAdminMockTests } from "@/lib/mock-test-service";



export const instant = false;

export const metadata: Metadata = {
  title: "Mock Test Library — MockMate Admin",
  description: "Create, configure, and manage CUET UG mock examinations.",
};

interface MockTestsPageProps {
  searchParams: Promise<{
    page?: string;
    q?: string;
    status?: string;
    type?: string;
    difficulty?: string;
  }>;
}

export default async function MockTestsAdminPage({ searchParams }: MockTestsPageProps) {
  const session = await requireRole(["ADMIN", "CONTENT_CREATOR", "FACULTY"]);
  const params = await searchParams;

  const page = params.page ? parseInt(params.page, 10) : 1;
  const search = params.q;
  const status = params.status;
  const testType = params.type;
  const difficulty = params.difficulty;

  const [stats, { tests }] = await Promise.all([
    getMockTestStats(),
    getAdminMockTests({
      page,
      search,
      status,
      testType,
      difficulty,
      pageSize: 20,
    }),
  ]);

  return (
    <AdminLayout
      activeRoute="/admin/mock-tests"
      breadcrumbs={[
        { label: "Admin Portal", href: "/admin" },
        { label: "Mock Test Library" },
      ]}
      user={session.user}
    >
      <MockTestTable
        initialTests={tests.map((t) => ({
          id: t.id,
          title: t.title,
          slug: t.slug,
          testCode: t.testCode,
          description: t.description,
          examYear: t.examYear,
          testType: t.testType,
          status: t.status,
          difficulty: t.difficulty,
          totalDuration: t.totalDuration,
          totalMarks: t.totalMarks,
          totalQuestions: t.totalQuestions,
          questionsToAttempt: t.questionsToAttempt,
          isOfficialPattern: t.isOfficialPattern,
          attemptsCount: t.attemptsCount,
          sectionsCount: t.sectionsCount,
          subjects: t.subjects,
          createdAt: t.createdAt,
        }))}
        stats={stats}
      />
    </AdminLayout>
  );
}
