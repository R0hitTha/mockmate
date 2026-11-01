import React from "react";
import type { Metadata } from "next";
import { requireRole } from "@/lib/auth-server";
import { getSyllabusCascade } from "@/lib/question-service";
import { AdminLayout } from "@/components/layout/admin-layout";
import { QuestionForm } from "@/components/admin/question-bank/question-form";

export const instant = false;

export const metadata: Metadata = {
  title: "Create Question — MockMate Admin",
  description: "Author a new CUET UG examination question with structured syllabus indexing.",
};

export default async function NewQuestionPage() {
  const session = await requireRole(["ADMIN", "CONTENT_CREATOR", "FACULTY"]);
  const cascadeData = await getSyllabusCascade({ examYear: 2026 });

  return (
    <AdminLayout
      activeRoute="/admin/question-bank/new"
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Question Bank", href: "/admin/question-bank" },
        { label: "Create Question" },
      ]}
      user={session.user}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            Create CUET Question
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Index the question against official NTA syllabus units, configure option choices, and assign difficulty.
          </p>
        </div>

        <QuestionForm cascadeData={cascadeData} mode="create" />
      </div>
    </AdminLayout>
  );
}

