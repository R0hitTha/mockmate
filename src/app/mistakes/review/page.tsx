import React from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { StudentLayout } from "@/components/layout/student-layout";
import { Button } from "@/components/ui/button";
import { getServerSession, getStudentProfile } from "@/lib/auth-server";
import { getStudentMistakesList } from "@/lib/mistake-service";
import { MistakeFilterSchema } from "@/lib/validations/mistakes";
import { MistakeReviewFilters } from "@/components/mistakes/mistake-review-filters";
import { MistakeReviewCard } from "@/components/mistakes/mistake-review-card";

export const instant = false;

interface ReviewPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function MistakeReviewPage({ searchParams }: ReviewPageProps) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/mistakes/review");
  }

  const profile = await getStudentProfile(session.user.id);
  if (!profile?.onboardingCompleted) {
    redirect("/onboarding");
  }

  const rawParams = await searchParams;
  const parsedFilters = MistakeFilterSchema.parse({
    subject: typeof rawParams.subject === "string" ? rawParams.subject : undefined,
    topic: typeof rawParams.topic === "string" ? rawParams.topic : undefined,
    testId: typeof rawParams.testId === "string" ? rawParams.testId : undefined,
    category: typeof rawParams.category === "string" ? rawParams.category : "ALL",
    status: typeof rawParams.status === "string" ? rawParams.status : "ALL",
    sortBy: typeof rawParams.sortBy === "string" ? rawParams.sortBy : "recent",
    page: typeof rawParams.page === "string" ? parseInt(rawParams.page, 10) : 1,
    limit: 10,
  });

  const listData = await getStudentMistakesList(session.user.id, parsedFilters);

  return (
    <StudentLayout
      activeRoute="/mistakes"
      breadcrumbs={[
        { label: "Student Portal", href: "/dashboard" },
        { label: "Mistake Intelligence", href: "/mistakes" },
        { label: "Review Workspace" },
      ]}
      user={session.user}
      targetExamYear={profile.targetExamYear}
    >
      <div className="space-y-6">
        {/* Navigation / Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
          <div>
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm" className="h-8 px-2 text-xs gap-1 -ml-2 text-muted-foreground">
                <Link href="/mistakes">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Overview</span>
                </Link>
              </Button>
              <span className="text-muted-foreground">•</span>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                <span>Mistake Revision Workspace</span>
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Showing {listData.total} mistake records matching your filter criteria.
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <MistakeReviewFilters
          currentSubject={parsedFilters.subject}
          currentTopic={parsedFilters.topic}
          currentCategory={parsedFilters.category}
          currentStatus={parsedFilters.status}
          currentSortBy={parsedFilters.sortBy}
          availableSubjects={listData.availableSubjects}
          availableTopics={listData.availableTopics}
        />

        {/* Mistakes List */}
        {listData.items.length > 0 ? (
          <div className="space-y-4">
            {listData.items.map((item) => (
              <MistakeReviewCard key={item.id} item={item} />
            ))}

            {/* Pagination Controls */}
            {listData.totalPages > 1 && (
              <div className="flex flex-wrap items-center justify-between gap-2.5 pt-4 border-t border-border/60">
                <span className="text-xs text-muted-foreground">
                  Page {listData.page} of {listData.totalPages} ({listData.total} total items)
                </span>

                <div className="flex items-center gap-2">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    disabled={listData.page <= 1}
                    className="h-8 text-xs gap-1"
                  >
                    <Link
                      href={`/mistakes/review?page=${listData.page - 1}&subject=${parsedFilters.subject || "ALL"}&topic=${parsedFilters.topic || "ALL"}&category=${parsedFilters.category}&status=${parsedFilters.status}&sortBy=${parsedFilters.sortBy}`}
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Previous</span>
                    </Link>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    disabled={listData.page >= listData.totalPages}
                    className="h-8 text-xs gap-1"
                  >
                    <Link
                      href={`/mistakes/review?page=${listData.page + 1}&subject=${parsedFilters.subject || "ALL"}&topic=${parsedFilters.topic || "ALL"}&category=${parsedFilters.category}&status=${parsedFilters.status}&sortBy=${parsedFilters.sortBy}`}
                    >
                      <span>Next</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-12 text-center bg-card border border-border rounded-xl">
            <BookOpen className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-foreground">No Mistakes Matching Filters</h4>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
              Try changing or resetting your status, subject, or topic filters to inspect other mistake records.
            </p>
            <div className="mt-4">
              <Button asChild size="sm" variant="outline" className="text-xs">
                <Link href="/mistakes/review">Reset All Filters</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}

