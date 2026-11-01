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

function getSubjectSlug(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("physics")) return "physics";
  if (n.includes("chemistry")) return "chemistry";
  if (n.includes("math")) return "mathematics";
  if (n.includes("biology")) return "biology";
  if (n.includes("account")) return "accountancy";
  if (n.includes("business")) return "business-studies";
  if (n.includes("econ")) return "economics";
  if (n.includes("history")) return "history";
  if (n.includes("polit")) return "political-science";
  if (n.includes("geograph")) return "geography";
  if (n.includes("computer")) return "computer-science";
  if (n.includes("english")) return "english";
  if (n.includes("hindi")) return "hindi";
  if (n.includes("general") || n.includes("aptitude")) return "general-test";
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
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
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild className="text-xs">
            <Link href="/subjects" className="flex items-center gap-1.5">
              <span>View Syllabus</span>
              <BookOpen className="w-3.5 h-3.5" />
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild className="text-xs">
            <Link href="/profile" className="flex items-center gap-1.5">
              <span>Edit Subjects</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>
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
                <Link
                  key={lang.id}
                  href={`/subjects/${getSubjectSlug(lang.subjectName)}?year=${targetExamYear}`}
                  className="p-2.5 rounded-lg border border-border/80 bg-muted/30 flex items-center justify-between text-xs hover:border-primary/50 hover:bg-primary/5 transition-colors group"
                >
                  <div className="space-y-0.5 min-w-0 pr-2">
                    <div className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                      {lang.subjectName}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      Code: {lang.subjectCode} • View Syllabus →
                    </div>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                </Link>
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
                <Link
                  key={dom.id}
                  href={`/subjects/${getSubjectSlug(dom.subjectName)}?year=${targetExamYear}`}
                  className="p-2.5 rounded-lg border border-border/80 bg-muted/30 flex items-center justify-between text-xs hover:border-primary/50 hover:bg-primary/5 transition-colors group"
                >
                  <div className="space-y-0.5 min-w-0 pr-2">
                    <div className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                      {dom.subjectName}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      Code: {dom.subjectCode} • View Syllabus →
                    </div>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                </Link>
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
                <Link
                  href={`/subjects/general-test?year=${targetExamYear}`}
                  className="p-2.5 rounded-lg border border-border/80 bg-muted/30 flex items-center justify-between text-xs hover:border-primary/50 hover:bg-primary/5 transition-colors group"
                >
                  <div className="space-y-0.5 min-w-0 pr-2">
                    <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      General Aptitude Test (GT)
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      Code: 501 • View Syllabus →
                    </div>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                </Link>
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
