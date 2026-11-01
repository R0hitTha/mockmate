"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Shield,
  FileQuestion,
  BookOpen,
  Users,
  Settings,
  Menu,
  X,
  ArrowLeft,
  LogOut,
  ChevronRight,
  Database,
  UploadCloud,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, type BreadcrumbItem } from "@/components/layout/breadcrumb";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: React.ReactNode;
  activeRoute?: string;
  breadcrumbs?: BreadcrumbItem[];
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string | null;
  } | null;
}

export function AdminLayout({
  children,
  activeRoute = "/admin/question-bank",
  breadcrumbs = [{ label: "Admin Portal", href: "/admin" }, { label: "Question Bank" }],
  user,
}: AdminLayoutProps) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: session } = authClient.useSession();
  const currentUser = user || session?.user;
  const displayName = currentUser?.name || "Administrator";
  const displayEmail = currentUser?.email || "admin@mockmate.in";

  const initials =
    displayName
      .split(" ")
      .map((n) => n[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "AD";

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      router.push("/login");
      router.refresh();
    } catch {
      router.push("/login");
    }
  };

  const adminNav = [
    { label: "Admin Overview", icon: Shield, href: "/admin", badge: null },
    { label: "Mock Test Library", icon: BookOpen, href: "/admin/mock-tests", badge: "Active" },
    { label: "Build Mock Test", icon: Database, href: "/admin/mock-tests/new", badge: null },
    { label: "Question Bank", icon: FileQuestion, href: "/admin/question-bank", badge: null },
    { label: "Create Question", icon: Database, href: "/admin/question-bank/new", badge: null },
    { label: "Bulk CSV Import", icon: UploadCloud, href: "/admin/question-bank/import", badge: null },
    { label: "CUET Syllabus", icon: BookOpen, href: "/subjects", badge: null },
    { label: "Students", icon: Users, href: "/admin/students", badge: "Phase 14" },
    { label: "Settings", icon: Settings, href: "/admin/settings", badge: "Phase 14" },
  ];

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Desktop Sidebar */}
      <aside className="w-64 border-r border-border bg-surface shrink-0 hidden lg:flex flex-col">
        <div className="h-16 px-6 flex items-center border-b border-border">
          <Logo size="default" href="/admin" />
        </div>

        <div className="px-6 py-2.5 bg-primary/5 border-b border-border flex items-center justify-between text-[11px] font-bold text-primary uppercase tracking-wider">
          <span>Question Management</span>
          <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-primary/30 text-primary">
            Admin
          </Badge>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {adminNav.map((item) => {
            const Icon = item.icon;
            const isActive = activeRoute === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors select-none",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs font-bold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
                {item.badge && (
                  <span
                    className={cn(
                      "ml-auto text-[10px] font-normal px-1.5 py-0.5 rounded-md",
                      isActive
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-muted text-muted-foreground border border-border/60"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
                {isActive && !item.badge && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-70" />}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-border mt-auto space-y-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors border border-border/50"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Student App</span>
          </Link>

          <div className="flex items-center justify-between p-2 rounded-xl bg-muted/60 border border-border/40">
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar className="w-7 h-7 rounded-lg">
                {currentUser?.image && <AvatarImage src={currentUser.image} alt={displayName} />}
                <AvatarFallback className="rounded-lg text-[10px] font-bold bg-primary/10 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-xs font-bold text-foreground truncate">{displayName}</p>
                <p className="text-[10px] text-muted-foreground truncate">{displayEmail}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="p-1 text-muted-foreground hover:text-destructive"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-64 bg-surface border-r border-border p-4 flex flex-col z-50">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <Logo size="default" href="/admin" />
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-md text-muted-foreground hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 py-4 space-y-1">
              {adminNav.map((item) => {
                const Icon = item.icon;
                const isActive = activeRoute === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="pt-4 border-t border-border">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Student App</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border bg-surface flex items-center justify-between px-4 sm:px-6 shrink-0 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1.5 rounded-lg border border-border text-foreground hover:bg-muted"
              aria-label="Open Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Breadcrumb items={breadcrumbs} />
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="outline" className="hidden sm:inline-flex text-[11px] font-mono">
              CUET UG Engine
            </Badge>
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">{children}</main>
      </div>
    </div>
  );
}
