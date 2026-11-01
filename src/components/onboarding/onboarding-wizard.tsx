"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Calendar,
  GraduationCap,
  BookOpen,
  Building2,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Check,
  Sparkles,
} from "lucide-react";
import { Container } from "@/components/layout/container";
import { Card, CardContent } from "@/components/layout/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ProgressBar } from "@/components/feedback/progress-bar";
import { Logo } from "@/components/brand/logo";
import {
  ACADEMIC_STATUSES,
  TARGET_YEARS,
  STREAMS,
  PROVISIONAL_LANGUAGES,
  PROVISIONAL_DOMAINS,
  PROVISIONAL_UNIVERSITIES,
  type CompleteOnboardingInput,
} from "@/lib/validations/onboarding";
import { normalizeIndianPhoneNumber } from "@/lib/phone";
import { saveStepProgress, completeStudentOnboarding } from "@/actions/onboarding";

interface OnboardingWizardProps {
  initialName?: string;
  initialPhone?: string;
  initialStep?: number;
}

export function OnboardingWizard({
  initialName = "",
  initialPhone = "",
  initialStep = 1,
}: OnboardingWizardProps) {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState<number>(
    Math.min(Math.max(initialStep, 1), 6)
  );
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [stepError, setStepError] = useState<string | null>(null);

  // Form State initialized from server props
  const [formData, setFormData] = useState<CompleteOnboardingInput>({
    name: initialName,
    phone: initialPhone,
    academicStatus: "CLASS_12_APPEARING",
    targetExamYear: 2026,
    class12Status: "Currently studying in Class 12",
    stream: "SCIENCE",
    languages: ["101"], // English by default
    domains: ["314", "306", "312"], // Physics, Chemistry, Maths by default for science
    generalTest: true,
    universities: ["DU", "BHU"],
  });

  // Handle stream change and adjust suggested domains
  const handleStreamChange = (
    stream: "SCIENCE" | "COMMERCE" | "HUMANITIES" | "OTHER"
  ) => {
    let suggestedDomains: string[] = [];
    if (stream === "SCIENCE") {
      suggestedDomains = ["314", "306", "312"];
    } else if (stream === "COMMERCE") {
      suggestedDomains = ["301", "305", "308"];
    } else if (stream === "HUMANITIES") {
      suggestedDomains = ["310", "315", "309"];
    } else {
      suggestedDomains = ["313"];
    }
    setFormData((prev) => ({
      ...prev,
      stream,
      domains: suggestedDomains,
    }));
  };

  // Step 1 Validation
  const validateStep1 = () => {
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      setStepError("Please enter your full name (at least 2 characters).");
      return false;
    }
    const phoneRes = normalizeIndianPhoneNumber(formData.phone);
    if (!phoneRes.isValid) {
      setStepError(
        phoneRes.error || "Please enter a valid 10-digit Indian mobile number."
      );
      return false;
    }
    return true;
  };

  // Step 4 Validation
  const validateStep4 = () => {
    if (formData.languages.length === 0) {
      setStepError("Please select at least 1 language paper (e.g. English or Hindi).");
      return false;
    }
    if (formData.domains.length === 0) {
      setStepError("Please select at least 1 domain subject.");
      return false;
    }
    return true;
  };

  // Handle Next / Continue
  const handleNext = async () => {
    setStepError(null);

    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 4 && !validateStep4()) return;

    try {
      setIsSaving(true);
      await saveStepProgress(currentStep + 1, formData);
      setCurrentStep((prev) => Math.min(prev + 1, 6));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setCurrentStep((prev) => Math.min(prev + 1, 6));
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Back
  const handleBack = () => {
    setStepError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Final Submission (Step 6)
  const handleCompleteSetup = async () => {
    try {
      setIsSaving(true);
      setStepError(null);

      const result = await completeStudentOnboarding(formData);

      if (!result.success) {
        setStepError(result.error || "Failed to complete onboarding. Please try again.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      console.error("[ONBOARDING_ERROR]", err);
      setStepError(
        "A network error occurred while finalizing your profile. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const stepTitles = [
    "Personal Info",
    "CUET Target",
    "Academic Stream",
    "Subject Selection",
    "Target Universities",
    "Review & Confirm",
  ];

  const progressPercentage = Math.round((currentStep / 6) * 100);

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col justify-between">
      {/* Top Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <div className="hidden sm:block h-4 w-px bg-border" />
            <span className="hidden sm:inline-block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Student Onboarding
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground font-medium">
              Step <span className="text-foreground font-bold">{currentStep}</span> of 6
            </span>
            <Badge variant="secondary" className="text-xs">
              {progressPercentage}% Completed
            </Badge>
          </div>
        </div>
        {/* Visual Progress Bar */}
        <ProgressBar value={progressPercentage} className="h-1 rounded-none bg-muted" />
      </header>

      {/* Main Content Area */}
      <main className="py-8 sm:py-12 flex-1">
        <Container size="default">
          <div className="space-y-6">
            {/* Step Pills on Desktop */}
            <div className="hidden md:grid grid-cols-6 gap-2 text-center text-xs font-medium">
              {stepTitles.map((title, idx) => {
                const stepNum = idx + 1;
                const isCurrent = stepNum === currentStep;
                const isDone = stepNum < currentStep;
                return (
                  <div
                    key={title}
                    className={`py-2 px-1 rounded-lg border transition-all ${
                      isCurrent
                        ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                        : isDone
                          ? "border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400"
                          : "border-border bg-card text-muted-foreground"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1">
                      {isDone ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <span>{stepNum}.</span>
                      )}
                      <span className="truncate">{title}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Error Notification */}
            {stepError && (
              <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-xs uppercase tracking-wider">
                    Action Required
                  </p>
                  <p>{stepError}</p>
                </div>
              </div>
            )}

            {/* Step Card Shell */}
            <Card className="border-border shadow-xs">
              <CardContent className="p-6 sm:p-8">
                {/* ---------------------------------------------------- */}
                {/* STEP 1: Personal Info & Identity                     */}
                {/* ---------------------------------------------------- */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-wider uppercase">
                        <User className="w-4 h-4" />
                        <span>Step 1: Personal Profile</span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                        Tell us about yourself
                      </h2>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Your identity details are used to personalize your CUET mock tests
                        and ensure account uniqueness.
                      </p>
                    </div>

                    <div className="space-y-4 pt-2">
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="fullName"
                          className="text-xs font-semibold text-foreground"
                        >
                          Full Name
                        </Label>
                        <Input
                          id="fullName"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          placeholder="e.g. Aryan Sharma"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label
                          htmlFor="phone"
                          className="text-xs font-semibold text-foreground"
                        >
                          Mobile Number (+91)
                        </Label>
                        <div className="relative flex rounded-md">
                          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-xs font-semibold">
                            🇮🇳 +91
                          </span>
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) =>
                              setFormData({ ...formData, phone: e.target.value })
                            }
                            placeholder="9876543210"
                            className="rounded-l-none"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Used to secure your student profile and prevent duplicate
                          accounts.
                        </p>
                      </div>

                      <div className="space-y-2 pt-2">
                        <Label className="text-xs font-semibold text-foreground">
                          Current Academic Status
                        </Label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {ACADEMIC_STATUSES.map((status) => (
                            <button
                              key={status.value}
                              type="button"
                              onClick={() =>
                                setFormData({
                                  ...formData,
                                  academicStatus: status.value,
                                })
                              }
                              className={`p-3.5 rounded-xl border text-left transition-all ${
                                formData.academicStatus === status.value
                                  ? "border-primary bg-primary/5 text-foreground ring-1 ring-primary"
                                  : "border-border hover:bg-muted/50 text-muted-foreground"
                              }`}
                            >
                              <div className="text-xs font-bold text-foreground">
                                {status.label.split("(")[0]}
                              </div>
                              {status.label.includes("(") && (
                                <div className="text-xs text-muted-foreground mt-0.5">
                                  ({status.label.split("(")[1]}
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ---------------------------------------------------- */}
                {/* STEP 2: CUET Target Year                             */}
                {/* ---------------------------------------------------- */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-wider uppercase">
                        <Calendar className="w-4 h-4" />
                        <span>Step 2: Target Examination</span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                        Which CUET UG examination are you targeting?
                      </h2>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        We configure test schedules, syllabus patterns, and countdown
                        timers to your target year.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      {TARGET_YEARS.map((y) => (
                        <div
                          key={y.value}
                          onClick={() =>
                            setFormData({
                              ...formData,
                              targetExamYear: y.value,
                            })
                          }
                          className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                            formData.targetExamYear === y.value
                              ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs"
                              : "border-border hover:border-border/80 bg-card"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-2xl font-black text-foreground">
                              CUET UG {y.value}
                            </span>
                            {formData.targetExamYear === y.value && (
                              <CheckCircle className="w-5 h-5 text-primary" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {y.label}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-1.5 pt-2">
                      <Label
                        htmlFor="class12Status"
                        className="text-xs font-semibold text-foreground"
                      >
                        Class 12 Completion Status
                      </Label>
                      <Input
                        id="class12Status"
                        value={formData.class12Status}
                        onChange={(e) =>
                          setFormData({ ...formData, class12Status: e.target.value })
                        }
                        placeholder="e.g. CBSE Board 2026 Batch, appearing in March"
                      />
                    </div>
                  </div>
                )}

                {/* ---------------------------------------------------- */}
                {/* STEP 3: Academic Background & Stream                 */}
                {/* ---------------------------------------------------- */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-wider uppercase">
                        <GraduationCap className="w-4 h-4" />
                        <span>Step 3: Academic Stream</span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                        What is your high school academic stream?
                      </h2>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        This pre-configures your recommended domain subjects, which you
                        can customize in the next step.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                      {STREAMS.map((st) => (
                        <div
                          key={st.value}
                          onClick={() => handleStreamChange(st.value)}
                          className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                            formData.stream === st.value
                              ? "border-primary bg-primary/5 ring-1 ring-primary shadow-xs"
                              : "border-border hover:bg-muted/40 bg-card"
                          }`}
                        >
                          <div>
                            <div className="text-sm font-bold text-foreground">
                              {st.label.split("(")[0]}
                            </div>
                            {st.label.includes("(") && (
                              <div className="text-xs text-muted-foreground mt-0.5">
                                ({st.label.split("(")[1]}
                              </div>
                            )}
                          </div>
                          {formData.stream === st.value && (
                            <CheckCircle className="w-5 h-5 text-primary shrink-0 ml-2" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ---------------------------------------------------- */}
                {/* STEP 4: Subject Preferences                          */}
                {/* ---------------------------------------------------- */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-wider uppercase">
                        <BookOpen className="w-4 h-4" />
                        <span>Step 4: CUET Test Papers</span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                        Select your CUET UG examination subjects
                      </h2>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        You can take up to 6 test papers as per NTA CUET guidelines. All
                        selections can be edited anytime in your profile.
                      </p>
                    </div>

                    {/* Section IA/IB: Languages */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-bold uppercase tracking-wider text-foreground">
                          Section I: Language Papers (Select at least 1)
                        </Label>
                        <span className="text-xs text-muted-foreground">
                          {formData.languages.length} selected
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {PROVISIONAL_LANGUAGES.map((lang) => {
                          const isSelected = formData.languages.includes(lang.code);
                          return (
                            <button
                              key={lang.code}
                              type="button"
                              onClick={() => {
                                setFormData((prev) => ({
                                  ...prev,
                                  languages: isSelected
                                    ? prev.languages.filter((c) => c !== lang.code)
                                    : [...prev.languages, lang.code],
                                }));
                              }}
                              className={`p-2.5 rounded-lg border text-xs font-semibold text-left flex items-center justify-between transition-all ${
                                isSelected
                                  ? "border-primary bg-primary/10 text-primary"
                                  : "border-border hover:bg-muted/50 text-foreground"
                              }`}
                            >
                              <span>{lang.name}</span>
                              {isSelected && <Check className="w-3.5 h-3.5" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Section II: Domain Subjects */}
                    <div className="space-y-2.5 pt-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-bold uppercase tracking-wider text-foreground">
                          Section II: Domain Subjects (Select your subjects)
                        </Label>
                        <span className="text-xs text-muted-foreground">
                          {formData.domains.length} selected
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {PROVISIONAL_DOMAINS.map((domain) => {
                          const isSelected = formData.domains.includes(domain.code);
                          return (
                            <button
                              key={domain.code}
                              type="button"
                              onClick={() => {
                                setFormData((prev) => ({
                                  ...prev,
                                  domains: isSelected
                                    ? prev.domains.filter((c) => c !== domain.code)
                                    : [...prev.domains, domain.code],
                                }));
                              }}
                              className={`p-2.5 rounded-lg border text-xs font-medium text-left flex items-center justify-between transition-all ${
                                isSelected
                                  ? "border-primary bg-primary/10 text-primary font-bold"
                                  : "border-border hover:bg-muted/50 text-foreground"
                              }`}
                            >
                              <span className="truncate">{domain.name}</span>
                              {isSelected && (
                                <Check className="w-3.5 h-3.5 shrink-0 ml-1.5" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Section III: General Test Toggle */}
                    <div className="pt-2 p-4 rounded-xl border border-border bg-card flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-foreground">
                          Section III: General Aptitude Test (GT)
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Recommended for B.A., B.Com, and interdisciplinary courses in
                          central universities.
                        </div>
                      </div>
                      <Switch
                        checked={formData.generalTest}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, generalTest: checked })
                        }
                      />
                    </div>
                  </div>
                )}

                {/* ---------------------------------------------------- */}
                {/* STEP 5: Target Universities                          */}
                {/* ---------------------------------------------------- */}
                {currentStep === 5 && (
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-wider uppercase">
                        <Building2 className="w-4 h-4" />
                        <span>Step 5: Target Universities (Optional)</span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                        Which universities are you aspiring to join?
                      </h2>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Select one or more central/state universities. You can skip this
                        step and add them later.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {PROVISIONAL_UNIVERSITIES.map((uni) => {
                        const isSelected = formData.universities.includes(uni.code);
                        return (
                          <div
                            key={uni.code}
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                universities: isSelected
                                  ? prev.universities.filter((c) => c !== uni.code)
                                  : [...prev.universities, uni.code],
                              }));
                            }}
                            className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                              isSelected
                                ? "border-primary bg-primary/5 ring-1 ring-primary"
                                : "border-border hover:bg-muted/40 bg-card"
                            }`}
                          >
                            <div>
                              <div className="text-xs sm:text-sm font-bold text-foreground">
                                {uni.name}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {uni.state}
                              </div>
                            </div>
                            {isSelected && (
                              <CheckCircle className="w-4 h-4 text-primary shrink-0 ml-2" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ---------------------------------------------------- */}
                {/* STEP 6: Review & Finalize                            */}
                {/* ---------------------------------------------------- */}
                {currentStep === 6 && (
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-wider uppercase">
                        <Sparkles className="w-4 h-4" />
                        <span>Step 6: Review & Complete Setup</span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                        Confirm your CUET preparation profile
                      </h2>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Everything is set! Review your selections below before entering
                        your student dashboard.
                      </p>
                    </div>

                    <div className="space-y-3 pt-2">
                      {/* Personal Info summary */}
                      <div className="p-4 rounded-xl border border-border bg-muted/30 flex items-center justify-between">
                        <div>
                          <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                            Student Identity
                          </div>
                          <div className="text-sm font-bold text-foreground mt-0.5">
                            {formData.name} • {formData.phone}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {
                              ACADEMIC_STATUSES.find(
                                (s) => s.value === formData.academicStatus
                              )?.label
                            }
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCurrentStep(1)}
                          className="text-xs"
                        >
                          Edit
                        </Button>
                      </div>

                      {/* Target Year & Stream */}
                      <div className="p-4 rounded-xl border border-border bg-muted/30 flex items-center justify-between">
                        <div>
                          <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                            Target Examination & Stream
                          </div>
                          <div className="text-sm font-bold text-foreground mt-0.5">
                            CUET UG {formData.targetExamYear} • {formData.stream} Stream
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formData.class12Status}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCurrentStep(2)}
                          className="text-xs"
                        >
                          Edit
                        </Button>
                      </div>

                      {/* Subjects */}
                      <div className="p-4 rounded-xl border border-border bg-muted/30 flex items-center justify-between">
                        <div className="space-y-1 max-w-[80%]">
                          <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                            CUET Test Papers
                          </div>
                          <div className="flex flex-wrap gap-1.5 pt-0.5">
                            {formData.languages.map((code) => {
                              const match = PROVISIONAL_LANGUAGES.find(
                                (l) => l.code === code
                              );
                              return (
                                <Badge key={code} variant="secondary" className="text-xs">
                                  {match ? match.name : code}
                                </Badge>
                              );
                            })}
                            {formData.domains.map((code) => {
                              const match = PROVISIONAL_DOMAINS.find(
                                (d) => d.code === code
                              );
                              return (
                                <Badge key={code} variant="outline" className="text-xs">
                                  {match ? match.name : code}
                                </Badge>
                              );
                            })}
                            {formData.generalTest && (
                              <Badge variant="default" className="text-xs">
                                General Test (GT)
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCurrentStep(4)}
                          className="text-xs"
                        >
                          Edit
                        </Button>
                      </div>

                      {/* Universities */}
                      <div className="p-4 rounded-xl border border-border bg-muted/30 flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                            Target Universities
                          </div>
                          <div className="text-xs text-foreground font-medium">
                            {formData.universities.length > 0
                              ? formData.universities
                                  .map(
                                    (u) =>
                                      PROVISIONAL_UNIVERSITIES.find(
                                        (item) => item.code === u
                                      )?.name || u
                                  )
                                  .join(", ")
                              : "None selected (Skipped)"}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCurrentStep(5)}
                          className="text-xs"
                        >
                          Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Bottom Navigation Buttons */}
                <div className="pt-8 border-t border-border mt-8 flex items-center justify-between">
                  {currentStep > 1 ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                      disabled={isSaving}
                      className="text-xs font-semibold"
                    >
                      <ArrowLeft className="w-4 h-4 mr-1.5" />
                      <span>Back</span>
                    </Button>
                  ) : (
                    <div />
                  )}

                  {currentStep < 6 ? (
                    <Button
                      type="button"
                      onClick={handleNext}
                      disabled={isSaving}
                      isLoading={isSaving}
                      className="text-xs font-semibold px-6"
                    >
                      <span>Continue</span>
                      <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={handleCompleteSetup}
                      disabled={isSaving}
                      isLoading={isSaving}
                      className="text-xs font-bold px-8 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                    >
                      <span>Complete Setup & Enter Dashboard</span>
                      <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </Container>
      </main>
    </div>
  );
}
