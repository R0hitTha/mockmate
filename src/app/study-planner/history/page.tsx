import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, History, CheckCircle2, Clock } from "lucide-react";
import { StudentLayout } from "@/components/layout/student-layout";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { getServerSession, getStudentProfile } from "@/lib/auth-server";
import { getStudentPlanHistory } from "@/lib/study-planner-service";

export const instant = false;

export default async function PlannerHistoryPage() {
  const session = await getServerSession();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/study-planner/history");
  }

  const profile = await getStudentProfile(session.user.id);
  if (!profile?.onboardingCompleted) {
    redirect("/onboarding");
  }

  const targetYear = profile.targetExamYear || 2026;
  const history = await getStudentPlanHistory(session.user.id, 1, 10);

  const formatHoursMinutes = (totalMins: number) => {
    const hrs = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    if (hrs === 0) return `${mins}m`;
    if (mins === 0) return `${hrs}h`;
    return `${hrs}h ${mins}m`;
  };

  return (
    <StudentLayout
      activeRoute="/study-planner"
      breadcrumbs={[
        { label: "Student Portal", href: "/dashboard" },
        { label: "Study Planner", href: "/study-planner" },
        { label: "History" },
      ]}
      user={session.user}
      targetExamYear={targetYear}
    >
      <div className="py-4 sm:py-6 bg-background">
        <Container size="default">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-3">
                <Link
                  href="/study-planner"
                  className="p-2 rounded-lg border border-border hover:bg-muted text-muted hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Link>
                <div>
                  <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <History className="w-5 h-5 text-primary" /> Study Plan History
                  </h1>
                  <p className="text-xs text-muted mt-0.5">
                    Audit trail of past weekly timetables and task completion records
                  </p>
                </div>
              </div>

              <Link href="/study-planner">
                <Button variant="outline" size="sm" className="text-xs">
                  Back to Planner
                </Button>
              </Link>
            </div>

            {/* List / Table */}
            {history.plans.length === 0 ? (
              <div className="bg-surface rounded-xl border border-border p-12 text-center shadow-xs">
                <div className="w-12 h-12 rounded-full bg-muted/20 flex items-center justify-center text-muted mx-auto mb-3">
                  <History className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-foreground">No Plan History Found</h3>
                <p className="text-xs text-muted mt-1 max-w-sm mx-auto">
                  As you complete your weekly preparation goals and regenerate new weeks, your previous plans will appear here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {history.plans.map((p) => (
                  <div
                    key={p.id}
                    className="bg-surface rounded-xl border border-border p-5 shadow-xs flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-primary">
                          {p.weekStartDate} to {p.weekEndDate}
                        </span>
                        <span className="text-xs font-bold text-foreground">
                          {p.completionPercentage}% Done
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-foreground mt-1">{p.title}</h3>
                    </div>

                    <div className="space-y-2">
                      <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-emerald-600 h-1.5 rounded-full"
                          style={{ width: `${Math.min(100, p.completionPercentage)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          {p.completedTasks} of {p.totalTasks} tasks
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-primary" />
                          {formatHoursMinutes(p.totalMinutesCompleted)} logged
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Container>
      </div>
    </StudentLayout>
  );
}
