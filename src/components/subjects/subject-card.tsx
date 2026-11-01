"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock, BookOpen, Layers, ArrowRight, Check, Plus, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SubjectListItem } from "@/lib/syllabus-service";
import { toggleSubjectEnrollmentAction } from "@/actions/subject-actions";

interface SubjectCardProps {
  subject: SubjectListItem;
  selectedYear: number;
  isAuthenticated: boolean;
  onEnrollmentChange?: (slug: string, isEnrolled: boolean) => void;
}

export function SubjectCard({
  subject,
  selectedYear,
  isAuthenticated,
  onEnrollmentChange,
}: SubjectCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [enrolledOverride, setEnrolledOverride] = React.useState<boolean | null>(null);
  const [statusMessage, setStatusMessage] = React.useState<string | null>(null);

  const isSelected = enrolledOverride !== null ? enrolledOverride : (subject.isSelected ?? false);

  const handleToggle = () => {
    if (!isAuthenticated) {
      router.push(`/login?callbackUrl=${encodeURIComponent(`/subjects?year=${selectedYear}`)}`);
      return;
    }

    startTransition(async () => {
      setStatusMessage(null);
      const res = await toggleSubjectEnrollmentAction(subject.slug, selectedYear);
      if (res.success && typeof res.enrolled === "boolean") {
        setEnrolledOverride(res.enrolled);
        onEnrollmentChange?.(subject.slug, res.enrolled);
      } else if (res.error) {
        setStatusMessage(res.error);
        setTimeout(() => setStatusMessage(null), 4000);
      }
    });
  };

  return (
    <div
      className={`group relative flex flex-col justify-between rounded-xl border bg-card p-5 transition-all duration-200 hover:shadow-md ${
        isSelected
          ? "border-primary/50 shadow-sm ring-1 ring-primary/20 dark:border-primary/40"
          : "border-border hover:border-border/80"
      }`}
    >
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <Badge variant="outline" className="text-xs font-medium tracking-wide uppercase">
            Code {subject.code}
          </Badge>

          {subject.hasVerifiedSyllabus ? (
            <Badge
              variant="default"
              className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800 text-[11px] gap-1 font-medium"
            >
              <CheckCircle2 className="h-3 w-3" />
              Verified NTA
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="bg-amber-50/70 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/60 text-[11px] gap-1 font-medium"
            >
              <Clock className="h-3 w-3" />
              In Progress
            </Badge>
          )}
        </div>

        {/* Title & Category */}
        <div className="mb-2">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            {subject.categoryName}
          </span>
          <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1 mt-0.5">
            {subject.name}
          </h3>
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-4">
          {subject.description}
        </p>

        {/* Units / Topics Stats */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground py-2 border-y border-border/60 mb-4 bg-muted/20 px-2.5 rounded-md">
          <span className="flex items-center gap-1.5 font-medium">
            <Layers className="h-3.5 w-3.5 text-primary" />
            {subject.totalUnits > 0 ? `${subject.totalUnits} Units` : "Pending NTA"}
          </span>
          <span className="text-border">•</span>
          <span className="flex items-center gap-1.5 font-medium">
            <BookOpen className="h-3.5 w-3.5 text-primary" />
            {subject.totalTopics > 0 ? `${subject.totalTopics} Topics` : "Pending NTA"}
          </span>
        </div>

        {statusMessage && (
          <p className="text-xs text-rose-600 dark:text-rose-400 mb-3 bg-rose-50 dark:bg-rose-950/40 p-2 rounded border border-rose-200 dark:border-rose-900">
            {statusMessage}
          </p>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-2 flex items-center gap-2">
        <Link
          href={`/subjects/${subject.slug}?year=${selectedYear}`}
          className="flex-1"
        >
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs font-medium justify-between group-hover:border-primary/40"
          >
            <span>View Syllabus</span>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-0.5" />
          </Button>
        </Link>

        <Button
          size="sm"
          variant={isSelected ? "default" : "outline"}
          onClick={handleToggle}
          disabled={isPending}
          className={`text-xs font-medium px-3 shrink-0 ${
            isSelected
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "border-border text-foreground hover:bg-muted"
          }`}
          title={isSelected ? "Remove from my subjects" : "Add to my subjects"}
        >
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : isSelected ? (
            <span className="flex items-center gap-1">
              <Check className="h-3.5 w-3.5" />
              Enrolled
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <Plus className="h-3.5 w-3.5" />
              Add
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
