"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, BookCheck, ShieldCheck, CheckCircle2, Filter, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SubjectCard } from "./subject-card";
import { SubjectListItem } from "@/lib/syllabus-service";

interface SubjectCatalogProps {
  initialSubjects: SubjectListItem[];
  examYears: { id: string; year: number; label: string; isDefault: boolean }[];
  categories: { id: string; name: string; slug: string; description: string }[];
  currentYear: number;
  isAuthenticated: boolean;
}

export function SubjectCatalog({
  initialSubjects,
  examYears,
  categories,
  currentYear,
  isAuthenticated,
}: SubjectCatalogProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedYear, setSelectedYear] = React.useState<number>(currentYear);
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [onlyEnrolled, setOnlyEnrolled] = React.useState<boolean>(false);
  const [enrollmentOverrides, setEnrollmentOverrides] = React.useState<Record<string, boolean>>({});

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    const params = new URLSearchParams(searchParams.toString());
    params.set("year", year.toString());
    router.push(`/subjects?${params.toString()}`);
  };

  const handleEnrollmentChange = (slug: string, isEnrolled: boolean) => {
    setEnrollmentOverrides((prev) => ({ ...prev, [slug]: isEnrolled }));
  };

  // Derive subjects with optimistic enrollment overrides
  const subjects = React.useMemo(() => {
    return initialSubjects.map((sub) => {
      if (sub.slug in enrollmentOverrides) {
        return { ...sub, isSelected: enrollmentOverrides[sub.slug] };
      }
      return sub;
    });
  }, [initialSubjects, enrollmentOverrides]);

  // Filter subjects based on state
  const filteredSubjects = React.useMemo(() => {
    return subjects.filter((sub) => {
      // Year filter
      if (!sub.examYears.includes(selectedYear)) return false;

      // Category filter
      if (selectedCategory !== "all" && sub.categorySlug !== selectedCategory) return false;

      // Enrolled filter
      if (onlyEnrolled && !sub.isSelected) return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = sub.name.toLowerCase().includes(q);
        const matchesCode = sub.code.toLowerCase().includes(q);
        const matchesDesc = sub.description.toLowerCase().includes(q);
        if (!matchesName && !matchesCode && !matchesDesc) return false;
      }

      return true;
    });
  }, [subjects, selectedYear, selectedCategory, onlyEnrolled, searchQuery]);

  const enrolledCount = subjects.filter((s) => s.isSelected).length;
  const verifiedCount = subjects.filter((s) => s.hasVerifiedSyllabus).length;

  return (
    <div className="space-y-8">
      {/* Top Banner / Verification Guarantee */}
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 via-sky-500/5 to-transparent p-6 dark:border-primary/30">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
              <h2 className="text-base font-semibold text-foreground">
                Authentic NTA CUET UG Syllabus Architecture
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
              Every unit, chapter, and topic in MockMate is indexed against the official National
              Testing Agency (NTA) Information Bulletin and rationalized Class 12 NCERT curriculum.
              We never fabricate or approximate syllabus outlines.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-medium text-muted-foreground mr-1">Target Exam Year:</span>
            <div className="inline-flex rounded-lg border border-border bg-background p-1 shadow-sm">
              {examYears.map((yr) => (
                <button
                  key={yr.year}
                  type="button"
                  onClick={() => handleYearChange(yr.year)}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                    selectedYear === yr.year
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  CUET {yr.year}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by subject name or NTA code (e.g. Physics, 314)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 text-sm bg-background border-border"
            />
          </div>

          {/* Quick Enrolled Toggle */}
          {isAuthenticated && (
            <button
              type="button"
              onClick={() => setOnlyEnrolled(!onlyEnrolled)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium border transition-colors ${
                onlyEnrolled
                  ? "bg-primary/10 border-primary text-primary dark:bg-primary/20"
                  : "bg-background border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <BookCheck className="h-4 w-4" />
              <span>My Enrolled Subjects</span>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 ml-0.5">
                {enrolledCount}
              </Badge>
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-medium text-muted-foreground flex items-center gap-1 shrink-0 mr-1">
            <Filter className="h-3.5 w-3.5" />
            Category:
          </span>

          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${
              selectedCategory === "all"
                ? "bg-foreground text-background border-foreground font-semibold"
                : "bg-background text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground"
            }`}
          >
            All Subjects ({subjects.length})
          </button>

          {categories.map((cat) => {
            const count = subjects.filter((s) => s.categorySlug === cat.slug).length;
            return (
              <button
                key={cat.slug}
                type="button"
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${
                  selectedCategory === cat.slug
                    ? "bg-foreground text-background border-foreground font-semibold"
                    : "bg-background text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground"
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Catalogue Meta Summary */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1 border-b border-border/40 pb-2">
        <span>
          Showing <strong className="text-foreground">{filteredSubjects.length}</strong> subjects for{" "}
          <strong className="text-foreground">CUET UG {selectedYear}</strong>
        </span>
        <span className="hidden sm:inline-flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          {verifiedCount} verified NTA syllabus blueprints indexed
        </span>
      </div>

      {/* Subjects Grid */}
      {filteredSubjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSubjects.map((sub) => (
            <SubjectCard
              key={`${sub.slug}-${selectedYear}`}
              subject={sub}
              selectedYear={selectedYear}
              isAuthenticated={isAuthenticated}
              onEnrollmentChange={handleEnrollmentChange}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-muted-foreground/60 mb-3" />
          <h3 className="text-base font-semibold text-foreground mb-1">
            No subjects match your filters
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto mb-5">
            {onlyEnrolled
              ? "You haven't enrolled in any subjects matching these criteria yet. Switch off 'My Enrolled Subjects' to browse the complete catalogue."
              : "Try adjusting your search query, selecting another category, or clearing the search bar."}
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
              setOnlyEnrolled(false);
            }}
            className="text-xs font-semibold text-primary hover:underline"
          >
            Reset all filters
          </button>
        </div>
      )}
    </div>
  );
}
