import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Lock, ArrowRight, ShieldCheck } from "lucide-react";
import { PublicLayout } from "@/components/layout/public-layout";
import { Container } from "@/components/layout/container";
import { Card, CardContent } from "@/components/layout/card";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/feedback/alert";

export const metadata: Metadata = {
  title: "Sign In — MockMate (Phase 4 Ready)",
  description:
    "MockMate student sign in portal. Scheduled for Phase 4 integration with Better Auth.",
};

export default function LoginPage() {
  return (
    <PublicLayout>
      <div className="py-16 sm:py-24 bg-background">
        <Container size="sm">
          <div className="max-w-md mx-auto space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 flex items-center justify-center mx-auto mb-2">
                <Lock className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
                Sign In to MockMate
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Access your personalized CUET UG test attempts and analytics.
              </p>
            </div>

            <Alert variant="info" title="Phase 4 Integration Milestone">
              Authentication and student sessions (Email/Password & Google OAuth via
              Better Auth) will be implemented in{" "}
              <span className="font-bold">Phase 4</span>. No fake login form or insecure
              mock session has been created.
            </Alert>

            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="p-4 rounded-xl bg-muted/60 text-xs text-muted-foreground space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-foreground">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Upcoming Authentication Capabilities:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 pl-1">
                    <li>Secure session handling via Better Auth</li>
                    <li>Google Single Sign-On (OAuth 2.0)</li>
                    <li>Class 12 CUET target year selection</li>
                    <li>Subject enrollment & diagnostic onboarding</li>
                  </ul>
                </div>

                <div className="pt-2 flex flex-col gap-2.5">
                  <Button asChild className="w-full">
                    <Link href="/">
                      Return to Website Homepage
                      <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/features">Explore Platform Features</Link>
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
