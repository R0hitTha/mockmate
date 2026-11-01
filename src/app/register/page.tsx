import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { UserPlus, ArrowRight, GraduationCap } from "lucide-react";
import { PublicLayout } from "@/components/layout/public-layout";
import { Container } from "@/components/layout/container";
import { Card, CardContent } from "@/components/layout/card";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/feedback/alert";

export const metadata: Metadata = {
  title: "Get Started — MockMate (Phase 4 Ready)",
  description: "Create your MockMate student profile. Scheduled for Phase 4 onboarding.",
};

export default function RegisterPage() {
  return (
    <PublicLayout>
      <div className="py-16 sm:py-24 bg-background">
        <Container size="sm">
          <div className="max-w-md mx-auto space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 flex items-center justify-center mx-auto mb-2">
                <UserPlus className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
                Start Preparing with MockMate
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Begin with free diagnostic mock exams for CUET UG 2026/2027.
              </p>
            </div>

            <Alert variant="info" title="Phase 4 Integration Milestone">
              Student account creation and subject onboarding are scheduled for{" "}
              <span className="font-bold">Phase 4</span>. This ensures seamless database
              linkage without premature stubbing.
            </Alert>

            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="p-4 rounded-xl bg-muted/60 text-xs text-muted-foreground space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-foreground">
                    <GraduationCap className="w-4 h-4 text-blue-600" />
                    <span>Included in Free Registration:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 pl-1">
                    <li>1 Full-length diagnostic mock per subject</li>
                    <li>Official NTA computer-based exam simulator</li>
                    <li>Detailed step-by-step solution breakdowns</li>
                    <li>Baseline chapter accuracy diagnostics</li>
                  </ul>
                </div>

                <div className="pt-2 flex flex-col gap-2.5">
                  <Button asChild className="w-full">
                    <Link href="/">
                      Explore Homepage & CBT Preview
                      <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/cuet-subjects">View Syllabus & Subjects</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </Container>
      </div>
    </PublicLayout>
  );
}
