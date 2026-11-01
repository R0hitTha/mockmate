import React from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Bookmark, BookOpen, ArrowRight } from "lucide-react";
import { StudentLayout } from "@/components/layout/student-layout";
import { Card, CardHeader, CardContent } from "@/components/layout/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getServerSession, getStudentProfile } from "@/lib/auth-server";
import { getStudentBookmarks } from "@/lib/mistake-service";

export const instant = false;

interface BookmarksPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function BookmarksPage({ searchParams }: BookmarksPageProps) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/bookmarks");
  }

  const profile = await getStudentProfile(session.user.id);
  if (!profile?.onboardingCompleted) {
    redirect("/onboarding");
  }

  const rawParams = await searchParams;
  const page = typeof rawParams.page === "string" ? parseInt(rawParams.page, 10) : 1;

  const data = await getStudentBookmarks(session.user.id, page, 10);

  return (
    <StudentLayout
      activeRoute="/bookmarks"
      breadcrumbs={[
        { label: "Student Portal", href: "/dashboard" },
        { label: "Bookmarks" },
      ]}
      user={session.user}
      targetExamYear={profile.targetExamYear}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Bookmark className="w-5 h-5 fill-current" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Saved Question Notebook
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Your personal repository of saved questions, tricky problems, and formula reminders.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {data.total} Saved Questions
            </Badge>
          </div>
        </div>

        {/* Bookmarked Questions List */}
        {data.items.length > 0 ? (
          <div className="space-y-4">
            {data.items.map((item, idx) => (
              <Card key={idx} className="border border-border/80 shadow-xs hover:border-primary/30 transition-all">
                <CardHeader className="p-4 bg-muted/20 border-b border-border/60 flex flex-row items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-xs font-semibold uppercase">
                      {item.subjectName}
                    </Badge>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs font-medium text-foreground">{item.topicTitle}</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Saved: {new Date(item.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </div>
                </CardHeader>

                <CardContent className="p-4 sm:p-5 space-y-4">
                  <p className="text-xs sm:text-sm font-medium text-foreground leading-relaxed">
                    {item.questionText}
                  </p>

                  {/* Options */}
                  {item.options && item.options.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {item.options.map((opt, optIdx) => (
                        <div
                          key={opt.optionLabel || optIdx}
                          className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
                            opt.isCorrect
                              ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200 font-medium"
                              : "border-border/60 bg-card text-muted-foreground"
                          }`}
                        >
                          <span className="w-5 h-5 rounded-full bg-muted/60 flex items-center justify-center font-bold text-[10px] shrink-0">
                            {opt.optionLabel}
                          </span>
                          <span className="line-clamp-2">{opt.optionText}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Explanation */}
                  {item.explanation && (
                    <div className="p-3 rounded-lg bg-muted/40 border border-border/60 text-xs text-muted-foreground space-y-1">
                      <span className="font-semibold text-foreground block text-[11px] uppercase">Solution Note</span>
                      <p className="line-clamp-3 leading-relaxed">{item.explanation}</p>
                    </div>
                  )}

                  {/* Student Notes */}
                  {item.notes && (
                    <div className="p-2.5 rounded bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200">
                      <strong>My Note:</strong> {item.notes}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border border-border">
            <CardContent className="p-12 text-center">
              <Bookmark className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-foreground">No Questions Bookmarked Yet</h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1 leading-relaxed">
                While reviewing your mistakes or solving mock tests, click the bookmark icon on any question to save it directly to your personal notebook.
              </p>

              <div className="mt-5 flex justify-center gap-3">
                <Button asChild size="sm" className="gap-1.5 text-xs">
                  <Link href="/mistakes/review">
                    <BookOpen className="w-4 h-4" />
                    <span>Go to Mistake Review</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </StudentLayout>
  );
}
