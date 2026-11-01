import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Sparkles,
  BookOpen,
  Calendar,
  ShieldCheck,
  ArrowRight,
  User,
  GraduationCap,
} from "lucide-react";
import { StudentLayout } from "@/components/layout/student-layout";
import { Container } from "@/components/layout/container";
import { Card, CardContent } from "@/components/layout/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/feedback/alert";
import { getServerSession, getStudentProfile } from "@/lib/auth-server";

export const instant = false;

export default async function DashboardPage() {
  const session = await getServerSession();

  // Route protection: Must be authenticated
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard");
  }

  // Fetch student profile
  const profile = await getStudentProfile(session.user.id);

  // If student hasn't completed onboarding, redirect to onboarding flow
  if (!profile || !profile.onboardingCompleted) {
    redirect("/onboarding");
  }

  const studentName = session.user.name || "Aspirant";
  const targetYear = profile.targetExamYear || 2026;
  const stream = profile.stream || "General";
  const subjects = profile.subjectPreferences || [];

  return (
    <StudentLayout
      activeRoute="/dashboard"
      breadcrumbs={[
        { label: "Student Portal", href: "/dashboard" },
        { label: "Dashboard" },
      ]}
    >
      <div className="py-8 bg-background">
        <Container size="lg">
          <div className="space-y-6">
            {/* Welcome Banner */}
            <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 text-white shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold backdrop-blur-xs">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>CUET UG {targetYear} Aspirant</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    Welcome back, {studentName}!
                  </h1>
                  <p className="text-xs sm:text-sm text-blue-100 max-w-xl">
                    Your authenticated student profile is fully initialized. Phase 4
                    authentication and onboarding are verified.
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <Button
                    variant="outline"
                    asChild
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
                  >
                    <Link href="/profile">
                      <User className="w-4 h-4 mr-1.5" />
                      <span>View Profile</span>
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Phase 4 Milestone Notice */}
            <Alert variant="info" title="Phase 4 Authenticated Shell">
              You are currently viewing the Phase 4 authenticated landing shell. Full mock
              examination catalogs, test engines, and performance analytics will be
              implemented in upcoming phases (Phase 5: Student Dashboard, Phase 9: CBT
              Engine).
            </Alert>

            {/* Profile Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Target Year & Stream */}
              <Card>
                <CardContent className="p-5 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 flex items-center justify-center">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                      Target Exam
                    </div>
                    <div className="text-lg font-bold text-foreground mt-0.5">
                      CUET UG {targetYear}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>{stream} Stream</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Verified Phone & Security */}
              <Card>
                <CardContent className="p-5 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                      Account Status
                    </div>
                    <div className="text-lg font-bold text-foreground mt-0.5">
                      Onboarding Complete
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 truncate">
                      {profile.normalizedPhone || "No phone added"}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Selected Subjects */}
              <Card>
                <CardContent className="p-5 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 flex items-center justify-center">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                      Enrolled Papers
                    </div>
                    <div className="text-lg font-bold text-foreground mt-0.5">
                      {subjects.length} CUET Papers
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Languages, Domains & General Test
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Enrolled Subjects Details */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-bold text-foreground">
                      Your Registered CUET Test Papers
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Configured during onboarding. Editable at any time in your profile.
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" asChild className="text-xs">
                    <Link href="/profile">Edit Subjects</Link>
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {subjects.map((s) => (
                    <Badge
                      key={s.id}
                      variant={s.category === "LANGUAGE" ? "secondary" : "outline"}
                      className="px-3 py-1 text-xs font-semibold"
                    >
                      {s.subjectName} ({s.category})
                    </Badge>
                  ))}
                  {subjects.length === 0 && (
                    <span className="text-xs text-muted-foreground">
                      No subjects configured yet.
                    </span>
                  )}
                </div>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border">
                  <span className="text-xs text-muted-foreground">
                    Phase 5 (Student Dashboard) will provide real-time syllabus tracking
                    and test launches.
                  </span>
                  <Button asChild size="sm">
                    <Link href="/profile">
                      <span>Manage Student Profile</span>
                      <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </Container>
      </div>
    </StudentLayout>
  );
}
