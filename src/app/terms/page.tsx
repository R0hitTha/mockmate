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
  title: "Terms of Service (Placeholder) — MockMate",
  description: "MockMate terms of service and academic platform guidelines.",
};

export default function TermsPage() {
  return (
    <PublicLayout>
      <div className="py-12 border-b border-border bg-gradient-to-b from-surface to-background">
        <Container size="lg">
          <PageHeader
            title="Terms of Service"
            description="Guidelines and terms governing the use of MockMate's CUET UG preparation platform."
            badge={<Badge variant="outline">Legal Policy</Badge>}
          />
        </Container>
      </div>

      <div className="py-14 sm:py-20 bg-background">
        <Container size="default">
          <Card className="p-6 sm:p-10 space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">
                Academic Use Agreement
              </h2>
              <p className="text-xs text-muted-foreground">
                Last updated: November 2026 • Development Draft
              </p>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              <p>
                By accessing or using the MockMate platform, you agree to prepare honestly
                and use our examination content strictly for individual educational
                practice.
              </p>
              <h3 className="text-base font-bold text-foreground pt-2">
                1. Independent Preparation Platform
              </h3>
              <p>
                MockMate is an independent academic preparation platform. CUET UG is
                administered by the National Testing Agency (NTA). MockMate is neither
                affiliated with nor endorsed by the NTA.
              </p>
              <h3 className="text-base font-bold text-foreground pt-2">
                2. Intellectual Property
              </h3>
              <p>
                All mock examinations, question solutions, analytics algorithms, and
                software code are the intellectual property of MockMate. Content may not
                be scraped, redistributed, or repackaged without written authorization.
              </p>
              <h3 className="text-base font-bold text-foreground pt-2">
                3. Examination Availability
              </h3>
              <p>
                During phased development, features and question libraries are expanded
                incrementally. We strive to maintain continuous platform availability and
                exam-state persistence.
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
