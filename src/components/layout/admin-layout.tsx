import React from "react";
import Link from "next/link";
import { Shield, BookOpen, Users, FileText, Settings } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const adminNav = [
    { label: "Overview", icon: Shield, href: "/admin" },
    { label: "Question Bank", icon: FileText, href: "/admin/questions" },
    { label: "Syllabus Manager", icon: BookOpen, href: "/admin/syllabus" },
    { label: "Students", icon: Users, href: "/admin/students" },
    { label: "Platform Settings", icon: Settings, href: "/admin/settings" },
  ];

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <aside className="w-64 border-r border-border bg-surface shrink-0 hidden md:flex flex-col">
        <div className="h-16 px-6 flex items-center border-b border-border">
          <Logo size="default" href="/admin" />
        </div>
        <div className="px-6 py-2 bg-slate-100 dark:bg-slate-900 border-b border-border text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
          Admin Portal (Phase 14)
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {adminNav.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border bg-surface flex items-center justify-between px-6">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            MockMate Administration Foundation
          </span>
          <ThemeToggle />
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
