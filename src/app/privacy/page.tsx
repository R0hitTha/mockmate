import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { PublicLayout } from "@/components/layout/public-layout";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/layout/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Privacy Policy (Placeholder) — MockMate",
  description: "MockMate data privacy and student records policy placeholder.",
};

export default function PrivacyPage() {
  return (
    <PublicLayout>
      <div className="py-12 border-b border-border bg-gradient-to-b from-surface to-background">
        <Container size="lg">
          <PageHeader
            title="Privacy Policy"
            description="Our commitment to student data protection, minimal information collection, and test privacy."
            badge={<Badge variant="outline">Legal Policy</Badge>}
          />
        </Container>
      </div>

      <div className="py-14 sm:py-20 bg-background">
        <Container size="default">
          <Card className="p-6 sm:p-10 space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">
                Student Data Protection Notice
              </h2>
              <p className="text-xs text-muted-foreground">
                Last updated: November 2026 • Development Draft
              </p>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              <p>
                MockMate is designed strictly for student examination preparation. We
                collect only the minimal personal information necessary to deliver
                authentic mock test simulations, record your test scores, and analyze your
                performance.
              </p>
              <h3 className="text-base font-bold text-foreground pt-2">
                1. Information We Collect
              </h3>
              <p>
                During early access and account registration (Phase 4), we collect your
                name, email address, and selected CUET target subjects. We do not sell or
                trade student data to third-party coaching institutes or marketing
                brokers.
              </p>
              <h3 className="text-base font-bold text-foreground pt-2">
                2. Test Performance Records
              </h3>
              <p>
                Your mock attempt records, responses, and time-tracking data are securely
                stored in relational databases and accessible solely by your account.
              </p>
              <h3 className="text-base font-bold text-foreground pt-2">
                3. Policy Updates
              </h3>
              <p>
                As additional authentication and payment capabilities are introduced in
                subsequent phases, this policy will be expanded in accordance with
                applicable Indian digital data protection standards.
              </p>
            </div>

            <div className="pt-4 border-t border-border">
              <Button asChild variant="outline" size="sm">
                <Link href="/">Return to Home</Link>
              </Button>
            </div>
          </Card>
        </Container>
      </div>
    </PublicLayout>
  );
}
