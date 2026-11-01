"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Layers,
  Database,
  Sliders,
  Eye,
  CheckCircle,
  Plus,
  Trash2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Save,
  HelpCircle,
  MoveUp,
  MoveDown,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  QuestionPickerModal,
  type AvailableQuestion,
} from "./question-picker-modal";
import {
  createMockTestAction,
  updateMockTestAction,
} from "@/actions/mock-test-actions";
import {
  type TestType,
  type TestDifficulty,
} from "@/lib/validations/mock-test";

export interface MockTestSubjectOption {
  id: string;
  name: string;
  code: string;
  slug: string;
}

export interface MockTestYearOption {
  id: string;
  year: number;
}

export interface InitialMockTestData {
  id?: string;
  title?: string;
  slug?: string;
  testCode?: string;
  description?: string | null;
  examYearId?: string;
  testType?: TestType | string;
  difficulty?: TestDifficulty | string;
  instructions?: string | null;
  totalDuration?: number;
  totalMarks?: number;
  totalQuestions?: number;
  isOfficialPattern?: boolean;
  attemptsCount?: number;
  sections?: Array<{
    id?: string;
    title: string;
    subjectId: string;
    sectionType?: "COMPULSORY" | "OPTIONAL" | string;
    description?: string | null;
    order?: number;
    duration?: number | null;
    totalQuestions?: number;
    questionsToAttempt?: number;
    totalMarks?: number;
    questions?: Array<{ id?: string; questionId?: string }>;
    questionCodes?: string[];
  }>;
}

interface MockTestBuilderProps {
  subjects: MockTestSubjectOption[];
  examYears: MockTestYearOption[];
  availableQuestions: AvailableQuestion[];
  initialData?: InitialMockTestData;
}

