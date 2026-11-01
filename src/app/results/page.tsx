import React from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-server";
import { getStudentResults } from "@/lib/evaluation-service";
import { StudentLayout } from "@/components/layout/student-layout";
import { Container } from "@/components/layout/container";
import { ResultsHistoryTable } from "@/components/results/results-history-table";

export const instant = false;

export const metadata: Metadata = {
  title: "My Examination Results — MockMate",
  description: "View and review all your submitted CUET UG mock examinations and scorecards.",
};

export default async function ResultsHistoryPage() {
  const session = await getServerSession();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/results");
  }

  const { results, total } = await getStudentResults(session.user.id, {
    page: 1,
    limit: 50,
    sortBy: "date",
    sortOrder: "desc",
  });

  return (
    <StudentLayout
      activeRoute="/results"
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "My Results" },
      ]}
      user={{
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        role: (session.user as { role?: string }).role,
      }}
      targetExamYear={2026}
    >
      <div className="py-6 sm:py-8 bg-background min-h-screen">
        <Container size="default">
          <ResultsHistoryTable
            initialResults={results}
            totalResults={total}
          />
        </Container>
      </div>
    </StudentLayout>
  );
}
