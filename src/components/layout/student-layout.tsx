"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  BookOpen,
  FileCheck2,
  BarChart3,
  Bookmark,
  Menu,
  X,
  Bell,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Breadcrumb, type BreadcrumbItem } from "@/components/layout/breadcrumb";
import { cn } from "@/lib/utils";

interface StudentLayoutProps {
  children: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  activeRoute?: string;
}

export function StudentLayout({
  children,
  breadcrumbs = [{ label: "Student Portal" }],
  activeRoute = "/dashboard",
}: StudentLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/subjects", label: "CUET Syllabus", icon: BookOpen },
    { href: "/tests", label: "Mock Tests", icon: FileCheck2 },
    { href: "/analytics", label: "Performance", icon: BarChart3 },
    { href: "/bookmarks", label: "Saved Questions", icon: Bookmark },
  ];

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-surface shrink-0">
        <div className="h-16 px-6 flex items-center border-b border-border">
          <Logo size="default" href="/dashboard" />
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            CUET UG 2026
          </div>
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = activeRoute === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors select-none",
                  isActive
                    ? "bg-secondary text-secondary-foreground dark:bg-blue-950 dark:text-blue-300"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-70" />}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer User Info */}
        <div className="p-3 border-t border-border mt-auto">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/60">
            <Avatar className="w-8 h-8">
              <AvatarFallback>CU</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">
                CUET Aspirant
              </p>
              <p className="text-[10px] text-muted-foreground truncate">
                aspirant@mockmate.in
              </p>
            </div>
            <button
              type="button"
              aria-label="Sign Out"
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
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
      <div
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 w-64 bg-surface border-r border-border flex flex-col transition-transform duration-200 ease-in-out lg:hidden",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-16 px-6 flex items-center justify-between border-b border-border">
          <Logo size="default" href="/dashboard" />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="p-1 text-muted-foreground hover:text-foreground"
            aria-label="Close Navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = activeRoute === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-colors",
                  isActive
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 border-b border-border bg-surface flex items-center justify-between px-4 sm:px-6 shrink-0">
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

          <div className="flex items-center gap-2.5">
            <ThemeToggle />
            <button
              type="button"
              className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer relative"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600" />
            </button>
            <Avatar className="w-8 h-8">
              <AvatarFallback>CU</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
