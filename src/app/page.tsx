"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  BookOpen,
  ArrowRight,
  RefreshCw,
  Sliders,
  BarChart3,
  Eye,
} from "lucide-react";
import { siteConfig } from "@/config/site";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert } from "@/components/feedback/alert";
import { ProgressBar } from "@/components/feedback/progress-bar";
import { Skeleton } from "@/components/feedback/skeleton";
import { LoadingSpinner } from "@/components/feedback/loading-spinner";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { ConfirmDialog } from "@/components/feedback/confirm-dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/layout/card";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { SectionHeader } from "@/components/layout/section-header";
import { ResponsiveGrid } from "@/components/layout/responsive-grid";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { StatCard } from "@/components/data-display/stat-card";
import { StatusIndicator } from "@/components/data-display/status-indicator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/data-display/table";
import { CBTPaletteItem, type CBTPaletteStatus } from "@/components/cbt/cbt-palette-item";
import { CBTOptionItem } from "@/components/cbt/cbt-option-item";
import { CBTTimer } from "@/components/cbt/cbt-timer";
import { CBTQuestionContainer } from "@/components/cbt/cbt-question-container";

export default function DesignSystemShowcasePage() {
  // Interactive state fixtures
  const [btnLoading, setBtnLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [switchChecked, setSwitchChecked] = useState(true);
  const [checkboxChecked, setCheckboxChecked] = useState(true);
  const [radioSelected, setRadioSelected] = useState("phy");
  const [cbtOption, setCbtOption] = useState<string>("B");
  const [currentQuestion, setCurrentQuestion] = useState(4);
  const [progressVal, setProgressVal] = useState(65);

  const samplePaletteStates: { num: number; status: CBTPaletteStatus }[] = [
    { num: 1, status: "answered" },
    { num: 2, status: "answered" },
    { num: 3, status: "not-answered" },
    { num: 4, status: "answered" },
    { num: 5, status: "marked" },
    { num: 6, status: "answered-and-marked" },
    { num: 7, status: "unvisited" },
    { num: 8, status: "unvisited" },
    { num: 9, status: "unvisited" },
    { num: 10, status: "unvisited" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-200">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-surface/85 backdrop-blur-md">
        <Container size="lg" className="h-16 flex items-center justify-between">
          <Logo size="default" href="/" showTagline />

          <div className="flex items-center space-x-3">
            <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mr-1.5 animate-pulse" />
              Phase 2 Design System
            </span>
            <ThemeToggle />
            <Button size="sm" asChild variant="outline">
              <Link href="/api/health" target="_blank">
                Health Check
              </Link>
            </Button>
          </div>
        </Container>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-10">
        <Container size="lg" className="space-y-12">
          {/* Page Header */}
          <PageHeader
            title="MockMate Design System"
            description="The centralized, reusable component library and design token foundation powering CUET UG 2026/2027 preparation interfaces."
            badge={
              <Badge variant="default" className="text-xs">
                v0.2.0 • Phase 2
              </Badge>
            }
            actions={
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => setDialogOpen(true)}>
                  <Eye className="w-4 h-4 mr-1.5" />
                  Preview Dialog
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setBtnLoading(true);
                    setTimeout(() => setBtnLoading(false), 1500);
                  }}
                  isLoading={btnLoading}
                >
                  <RefreshCw className="w-4 h-4 mr-1.5" />
                  Simulate Action
                </Button>
              </div>
            }
          />

          {/* Breadcrumb Preview */}
          <div className="p-3 rounded-lg border border-border bg-surface flex items-center justify-between">
            <Breadcrumb
              items={[
                { label: "Design System", href: "/" },
                { label: "Component Library" },
                { label: "Interactive Specimen" },
              ]}
            />
            <span className="text-xs text-muted-foreground font-mono">
              Breadcrumb Primitive
            </span>
          </div>

          {/* Showcase Tabs */}
          <Tabs defaultValue="components" className="space-y-8">
            <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full max-w-xl">
              <TabsTrigger value="components">UI Components</TabsTrigger>
              <TabsTrigger value="cbt">CBT Examination</TabsTrigger>
              <TabsTrigger value="feedback">Feedback & Data</TabsTrigger>
              <TabsTrigger value="tokens">Design Tokens</TabsTrigger>
            </TabsList>

            {/* TAB 1: UI COMPONENTS */}
            <TabsContent value="components" className="space-y-10">
              {/* Buttons */}
              <section className="space-y-4">
                <SectionHeader
                  title="Buttons & Variants"
                  description="Standardized interactive buttons designed with high-contrast accessibility and loading states."
                />
                <Card>
                  <CardContent className="p-6 space-y-6">
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                        Visual Variants
                      </h4>
                      <div className="flex flex-wrap items-center gap-3">
                        <Button variant="default">Primary Default</Button>
                        <Button variant="secondary">Secondary Accent</Button>
                        <Button variant="outline">Outline</Button>
                        <Button variant="ghost">Ghost</Button>
                        <Button variant="destructive">Destructive</Button>
                        <Button variant="success">Success</Button>
                        <Button variant="cbt">CBT Exam Button</Button>
                        <Button variant="link">Link Style</Button>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                        Sizes & States
                      </h4>
                      <div className="flex flex-wrap items-center gap-3">
                        <Button size="sm">Small (sm)</Button>
                        <Button size="default">Default</Button>
                        <Button size="lg">Large (lg)</Button>
                        <Button isLoading>Submitting</Button>
                        <Button disabled>Disabled State</Button>
                        <IconButton aria-label="Settings action">
                          <Sliders className="w-4 h-4" />
                        </IconButton>
                        <LoadingSpinner label="Evaluating responses..." />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Form Controls */}
              <section className="space-y-4">
                <SectionHeader
                  title="Form Inputs & Selectors"
                  description="Accessible form controls with consistent focus rings, error states, and keyboard navigation."
                />
                <Card>
                  <CardContent className="p-6">
                    <ResponsiveGrid cols={3}>
                      {/* Text Input */}
                      <div className="space-y-2">
                        <Label htmlFor="exam-roll" required>
                          CUET Application Number
                        </Label>
                        <Input
                          id="exam-roll"
                          placeholder="e.g. 26010049281"
                          defaultValue="26010049281"
                        />
                        <p className="text-[11px] text-muted-foreground">
                          11-digit NTA application ID.
                        </p>
                      </div>

                      {/* Select Input */}
                      <div className="space-y-2">
                        <Label htmlFor="subject-select">Target Subject</Label>
                        <Select defaultValue="math">
                          <SelectTrigger id="subject-select">
                            <SelectValue placeholder="Select Subject" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="math">
                              Section II: Mathematics (319)
                            </SelectItem>
                            <SelectItem value="phy">Section II: Physics (322)</SelectItem>
                            <SelectItem value="chem">
                              Section II: Chemistry (306)
                            </SelectItem>
                            <SelectItem value="eng">Section IA: English (101)</SelectItem>
                            <SelectItem value="gt">
                              Section III: General Test (501)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-[11px] text-muted-foreground">
                          NTA syllabus domain mapping.
                        </p>
                      </div>

                      {/* Input with Error State */}
                      <div className="space-y-2">
                        <Label htmlFor="invalid-input" required>
                          Error Validation Specimen
                        </Label>
                        <Input
                          id="invalid-input"
                          error
                          defaultValue="invalid-format-input"
                        />
                        <p className="text-[11px] text-destructive font-medium">
                          Required field cannot contain special characters.
                        </p>
                      </div>
                    </ResponsiveGrid>

                    <div className="mt-6 pt-6 border-t border-border">
                      <ResponsiveGrid cols={3}>
                        {/* Radio Group */}
                        <div className="space-y-3">
                          <Label>Select Examination Year</Label>
                          <RadioGroup
                            value={radioSelected}
                            onValueChange={setRadioSelected}
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="phy" id="r1" />
                              <Label htmlFor="r1" className="font-normal cursor-pointer">
                                CUET UG 2026 Aspirant
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="chem" id="r2" />
                              <Label htmlFor="r2" className="font-normal cursor-pointer">
                                CUET UG 2027 Early Preparation
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>

                        {/* Checkbox & Switch */}
                        <div className="space-y-4">
                          <Label>Preferences</Label>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="c1"
                              checked={checkboxChecked}
                              onCheckedChange={(c) => setCheckboxChecked(!!c)}
                            />
                            <Label
                              htmlFor="c1"
                              className="font-normal cursor-pointer text-xs"
                            >
                              Enforce official NTA timer warnings
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="s1"
                              checked={switchChecked}
                              onCheckedChange={setSwitchChecked}
                            />
                            <Label
                              htmlFor="s1"
                              className="font-normal cursor-pointer text-xs"
                            >
                              Instant explanation review mode
                            </Label>
                          </div>
                        </div>

                        {/* Badges */}
                        <div className="space-y-2">
                          <Label>Tag & Status Badges</Label>
                          <div className="flex flex-wrap gap-2 pt-1">
                            <Badge variant="default">Primary</Badge>
                            <Badge variant="secondary">Secondary</Badge>
                            <Badge variant="success">Completed</Badge>
                            <Badge variant="warning">In Progress</Badge>
                            <Badge variant="destructive">Needs Review</Badge>
                            <Badge variant="outline">Language</Badge>
                            <Badge variant="cbt">SEC II</Badge>
                          </div>
                        </div>
                      </ResponsiveGrid>
                    </div>

                    {/* Textarea */}
                    <div className="mt-6 pt-6 border-t border-border space-y-2">
                      <Label htmlFor="study-notes">Personal Study Notes Area</Label>
                      <Textarea
                        id="study-notes"
                        placeholder="Add revision pointers or formulas for this chapter..."
                        defaultValue="Revision notes: Focus on calculus integration by parts and definite integrals for the upcoming full mock."
                      />
                    </div>
                  </CardContent>
                </Card>
              </section>
            </TabsContent>

            {/* TAB 2: CBT EXAMINATION FOUNDATION */}
            <TabsContent value="cbt" className="space-y-8">
              <SectionHeader
                title="CBT Examination Design Foundation"
                description="Distraction-free, server-authoritative CBT UI patterns mirroring the official NTA online test interface."
              />

              {/* Timer & Status Bar */}
              <div className="p-4 rounded-xl border border-border bg-surface flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    CBT Active Simulation
                  </span>
                  <StatusIndicator status="online" label="Server Synchronized" pulse />
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">Exam Timer:</span>
                  <CBTTimer totalSeconds={2640} />
                  <CBTTimer totalSeconds={240} isUrgent />
                </div>
              </div>

              {/* Exam Layout Demonstration */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2 Cols: Question Container */}
                <div className="lg:col-span-2">
                  <CBTQuestionContainer
                    questionNumber={currentQuestion}
                    totalQuestions={50}
                    sectionName="Section II: Mathematics (Core)"
                    marksPositive={5}
                    marksNegative={1}
                    questionText="Let f: ℝ → ℝ be defined by f(x) = x³ - 3x + 2. Which of the following statements is TRUE regarding the local extrema and critical points of the function?"
                    actionBar={
                      <>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="cbt"
                            size="sm"
                            onClick={() => setCbtOption("")}
                          >
                            Clear Response
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-purple-300 text-purple-700 dark:border-purple-800 dark:text-purple-300"
                            onClick={() => {
                              setCurrentQuestion((q) => Math.min(q + 1, 50));
                            }}
                          >
                            Mark for Review & Next
                          </Button>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => {
                            setCurrentQuestion((q) => Math.min(q + 1, 50));
                          }}
                        >
                          Save & Next
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </>
                    }
                  >
                    <CBTOptionItem
                      label="A"
                      text="f(x) has a local minimum at x = -1 and a local maximum at x = 1"
                      selected={cbtOption === "A"}
                      onClick={() => setCbtOption("A")}
                    />
                    <CBTOptionItem
                      label="B"
                      text="f(x) has a local maximum at x = -1 and a local minimum at x = 1"
                      selected={cbtOption === "B"}
                      onClick={() => setCbtOption("B")}
                    />
                    <CBTOptionItem
                      label="C"
                      text="f(x) is strictly increasing for all real x"
                      selected={cbtOption === "C"}
                      onClick={() => setCbtOption("C")}
                    />
                    <CBTOptionItem
                      label="D"
                      text="f(x) has no critical points in the open interval (-2, 2)"
                      selected={cbtOption === "D"}
                      onClick={() => setCbtOption("D")}
                    />
                  </CBTQuestionContainer>
                </div>

                {/* Right 1 Col: Question Palette */}
                <div className="space-y-4">
                  <Card>
                    <CardHeader className="pb-3 border-b border-border">
                      <CardTitle className="text-sm">Question Palette</CardTitle>
                      <CardDescription>
                        Click a number to navigate directly.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                      {/* Question Numbers Grid */}
                      <div className="grid grid-cols-5 gap-2">
                        {samplePaletteStates.map((item) => (
                          <CBTPaletteItem
                            key={item.num}
                            number={item.num}
                            status={item.status}
                            isCurrent={currentQuestion === item.num}
                            onClick={() => setCurrentQuestion(item.num)}
                          />
                        ))}
                      </div>

                      {/* Legend */}
                      <div className="pt-3 border-t border-border space-y-2 text-xs">
                        <div className="flex items-center gap-2">
                          <CBTPaletteItem number="" status="answered" size="sm" />
                          <span className="text-muted-foreground">Answered (4)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CBTPaletteItem number="" status="not-answered" size="sm" />
                          <span className="text-muted-foreground">Not Answered (1)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CBTPaletteItem number="" status="marked" size="sm" />
                          <span className="text-muted-foreground">
                            Marked for Review (1)
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CBTPaletteItem
                            number=""
                            status="answered-and-marked"
                            size="sm"
                          />
                          <span className="text-muted-foreground">
                            Answered & Marked (1)
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CBTPaletteItem number="" status="unvisited" size="sm" />
                          <span className="text-muted-foreground">Not Visited (4)</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* TAB 3: FEEDBACK & DATA DISPLAY */}
            <TabsContent value="feedback" className="space-y-8">
              <SectionHeader
                title="Feedback & Data Components"
                description="Status alerts, progress tracking, stat cards, and structured tables."
              />

              {/* Alerts */}
              <div className="space-y-3">
                <Alert variant="info" title="CUET UG 2026 Examination Notice">
                  NTA has confirmed standard marking (+5 for correct, -1 for incorrect)
                  across all Section II domains.
                </Alert>
                <Alert variant="success" title="Attempt Submitted Successfully">
                  Your mock examination responses were synchronized and scored
                  server-side.
                </Alert>
                <Alert variant="warning" title="Negative Marking Caution">
                  You have skipped 6 questions in this section. Unattempted questions
                  carry zero penalty.
                </Alert>
                <Alert variant="destructive" title="Connection Interruption Handled">
                  Offline response recorded in local secure memory. Automatically
                  re-synced with server.
                </Alert>
              </div>

              {/* Stat Cards */}
              <ResponsiveGrid cols={3}>
                <StatCard
                  title="Average Mock Accuracy"
                  value="84.2%"
                  trend={{ value: "+6.4%", isPositive: true }}
                  description="Calculated over last 5 full-length mocks"
                  icon={CheckCircle2}
                />
                <StatCard
                  title="Time Per Question"
                  value="52s"
                  trend={{ value: "-4s", isPositive: true }}
                  description="NTA target budget is 60s per domain item"
                  icon={Clock}
                />
                <StatCard
                  title="Identified Weak Topics"
                  value="3"
                  trend={{ value: "+1", isPositive: false }}
                  description="Vectors & 3D Geometry flagged for revision"
                  icon={BarChart3}
                />
              </ResponsiveGrid>

              {/* Progress Bar Specimen */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Syllabus Completion Progress</CardTitle>
                  <CardDescription>
                    Interactive progress tracking with customizable color variants.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ProgressBar
                    value={progressVal}
                    label="Mathematics (Domain)"
                    showValue
                    variant="default"
                  />
                  <ProgressBar
                    value={90}
                    label="English Reading Comprehension"
                    showValue
                    variant="success"
                  />
                  <ProgressBar
                    value={42}
                    label="General Test Numerical Ability"
                    showValue
                    variant="warning"
                  />
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setProgressVal((p) => Math.max(p - 10, 0))}
                    >
                      -10%
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setProgressVal((p) => Math.min(p + 10, 100))}
                    >
                      +10%
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Structured Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">
                    Recent Mock Test Attempts (Sample Layout)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Test Title</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Accuracy</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-semibold">CUET Full Mock 01</TableCell>
                        <TableCell>Mathematics</TableCell>
                        <TableCell className="font-mono">185 / 200</TableCell>
                        <TableCell className="font-mono text-emerald-600 font-semibold">
                          92.5%
                        </TableCell>
                        <TableCell>
                          <StatusIndicator status="completed" />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-semibold">
                          Electrostatics Topic Test
                        </TableCell>
                        <TableCell>Physics</TableCell>
                        <TableCell className="font-mono">75 / 100</TableCell>
                        <TableCell className="font-mono text-amber-600 font-semibold">
                          75.0%
                        </TableCell>
                        <TableCell>
                          <StatusIndicator status="completed" />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-semibold">
                          Reading Comprehension 03
                        </TableCell>
                        <TableCell>English</TableCell>
                        <TableCell className="font-mono">190 / 200</TableCell>
                        <TableCell className="font-mono text-emerald-600 font-semibold">
                          95.0%
                        </TableCell>
                        <TableCell>
                          <StatusIndicator status="completed" />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* States: Empty & Error */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <EmptyState
                  icon={BookOpen}
                  title="No Custom Tests Created Yet"
                  description="Generate a targeted test pack by selecting chapters from Section II or General Test."
                  action={
                    <Button size="sm">
                      <Sliders className="w-3.5 h-3.5 mr-1.5" />
                      Create Custom Mock
                    </Button>
                  }
                />
                <ErrorState
                  title="Unable to Load Live Test Series"
                  message="We could not synchronize with the mock test library. Check your network or retry."
                  onRetry={() => alert("Simulated retry execution!")}
                />
              </div>

              {/* Skeleton Loaders */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">
                    Skeleton Loading State Foundation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 4: DESIGN TOKENS & SYSTEM PALETTE */}
            <TabsContent value="tokens" className="space-y-8">
              <SectionHeader
                title="Design Tokens & Visual Identity"
                description="Verified color hex codes, typographic hierarchy, and border tokens defined for MockMate."
              />

              {/* Color Swatches */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Core Brand & Neutral Palette</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h5 className="text-xs font-semibold text-muted-foreground mb-3">
                      Brand Colors
                    </h5>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3 rounded-lg border border-border bg-[#244B8F] text-white">
                        <p className="text-xs font-bold">Primary Brand</p>
                        <p className="text-[11px] font-mono opacity-80">#244B8F</p>
                      </div>
                      <div className="p-3 rounded-lg border border-border bg-[#172B4D] text-white">
                        <p className="text-xs font-bold">Navy Text</p>
                        <p className="text-[11px] font-mono opacity-80">#172B4D</p>
                      </div>
                      <div className="p-3 rounded-lg border border-border bg-[#EAF1FC] text-[#244B8F]">
                        <p className="text-xs font-bold">Light Accent</p>
                        <p className="text-[11px] font-mono opacity-80">#EAF1FC</p>
                      </div>
                      <div className="p-3 rounded-lg border border-border bg-[#F8FAFC] text-[#172B4D]">
                        <p className="text-xs font-bold">Main Background</p>
                        <p className="text-[11px] font-mono opacity-80">#F8FAFC</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-xs font-semibold text-muted-foreground mb-3">
                      Feedback Colors
                    </h5>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3 rounded-lg border border-border bg-[#16A34A] text-white">
                        <p className="text-xs font-bold">Success</p>
                        <p className="text-[11px] font-mono opacity-80">#16A34A</p>
                      </div>
                      <div className="p-3 rounded-lg border border-border bg-[#D97706] text-white">
                        <p className="text-xs font-bold">Warning</p>
                        <p className="text-[11px] font-mono opacity-80">#D97706</p>
                      </div>
                      <div className="p-3 rounded-lg border border-border bg-[#DC2626] text-white">
                        <p className="text-xs font-bold">Error / Destructive</p>
                        <p className="text-[11px] font-mono opacity-80">#DC2626</p>
                      </div>
                      <div className="p-3 rounded-lg border border-border bg-[#0284C7] text-white">
                        <p className="text-xs font-bold">Info</p>
                        <p className="text-[11px] font-mono opacity-80">#0284C7</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-xs font-semibold text-muted-foreground mb-3">
                      CBT Question Palette States
                    </h5>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      <div className="p-3 rounded-lg border border-slate-300 bg-slate-100 text-slate-700">
                        <p className="text-xs font-bold">Not Visited</p>
                        <p className="text-[10px] font-mono">#F1F5F9</p>
                      </div>
                      <div className="p-3 rounded-lg border border-red-600 bg-red-500 text-white">
                        <p className="text-xs font-bold">Not Answered</p>
                        <p className="text-[10px] font-mono">#FEE2E2 / Red</p>
                      </div>
                      <div className="p-3 rounded-lg border border-emerald-700 bg-emerald-600 text-white">
                        <p className="text-xs font-bold">Answered</p>
                        <p className="text-[10px] font-mono">#DCFCE7 / Grn</p>
                      </div>
                      <div className="p-3 rounded-lg border border-purple-700 bg-purple-600 text-white">
                        <p className="text-xs font-bold">Marked</p>
                        <p className="text-[10px] font-mono">#F3E8FF / Purp</p>
                      </div>
                      <div className="p-3 rounded-lg border border-purple-800 bg-purple-700 text-white">
                        <p className="text-xs font-bold">Ans & Marked</p>
                        <p className="text-[10px] font-mono">Purple + Badge</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Typography Specimen */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Typography Hierarchy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="pb-3 border-b border-border">
                    <span className="text-xs text-muted-foreground font-mono">
                      H1 Heading
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground">
                      Realistic CUET UG Mock Examinations
                    </h1>
                  </div>
                  <div className="pb-3 border-b border-border">
                    <span className="text-xs text-muted-foreground font-mono">
                      H2 Heading
                    </span>
                    <h2 className="text-2xl font-bold text-foreground">
                      Section II: Mathematics & Domain Subjects
                    </h2>
                  </div>
                  <div className="pb-3 border-b border-border">
                    <span className="text-xs text-muted-foreground font-mono">
                      H3 Heading
                    </span>
                    <h3 className="text-xl font-bold text-foreground">
                      Chapter-Wise Progress & Weakness Identification
                    </h3>
                  </div>
                  <div className="pb-3 border-b border-border">
                    <span className="text-xs text-muted-foreground font-mono">
                      Body Text
                    </span>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      MockMate evaluates each student attempt against NTA percentile
                      metrics, providing question-by-question breakdown, solution
                      rationale, and targeted revision recommendations.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Interactive Confirm Dialog */}
          <ConfirmDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            title="Confirm Examination Submission"
            description="Are you sure you want to finish this mock test? Once submitted, your attempt will be scored on the server and answers cannot be modified."
            confirmText="Submit Exam"
            cancelText="Resume Test"
            onConfirm={() => {
              setDialogOpen(false);
              alert("Submission simulated successfully!");
            }}
          />
        </Container>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-surface text-muted-foreground text-xs py-8">
        <Container
          size="lg"
          className="flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center space-x-3">
            <Logo size="sm" />
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <p>© 2026 {siteConfig.name}. CUET UG Preparation Platform.</p>
          </div>
          <p className="font-mono text-slate-400">Phase 2: Premium UI/UX Design System</p>
        </Container>
      </footer>
    </div>
  );
}
