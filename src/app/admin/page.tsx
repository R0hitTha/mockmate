import React from "react";
import Link from "next/link";
import {
  ShieldAlert,
  ArrowLeft,
  Award,
  FileCheck2,
  HelpCircle,
  ChevronRight,
} from "lucide-react";
import { requireRole } from "@/lib/auth-server";
import { Container } from "@/components/layout/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/layout/card";
import { Button } from "@/components/ui/button";

export const instant = false;

export default async function AdminDashboardPage() {
  // Server-side authorization check: Asserts role === "ADMIN"
  await requireRole("ADMIN");

  const modules = [
    {
      title: "Results & Evaluation",
      description: "Audit student test attempts, review scorecards, and trigger controlled re-evaluations.",
      href: "/admin/results",
      icon: Award,
      badge: "Phase 10",
    },
    {
      title: "Mock Test Builder",
      description: "Build and publish CUET UG mock tests, configure sections, timing and marking rules.",
      href: "/admin/mock-tests",
      icon: FileCheck2,
      badge: "Phase 8",
    },
    {
      title: "Question Bank",
      description: "Manage questions, verified options, explanations, tags, and bulk CSV imports.",
      href: "/admin/question-bank",
      icon: HelpCircle,
      badge: "Phase 7",
    },
  ];

  return (
    <div className="min-h-screen bg-background py-12">
      <Container size="default">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  MockMate Administrative Panel
                </h1>
                <p className="text-xs text-muted-foreground">
                  Authorized administrative control center
                </p>
              </div>
            </div>

            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard">
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                <span>Student Dashboard</span>
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            {modules.map((m) => {
              const Icon = m.icon;
              return (
                <Link key={m.href} href={m.href} className="group">
                  <Card className="h-full border-border hover:border-primary/50 transition-all hover:shadow-xs">
                    <CardHeader className="p-6">
                      <div className="flex items-center justify-between pb-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-mono font-bold bg-muted px-2 py-0.5 rounded text-muted-foreground">
                          {m.badge}
                        </span>
                      </div>
                      <CardTitle className="text-base font-bold text-foreground group-hover:text-primary transition-colors flex items-center justify-between">
                        <span>{m.title}</span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-6 pb-6 pt-0">
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {m.description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </Container>
    </div>
  );
}
