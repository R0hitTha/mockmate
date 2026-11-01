"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Layers,
  BookOpen,
  Calendar,
  FileText,
  AlertTriangle,
  Check,
  Plus,
  Loader2,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { DetailedSubject } from "@/lib/syllabus-service";
import { toggleSubjectEnrollmentAction } from "@/actions/subject-actions";

interface SyllabusViewProps {
  subject: DetailedSubject;
  targetYear: number;
  isAuthenticated: boolean;
}

export function SyllabusView({ subject, targetYear, isAuthenticated }: SyllabusViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [isSelected, setIsSelected] = React.useState(subject.isSelected ?? false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Accordion active state: defaults to expanding the first unit
  const defaultOpenUnits = subject.syllabus?.units.length
    ? [`unit-${subject.syllabus.units[0].unitNumber}`]
    : [];
  const [openUnits, setOpenUnits] = React.useState<string[]>(defaultOpenUnits);

  const handleToggle = () => {
    if (!isAuthenticated) {
      router.push(
        `/login?callbackUrl=${encodeURIComponent(`/subjects/${subject.slug}?year=${targetYear}`)}`
      );
      return;
    }

    startTransition(async () => {
      setErrorMessage(null);
      const res = await toggleSubjectEnrollmentAction(subject.slug, targetYear);
      if (res.success && typeof res.enrolled === "boolean") {
        setIsSelected(res.enrolled);
      } else if (res.error) {
        setErrorMessage(res.error);
        setTimeout(() => setErrorMessage(null), 4000);
      }
    });
  };

  const handleExpandAll = () => {
    if (!subject.syllabus?.units) return;
    setOpenUnits(subject.syllabus.units.map((u) => `unit-${u.unitNumber}`));
  };

  const handleCollapseAll = () => {
    setOpenUnits([]);
  };

  const formattedDate = subject.syllabus?.verifiedAt
    ? new Date(subject.syllabus.verifiedAt).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "March 1, 2026";

  return (
    <div className="space-y-8">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href={`/subjects?year=${targetYear}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Subjects Catalogue</span>
        </Link>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs uppercase font-mono tracking-wider">
            NTA Code {subject.code}
          </Badge>
          <Badge variant="secondary" className="text-xs font-medium">
            CUET UG {targetYear}
          </Badge>
        </div>
      </div>

      {/* Main Subject Header Card */}
      <div className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {subject.categoryName}
              </span>
              {subject.hasVerifiedSyllabus && (
                <Badge
                  variant="default"
                  className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800 text-[11px] gap-1 font-medium"
                >
                  <CheckCircle2 className="h-3 w-3" />
                  Verified NTA Syllabus
                </Badge>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
              {subject.name}
            </h1>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-3xl">
              {subject.description}
            </p>

            {/* Quick Metrics */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-muted-foreground pt-2">
              <div className="flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-primary" />
                <span>
                  {subject.totalUnits > 0 ? `${subject.totalUnits} Syllabus Units` : "Pending Blueprint"}
                </span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-primary" />
                <span>
                  {subject.totalTopics > 0 ? `${subject.totalTopics} Sub-topics` : "Pending Blueprint"}
                </span>
              </div>
              {subject.hasVerifiedSyllabus && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Verified {formattedDate}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Action button */}
          <div className="shrink-0 flex flex-col items-start lg:items-end gap-2">
            <Button
              size="lg"
              variant={isSelected ? "default" : "outline"}
              onClick={handleToggle}
              disabled={isPending}
              className={`h-11 px-6 font-semibold transition-all shadow-sm ${
                isSelected
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "border-primary text-primary hover:bg-primary/5 dark:border-primary/60"
              }`}
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </span>
              ) : isSelected ? (
                <span className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  Enrolled in My Subjects
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add to My Preparation List
                </span>
              )}
            </Button>

            {errorMessage && (
              <p className="text-xs text-rose-600 dark:text-rose-400 max-w-xs text-left lg:text-right">
                {errorMessage}
              </p>
            )}
            <p className="text-[11px] text-muted-foreground">
              {isSelected
                ? "This subject appears in your practice dashboard"
                : "Add to customize your mock test and practice tests"}
            </p>
          </div>
        </div>
      </div>

      {/* Official NTA Verification & Source Citation */}
      {subject.hasVerifiedSyllabus && subject.syllabus ? (
        <div className="rounded-xl border border-border/80 bg-muted/30 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary shrink-0" />
              <span className="font-semibold text-foreground">Official Source Reference:</span>
              <span className="text-muted-foreground">{subject.syllabus.sourceDocument}</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              All question pools and practice tests strictly adhere to this verified syllabus
              specification.
            </p>
          </div>

          <a
            href={subject.syllabus.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline shrink-0"
          >
            <span>Verify on NTA Portal</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      ) : null}

      {/* Syllabus Content Breakdown */}
      {subject.hasVerifiedSyllabus && subject.syllabus && subject.syllabus.units.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">
              Syllabus Units & Topics Breakdown
            </h2>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExpandAll}
                className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1"
              >
                <Maximize2 className="h-3.5 w-3.5" />
                <span>Expand All</span>
              </Button>
              <span className="text-border">|</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCollapseAll}
                className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1"
              >
                <Minimize2 className="h-3.5 w-3.5" />
                <span>Collapse All</span>
              </Button>
            </div>
          </div>

          {/* Radix Accordion */}
          <Accordion
            type="multiple"
            value={openUnits}
            onValueChange={setOpenUnits}
            className="space-y-3"
          >
            {subject.syllabus.units.map((unit) => (
              <AccordionItem
                key={`unit-${unit.unitNumber}`}
                value={`unit-${unit.unitNumber}`}
                className="rounded-xl border border-border bg-card px-5 transition-all data-[state=open]:shadow-xs"
              >
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3 text-left">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                      {unit.unitNumber}
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{unit.title}</h3>
                      <p className="text-xs font-normal text-muted-foreground">
                        {unit.topics.length} {unit.topics.length === 1 ? "Topic" : "Topics"}
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="pt-2 pb-5 text-foreground">
                  {unit.description && (
                    <div className="mb-4 rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground leading-relaxed border border-border/40">
                      {unit.description}
                    </div>
                  )}

                  <div className="space-y-4">
                    {unit.topics.map((topic) => (
                      <div
                        key={topic.id}
                        className="rounded-lg border border-border/60 bg-background/50 p-4 space-y-2.5"
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-xs font-bold text-primary shrink-0 mt-0.5">
                            {unit.unitNumber}.{topic.order}
                          </span>
                          <h4 className="text-xs sm:text-sm font-semibold text-foreground">
                            {topic.title}
                          </h4>
                        </div>

                        {topic.subtopics.length > 0 && (
                          <ul className="ml-5 space-y-1.5 border-l-2 border-primary/20 pl-3">
                            {topic.subtopics.map((subtopic) => (
                              <li
                                key={subtopic.id}
                                className="text-xs text-muted-foreground leading-relaxed flex items-start gap-1.5"
                              >
                                <span className="text-primary/70 shrink-0">•</span>
                                <span>{subtopic.title}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      ) : (
        /* Empty / Unverified State — Zero Hallucination Guarantee */
        <div className="rounded-2xl border border-amber-200/80 bg-amber-50/40 p-8 sm:p-12 text-center dark:border-amber-900/60 dark:bg-amber-950/20">
          <AlertTriangle className="mx-auto h-12 w-12 text-amber-600 dark:text-amber-500 mb-4" />
          <h2 className="text-lg sm:text-xl font-bold text-foreground mb-2">
            The syllabus for this subject has not been published or verified yet.
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed mb-6">
            MockMate adheres strictly to officially published NTA blueprints. To guarantee 100%
            academic accuracy, we never fabricate, synthesize, or estimate examination syllabi. As
            soon as the National Testing Agency publishes the detailed information bulletin for{" "}
            <strong>{subject.name}</strong> for CUET UG {targetYear}, our academic review team will
            index and release the verified unit breakdown here.
          </p>

          <div className="inline-flex flex-col sm:flex-row items-center gap-3">
            <a
              href="https://exams.nta.ac.in/CUET-UG/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-4 py-2 text-xs font-semibold text-background hover:bg-foreground/90 transition-colors shadow-sm"
            >
              <span>Check Official NTA CUET Portal</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>

            <Link
              href={`/subjects?year=${targetYear}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
            >
              Browse Other Subjects
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
