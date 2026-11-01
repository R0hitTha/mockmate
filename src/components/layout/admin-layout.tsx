"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
  Users,
  FileCheck2,
  HelpCircle,
  Award,
  CreditCard,
  Bot,
  ScrollText,
  Settings,
  Menu,
  X,
  LogOut,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, type BreadcrumbItem } from "@/components/layout/breadcrumb";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import {
  isSuperAdmin,
  canManageContent,
  canManageSupport,
  canManageFinance,
} from "@/lib/admin-roles";

export interface AdminLayoutProps {
  children: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  activeRoute?: string;
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string | null;
  } | null;
}

export function AdminLayout({
  children,
  breadcrumbs = [{ label: "Administration" }],
  activeRoute = "/admin",
  user,
}: AdminLayoutProps) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: session } = authClient.useSession();
  const currentUser = user || session?.user;
  const userRole = (currentUser as { role?: string })?.role || "ADMIN";

  const displayName = currentUser?.name || "Admin User";

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

  const navLinks = [
    {
      href: "/admin",
      label: "Overview",
      icon: ShieldAlert,
      visible: true,
    },
    {
      href: "/admin/students",
      label: "Students",
      icon: Users,
      visible: canManageSupport(userRole),
    },
    {
      href: "/admin/question-bank",
      label: "Question Bank",
      icon: HelpCircle,
      visible: canManageContent(userRole),
    },
    {
      href: "/admin/mock-tests",
      label: "Mock Tests",
      icon: FileCheck2,
      visible: canManageContent(userRole),
    },
    {
      href: "/admin/results",
      label: "Results & Attempts",
      icon: Award,
      visible: canManageSupport(userRole) || canManageContent(userRole),
    },
    {
      href: "/admin/plans",
      label: "Subscription Plans",
      icon: CreditCard,
      visible: canManageFinance(userRole) || isSuperAdmin(userRole),
    },
    {
      href: "/admin/ai-usage",
      label: "AI Telemetry",
      icon: Bot,
      visible: isSuperAdmin(userRole),
    },
    {
      href: "/admin/audit-logs",
      label: "Audit Logs",
      icon: ScrollText,
      visible: isSuperAdmin(userRole),
    },
    {
      href: "/admin/settings",
      label: "Platform Settings",
      icon: Settings,
      visible: isSuperAdmin(userRole),
    },
  ];

  const visibleNavLinks = navLinks.filter((n) => n.visible);

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-surface shrink-0">
        <div className="h-16 px-6 flex items-center justify-between border-b border-border">
          <Logo size="default" href="/admin" />
          <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider text-primary border-primary/30">
            Admin
          </Badge>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Control Center
          </div>

          {visibleNavLinks.map((item) => {
            const Icon = item.icon;
            const isActive =
              activeRoute === item.href ||
              (item.href !== "/admin" && activeRoute?.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors select-none",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-2xs font-bold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-70" />}
              </Link>
            );
          })}

          <div className="pt-4 px-3">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 p-2 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <span>Student Dashboard</span>
              <ExternalLink className="w-3.5 h-3.5 ml-auto text-muted-foreground" />
            </Link>
          </div>
        </nav>

        {/* Sidebar Footer User Info */}
        <div className="p-3 border-t border-border mt-auto">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-muted/60 border border-border/50">
            <Avatar className="w-8 h-8 rounded-lg">
              {currentUser?.image && (
                <AvatarImage src={currentUser.image} alt={displayName} />
              )}
              <AvatarFallback className="rounded-lg text-xs font-bold bg-primary/10 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-foreground truncate">{displayName}</p>
              <p className="text-[10px] text-muted-foreground truncate">{userRole}</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              title="Sign Out"
              aria-label="Sign Out"
              className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 lg:hidden backdrop-blur-xs"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Slide-over Sidebar */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 w-72 bg-surface border-r border-border flex flex-col transition-transform duration-200 lg:hidden",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-16 px-6 flex items-center justify-between border-b border-border">
          <Logo size="default" href="/admin" />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Administration
          </div>

          {visibleNavLinks.map((item) => {
            const Icon = item.icon;
            const isActive =
              activeRoute === item.href ||
              (item.href !== "/admin" && activeRoute?.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground font-bold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border mt-auto">
          <div className="flex items-center justify-between p-2 rounded-xl bg-muted/60">
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar className="w-8 h-8 rounded-lg">
                <AvatarFallback className="rounded-lg text-xs font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">{displayName}</p>
                <p className="text-[10px] text-muted-foreground truncate">{userRole}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 px-4 sm:px-6 lg:px-8 border-b border-border bg-surface flex items-center justify-between gap-4 sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
              className="lg:hidden p-2 -ml-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="hidden sm:block min-w-0">
              <Breadcrumb items={breadcrumbs} />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <Badge variant="outline" className="hidden sm:inline-flex text-xs font-bold text-primary bg-primary/10 border-primary/20">
              {userRole}
            </Badge>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 min-w-0 bg-background">{children}</main>
      </div>
    </div>
  );
}
