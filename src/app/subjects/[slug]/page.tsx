import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServerSession, getStudentProfile } from "@/lib/auth-server";
import { getSubjectBySlug } from "@/lib/syllabus-service";
import { SyllabusView } from "@/components/subjects/syllabus-view";
import { StudentLayout } from "@/components/layout/student-layout";
import { PublicLayout } from "@/components/layout/public-layout";
import { Container } from "@/components/layout/container";

export const instant = false;

interface SubjectDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    year?: string;
  }>;
}

export async function generateMetadata({
  params,
  searchParams,
}: SubjectDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { year } = await searchParams;
  const parsedYear = year ? parseInt(year, 10) : 2026;
  const targetYear = isNaN(parsedYear) ? 2026 : parsedYear;

  const subject = await getSubjectBySlug(slug, targetYear);
  if (!subject) {
    return {
      title: "Subject Not Found — MockMate",
    };
  }

  return {
    title: `${subject.name} (Code ${subject.code}) CUET UG ${targetYear} Syllabus — MockMate`,
    description: `Official NTA syllabus breakdown, units, chapters and topics for CUET UG ${targetYear} ${subject.name}.`,
  };
}

export default async function SubjectDetailPage({
  params,
  searchParams,
}: SubjectDetailPageProps) {
  const { slug } = await params;
  const { year } = await searchParams;
  const parsedYear = year ? parseInt(year, 10) : 2026;
  const targetYear = isNaN(parsedYear) ? 2026 : parsedYear;

  // Retrieve session if logged in
  const session = await getServerSession();
  const studentProfile = session?.user?.id
    ? await getStudentProfile(session.user.id)
    : null;

  const subject = await getSubjectBySlug(
    slug,
    targetYear,
    studentProfile?.id
  );

  if (!subject) {
    notFound();
  }

  const content = (
    <SyllabusView
      subject={subject}
      targetYear={targetYear}
      isAuthenticated={Boolean(session?.user)}
    />
  );

  // Authenticated Student View
  if (session?.user) {
    return (
      <StudentLayout
        activeRoute="/subjects"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Subjects", href: `/subjects?year=${targetYear}` },
          { label: subject.name },
        ]}
        user={session.user}
        targetExamYear={studentProfile?.targetExamYear || targetYear}
      >
        <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">{content}</div>
      </StudentLayout>
    );
  }

  // Public Guest View
  return (
    <PublicLayout>
      <Container className="py-12 sm:py-16 max-w-5xl">{content}</Container>
    </PublicLayout>
  );
}
