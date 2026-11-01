import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Clock, GraduationCap } from "lucide-react";
import { PublicLayout } from "@/components/layout/public-layout";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "CUET Subjects & Syllabus Structure — MockMate",
  description:
    "Comprehensive overview of CUET UG 2026/2027 sections: Section IA & IB Languages, Section II Domain Subjects, and Section III General Test.",
};

export default function CUETSubjectsPage() {
  const sections = [
    {
      id: "languages",
      code: "Section IA & IB",
      title: "Languages",
      duration: "45 Minutes",
      pattern: "40 Questions to be attempted out of 50",
      marks: "Total: 200 Marks (+5 per correct, -1 per incorrect)",
      description:
        "Tests reading comprehension across factual, narrative, and literary passages, along with vocabulary, literary aptitude, idioms, and verbal ability.",
      subCategories: [
        {
          name: "Section IA: 13 Main Languages",
          detail:
            "English, Hindi, Bengali, Gujarati, Kannada, Malayalam, Marathi, Odia, Punjabi, Tamil, Telugu, Urdu, and Assamese.",
        },
        {
          name: "Section IB: 20 Additional Languages",
          detail:
            "French, Spanish, German, Sanskrit, Arabic, Persian, Russian, Italian, Japanese, Chinese, and others.",
        },
      ],
      prepTip:
        "Focus heavily on speed reading and elimination techniques. Passages are lengthy and require disciplined pacing.",
    },
    {
      id: "domain",
      code: "Section II",
      title: "Domain Subjects",
      duration: "45 to 60 Minutes (subject dependent)",
      pattern: "40 Questions to be attempted out of 50",
      marks: "Total: 200 Marks (+5 per correct, -1 per incorrect)",
      description:
        "Evaluates mastery over specific academic disciplines based on the Class 12 NCERT curriculum. Crucial for undergraduate degree stream admissions.",
      subCategories: [
        {
          name: "Science Stream Domains",
          detail:
            "Mathematics, Physics, Chemistry, Biology, Computer Science / Informatics Practices.",
        },
        {
          name: "Commerce Stream Domains",
          detail: "Accountancy, Business Studies, Economics, Commercial Mathematics.",
        },
        {
          name: "Humanities & Social Sciences",
          detail:
            "History, Political Science, Geography, Sociology, Psychology, Legal Studies.",
        },
      ],
      prepTip:
        "Every domain question is drawn strictly from the Class 12 NCERT syllabus. Thorough conceptual revision of NCERT textbooks is paramount.",
    },
    {
      id: "general",
      code: "Section III",
      title: "General Test (GT)",
      duration: "60 Minutes",
      pattern: "50 Questions to be attempted out of 60",
      marks: "Total: 250 Marks (+5 per correct, -1 per incorrect)",
      description:
        "Assesses general awareness, current affairs, general mental ability, numerical ability, and logical reasoning for interdisciplinary and vocational degree admissions.",
      subCategories: [
        {
          name: "General Knowledge & Current Affairs",
          detail:
            "National and international events, basic science, Indian polity, geography, and awards.",
        },
        {
          name: "Quantitative & Numerical Ability",
          detail:
            "Arithmetic up to Class 8, percentages, ratio & proportion, algebra, geometry, mensuration.",
        },
        {
          name: "Reasoning & Mental Ability",
          detail:
            "Logical sequences, coding-decoding, blood relations, series completion, data interpretation.",
        },
      ],
      prepTip:
        "Speed and accuracy are essential. With 50 questions in 60 minutes, budgeting 60 seconds per item is critical.",
    },
  ];

  return (
    <PublicLayout>
      <div className="py-12 border-b border-border bg-gradient-to-b from-surface to-background">
        <Container size="lg">
          <PageHeader
            title="CUET UG Syllabus & Subject Architecture"
            description="Understand how the official NTA examination is structured across Languages, Domain Subjects, and the General Aptitude Test."
            badge={<Badge variant="default">NTA Pattern 2026/2027</Badge>}
            actions={
              <Button asChild>
                <Link href="/register">Practice Subject Tests</Link>
              </Button>
            }
          />
        </Container>
      </div>

      <div className="py-14 sm:py-20 bg-background">
        <Container size="lg" className="space-y-12">
          {sections.map((section) => (
            <div
              key={section.id}
              id={section.id}
              className="p-6 sm:p-10 rounded-2xl border border-border bg-surface shadow-xs space-y-6 scroll-mt-24"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-5">
                <div>
                  <Badge variant="secondary" className="text-xs">
                    {section.code}
                  </Badge>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight mt-1.5">
                    {section.title}
                  </h2>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-md bg-muted text-xs font-mono font-medium text-slate-700 dark:text-slate-300">
                    <Clock className="w-3.5 h-3.5 mr-1 text-slate-500" />
                    {section.duration}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-900 text-xs font-mono font-semibold">
                    {section.pattern}
                  </span>
                </div>
              </div>

              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {section.description}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {section.subCategories.map((sub, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl border border-border bg-muted/40 space-y-2"
                  >
                    <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">
                      {sub.name}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {sub.detail}
                    </p>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/60 flex items-start gap-3">
                <GraduationCap className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-xs text-blue-900 dark:text-blue-300">
                  <span className="font-bold">Preparation Strategy: </span>
                  {section.prepTip}
                </div>
              </div>
            </div>
          ))}

          {/* Section: Marking Scheme Summary */}
          <div
            id="marking"
            className="p-6 sm:p-8 rounded-2xl border border-border bg-surface space-y-4"
          >
            <h3 className="text-lg font-bold text-foreground tracking-tight">
              Official CUET Marking Scheme Summary
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Every section strictly adheres to the official NTA scoring formula:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-center">
                <p className="text-2xl font-black font-mono text-emerald-600">+5</p>
                <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 mt-1">
                  Correct Response
                </p>
                <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400 mt-0.5">
                  Awarded for every right choice
                </p>
              </div>

              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-center">
                <p className="text-2xl font-black font-mono text-red-600">-1</p>
                <p className="text-xs font-semibold text-red-800 dark:text-red-300 mt-1">
                  Incorrect Response
                </p>
                <p className="text-[11px] text-red-700/80 dark:text-red-400 mt-0.5">
                  Deducted for wrong choices
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
                <p className="text-2xl font-black font-mono text-slate-700 dark:text-slate-300">
                  0
                </p>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1">
                  Unattempted
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                  No penalty for skipped questions
                </p>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </PublicLayout>
  );
}
