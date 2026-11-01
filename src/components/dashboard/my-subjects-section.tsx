import React from "react";
import Link from "next/link";
import { BookOpen, Layers, ArrowRight, User, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/layout/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface SubjectItem {
  id: string;
  subjectCode: string;
  subjectName: string;
  category: string; // LANGUAGE, DOMAIN, GENERAL_TEST
}

export interface MySubjectsSectionProps {
  subjects: SubjectItem[];
  targetExamYear: number;
}

export function MySubjectsSection({ subjects, targetExamYear }: MySubjectsSectionProps) {
  const languages = subjects.filter((s) => s.category === "LANGUAGE");
  const domains = subjects.filter((s) => s.category === "DOMAIN");
  const generalTest = subjects.filter((s) => s.category === "GENERAL_TEST");

  if (subjects.length === 0) {
    return (
      <Card className="border-border shadow-2xs">
        <CardContent className="p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-foreground">
              No CUET Test Papers Selected
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              You haven&apos;t enrolled in any CUET subjects yet. Configure your
              languages, domain subjects, and general test to customize your mock exams.
            </p>
          </div>
          <Button asChild size="sm">
            <Link href="/profile">
              <User className="w-4 h-4 mr-1.5" />
              <span>Select CUET Subjects</span>
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-foreground">My Enrolled Subjects</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configured for your CUET UG {targetExamYear} examination curriculum
          </p>
        </div>
        <Button variant="ghost" size="sm" asChild className="text-xs">
          <Link href="/profile" className="flex items-center gap-1.5">
            <span>Edit Subjects</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Group 1: Languages */}
        <Card className="border-border shadow-2xs">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Languages (Sec I)
                </span>
              </div>
              <Badge variant="secondary" className="text-[10px]">
                {languages.length} Selected
              </Badge>
            </div>

            <div className="space-y-2">
              {languages.map((lang) => (
                <div
                  key={lang.id}
                  className="p-2.5 rounded-lg border border-border/80 bg-muted/30 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5 min-w-0 pr-2">
                    <div className="font-semibold text-foreground truncate">
                      {lang.subjectName}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      Code: {lang.subjectCode} • Reading Comprehension
                    </div>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                </div>
              ))}
              {languages.length === 0 && (
                <p className="text-xs text-muted-foreground py-2 text-center">
                  No language paper selected
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Group 2: Domain Subjects */}
        <Card className="border-border shadow-2xs">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Domains (Sec II)
                </span>
              </div>
              <Badge variant="secondary" className="text-[10px]">
                {domains.length} Selected
              </Badge>
            </div>

            <div className="space-y-2">
              {domains.map((dom) => (
                <div
                  key={dom.id}
                  className="p-2.5 rounded-lg border border-border/80 bg-muted/30 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5 min-w-0 pr-2">
                    <div className="font-semibold text-foreground truncate">
                      {dom.subjectName}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      Code: {dom.subjectCode} • NCERT Class 12
                    </div>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                </div>
              ))}
              {domains.length === 0 && (
                <p className="text-xs text-muted-foreground py-2 text-center">
                  No domain subjects selected
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Group 3: General Test */}
        <Card className="border-border shadow-2xs">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                  General Test (Sec III)
                </span>
              </div>
              <Badge variant="secondary" className="text-[10px]">
                {generalTest.length > 0 ? "Enrolled" : "Not Enrolled"}
              </Badge>
            </div>

            <div className="space-y-2">
              {generalTest.length > 0 ? (
                <div className="p-2.5 rounded-lg border border-border/80 bg-muted/30 flex items-center justify-between text-xs">
                  <div className="space-y-0.5 min-w-0 pr-2">
                    <div className="font-semibold text-foreground">
                      General Aptitude Test (GT)
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      Code: 501 • Quant, Logic, GK & Current Affairs
                    </div>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                </div>
              ) : (
                <div className="py-4 text-center space-y-2">
                  <p className="text-xs text-muted-foreground">
                    General Test is not included in your profile.
                  </p>
                  <Button variant="outline" size="sm" asChild className="text-[11px] h-8">
                    <Link href="/profile">Add General Test</Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
