"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileCheck2,
  BookOpen,
  BarChart3,
  CalendarDays,
  Bookmark,
  User,
  Layers,
  Menu,
  X,
  Bell,
  LogOut,
  ChevronRight,
  Shield,
  Award,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, type BreadcrumbItem } from "@/components/layout/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

export interface StudentLayoutProps {
  children: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  activeRoute?: string;
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string | null;
  } | null;
  targetExamYear?: number | null;
}

export function StudentLayout({
  children,
  breadcrumbs = [{ label: "Student Portal" }],
  activeRoute = "/dashboard",
  user,
  targetExamYear = 2026,
}: StudentLayoutProps) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Read active session if user wasn't directly passed
  const { data: session } = authClient.useSession();
  const currentUser = user || session?.user;

  const displayName = currentUser?.name || "Student";
  const displayEmail = currentUser?.email || "student@mockmate.in";

  // Avatar Initials
  const initials =
    displayName
      .split(" ")
      .map((n) => n[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "CU";

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("[LOGOUT_ERROR]", err);
      router.push("/login");
    }
  };

  const navLinks = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      status: "active",
      badge: null,
    },
    {
      href: "/subjects",
      label: "CUET Syllabus",
      icon: BookOpen,
      status: "active",
      badge: null,
    },
    {
      href: "/mock-tests",
      label: "Mock Tests",
      icon: FileCheck2,
      status: "active",
      badge: null,
    },
    {
      href: "/results",
      label: "My Results",
      icon: Award,
      status: "active",
      badge: null,
    },
    {
      href: "/practice",
      label: "Subject Practice",
      icon: Layers,
      status: "phase-8",
      badge: "Phase 8",
    },
    {
      href: "/analytics",
      label: "My Performance",
      icon: BarChart3,
      status: "phase-10",
      badge: "Phase 10",
    },
    {
      href: "/planner",
      label: "Study Planner",
      icon: CalendarDays,
      status: "phase-11",
      badge: "Phase 11",
    },
    {
      href: "/bookmarks",
      label: "Bookmarks",
      icon: Bookmark,
      status: "phase-12",
      badge: "Phase 12",
    },
    {
      href: "/profile",
      label: "Profile & Subjects",
      icon: User,
      status: "active",
      badge: null,
    },
  ];

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-surface shrink-0">
        <div className="h-16 px-6 flex items-center border-b border-border">
          <Logo size="default" href="/dashboard" />
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            <span>CUET UG {targetExamYear}</span>
            <Badge
              variant="outline"
              className="text-[9px] px-1.5 py-0 font-bold uppercase"
            >
              Aspirant
            </Badge>
          </div>

          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = activeRoute === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors select-none",
                  isActive
                    ? "bg-secondary text-secondary-foreground dark:bg-blue-950 dark:text-blue-300 shadow-2xs"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto text-[10px] font-normal px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground border border-border/60">
                    {item.badge}
                  </span>
                )}
                {isActive && !item.badge && (
                  <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-70" />
                )}
              </Link>
            );
          })}
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
              <p className="text-[10px] text-muted-foreground truncate">{displayEmail}</p>
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

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            CUET UG {targetExamYear}
          </div>

          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = activeRoute === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors",
                  isActive
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground">
                    {item.badge}
                  </span>
                )}
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
                <p className="text-xs font-bold truncate">{displayName}</p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {displayEmail}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="p-1 text-muted-foreground hover:text-destructive"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
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

          <div className="flex items-center gap-2.5">
            <ThemeToggle />

            {/* Notifications Popover */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors"
                aria-label="View notifications"
              >
                <Bell className="w-4 h-4" />
              </button>

              {notificationsOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setNotificationsOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-72 p-4 rounded-xl border border-border bg-card shadow-lg z-40 text-xs space-y-2">
                    <div className="flex items-center justify-between font-bold text-foreground">
                      <span>Notifications</span>
                      <span className="text-[10px] font-normal text-muted-foreground">
                        0 Unread
                      </span>
                    </div>
                    <p className="text-muted-foreground text-[11px] leading-relaxed py-2">
                      No new announcements. Official NTA CUET schedule updates and test
                      notifications will appear here.
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Profile Dropdown Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-lg border border-border hover:bg-muted transition-colors cursor-pointer select-none"
                  aria-label="Open user menu"
                >
                  <Avatar className="w-7 h-7 rounded-md">
                    {currentUser?.image && (
                      <AvatarImage src={currentUser.image} alt={displayName} />
                    )}
                    <AvatarFallback className="rounded-md text-[11px] font-bold bg-primary/10 text-primary">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline-block text-xs font-semibold max-w-[120px] truncate text-foreground">
                    {displayName.split(" ")[0]}
                  </span>
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56 p-1.5">
                <DropdownMenuLabel className="font-normal px-2 py-1.5">
                  <div className="flex flex-col space-y-0.5">
                    <p className="text-xs font-bold text-foreground truncate">
                      {displayName}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {displayEmail}
                    </p>
                    <div className="pt-1">
                      <Badge variant="secondary" className="text-[9px] font-semibold">
                        CUET UG {targetExamYear}
                      </Badge>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/dashboard" className="flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4 text-muted-foreground" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/profile" className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span>Profile & Preferences</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/subjects" className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-muted-foreground" />
                    <span>CUET Syllabus Catalogue</span>
                  </Link>
                </DropdownMenuItem>

                {currentUser?.role === "ADMIN" && (
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 text-amber-600"
                    >
                      <Shield className="w-4 h-4" />
                      <span>Admin Area</span>
                    </Link>
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  <span>Log Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
