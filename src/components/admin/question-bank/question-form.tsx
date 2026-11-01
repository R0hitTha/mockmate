"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Eye,
  Save,
  Send,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { QuestionInput } from "@/lib/validations/question";
import { createQuestionAction, updateQuestionAction } from "@/actions/question-actions";

interface QuestionFormProps {
  initialData?: Partial<QuestionInput> & { id?: string; usageCount?: number };
  cascadeData: {
    examYears: { year: number; label: string }[];
    subjects: { slug: string; name: string; code: string; categoryName: string; hasSyllabus: boolean }[];
    units: { unitNumber: number; title: string; description?: string }[];
    topics: { order: number; title: string }[];
    subtopics: { order: number; title: string }[];
  };
  mode?: "create" | "edit";
}

export function QuestionForm({ initialData, cascadeData, mode = "create" }: QuestionFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");

  // Step 1: Classification state
  const [examYear, setExamYear] = useState<number>(initialData?.examYear || 2026);
  const [subjectSlug, setSubjectSlug] = useState<string>(initialData?.subjectSlug || "physics");
  const [unitNumber, setUnitNumber] = useState<number>(initialData?.unitNumber || 1);
  const [topicOrder, setTopicOrder] = useState<number>(initialData?.topicOrder || 1);
  const [subtopicOrder, setSubtopicOrder] = useState<number | undefined>(initialData?.subtopicOrder);
  const [questionType, setQuestionType] = useState<string>(initialData?.questionType || "MCQ_SINGLE");

  // Step 2: Content state
  const [questionText, setQuestionText] = useState<string>(initialData?.questionText || "");
  const [includePassage, setIncludePassage] = useState<boolean>(
    Boolean(initialData?.passageText || initialData?.questionType === "PASSAGE_BASED")
  );
  const [passageTitle, setPassageTitle] = useState<string>(initialData?.passageTitle || "");
  const [passageText, setPassageText] = useState<string>(initialData?.passageText || "");

  // Step 3: Options state
  const defaultOptions = [
    { optionLabel: "A", optionText: "", isCorrect: true, order: 1 },
    { optionLabel: "B", optionText: "", isCorrect: false, order: 2 },
    { optionLabel: "C", optionText: "", isCorrect: false, order: 3 },
    { optionLabel: "D", optionText: "", isCorrect: false, order: 4 },
  ];
  const [options, setOptions] = useState(initialData?.options || defaultOptions);

  // Step 4: Explanation & Marking
  const [explanation, setExplanation] = useState<string>(initialData?.explanation || "");
  const [difficulty, setDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">(
    (initialData?.difficulty as "EASY" | "MEDIUM" | "HARD") || "MEDIUM"
  );
  const [marks, setMarks] = useState<number>(initialData?.marks || 5.0);
  const [negativeMarks, setNegativeMarks] = useState<number>(initialData?.negativeMarks || 1.0);
  const [tagsString, setTagsString] = useState<string>(
    initialData?.tags ? initialData.tags.join(", ") : "NCERT Exemplar, High Yield"
  );

  // Lock status if question is already used in tests
  const isLocked = Boolean(initialData?.usageCount && initialData.usageCount > 0);

  // Filter units and topics dynamically for selected subject
  const currentSubject = cascadeData.subjects.find((s) => s.slug === subjectSlug);

  // Handle option modifications
  const handleOptionTextChange = (idx: number, text: string) => {
    setOptions((prev) =>
      prev.map((opt, i) => (i === idx ? { ...opt, optionText: text } : opt))
    );
  };

  const handleSetCorrect = (idx: number) => {
    if (questionType === "MCQ_MULTIPLE") {
      setOptions((prev) =>
        prev.map((opt, i) => (i === idx ? { ...opt, isCorrect: !opt.isCorrect } : opt))
      );
    } else {
      setOptions((prev) =>
        prev.map((opt, i) => ({ ...opt, isCorrect: i === idx }))
      );
    }
  };

  const handleAddOption = () => {
    if (options.length >= 6) return;
    const nextLabel = String.fromCharCode(65 + options.length);
    setOptions((prev) => [
      ...prev,
      { optionLabel: nextLabel, optionText: "", isCorrect: false, order: prev.length + 1 },
    ]);
  };

  const handleRemoveOption = (idx: number) => {
    if (options.length <= 2) return;
    const filtered = options.filter((_, i) => i !== idx);
    // Relabel options
    const relabeled = filtered.map((opt, i) => ({
      ...opt,
      optionLabel: String.fromCharCode(65 + i),
      order: i + 1,
    }));
    setOptions(relabeled);
  };

  // Submit action
  const handleSave = (targetStatus: "DRAFT" | "IN_REVIEW" | "PUBLISHED") => {
    setErrorMessage(null);

    // Validation checks
    if (!questionText.trim() || questionText.trim().length < 5) {
      setErrorMessage("Please enter a valid question statement (at least 5 characters).");
      return;
    }

    const hasEmptyOption = options.some((o) => !o.optionText.trim());
    if (hasEmptyOption) {
      setErrorMessage("All option choices must have text content.");
      return;
    }

    const correctCount = options.filter((o) => o.isCorrect).length;
    if (questionType === "MCQ_SINGLE" && correctCount !== 1) {
      setErrorMessage("Single Choice questions must have exactly one correct option marked.");
      return;
    }

    if (targetStatus === "PUBLISHED" && (!explanation || explanation.trim().length < 5)) {
      setErrorMessage("Published questions must include a comprehensive explanation.");
      return;
    }

    const tags = tagsString
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    startTransition(async () => {
      const payload: QuestionInput = {
        examYear,
        subjectSlug,
        unitNumber,
        topicOrder,
        subtopicOrder,
        questionType: questionType as "MCQ_SINGLE" | "MCQ_MULTIPLE" | "ASSERTION_REASON" | "PASSAGE_BASED" | "TRUE_FALSE",
        questionText: questionText.trim(),
        passageTitle: includePassage ? passageTitle.trim() : undefined,
        passageText: includePassage ? passageText.trim() : undefined,
        difficulty,
        explanation: explanation.trim() || undefined,
        marks,
        negativeMarks,
        status: targetStatus,
        tags,
        options,
      };

      if (mode === "edit" && initialData?.id) {
        const res = await updateQuestionAction(initialData.id, payload);
        if (res.success) {
          router.push(`/admin/question-bank/${initialData.id}`);
        } else {
          setErrorMessage(res.error || "Failed to update question.");
        }
      } else {
        const res = await createQuestionAction(payload);
        if (res.success && res.data?.questionId) {
          router.push(`/admin/question-bank/${res.data.questionId}`);
        } else {
          setErrorMessage(res.error || "Failed to create question.");
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Bar with Mode and Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/question-bank"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Question Bank</span>
        </Link>

        {/* Tab switch between Editor and Live Preview */}
        <div className="inline-flex rounded-lg border border-border bg-card p-1">
          <button
            type="button"
            onClick={() => setActiveTab("edit")}
            className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
              activeTab === "edit" ? "bg-primary text-primary-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Question Editor
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`px-3 py-1 rounded text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === "preview" ? "bg-primary text-primary-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Student Preview</span>
          </button>
        </div>
      </div>

      {isLocked && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xl flex items-start gap-3 text-xs text-amber-800 dark:text-amber-300">
          <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
          <div>
            <h4 className="font-bold">Historical Test Lock Active</h4>
            <p className="mt-0.5 leading-relaxed">
              This question has already been served in student test sessions. To preserve historical
              scoring integrity, modifying the answer key is restricted.
            </p>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Tab Panels */}
      {activeTab === "edit" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Question Details & Content (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Classification */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  1
                </span>
                <h3 className="text-sm font-bold text-foreground">Syllabus Classification</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Exam Year */}
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1.5">Exam Year</label>
                  <select
                    value={examYear}
                    onChange={(e) => setExamYear(parseInt(e.target.value, 10))}
                    className="w-full h-9 rounded-lg border border-border bg-background px-3 text-xs text-foreground"
                  >
                    {cascadeData.examYears.map((yr) => (
                      <option key={yr.year} value={yr.year}>
                        {yr.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subject */}
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1.5">CUET Subject</label>
                  <select
                    value={subjectSlug}
                    onChange={(e) => setSubjectSlug(e.target.value)}
                    className="w-full h-9 rounded-lg border border-border bg-background px-3 text-xs text-foreground"
                  >
                    {cascadeData.subjects.map((sub) => (
                      <option key={sub.slug} value={sub.slug}>
                        {sub.name} ({sub.code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Question Type */}
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1.5">Question Format</label>
                  <select
                    value={questionType}
                    onChange={(e) => {
                      setQuestionType(e.target.value);
                      if (e.target.value === "PASSAGE_BASED") setIncludePassage(true);
                    }}
                    className="w-full h-9 rounded-lg border border-border bg-background px-3 text-xs text-foreground"
                  >
                    <option value="MCQ_SINGLE">Single Choice (MCQ)</option>
                    <option value="ASSERTION_REASON">Assertion & Reason</option>
                    <option value="PASSAGE_BASED">Passage-Based (RC)</option>
                    <option value="MCQ_MULTIPLE">Multiple Select</option>
                    <option value="TRUE_FALSE">True / False</option>
                  </select>
                </div>
              </div>

              {/* Units and Topics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1.5">
                    Syllabus Unit Number
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={unitNumber}
                    onChange={(e) => setUnitNumber(parseInt(e.target.value, 10) || 1)}
                    className="w-full h-9 rounded-lg border border-border bg-background px-3 text-xs text-foreground"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1.5">
                    Topic Order Number
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={topicOrder}
                    onChange={(e) => setTopicOrder(parseInt(e.target.value, 10) || 1)}
                    className="w-full h-9 rounded-lg border border-border bg-background px-3 text-xs text-foreground"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1.5">
                    Subtopic Order (Optional)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={subtopicOrder || ""}
                    placeholder="e.g. 1"
                    onChange={(e) => setSubtopicOrder(parseInt(e.target.value, 10) || undefined)}
                    className="w-full h-9 rounded-lg border border-border bg-background px-3 text-xs text-foreground"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Question Statement & Passage */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    2
                  </span>
                  <h3 className="text-sm font-bold text-foreground">Question Content</h3>
                </div>

                <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includePassage}
                    onChange={(e) => setIncludePassage(e.target.checked)}
                    className="rounded border-border"
                  />
                  <span>Belongs to Passage / Stimulus</span>
                </label>
              </div>

              {includePassage && (
                <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">
                      Passage Title / Reference
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g. Reading Comprehension Passage 1"
                      value={passageTitle}
                      onChange={(e) => setPassageTitle(e.target.value)}
                      className="text-xs h-9 bg-background"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">
                      Passage Full Text
                    </label>
                    <Textarea
                      rows={5}
                      placeholder="Paste the shared passage, case study, or paragraph here..."
                      value={passageText}
                      onChange={(e) => setPassageText(e.target.value)}
                      className="text-xs bg-background leading-relaxed font-sans"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Question Statement *
                </label>
                <Textarea
                  rows={4}
                  placeholder="Enter the question problem statement. LaTeX math syntax like $E = mc^2$ or $\int x dx$ is supported."
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  className="text-xs leading-relaxed font-sans"
                />
              </div>
            </div>

            {/* Step 3: Answer Options */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    3
                  </span>
                  <h3 className="text-sm font-bold text-foreground">Answer Options & Correct Key</h3>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddOption}
                  disabled={options.length >= 6}
                  className="h-7 text-xs gap-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Option</span>
                </Button>
              </div>

              <div className="space-y-3">
                {options.map((opt, idx) => (
                  <div
                    key={opt.optionLabel}
                    className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                      opt.isCorrect
                        ? "border-emerald-500/60 bg-emerald-50/30 dark:bg-emerald-950/20"
                        : "border-border bg-background"
                    }`}
                  >
                    {/* Correct Selector button */}
                    <button
                      type="button"
                      onClick={() => handleSetCorrect(idx)}
                      title={opt.isCorrect ? "Correct answer" : "Mark as correct answer"}
                      className={`h-7 w-7 rounded-lg shrink-0 flex items-center justify-center font-bold text-xs transition-colors cursor-pointer mt-1 ${
                        opt.isCorrect
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {opt.optionLabel}
                    </button>

                    {/* Option Text Input */}
                    <div className="flex-1">
                      <Input
                        type="text"
                        placeholder={`Option ${opt.optionLabel} text...`}
                        value={opt.optionText}
                        onChange={(e) => handleOptionTextChange(idx, e.target.value)}
                        className="text-xs h-9 bg-background"
                      />
                    </div>

                    {/* Remove Option Button */}
                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(idx)}
                        className="p-1.5 text-muted-foreground hover:text-destructive rounded mt-1"
                        title="Remove option"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                Click the letter circle to mark it as the correct answer key.
              </p>
            </div>

            {/* Step 4: Explanation */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  4
                </span>
                <h3 className="text-sm font-bold text-foreground">Pedagogical Explanation & Solutions</h3>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Comprehensive Solution & Step-by-Step Explanation
                </label>
                <Textarea
                  rows={4}
                  placeholder="Detail the complete derivation, concept explanation, or reasoning. Shown to students during test analysis."
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  className="text-xs leading-relaxed font-sans"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Metadata, Marking, Publishing Actions (1 col) */}
          <div className="space-y-6">
            {/* Marking & Difficulty */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-2.5">
                Marking & Difficulty
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Difficulty Level
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as "EASY" | "MEDIUM" | "HARD")}
                    className="w-full h-9 rounded-lg border border-border bg-background px-3 text-xs text-foreground"
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium (CUET Standard)</option>
                    <option value="HARD">Hard (Advanced Multi-Concept)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">
                      Marks (Correct)
                    </label>
                    <input
                      type="number"
                      step={0.5}
                      value={marks}
                      onChange={(e) => setMarks(parseFloat(e.target.value) || 5.0)}
                      className="w-full h-9 rounded-lg border border-border bg-background px-3 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">
                      Negative Penalty
                    </label>
                    <input
                      type="number"
                      step={0.25}
                      value={negativeMarks}
                      onChange={(e) => setNegativeMarks(parseFloat(e.target.value) || 1.0)}
                      className="w-full h-9 rounded-lg border border-border bg-background px-3 text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Tags (Comma Separated)
                  </label>
                  <Input
                    type="text"
                    value={tagsString}
                    onChange={(e) => setTagsString(e.target.value)}
                    placeholder="e.g. NCERT Exemplar, PYQ 2024"
                    className="text-xs h-9"
                  />
                </div>
              </div>
            </div>

            {/* Publishing & Actions */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-2.5">
                Workflow Actions
              </h3>

              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Save as draft during authoring. Published questions immediately become available for
                mock test builders and subject practice.
              </p>

              <div className="space-y-2 pt-2">
                <Button
                  type="button"
                  variant="default"
                  onClick={() => handleSave("PUBLISHED")}
                  disabled={isPending}
                  className="w-full text-xs font-semibold h-10 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                  <span>Publish Question</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleSave("IN_REVIEW")}
                  disabled={isPending}
                  className="w-full text-xs font-semibold h-9 gap-2"
                >
                  <Send className="h-3.5 w-3.5 text-primary" />
                  <span>Submit for Peer Review</span>
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => handleSave("DRAFT")}
                  disabled={isPending}
                  className="w-full text-xs font-medium h-9 gap-2 text-muted-foreground"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>Save as Draft</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Live Student Preview Mode */
        <div className="max-w-3xl mx-auto rounded-2xl border border-border bg-card p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs font-mono">
                  {currentSubject?.name || "Subject"} (Code {currentSubject?.code || "CUET"})
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  Unit {unitNumber} • {difficulty}
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Marks: +{marks} / -{negativeMarks}
              </p>
            </div>

            <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
              Student CBT View Preview
            </Badge>
          </div>

          {includePassage && passageText && (
            <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-2">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                {passageTitle || "Reference Passage"}
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line font-serif">
                {passageText}
              </p>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-sm sm:text-base font-semibold text-foreground leading-relaxed whitespace-pre-line">
              {questionText || "Question statement preview will appear here..."}
            </h3>

            <div className="space-y-2.5 pt-2">
              {options.map((opt) => (
                <div
                  key={opt.optionLabel}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border/80 bg-background hover:bg-muted/40 transition-colors"
                >
                  <span className="h-6 w-6 rounded-md border border-border/80 flex items-center justify-center text-xs font-semibold text-muted-foreground">
                    {opt.optionLabel}
                  </span>
                  <span className="text-xs text-foreground font-medium">
                    {opt.optionText || `Option ${opt.optionLabel}`}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {explanation && (
            <div className="p-4 rounded-xl border border-emerald-200/60 bg-emerald-50/40 dark:bg-emerald-950/20 text-xs space-y-1.5">
              <span className="font-bold text-emerald-800 dark:text-emerald-300">
                Official Solution & Explanation:
              </span>
              <p className="text-emerald-900/80 dark:text-emerald-200/80 leading-relaxed">
                {explanation}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
