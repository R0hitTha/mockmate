import React from "react";
import type { Metadata } from "next";
import { requireRole } from "@/lib/auth-server";
import { AdminLayout } from "@/components/layout/admin-layout";
import { MockTestBuilder } from "@/components/admin/mock-tests/mock-test-builder";
import { getSubjects, getExamYears } from "@/lib/syllabus-service";
import { getAvailableQuestionsForTestBuilder } from "@/lib/mock-test-service";



export const instant = false;

export const metadata: Metadata = {
  title: "Build New Mock Test — MockMate Admin",
  description: "Create a computer-based CUET UG mock examination paper.",
};

export default async function NewMockTestPage() {
  const session = await requireRole(["ADMIN", "CONTENT_CREATOR", "FACULTY"]);

  const [subjects, examYears, availableQuestions] = await Promise.all([
    getSubjects(),
    getExamYears(),
    getAvailableQuestionsForTestBuilder({ limit: 50 }),
  ]);

  return (
    <AdminLayout
      activeRoute="/admin/mock-tests"
      breadcrumbs={[
        { label: "Admin Portal", href: "/admin" },
        { label: "Mock Test Library", href: "/admin/mock-tests" },
        { label: "Build New Test" },
      ]}
      user={session.user}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Create CUET Mock Test
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Configure multi-section examination papers, assign question banks, and specify timing rules.
          </p>
        </div>

        <MockTestBuilder
          subjects={subjects.map((s) => ({
            id: s.id,
            name: s.name,
            code: s.code,
            slug: s.slug,
          }))}
          examYears={examYears.map((y) => ({
            id: y.id,
            year: y.year,
          }))}
          availableQuestions={availableQuestions}
        />
      </div>
    </AdminLayout>
  );
}