export function MockTestBuilder({
  subjects,
  examYears,
  availableQuestions,
  initialData,
}: MockTestBuilderProps) {
  const router = useRouter();
  const isEditing = Boolean(initialData?.id);
  const isLocked = (initialData?.attemptsCount || 0) > 0;

  // Wizard state: 1 to 6
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

  // Form State 
  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [testCode, setTestCode] = useState(initialData?.testCode || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [examYearId, setExamYearId] = useState(
    initialData?.examYearId || examYears[0]?.id || "year-2026"
  );
  const [testType, setTestType] = useState<TestType>(
    (initialData?.testType as TestType) || "SUBJECT_WISE"
  );
  const [difficulty, setDifficulty] = useState<TestDifficulty>(
    (initialData?.difficulty as TestDifficulty) || "MEDIUM"
  );
  const [instructions, setInstructions] = useState(
    initialData?.instructions ||
    `### CUET UG Examination Instructions\n1. Attempt the required number of questions within the allocated time.\n2. +5 marks for correct response, -1 for incorrect response.\n3. Question palette allows easy navigation.`
  );
  const [totalDuration, setTotalDuration] = useState<number>(initialData?.totalDuration || 45);
  const [isOfficialPattern, setIsOfficialPattern] = useState<boolean>(
    initialData?.isOfficialPattern ?? true
  );

  // Sections State
  const defaultSubjectId = subjects[0]?.id || "";
  const [sections, setSections] = useState<
    Array<{
      id?: string;
      title: string;
      subjectId: string;
      sectionType: "COMPULSORY" | "OPTIONAL";
      description?: string;
      order: number;
      duration?: number;
      totalQuestions: number;
      questionsToAttempt: number;
      totalMarks: number;
      questionIds: string[];
    }>
  >(
    initialData?.sections?.length
      ? initialData.sections.map((s, idx) => ({
        id: s.id,
        title: s.title,
        subjectId: s.subjectId,
        sectionType: (s.sectionType === "OPTIONAL" ? "OPTIONAL" : "COMPULSORY") as "COMPULSORY" | "OPTIONAL",
        description: s.description || "",
        order: s.order || idx + 1,
        duration: s.duration || undefined,
        totalQuestions: s.totalQuestions || 50,
        questionsToAttempt: s.questionsToAttempt || 40,
        totalMarks: s.totalMarks || 200,
        questionIds:
          s.questions?.map((q) => q.id || q.questionId || "").filter(Boolean) ||
          s.questionCodes ||
          [],
      }))
      : [
        {
          title: "Section A: Compulsory Core",
          subjectId: defaultSubjectId,
          sectionType: "COMPULSORY",
          order: 1,
          totalQuestions: 50,
          questionsToAttempt: 40,
          totalMarks: 200,
          questionIds: [],
        },
      ]
  );

  // Active question picker modal state
  const [activePickerSectionIndex, setActivePickerSectionIndex] = useState<number | null>(null);

  // Auto-generate slug and testCode from title if creating new
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEditing) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setSlug(generatedSlug);

      const generatedCode =
        "MT-" +
        val
          .toUpperCase()
          .replace(/[^A-Z0-9]+/g, "-")
          .substring(0, 16);
      setTestCode(generatedCode);
    }
  };

  // Section Helpers
  const addSection = () => {
    setSections((prev) => [
      ...prev,
      {
        title: `Section ${String.fromCharCode(65 + prev.length)}`,
        subjectId: subjects[0]?.id || "",
        sectionType: "COMPULSORY",
        order: prev.length + 1,
        totalQuestions: 25,
        questionsToAttempt: 20,
        totalMarks: 100,
        questionIds: [],
      },
    ]);
  };

  const removeSection = (index: number) => {
    if (sections.length <= 1) return;
    setSections((prev) => prev.filter((_, i) => i !== index));
  };

  const updateSection = (
    index: number,
    field: string,
    value: string | number | boolean | string[]
  ) => {
    setSections((prev) =>
      prev.map((sec, i) => {
        if (i !== index) return sec;
        const updated = { ...sec, [field]: value };
        if (field === "questionsToAttempt") {
          updated.totalMarks = Number(value) * 5;
        }
        return updated;
      })
    );
  };

  const removeQuestionFromSection = (sectionIndex: number, questionId: string) => {
    setSections((prev) =>
      prev.map((sec, i) => {
        if (i !== sectionIndex) return sec;
        return {
          ...sec,
          questionIds: sec.questionIds.filter((id) => id !== questionId),
        };
      })
    );
  };

  const moveQuestion = (sectionIndex: number, qIdx: number, direction: "up" | "down") => {
    setSections((prev) =>
      prev.map((sec, i) => {
        if (i !== sectionIndex) return sec;
        const arr = [...sec.questionIds];
        const targetIdx = direction === "up" ? qIdx - 1 : qIdx + 1;
        if (targetIdx < 0 || targetIdx >= arr.length) return sec;
        const temp = arr[qIdx];
        arr[qIdx] = arr[targetIdx];
        arr[targetIdx] = temp;
        return { ...sec, questionIds: arr };
      })
    );
  };

  // Computations
  const computedTotalQuestions = sections.reduce((acc, s) => acc + s.totalQuestions, 0);
  const computedQuestionsToAttempt = sections.reduce((acc, s) => acc + s.questionsToAttempt, 0);
  const computedTotalMarks = computedQuestionsToAttempt * 5;

  // Validation Pre-flight Checklist
  const validationErrors: string[] = [];
  if (!title.trim()) validationErrors.push("Test title is required.");
  if (!slug.trim()) validationErrors.push("Test URL slug is required.");
  if (!testCode.trim()) validationErrors.push("Unique test code is required.");
  if (sections.length === 0) validationErrors.push("At least one section must be created.");

  sections.forEach((s, idx) => {
    if (s.questionsToAttempt > s.totalQuestions) {
      validationErrors.push(
        `Section ${idx + 1} (${s.title}): Questions to attempt cannot exceed total questions.`
      );
    }
    if (s.questionIds.length !== s.totalQuestions) {
      validationErrors.push(
        `Section ${idx + 1} (${s.title}): Needs ${s.totalQuestions} questions selected (currently ${s.questionIds.length
        }).`
      );
    }
  });

  // Check for duplicate questions across sections
  const allQuestionIds = sections.flatMap((s) => s.questionIds);
  const uniqueQuestionIds = new Set(allQuestionIds);
  if (allQuestionIds.length !== uniqueQuestionIds.size) {
    validationErrors.push("Duplicate questions detected across test sections.");
  }

  // Handle Save
  const handleSave = async (targetStatus: "DRAFT" | "IN_REVIEW" | "PUBLISHED") => {
    if (isLocked) {
      setFeedback({
        type: "error",
        message: "This test cannot be altered because students have already attempted it.",
      });
      return;
    }

    if (targetStatus === "PUBLISHED" && validationErrors.length > 0) {
      setFeedback({
        type: "error",
        message: "Cannot publish test with validation errors. Please check the preview step.",
      });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    const payload = {
      title,
      slug,
      testCode,
      description,
      examYearId,
      testType,
      status: targetStatus,
      difficulty,
      instructions,
      totalDuration,
      totalMarks: computedTotalMarks,
      totalQuestions: computedTotalQuestions,
      isOfficialPattern,
      sections: sections.map((sec, idx) => ({
        id: sec.id,
        title: sec.title,
        subjectId: sec.subjectId,
        sectionType: sec.sectionType,
        description: sec.description || undefined,
        order: idx + 1,
        duration: sec.duration,
        totalMarks: sec.totalMarks,
        totalQuestions: sec.totalQuestions,
        questionsToAttempt: sec.questionsToAttempt,
        questionIds: sec.questionIds,
      })),
    };

    try {
      let res;
      if (isEditing && initialData?.id) {
        res = await updateMockTestAction(initialData.id, payload);
      } else {
        res = await createMockTestAction(payload);
      }

      if (res.success) {
        setFeedback({
          type: "success",
          message: res.message || "Mock test successfully saved!",
        });
        setTimeout(() => {
          router.push("/admin/mock-tests");
          router.refresh();
        }, 1200);
      } else {
        setFeedback({
          type: "error",
          message: res.error || "Failed to save mock test.",
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setFeedback({
        type: "error",
        message: msg,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { num: 1, label: "Basic Info", icon: FileText },
    { num: 2, label: "Sections", icon: Layers },
    { num: 3, label: "Questions", icon: Database },
    { num: 4, label: "Exam Rules", icon: Sliders },
    { num: 5, label: "Validation", icon: Eye },
    { num: 6, label: "Publish", icon: CheckCircle },
  ];

  return (
    <div className="space-y-6">
      {/* Historical Lock Notice */}
      {isLocked && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-amber-800 dark:text-amber-300">
          <Lock className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-bold">Test Configuration Locked for Historical Consistency</p>
            <p className="mt-0.5">
              This mock test has recorded {initialData?.attemptsCount} student attempt(s). Its sections,
              questions, and marking scheme cannot be edited directly to protect student score integrity.
            </p>
          </div>
        </div>
      )}

      {/* Step Stepper Header */}
      <div className="bg-surface border border-border rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between overflow-x-auto pb-2 sm:pb-0 gap-2">
          {steps.map((step) => {
            const Icon = step.icon;
            const isCompleted = currentStep > step.num;
            const isCurrent = currentStep === step.num;
            return (
              <button
                key={step.num}
                type="button"
                onClick={() => setCurrentStep(step.num)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${isCurrent
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : isCompleted
                      ? "text-primary hover:bg-primary/5"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${isCurrent
                      ? "bg-primary-foreground text-primary font-bold"
                      : isCompleted
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                >
                  {isCompleted ? "✓" : step.num}
                </div>
                <Icon className="w-3.5 h-3.5" />
                <span>{step.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs font-medium border flex items-center gap-2 ${feedback.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300"
              : "bg-destructive/10 border-destructive/30 text-destructive"
            }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* STEP 1: BASIC INFORMATION */}
      {currentStep === 1 && (
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-xs space-y-5">
          <div>
            <h3 className="text-base font-bold text-foreground">Step 1: Test Identity & Classification</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Specify the administrative title, official NTA classification, and target CUET academic cycle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-foreground">Test Title</label>
              <Input
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. CUET UG Physics Full Mock Test 01"
                className="text-xs"
                disabled={isLocked}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Test Code</label>
              <Input
                value={testCode}
                onChange={(e) => setTestCode(e.target.value.toUpperCase())}
                placeholder="e.g. MT-CUET-PHY-2026-01"
                className="text-xs font-mono"
                disabled={isLocked}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">URL Slug</label>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase())}
                placeholder="e.g. cuet-ug-physics-mock-01"
                className="text-xs font-mono"
                disabled={isLocked}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Target Exam Year</label>
              <select
                value={examYearId}
                onChange={(e) => setExamYearId(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-border bg-background text-xs"
                disabled={isLocked}
              >
                {examYears.map((yr) => (
                  <option key={yr.id} value={yr.id}>
                    CUET UG {yr.year}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Test Pattern Category</label>
              <select
                value={testType}
                onChange={(e) => setTestType(e.target.value as TestType)}
                className="w-full h-9 px-3 rounded-lg border border-border bg-background text-xs"
                disabled={isLocked}
              >
                <option value="FULL_LENGTH">Full Length Comprehensive Mock</option>
                <option value="SUBJECT_WISE">Subject-Wise Standard Test</option>
                <option value="GENERAL_TEST">General Test (Section III)</option>
                <option value="SECTIONAL">Sectional / Diagnostic Practice</option>
                <option value="CUSTOM_PRACTICE">Custom Practice Test</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Difficulty Rating</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as TestDifficulty)}
                className="w-full h-9 px-3 rounded-lg border border-border bg-background text-xs"
                disabled={isLocked}
              >
                <option value="EASY">Easy (Foundational)</option>
                <option value="MEDIUM">Medium (CUET Standard Benchmark)</option>
                <option value="HARD">Hard (Advanced Competitive)</option>
              </select>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-foreground">Description & Overview</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Brief summary of test coverage and target topics..."
                className="w-full p-3 rounded-xl border border-border bg-background text-xs leading-relaxed"
                disabled={isLocked}
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: TEST SECTIONS CONFIGURATION */}
      {currentStep === 2 && (
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground">Step 2: Section Architecture</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Configure multi-section papers, assign CUET subject catalogues, and set optionality limits.
              </p>
            </div>
            {!isLocked && (
              <Button type="button" variant="outline" size="sm" onClick={addSection}>
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Add Section
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {sections.map((section, idx) => (
              <div
                key={idx}
                className="p-5 rounded-xl border border-border bg-background/50 space-y-4 shadow-xs"
              >
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-foreground">
                      Section {idx + 1}: {section.title || "Untitled"}
                    </span>
                  </div>

                  {!isLocked && sections.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSection(idx)}
                      className="text-muted-foreground hover:text-destructive p-1 rounded-md transition-colors"
                      title="Remove section"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-semibold text-foreground">Section Title</label>
                    <Input
                      value={section.title}
                      onChange={(e) => updateSection(idx, "title", e.target.value)}
                      placeholder="e.g. Section A: Compulsory Core"
                      className="text-xs"
                      disabled={isLocked}
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-semibold text-foreground">Assigned CUET Subject</label>
                    <select
                      value={section.subjectId}
                      onChange={(e) => updateSection(idx, "subjectId", e.target.value)}
                      className="w-full h-9 px-3 rounded-lg border border-border bg-background text-xs"
                      disabled={isLocked}
                    >
                      {subjects.map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.name} (Code: {sub.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Total Questions</label>
                    <Input
                      type="number"
                      value={section.totalQuestions}
                      onChange={(e) =>
                        updateSection(idx, "totalQuestions", parseInt(e.target.value) || 0)
                      }
                      className="text-xs"
                      min={1}
                      disabled={isLocked}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Questions To Attempt</label>
                    <Input
                      type="number"
                      value={section.questionsToAttempt}
                      onChange={(e) =>
                        updateSection(idx, "questionsToAttempt", parseInt(e.target.value) || 0)
                      }
                      className="text-xs"
                      min={1}
                      max={section.totalQuestions}
                      disabled={isLocked}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Section Type</label>
                    <select
                      value={section.sectionType}
                      onChange={(e) => updateSection(idx, "sectionType", e.target.value as "COMPULSORY" | "OPTIONAL")}
                      className="w-full h-9 px-3 rounded-lg border border-border bg-background text-xs"
                      disabled={isLocked}
                    >
                      <option value="COMPULSORY">Compulsory</option>
                      <option value="OPTIONAL">Optional Section</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Section Marks</label>
                    <Input
                      type="number"
                      value={section.totalMarks}
                      onChange={(e) =>
                        updateSection(idx, "totalMarks", parseFloat(e.target.value) || 0)
                      }
                      className="text-xs font-mono"
                      disabled={isLocked}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-muted/40 border border-border/60 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Cumulative Test Structure:</span>
            <span className="font-semibold text-foreground">
              {computedTotalQuestions} Total Questions • Attempt any {computedQuestionsToAttempt} •{" "}
              {computedTotalMarks} Total Marks
            </span>
          </div>
        </div>
      )}

      {/* STEP 3: QUESTION SELECTION & ASSIGNMENT */}
      {currentStep === 3 && (
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-foreground">Step 3: Question Bank Mapping</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Select verified, published questions from the CUET question bank for each defined section.
            </p>
          </div>

          <div className="space-y-6">
            {sections.map((section, secIdx) => {
              const assignedQuestions = section.questionIds
                .map((qid) => availableQuestions.find((aq) => aq.id === qid))
                .filter(Boolean) as AvailableQuestion[];

              const isComplete = section.questionIds.length === section.totalQuestions;

              return (
                <div
                  key={secIdx}
                  className="p-5 rounded-2xl border border-border bg-background space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-foreground">{section.title}</h4>
                        <Badge
                          variant={isComplete ? "default" : "outline"}
                          className={`text-[10px] ${isComplete
                              ? "bg-emerald-600 text-white"
                              : "border-amber-500 text-amber-600 dark:text-amber-400"
                            }`}
                        >
                          {section.questionIds.length} / {section.totalQuestions} Questions Assigned
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Students must attempt {section.questionsToAttempt} out of {section.totalQuestions}{" "}
                        questions.
                      </p>
                    </div>

                    {!isLocked && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => setActivePickerSectionIndex(secIdx)}
                      >
                        <Database className="w-3.5 h-3.5 mr-1.5" />
                        Pick Questions ({section.questionIds.length})
                      </Button>
                    )}
                  </div>

                  {assignedQuestions.length === 0 ? (
                    <div className="p-8 text-center border border-dashed border-border rounded-xl">
                      <HelpCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                      <p className="text-xs font-semibold text-foreground">No questions assigned yet</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 mb-3">
                        Click &apos;Pick Questions&apos; to browse published questions for this section.
                      </p>
                      {!isLocked && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActivePickerSectionIndex(secIdx)}
                        >
                          Open Question Selector
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {assignedQuestions.map((q, qIdx) => (
                        <div
                          key={q.id}
                          className="flex items-center justify-between p-3 rounded-xl border border-border bg-surface text-xs"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="font-mono text-muted-foreground w-6 text-center">
                              #{qIdx + 1}
                            </span>
                            <span className="font-mono font-bold text-foreground">
                              {q.questionCode}
                            </span>
                            <Badge variant="outline" className="text-[10px] py-0">
                              {q.questionType.replace("_", " ")}
                            </Badge>
                            <Badge
                              variant={
                                q.difficulty === "HARD"
                                  ? "destructive"
                                  : q.difficulty === "MEDIUM"
                                    ? "secondary"
                                    : "outline"
                              }
                              className="text-[10px] py-0"
                            >
                              {q.difficulty}
                            </Badge>
                            <p className="text-muted-foreground truncate max-w-[320px]">
                              {q.questionText}
                            </p>
                          </div>

                          {!isLocked && (
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => moveQuestion(secIdx, qIdx, "up")}
                                disabled={qIdx === 0}
                                className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                              >
                                <MoveUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => moveQuestion(secIdx, qIdx, "down")}
                                disabled={qIdx === assignedQuestions.length - 1}
                                className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                              >
                                <MoveDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeQuestionFromSection(secIdx, q.id)}
                                className="p-1 text-muted-foreground hover:text-destructive ml-2"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 4: EXAMINATION CONFIGURATION */}
      {currentStep === 4 && (
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-foreground">Step 4: Examination & Scoring Rules</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Set timing constraints, negative marking deductions, and official NTA pattern adherence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Total Duration (Minutes)</label>
              <Input
                type="number"
                value={totalDuration}
                onChange={(e) => setTotalDuration(parseInt(e.target.value) || 45)}
                className="text-xs"
                min={5}
                max={300}
                disabled={isLocked}
              />
              <p className="text-[11px] text-muted-foreground">
                NTA Standard: 45 minutes for core domain subjects; 60 minutes for Math/Accounts/General Test.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Computed Total Marks</label>
              <Input
                value={`${computedTotalMarks} Marks (${computedQuestionsToAttempt} attempted × 5)`}
                disabled
                className="text-xs bg-muted/50 font-mono font-semibold"
              />
            </div>

            <div className="space-y-3 md:col-span-2 p-4 rounded-xl border border-border bg-muted/20">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="official-pattern"
                  checked={isOfficialPattern}
                  onChange={(e) => setIsOfficialPattern(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary w-4 h-4"
                  disabled={isLocked}
                />
                <label htmlFor="official-pattern" className="text-xs font-semibold text-foreground cursor-pointer">
                  Enforce Official NTA CUET Examination Pattern
                </label>
              </div>
              <p className="text-xs text-muted-foreground pl-7">
                When enabled, MockMate displays official NTA badges, standard +5 / -1 marking scheme notices,
                and prepares the test for full CBT simulation.
              </p>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-foreground">Student Examination Instructions</label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows={6}
                className="w-full p-3 rounded-xl border border-border bg-background text-xs font-mono leading-relaxed"
                disabled={isLocked}
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: PREVIEW & VALIDATION */}
      {currentStep === 5 && (
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-foreground">Step 5: Pre-Flight Integrity Check</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Review test structure and ensure all consistency checks pass before publishing.
            </p>
          </div>

          {/* Validation Checklist */}
          <div className="p-4 rounded-xl border border-border bg-background space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Automated Integrity Diagnostics
            </h4>

            {validationErrors.length === 0 ? (
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>All verification checks passed! Test is structurally valid and ready for deployment.</span>
              </div>
            ) : (
              <div className="space-y-1.5">
                {validationErrors.map((err, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-destructive">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{err}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Mock Test Summary Card */}
          <div className="p-5 rounded-2xl border border-border bg-surface space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="font-mono text-xs font-bold text-primary">{testCode}</span>
                <h4 className="text-lg font-bold text-foreground">{title || "Untitled Mock Test"}</h4>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{testType}</Badge>
                <Badge
                  variant={
                    difficulty === "HARD"
                      ? "destructive"
                      : difficulty === "MEDIUM"
                        ? "secondary"
                        : "outline"
                  }
                >
                  {difficulty}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-muted/40 border border-border/50">
                <span className="text-muted-foreground block text-[11px]">Total Duration</span>
                <span className="font-bold text-foreground text-sm">{totalDuration} Mins</span>
              </div>
              <div className="p-3 rounded-xl bg-muted/40 border border-border/50">
                <span className="text-muted-foreground block text-[11px]">Total Marks</span>
                <span className="font-bold text-foreground text-sm">{computedTotalMarks} Marks</span>
              </div>
              <div className="p-3 rounded-xl bg-muted/40 border border-border/50">
                <span className="text-muted-foreground block text-[11px]">Total Questions</span>
                <span className="font-bold text-foreground text-sm">{computedTotalQuestions}</span>
              </div>
              <div className="p-3 rounded-xl bg-muted/40 border border-border/50">
                <span className="text-muted-foreground block text-[11px]">Questions to Attempt</span>
                <span className="font-bold text-foreground text-sm">{computedQuestionsToAttempt}</span>
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-border">
              <h5 className="text-xs font-bold text-foreground">Section Breakdown ({sections.length})</h5>
              {sections.map((s, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl border border-border bg-background text-xs"
                >
                  <div>
                    <span className="font-semibold text-foreground">{s.title}</span>
                    <span className="text-muted-foreground ml-2">({s.sectionType})</span>
                  </div>
                  <div className="text-muted-foreground font-mono">
                    Attempt {s.questionsToAttempt} of {s.totalQuestions} • {s.totalMarks} Marks
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STEP 6: PUBLISH & DEPLOY */}
      {currentStep === 6 && (
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-foreground">Step 6: Save & Publish Workflow</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Choose the lifecycle stage for this mock examination paper.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div
              onClick={() => !isLocked && handleSave("DRAFT")}
              className={`p-5 rounded-2xl border border-border bg-background hover:border-primary/50 transition-all cursor-pointer space-y-2 ${isLocked ? "opacity-50 pointer-events-none" : ""
                }`}
            >
              <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center text-foreground font-bold">
                <Save className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-foreground">Save as Draft</h4>
              <p className="text-xs text-muted-foreground">
                Work-in-progress test. Hidden from students, editable by authors anytime.
              </p>
            </div>

            <div
              onClick={() => !isLocked && handleSave("IN_REVIEW")}
              className={`p-5 rounded-2xl border border-border bg-background hover:border-amber-500/50 transition-all cursor-pointer space-y-2 ${isLocked ? "opacity-50 pointer-events-none" : ""
                }`}
            >
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                <Eye className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-foreground">Submit for Review</h4>
              <p className="text-xs text-muted-foreground">
                Flags paper for academic peer review and syllabus balance verification.
              </p>
            </div>

            <div
              onClick={() => !isLocked && handleSave("PUBLISHED")}
              className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-2 ${validationErrors.length > 0 || isLocked
                  ? "border-border bg-muted/30 opacity-60 pointer-events-none"
                  : "border-primary bg-primary/5 hover:bg-primary/10"
                }`}
            >
              <div className="w-8 h-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold">
                <CheckCircle className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-foreground">Publish to Students</h4>
              <p className="text-xs text-muted-foreground">
                Immediately live in the Student Mock Test Library for full practice.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Wizard Footer Controls */}
      <div className="bg-surface border border-border rounded-2xl p-4 flex items-center justify-between shadow-xs">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
          disabled={currentStep === 1 || isSubmitting}
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
          Previous Step
        </Button>

        <div className="flex items-center gap-2">
          {currentStep < 6 ? (
            <Button
              type="button"
              size="sm"
              onClick={() => setCurrentStep((prev) => Math.min(6, prev + 1))}
            >
              Next Step
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              disabled={isSubmitting || isLocked}
              onClick={() => handleSave("PUBLISHED")}
            >
              <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
              {isSubmitting ? "Deploying..." : "Finalize & Publish Test"}
            </Button>
          )}
        </div>
      </div>

      {/* Active Question Picker Modal */}
      {activePickerSectionIndex !== null && (
        <QuestionPickerModal
          isOpen={true}
          onClose={() => setActivePickerSectionIndex(null)}
          sectionTitle={sections[activePickerSectionIndex].title}
          subjectName={
            subjects.find((s) => s.id === sections[activePickerSectionIndex].subjectId)?.name ||
            "Subject"
          }
          targetCount={sections[activePickerSectionIndex].totalQuestions}
          currentlySelectedIds={sections[activePickerSectionIndex].questionIds}
          availableQuestions={availableQuestions}
          onConfirmSelection={(selectedIds) => {
            updateSection(activePickerSectionIndex, "questionIds", selectedIds);
          }}
        />
      )}
    </div>
  );
}
