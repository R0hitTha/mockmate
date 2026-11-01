import React from "react";
import type { Metadata } from "next";
import { getServerSession, getStudentProfile } from "@/lib/auth-server";
import {
  getExamYears,
  getSubjectCategories,
  getSubjects,
} from "@/lib/syllabus-service";
import { SubjectCatalog } from "@/components/subjects/subject-catalog";
import { StudentLayout } from "@/components/layout/student-layout";
import { PublicLayout } from "@/components/layout/public-layout";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";

export const instant = false;

export const metadata: Metadata = {
  title: "CUET UG Subjects & Syllabus Catalogue — MockMate",
  description:
    "Explore the official NTA CUET UG subject catalogue and verified Class 12 NCERT syllabus outlines for CUET 2026 and 2027.",
};

interface SubjectsPageProps {
  searchParams: Promise<{
    year?: string;
    category?: string;
    q?: string;
  }>;
}

export default async function SubjectsPage({ searchParams }: SubjectsPageProps) {
  const params = await searchParams;
  const parsedYear = params.year ? parseInt(params.year, 10) : 2026;
  const targetYear = isNaN(parsedYear) ? 2026 : parsedYear;
  const categorySlug = params.category;
  const searchQuery = params.q;

  // Retrieve session if logged in
  const session = await getServerSession();
  const studentProfile = session?.user?.id
    ? await getStudentProfile(session.user.id)
    : null;

  const [examYears, categories, subjects] = await Promise.all([
    getExamYears(),
    getSubjectCategories(),
    getSubjects({
      year: targetYear,
      categorySlug,
      search: searchQuery,
      studentProfileId: studentProfile?.id,
    }),
  ]);

  const content = (
    <div className="space-y-6">
      <PageHeader
        title="CUET Subjects & Syllabus"
        description="Browse the complete, official CUET UG subject catalogue and inspect verified chapter and topic blueprints indexed against NTA guidelines."
      />

      <SubjectCatalog
        initialSubjects={subjects}
        examYears={examYears}
        categories={categories}
        currentYear={targetYear}
        isAuthenticated={Boolean(session?.user)}
      />
    </div>
  );

  // Authenticated Student View
  if (session?.user) {
    return (
      <StudentLayout
        activeRoute="/subjects"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "CUET Subjects & Syllabus" },
        ]}
        user={session.user}
        targetExamYear={studentProfile?.targetExamYear || targetYear}
      >
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">{content}</div>
      </StudentLayout>
    );
  }

  // Public Guest View
  return (
    <PublicLayout>
      <Container className="py-12 sm:py-16">{content}</Container>
    </PublicLayout>
  );
}
