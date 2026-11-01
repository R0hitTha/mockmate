"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Calendar,
  BookOpen,
  Building2,
  LogOut,
  Save,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { StudentLayout } from "@/components/layout/student-layout";
import { Container } from "@/components/layout/container";
import { Card, CardContent } from "@/components/layout/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  ACADEMIC_STATUSES,
  TARGET_YEARS,
  STREAMS,
  PROVISIONAL_LANGUAGES,
  PROVISIONAL_DOMAINS,
  PROVISIONAL_UNIVERSITIES,
} from "@/lib/validations/onboarding";
import { updateStudentProfile } from "@/actions/profile";
import { authClient } from "@/lib/auth-client";

interface ProfileFormProps {
  initialUser: {
    id: string;
    name?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  };
  initialProfile?: {
    normalizedPhone?: string | null;
    phoneVerified?: boolean | null;
    academicStatus?: string | null;
    stream?: string | null;
    targetExamYear?: number | null;
    subjectPreferences?: Array<{ subjectCode: string }>;
    universityPreferences?: Array<{ universityCode: string }>;
  } | null;
}

export function ProfileForm({ initialUser, initialProfile }: ProfileFormProps) {
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Form editable states initialized directly from server props
  const [name, setName] = useState(initialUser.name || "");
  const [phone, setPhone] = useState(initialProfile?.normalizedPhone || "");
  const [academicStatus, setAcademicStatus] = useState(
    initialProfile?.academicStatus || "CLASS_12_APPEARING"
  );
  const [stream, setStream] = useState<"SCIENCE" | "COMMERCE" | "HUMANITIES" | "OTHER">(
    (initialProfile?.stream as "SCIENCE" | "COMMERCE" | "HUMANITIES" | "OTHER") ||
      "SCIENCE"
  );
  const [targetExamYear, setTargetExamYear] = useState<number>(
    initialProfile?.targetExamYear || 2026
  );
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(
    initialProfile?.subjectPreferences?.map((s) => s.subjectCode) || [
      "101",
      "314",
      "306",
      "312",
    ]
  );
  const [selectedUniversities, setSelectedUniversities] = useState<string[]>(
    initialProfile?.universityPreferences?.map((u) => u.universityCode) || ["DU", "BHU"]
  );

  const emailVerified = Boolean(initialUser.emailVerified);
  const phoneVerified = Boolean(initialProfile?.phoneVerified);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const result = await updateStudentProfile({
        name,
        phone: phone || undefined,
        stream,
        targetExamYear,
        academicStatus,
        subjectCodes: selectedSubjects,
        universityCodes: selectedUniversities,
      });

      if (result.success) {
        setMessage({
          type: "success",
          text: result.message || "Profile updated successfully.",
        });
      } else {
        setMessage({ type: "error", text: result.error || "Failed to update profile." });
      }
    } catch {
      setMessage({ type: "error", text: "A network error occurred. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("[LOGOUT_ERROR]", err);
      router.push("/login");
    }
  };

  const toggleSubject = (code: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const toggleUniversity = (code: string) => {
    setSelectedUniversities((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  return (
    <StudentLayout
      activeRoute="/profile"
      breadcrumbs={[
        { label: "Student Portal", href: "/dashboard" },
        { label: "Student Profile" },
      ]}
    >
      <div className="py-8 bg-background">
        <Container size="default">
          <div className="space-y-6">
            {/* Header with Title and Logout */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
              <div>
                <h1 className="text-2xl font-black text-foreground tracking-tight">
                  Student Profile & Preferences
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  Manage your personal information, target CUET year, and subject
                  enrollments.
                </p>
              </div>

              <Button
                variant="outline"
                onClick={handleLogout}
                className="text-xs text-destructive hover:bg-destructive/10 border-destructive/20 self-start sm:self-auto"
              >
                <LogOut className="w-4 h-4 mr-1.5" />
                <span>Log Out</span>
              </Button>
            </div>

            {/* Notification alert */}
            {message && (
              <div
                className={`p-4 rounded-xl border text-sm flex items-start gap-2.5 ${
                  message.type === "success"
                    ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                    : "bg-destructive/10 border-destructive/20 text-destructive"
                }`}
              >
                {message.type === "success" ? (
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                )}
                <span>{message.text}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-6">
              {/* Account & Verification Details */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <User className="w-4 h-4 text-primary" />
                    <span>Account Verification & Identity</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    {/* Full Name */}
                    <div className="space-y-1.5">
                      <Label htmlFor="profName" className="text-xs font-semibold">
                        Full Name
                      </Label>
                      <Input
                        id="profName"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your full name"
                      />
                    </div>

                    {/* Email (Readonly) */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="profEmail" className="text-xs font-semibold">
                          Registered Email
                        </Label>
                        <Badge
                          variant={emailVerified ? "default" : "secondary"}
                          className="text-[10px]"
                        >
                          {emailVerified ? "Verified" : "Verification Pending"}
                        </Badge>
                      </div>
                      <Input
                        id="profEmail"
                        value={initialUser.email || ""}
                        disabled
                        className="bg-muted text-muted-foreground"
                      />
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="profPhone" className="text-xs font-semibold">
                          Mobile Number
                        </Label>
                        <Badge
                          variant={phoneVerified ? "default" : "outline"}
                          className="text-[10px]"
                        >
                          {phoneVerified ? "Verified" : "Unverified"}
                        </Badge>
                      </div>
                      <Input
                        id="profPhone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. 9876543210"
                      />
                      <p className="text-[11px] text-muted-foreground">
                        Phone verification is enforced to prevent duplicate student
                        profiles.
                      </p>
                    </div>

                    {/* Academic Status */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Academic Status</Label>
                      <select
                        value={academicStatus}
                        onChange={(e) => setAcademicStatus(e.target.value)}
                        className="w-full h-9 rounded-md border border-input bg-card px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                      >
                        {ACADEMIC_STATUSES.map((st) => (
                          <option key={st.value} value={st.value}>
                            {st.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* CUET Target & Stream */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span>Target Examination & Academic Stream</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    {/* Target Year */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Target CUET Year</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {TARGET_YEARS.map((y) => (
                          <button
                            key={y.value}
                            type="button"
                            onClick={() => setTargetExamYear(y.value)}
                            className={`p-2.5 rounded-lg border text-xs font-bold transition-all ${
                              targetExamYear === y.value
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border hover:bg-muted/50 text-muted-foreground"
                            }`}
                          >
                            CUET UG {y.value}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Academic Stream */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Academic Stream</Label>
                      <select
                        value={stream}
                        onChange={(e) =>
                          setStream(
                            e.target.value as
                              "SCIENCE" | "COMMERCE" | "HUMANITIES" | "OTHER"
                          )
                        }
                        className="w-full h-9 rounded-md border border-input bg-card px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                      >
                        {STREAMS.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Subject Preferences */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      <BookOpen className="w-4 h-4 text-primary" />
                      <span>Enrolled CUET Test Papers</span>
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">
                      {selectedSubjects.length} selected
                    </span>
                  </div>

                  {/* Languages */}
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-foreground">
                      Languages (Section IA & IB)
                    </Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {PROVISIONAL_LANGUAGES.map((lang) => {
                        const isSelected = selectedSubjects.includes(lang.code);
                        return (
                          <button
                            key={lang.code}
                            type="button"
                            onClick={() => toggleSubject(lang.code)}
                            className={`p-2 rounded-lg border text-xs font-medium text-left truncate transition-all ${
                              isSelected
                                ? "border-primary bg-primary/10 text-primary font-bold"
                                : "border-border hover:bg-muted/50 text-muted-foreground"
                            }`}
                          >
                            {lang.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Domains */}
                  <div className="space-y-2 pt-2">
                    <Label className="text-xs font-semibold text-foreground">
                      Domain Subjects (Section II)
                    </Label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {PROVISIONAL_DOMAINS.map((dom) => {
                        const isSelected = selectedSubjects.includes(dom.code);
                        return (
                          <button
                            key={dom.code}
                            type="button"
                            onClick={() => toggleSubject(dom.code)}
                            className={`p-2 rounded-lg border text-xs font-medium text-left truncate transition-all ${
                              isSelected
                                ? "border-primary bg-primary/10 text-primary font-bold"
                                : "border-border hover:bg-muted/50 text-muted-foreground"
                            }`}
                          >
                            {dom.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Target Universities */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      <Building2 className="w-4 h-4 text-primary" />
                      <span>Target Universities</span>
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">
                      {selectedUniversities.length} selected
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {PROVISIONAL_UNIVERSITIES.map((uni) => {
                      const isSelected = selectedUniversities.includes(uni.code);
                      return (
                        <button
                          key={uni.code}
                          type="button"
                          onClick={() => toggleUniversity(uni.code)}
                          className={`p-3 rounded-lg border text-xs font-medium text-left transition-all ${
                            isSelected
                              ? "border-primary bg-primary/10 text-primary font-bold"
                              : "border-border hover:bg-muted/50 text-muted-foreground"
                          }`}
                        >
                          <div>{uni.name}</div>
                          <div className="text-[10px] text-muted-foreground font-normal">
                            {uni.state}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Submit Save Changes */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={saving}
                  isLoading={saving}
                  className="px-6 h-11 text-xs font-bold"
                >
                  <Save className="w-4 h-4 mr-1.5" />
                  <span>Save Profile Updates</span>
                </Button>
              </div>
            </form>
          </div>
        </Container>
      </div>
    </StudentLayout>
  );
}
