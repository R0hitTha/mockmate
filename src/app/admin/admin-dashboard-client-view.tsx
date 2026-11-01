"use client";

import React from "react";
import Link from "next/link";
import {
  Users,
  HelpCircle,
  FileCheck2,
  Award,
  CreditCard,
  Bot,
  Settings,
  ScrollText,
  TrendingUp,
  Activity,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/layout/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AdminDashboardStats } from "@/lib/admin-service";
import {
  isSuperAdmin,
  canManageContent,
  canManageSupport,
  canManageFinance,
} from "@/lib/admin-roles";

interface AdminDashboardClientViewProps {
  stats: AdminDashboardStats;
  userRole: string;
  userName: string;
}

export function AdminDashboardClientView({
  stats,
  userRole,
  userName,
}: AdminDashboardClientViewProps) {
  const kpis = [
    {
      label: "Enrolled Students",
      value: stats.totalStudents.toLocaleString(),
      subvalue: `${stats.activeStudents} active (14d)`,
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "Question Bank",
      value: stats.totalQuestions.toLocaleString(),
      subvalue: `${stats.publishedQuestions} published`,
      icon: HelpCircle,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      label: "CUET Mock Tests",
      value: stats.totalMockTests.toLocaleString(),
      subvalue: `${stats.publishedMockTests} published`,
      icon: FileCheck2,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      label: "Evaluated Attempts",
      value: stats.totalEvaluatedAttempts.toLocaleString(),
      subvalue: "100% evaluated",
      icon: Award,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      label: "Active Subscriptions",
      value: stats.totalActiveSubscriptions.toLocaleString(),
      subvalue: "Enforced via entitlements",
      icon: CreditCard,
      color: "text-rose-500",
      bg: "bg-rose-500/10",
    },
  ];

  const modules = [
    {
      title: "Student Management",
      description: "Search, filter, view academic details, monitor attempts, soft-suspend or reactivate accounts.",
      href: "/admin/students",
      icon: Users,
      badge: "Support / Admin",
      visible: canManageSupport(userRole),
    },
    {
      title: "Question Bank",
      description: "Manage questions, verified options, explanations, tags, and bulk CSV imports.",
      href: "/admin/question-bank",
      icon: HelpCircle,
      badge: "Content / Admin",
      visible: canManageContent(userRole),
    },
    {
      title: "Mock Test Builder",
      description: "Build and publish CUET UG mock tests, configure sections, timing and marking rules.",
      href: "/admin/mock-tests",
      icon: FileCheck2,
      badge: "Content / Admin",
      visible: canManageContent(userRole),
    },
    {
      title: "Results & Attempts",
      description: "Audit student test attempts, review scorecards, and trigger controlled re-evaluations.",
      href: "/admin/results",
      icon: Award,
      badge: "Support / Admin",
      visible: canManageSupport(userRole) || canManageContent(userRole),
    },
    {
      title: "Subscription Plans",
      description: "Manage test pack pricing, billing tiers, feature entitlement limits and visibility.",
      href: "/admin/plans",
      icon: CreditCard,
      badge: "Finance / Admin",
      visible: canManageFinance(userRole) || isSuperAdmin(userRole),
    },
    {
      title: "AI Usage Telemetry",
      description: "Track student AI token consumption, monitor API quotas, query trends, and configure limits.",
      href: "/admin/ai-usage",
      icon: Bot,
      badge: "Super Admin",
      visible: isSuperAdmin(userRole),
    },
    {
      title: "Audit Logs",
      description: "Immutable record of administrative actions, role updates, suspensions, and plan adjustments.",
      href: "/admin/audit-logs",
      icon: ScrollText,
      badge: "Super Admin",
      visible: isSuperAdmin(userRole),
    },
    {
      title: "Platform Settings",
      description: "Configure target exam cycles, registration toggles, support contacts, and monetization flags.",
      href: "/admin/settings",
      icon: Settings,
      badge: "Super Admin",
      visible: isSuperAdmin(userRole),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Administrative Control Center
            </h1>
            <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
              {userRole}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome back, {userName}. Real-time monitoring and administrative tools for MockMate CUET UG.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard">
              Student Dashboard
            </Link>
          </Button>
          {isSuperAdmin(userRole) && (
            <Button asChild size="sm">
              <Link href="/admin/settings">
                <Settings className="w-4 h-4 mr-1.5" />
                Settings
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <Card key={idx} className="border-border shadow-xs hover:border-primary/40 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">{kpi.label}</span>
                  <div className={`p-2 rounded-lg ${kpi.bg} ${kpi.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-bold tracking-tight text-foreground">{kpi.value}</div>
                  <div className="flex items-center gap-1 mt-1 text-[11px] text-muted-foreground">
                    <TrendingUp className="w-3 h-3 text-emerald-500" />
                    <span>{kpi.subvalue}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Workspace Modules */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            Administrative Workspaces
          </h2>
          <span className="text-xs text-muted-foreground">
            Filtered by active credentials ({userRole})
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {modules
            .filter((m) => m.visible)
            .map((module) => {
              const Icon = module.icon;
              return (
                <Link key={module.href} href={module.href} className="group">
                  <Card className="h-full border-border hover:border-primary/50 transition-all hover:shadow-xs group-hover:-translate-y-0.5 duration-200">
                    <CardHeader className="p-5 pb-3">
                      <div className="flex items-center justify-between">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-medium bg-muted px-2 py-0.5 rounded text-muted-foreground">
                          {module.badge}
                        </span>
                      </div>
                      <CardTitle className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors flex items-center justify-between mt-3">
                        <span>{module.title}</span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 pb-5 pt-0">
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {module.description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
        </div>
      </div>

      {/* Recent Activity / System Log Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border shadow-xs">
          <CardHeader className="p-5 pb-3 border-b border-border flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <ScrollText className="w-4 h-4 text-primary" />
              Recent Administrative Activity
            </CardTitle>
            {isSuperAdmin(userRole) && (
              <Button asChild variant="ghost" size="sm" className="text-xs h-7">
                <Link href="/admin/audit-logs">
                  View full audit log
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-5">
            {stats.recentActivities && stats.recentActivities.length > 0 ? (
              <div className="space-y-4">
                {stats.recentActivities.map((act) => (
                  <div key={act.id} className="flex items-start gap-3 text-xs">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground">{act.title}</div>
                      <div className="text-muted-foreground truncate">{act.description}</div>
                    </div>
                    <div className="text-[10px] text-muted-foreground shrink-0">
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-muted-foreground">
                <CheckCircle2 className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                No administrative alerts in the last 24 hours.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Platform Status */}
        <Card className="border-border shadow-xs">
          <CardHeader className="p-5 pb-3 border-b border-border">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-3.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">CUET Exam Cycle</span>
              <span className="font-semibold text-foreground">CUET UG 2026 / 2027</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Evaluation Engine</span>
              <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                Active / 100% Reliable
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Billing Gateway</span>
              <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/20">
                Preparation Mode
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">RBAC Safeguards</span>
              <span className="text-emerald-600 font-medium">Enforced</span>
            </div>
            <div className="pt-2 border-t border-border flex items-center gap-2 text-[11px] text-muted-foreground">
              <AlertCircle className="w-3.5 h-3.5 text-primary shrink-0" />
              <span>Payments in sandbox/preparation mode. No real cards will be billed.</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
