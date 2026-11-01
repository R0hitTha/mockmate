import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import {
  FileCheck2,
  Clock,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  BookOpen,
  ArrowRight,
  Layers,
  Sparkles,
  Target,
  Check,
  GraduationCap,
} from "lucide-react";
import { PublicLayout } from "@/components/layout/public-layout";
import { Container } from "@/components/layout/container";
import { ResponsiveGrid } from "@/components/layout/responsive-grid";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/layout/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CBTPaletteItem } from "@/components/cbt/cbt-palette-item";
import { CBTOptionItem } from "@/components/cbt/cbt-option-item";
import { CBTTimer } from "@/components/cbt/cbt-timer";
import { CBTQuestionContainer } from "@/components/cbt/cbt-question-container";
import { StatCard } from "@/components/data-display/stat-card";
import { StatusIndicator } from "@/components/data-display/status-indicator";

export const metadata: Metadata = {
  title: "MockMate — Prepare Smarter, Practice Better, Perform with Confidence",
  description:
    "The dedicated preparation and CBT mock test platform for CUET UG 2026 & 2027 aspirants. Realistic exam simulation, subject practice, and actionable weakness analytics.",
};

export default function HomePage() {
  return (
    <PublicLayout>
      {/* SECTION 2: HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-16 md:pb-28 border-b border-border bg-gradient-to-b from-surface via-background to-background">
        <Container size="lg">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-300 text-xs font-semibold">
              <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
              <span>Exclusively Designed for CUET UG 2026 & 2027 Aspirants</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-foreground tracking-tight leading-[1.15]">
              Prepare Smarter. Practice Better.{" "}
              <span className="text-primary dark:text-blue-400">
                Perform with Confidence.
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl font-normal">
              Your CUET preparation deserves more than random practice. Prepare with
              realistic mock examinations, subject-wise tests, detailed solutions, and
              meaningful performance insights.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button size="lg" asChild className="h-12 px-7 text-sm font-bold shadow-md">
                <Link href="/register">
                  Start Preparing Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="h-12 px-7 text-sm font-semibold"
              >
                <Link href="/features">Explore Features</Link>
              </Button>
            </div>

            {/* Quick Proof Badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs font-medium text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                Official NTA CBT Exam Interface
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                Detailed Explanations for Every Question
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                Zero Mandatory Paid AI Dependencies
              </span>
            </div>
          </div>

          {/* Illustrative Product UI Preview */}
          <div className="mt-14 max-w-5xl mx-auto rounded-2xl border border-border bg-surface p-2 sm:p-4 shadow-xl">
            <div className="flex items-center justify-between px-3 py-2 border-b border-border/80 text-xs text-muted-foreground mb-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-400/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-400/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-400/80 inline-block" />
                <span className="ml-2 font-mono text-[11px]">
                  mockmate.in/exam/cuet-ug-mathematics-mock-01
                </span>
              </div>
              <Badge variant="outline" className="text-[10px]">
                Preview Simulation
              </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <CBTQuestionContainer
                  questionNumber={14}
                  totalQuestions={50}
                  sectionName="Section II: Domain Subject (Mathematics)"
                  marksPositive={5}
                  marksNegative={1}
                  questionText="If A and B are two symmetric matrices of the same order, then the matrix (AB - BA) is always which of the following?"
                  actionBar={
                    <div className="flex items-center justify-between w-full">
                      <Button variant="cbt" size="sm">
                        Clear Response
                      </Button>
                      <Button size="sm">
                        Save & Next
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </div>
                  }
                >
                  <CBTOptionItem label="A" text="A symmetric matrix" />
                  <CBTOptionItem label="B" text="A skew-symmetric matrix" selected />
                  <CBTOptionItem label="C" text="A null matrix" />
                  <CBTOptionItem label="D" text="An identity matrix" />
                </CBTQuestionContainer>
              </div>

              <div className="space-y-3">
                <Card className="h-full">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
                        Live Exam Timer
                      </CardTitle>
                      <CBTTimer totalSeconds={2340} />
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-2 space-y-4">
                    <div className="space-y-1.5">
                      <p className="text-xs font-semibold text-foreground">
                        Question Palette Status
                      </p>
                      <div className="grid grid-cols-5 gap-1.5 pt-1">
                        <CBTPaletteItem number={1} status="answered" size="sm" />
                        <CBTPaletteItem number={2} status="answered" size="sm" />
                        <CBTPaletteItem number={3} status="answered" size="sm" />
                        <CBTPaletteItem number={4} status="not-answered" size="sm" />
                        <CBTPaletteItem number={5} status="marked" size="sm" />
                        <CBTPaletteItem
                          number={6}
                          status="answered-and-marked"
                          size="sm"
                        />
                        <CBTPaletteItem number={7} status="unvisited" size="sm" />
                        <CBTPaletteItem number={8} status="unvisited" size="sm" />
                        <CBTPaletteItem number={9} status="unvisited" size="sm" />
                        <CBTPaletteItem number={10} status="unvisited" size="sm" />
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/60 text-xs text-blue-900 dark:text-blue-300">
                      <p className="font-semibold">CUET Marking Policy</p>
                      <p className="text-[11px] mt-0.5 opacity-90">
                        +5 marks for correct attempt, -1 mark deducted for incorrect
                        response.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* SECTION 3: THE PREPARATION PROBLEM */}
      <section className="py-16 sm:py-24 border-b border-border bg-surface">
        <Container size="lg">
          <div className="max-w-2xl mx-auto text-center space-y-3 mb-12">
            <Badge variant="secondary">The Reality of CUET</Badge>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              Why General Prep Tools Fall Short for CUET Aspirants
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              CUET UG has a distinct examination pattern, strict section-wise timing, and
              negative marking. Relying on generic multi-exam test portals leaves critical
              gaps in preparation.
            </p>
          </div>

          <ResponsiveGrid cols={4}>
            <Card hoverEffect>
              <CardContent className="p-5 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400 flex items-center justify-center font-bold">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-foreground">
                  Scattered Materials
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Questions are scattered across old CBSE question banks and NEET/JEE
                  portals that do not reflect the true NTA CUET format.
                </p>
              </CardContent>
            </Card>

            <Card hoverEffect>
              <CardContent className="p-5 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400 flex items-center justify-center font-bold">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-foreground">
                  Unfamiliar CBT Engine
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Students sit for paper exams throughout Class 12, leaving them
                  unprepared for NTA palette navigation, timers, and screen pacing.
                </p>
              </CardContent>
            </Card>

            <Card hoverEffect>
              <CardContent className="p-5 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 flex items-center justify-center font-bold">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-foreground">
                  Score-Only Feedback
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Getting a raw score like 140/200 does not explain which sub-topics
                  caused negative marking or where revision is required.
                </p>
              </CardContent>
            </Card>

            <Card hoverEffect>
              <CardContent className="p-5 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400 flex items-center justify-center font-bold">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-foreground">
                  Unstructured Revision
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Without evidence-based weakness tagging, students waste time reviewing
                  chapters they already know instead of targeted gaps.
                </p>
              </CardContent>
            </Card>
          </ResponsiveGrid>
        </Container>
      </section>

      {/* SECTION 4: THE MOCKMATE SOLUTION */}
      <section className="py-16 sm:py-24 border-b border-border bg-background">
        <Container size="lg">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <Badge variant="default">The MockMate Approach</Badge>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
                A Closed-Loop Preparation Platform Engineered Around Improvement
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                MockMate does not stop at giving you a test score. It closes the loop by
                turning your attempt history into high-resolution performance diagnostics,
                question-level solution breakdowns, and specific topic revision targets.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3.5">
                  <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">
                      CUET-Only Dedicated Scope
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                      Zero multi-exam clutter. Every question and mock is calibrated
                      strictly against Sections IA, IB, II, and III.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">
                      Server-Authoritative Integrity
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                      Correct answers stay server-side during active tests. Accurate
                      timing, auto-save, and refresh recovery ensure exam reliability.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">
                      Granular Chapter-Level Weakness Flagging
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                      Identifies specific concepts where negative marking occurs and
                      suggests the exact chapter tests to attempt next.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Illustrative Performance Insight Card */}
            <div className="rounded-2xl border border-border bg-surface p-6 shadow-md space-y-5">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h4 className="text-sm font-bold text-foreground">
                    Section II: Domain Diagnostic Card
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Physics, Chemistry & Mathematics Overview
                  </p>
                </div>
                <Badge variant="success">Strong Progress</Badge>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-muted/60">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase">
                    Accuracy Rate
                  </span>
                  <p className="text-xl font-bold font-mono text-emerald-600 mt-1">
                    86.5%
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    +4.2% over last 3 mocks
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-muted/60">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase">
                    Avg Speed
                  </span>
                  <p className="text-xl font-bold font-mono text-blue-600 mt-1">
                    54s / Q
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Within NTA 60s budget
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <span className="text-xs font-semibold text-foreground">
                  Recommended Revision Target
                </span>
                <div className="p-3 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-950/30 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                      Electromagnetic Induction (Ch 6)
                    </p>
                    <p className="text-[11px] text-amber-700 dark:text-amber-300">
                      3 negative penalties in recent mock
                    </p>
                  </div>
                  <Button size="sm" variant="outline" className="text-xs h-7">
                    Practice Topic
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* SECTION 5: CORE FEATURES */}
      <section id="features" className="py-16 sm:py-24 border-b border-border bg-surface">
        <Container size="lg">
          <div className="max-w-2xl mx-auto text-center space-y-3 mb-14">
            <Badge variant="secondary">Engineered for Results</Badge>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              Comprehensive Tools for Serious Preparation
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Every feature in MockMate has a single purpose: helping you understand your
              readiness and earn higher scores in CUET UG.
            </p>
          </div>

          <ResponsiveGrid cols={4}>
            {/* Feature 1 */}
            <Card hoverEffect>
              <CardContent className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 flex items-center justify-center">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-foreground">
                  Realistic Full Mocks
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Full-length papers replicating actual NTA question counts, difficulty,
                  and marking rules (+5 / -1).
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card hoverEffect>
              <CardContent className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-foreground">
                  Subject-Wise Practice
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Target individual domain subjects like Physics, Mathematics, Economics,
                  or Language comprehension directly.
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card hoverEffect>
              <CardContent className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400 flex items-center justify-center">
                  <Target className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-foreground">Topic-Wise Tests</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Chapter and concept-level short tests to master individual syllabus
                  units before full-length mocks.
                </p>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card hoverEffect>
              <CardContent className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-400 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-foreground">
                  Step-by-Step Solutions
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Clear, verified explanations and concept rationales for every single
                  question in the question library.
                </p>
              </CardContent>
            </Card>

            {/* Feature 5 */}
            <Card hoverEffect>
              <CardContent className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-foreground">
                  Performance Analytics
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Visual breakdowns of accuracy, time spent per question, and score trends
                  across test attempts.
                </p>
              </CardContent>
            </Card>

            {/* Feature 6 */}
            <Card hoverEffect>
              <CardContent className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-foreground">
                  Weak Topic Flagging
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Automated detection of concepts causing consistent mark deductions so
                  you never repeat mistakes.
                </p>
              </CardContent>
            </Card>

            {/* Feature 7 */}
            <Card hoverEffect>
              <CardContent className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-400 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-foreground">
                  Personalized Study Plan
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Actionable suggestions recommending the next mock, topic test, or
                  formula sheet based on your data.
                </p>
              </CardContent>
            </Card>

            {/* Feature 8 */}
            <Card hoverEffect>
              <CardContent className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-foreground">Practice History</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Immutable attempt logs allowing you to review old tests, bookmark tricky
                  questions, and track score gains.
                </p>
              </CardContent>
            </Card>
          </ResponsiveGrid>
        </Container>
      </section>

      {/* SECTION 6: HOW MOCKMATE WORKS */}
      <section
        id="how-it-works"
        className="py-16 sm:py-24 border-b border-border bg-background"
      >
        <Container size="lg">
          <div className="max-w-2xl mx-auto text-center space-y-3 mb-14">
            <Badge variant="secondary">Clear Student Workflow</Badge>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              How MockMate Works: Step-by-Step
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              A streamlined, evidence-backed preparation loop that takes you from
              diagnostic evaluation to exam mastery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="p-6 rounded-2xl border border-border bg-surface relative space-y-3">
              <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">
                1
              </span>
              <h3 className="text-base font-bold text-foreground">Create Your Account</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Sign up in seconds and establish your private, secure preparation profile.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl border border-border bg-surface relative space-y-3">
              <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">
                2
              </span>
              <h3 className="text-base font-bold text-foreground">
                Select Year & Subjects
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Choose CUET UG 2026 or 2027 and pick your targeted Languages, Domains, and
                General Test sections.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl border border-border bg-surface relative space-y-3">
              <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">
                3
              </span>
              <h3 className="text-base font-bold text-foreground">Choose Test Format</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Select a full-length timed mock examination, a subject test, or targeted
                chapter practice.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-2xl border border-border bg-surface relative space-y-3">
              <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">
                4
              </span>
              <h3 className="text-base font-bold text-foreground">
                Attempt the CBT Exam
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Experience authentic NTA-style timers, question palette navigation, and
                distraction-free testing.
              </p>
            </div>

            {/* Step 5 */}
            <div className="p-6 rounded-2xl border border-border bg-surface relative space-y-3">
              <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">
                5
              </span>
              <h3 className="text-base font-bold text-foreground">
                Instant Server Scoring
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Review your exact marks (+5 / -1), question-by-question breakdown, and
                detailed solution rationales.
              </p>
            </div>

            {/* Step 6 */}
            <div className="p-6 rounded-2xl border border-border bg-surface relative space-y-3">
              <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">
                6
              </span>
              <h3 className="text-base font-bold text-foreground">
                Track Insights & Improve
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Identify weak topics, reduce negative marks, and increase scores across
                repeated attempts.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* SECTION 7: CUET PREPARATION COVERAGE */}
      <section id="subjects" className="py-16 sm:py-24 border-b border-border bg-surface">
        <Container size="lg">
          <div className="max-w-2xl mx-auto text-center space-y-3 mb-14">
            <Badge variant="secondary">Curriculum Architecture</Badge>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              Structured Across All Three Official CUET Sections
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Every question in MockMate is categorized according to the official National
              Testing Agency syllabus structure.
            </p>
          </div>

          <ResponsiveGrid cols={3}>
            {/* Section I */}
            <Card hoverEffect className="flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="outline">Section IA & IB</Badge>
                  <span className="text-xs font-mono text-muted-foreground">
                    45–50 Mins
                  </span>
                </div>
                <CardTitle className="text-lg mt-2">Languages</CardTitle>
                <CardDescription>
                  Reading comprehension, literary aptitude, vocabulary, synonyms &
                  antonyms.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs text-muted-foreground mt-auto">
                <div className="p-3 rounded-lg bg-muted/60 space-y-1">
                  <p className="font-semibold text-foreground">Key Focus Areas:</p>
                  <p>English, Hindi, and regional language comprehension passages.</p>
                </div>
                <p className="text-[11px] font-medium text-slate-500">
                  Pattern: Attempt 40 questions out of 50.
                </p>
              </CardContent>
            </Card>

            {/* Section II */}
            <Card hoverEffect className="flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="default">Section II</Badge>
                  <span className="text-xs font-mono text-muted-foreground">
                    45–60 Mins
                  </span>
                </div>
                <CardTitle className="text-lg mt-2">Domain Subjects</CardTitle>
                <CardDescription>
                  Class 12 syllabus-based domain disciplines mapped to university
                  cut-offs.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs text-muted-foreground mt-auto">
                <div className="p-3 rounded-lg bg-muted/60 space-y-1">
                  <p className="font-semibold text-foreground">Supported Disciplines:</p>
                  <p>
                    Mathematics, Physics, Chemistry, Economics, Accountancy, and more.
                  </p>
                </div>
                <p className="text-[11px] font-medium text-slate-500">
                  Pattern: Attempt 40 questions out of 50.
                </p>
              </CardContent>
            </Card>

            {/* Section III */}
            <Card hoverEffect className="flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="outline">Section III</Badge>
                  <span className="text-xs font-mono text-muted-foreground">60 Mins</span>
                </div>
                <CardTitle className="text-lg mt-2">General Test</CardTitle>
                <CardDescription>
                  General knowledge, current affairs, numerical ability, and logical
                  reasoning.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs text-muted-foreground mt-auto">
                <div className="p-3 rounded-lg bg-muted/60 space-y-1">
                  <p className="font-semibold text-foreground">Key Focus Areas:</p>
                  <p>Quantitative aptitude, logical deductions, data interpretation.</p>
                </div>
                <p className="text-[11px] font-medium text-slate-500">
                  Pattern: Attempt 50 questions out of 60.
                </p>
              </CardContent>
            </Card>
          </ResponsiveGrid>

          <div className="mt-8 text-center">
            <Button variant="outline" asChild size="sm">
              <Link href="/cuet-subjects">
                View Full Subject & Syllabus Breakdown
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Link>
            </Button>
          </div>
        </Container>
      </section>

      {/* SECTION 8: CBT EXPERIENCE PREVIEW */}
      <section className="py-16 sm:py-24 border-b border-border bg-background">
        <Container size="lg">
          <div className="max-w-2xl mx-auto text-center space-y-3 mb-14">
            <Badge variant="secondary">CBT Exam Engine</Badge>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              Familiarity with the Exam Interface is Half the Battle
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Never be caught off guard on exam day. Practice in the exact same
              computer-based test environment used by the National Testing Agency.
            </p>
          </div>

          <div className="max-w-4xl mx-auto p-4 sm:p-6 rounded-2xl border border-border bg-surface shadow-lg space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-muted/50 text-xs">
              <div className="flex items-center gap-2">
                <StatusIndicator status="online" label="Secure Server Connection" pulse />
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <span className="font-medium text-muted-foreground">
                  NTA Simulation Mode
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Time Remaining:</span>
                <CBTTimer totalSeconds={2700} />
              </div>
            </div>

            <CBTQuestionContainer
              questionNumber={21}
              totalQuestions={50}
              sectionName="Section II: Economics (Micro & Macro)"
              marksPositive={5}
              marksNegative={1}
              questionText="In a perfectly competitive market, when a firm produces at a level where Marginal Cost (MC) exceeds Marginal Revenue (MR), what should the firm do to maximize its profit?"
              actionBar={
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <Button variant="cbt" size="sm">
                      Clear Response
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-purple-300 text-purple-700 dark:border-purple-800 dark:text-purple-300"
                    >
                      Mark for Review & Next
                    </Button>
                  </div>
                  <Button size="sm">
                    Save & Next
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              }
            >
              <CBTOptionItem
                label="A"
                text="Increase its output level until MC equals price"
              />
              <CBTOptionItem
                label="B"
                text="Reduce its output level to the point where MC equals MR"
                selected
              />
              <CBTOptionItem
                label="C"
                text="Shut down production immediately in the short run"
              />
              <CBTOptionItem label="D" text="Raise the market price of the good" />
            </CBTQuestionContainer>
          </div>
        </Container>
      </section>

      {/* SECTION 9: PERFORMANCE & IMPROVEMENT */}
      <section className="py-16 sm:py-24 border-b border-border bg-surface">
        <Container size="lg">
          <div className="max-w-2xl mx-auto text-center space-y-3 mb-14">
            <Badge variant="secondary">Analytics & Insights</Badge>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              Actionable Evidence to Guide Your Revision
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              MockMate turns raw attempt data into targeted learning recommendations,
              helping you eliminate negative marks before the real exam.
            </p>
          </div>

          <ResponsiveGrid cols={3}>
            <StatCard
              title="Accuracy in Domain Subjects"
              value="88.2%"
              trend={{ value: "+5.1%", isPositive: true }}
              description="Calculated across Section II attempts"
              icon={CheckCircle2}
            />
            <StatCard
              title="Average Time Budget"
              value="51s"
              trend={{ value: "-6s", isPositive: true }}
              description="9 seconds faster than NTA per-question limit"
              icon={Clock}
            />
            <StatCard
              title="Revision Recommendations"
              value="2 Chapters"
              trend={{ value: "-2", isPositive: true }}
              description="Down from 4 flagged chapters last week"
              icon={Target}
            />
          </ResponsiveGrid>
        </Container>
      </section>

      {/* SECTION 10: FREQUENTLY ASKED QUESTIONS */}
      <section className="py-16 sm:py-24 border-b border-border bg-background">
        <Container size="default">
          <div className="max-w-2xl mx-auto text-center space-y-3 mb-12">
            <Badge variant="secondary">Have Questions?</Badge>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Everything you need to know about MockMate, CUET UG preparation, and our
              mock testing platform.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-xs">
            <Accordion type="single" collapsible className="w-full space-y-2">
              <AccordionItem value="item-1">
                <AccordionTrigger>What is MockMate?</AccordionTrigger>
                <AccordionContent>
                  MockMate is a focused online examination and practice platform built
                  specifically for CUET UG aspirants in India. It simulates the actual
                  computer-based test (CBT) interface, provides detailed
                  question-by-question solutions, and analyzes your performance by chapter
                  to guide revision.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger>
                  Is MockMate specifically designed for CUET?
                </AccordionTrigger>
                <AccordionContent>
                  Yes. MockMate is strictly CUET-only. We do not support JEE, NEET, or
                  UPSC. Every mock exam, topic test, and marking rule (+5 / -1) is
                  tailored exclusively to the official National Testing Agency (NTA) CUET
                  UG format.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger>What is included in CUET mock tests?</AccordionTrigger>
                <AccordionContent>
                  Mock tests include realistic question sets for Languages (Section
                  IA/IB), Domain Subjects (Section II), and General Test (Section III).
                  Each test includes authentic timing, question palette navigation,
                  negative marking calculations, and step-by-step verified explanations
                  upon submission.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger>
                  Can I practice individual subjects and chapters?
                </AccordionTrigger>
                <AccordionContent>
                  Yes. In addition to full-length timed mocks, MockMate provides
                  subject-wise and topic-wise practice packs. If you are struggling with a
                  specific chapter (e.g. Calculus in Mathematics or Macroeconomics in
                  Economics), you can practice targeted chapter tests.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger>
                  Will I receive detailed solutions after submitting?
                </AccordionTrigger>
                <AccordionContent>
                  Yes. Immediately after your attempt is scored server-side, you receive a
                  comprehensive solution key with step-by-step mathematical derivations,
                  grammatical rules, and conceptual explanations for every question.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6">
                <AccordionTrigger>
                  How does MockMate track my performance?
                </AccordionTrigger>
                <AccordionContent>
                  MockMate analyzes your test history to highlight accuracy rates, time
                  spent per question, and specific sub-topics where negative marks
                  occurred. It highlights weak areas so you know exactly what to revise
                  next.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-7">
                <AccordionTrigger>
                  Is MockMate suitable for CUET UG 2026 and 2027?
                </AccordionTrigger>
                <AccordionContent>
                  Yes. MockMate supports Class 12 students preparing for CUET UG 2026 as
                  well as Class 11 students starting early preparation for CUET UG 2027.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-8">
                <AccordionTrigger>Is there a free plan?</AccordionTrigger>
                <AccordionContent>
                  Yes. Every registered student receives access to free diagnostic mock
                  tests and chapter practice sets to experience the CBT interface and
                  solution quality before deciding to purchase extended mock packs.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </Container>
      </section>

      {/* SECTION 11: FINAL CONVERSION CTA */}
      <section className="py-16 sm:py-24 border-b border-border bg-gradient-to-b from-surface to-background">
        <Container size="default">
          <div className="p-8 sm:p-12 rounded-3xl border border-primary/20 bg-primary text-primary-foreground text-center space-y-6 shadow-xl relative overflow-hidden">
            <div className="max-w-2xl mx-auto space-y-4 relative z-10">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-white">
                Start Your Preparation Today
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Your CUET Preparation Starts with the Right Practice.
              </h2>
              <p className="text-sm sm:text-base text-blue-100 leading-relaxed max-w-xl mx-auto font-normal">
                Build confidence through structured practice, authentic CBT simulation,
                and a better understanding of your performance.
              </p>
              <div className="pt-2">
                <Button
                  size="lg"
                  asChild
                  className="bg-white text-slate-900 hover:bg-slate-100 font-bold h-12 px-8 text-sm shadow-md"
                >
                  <Link href="/register">Get Started with MockMate</Link>
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </PublicLayout>
  );
}
