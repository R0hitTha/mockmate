"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowRight, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

interface PublicLayoutProps {
  children: React.ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/features", label: "Features" },
    { href: "/cuet-subjects", label: "CUET Subjects" },
    { href: "/#how-it-works", label: "How It Works" },
    { href: "/pricing", label: "Pricing" },
    { href: "/about", label: "About" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-200">
      {/* Top Banner Notice */}
      <div className="bg-primary/95 text-primary-foreground py-2 px-4 text-center text-xs font-medium border-b border-primary/20">
        <div className="flex items-center justify-center gap-2 max-w-7xl mx-auto">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-white/20 text-white uppercase tracking-wider">
            CUET UG 2026 & 2027
          </span>
          <span className="hidden sm:inline">
            Free diagnostic mock test now available for all registered aspirants.
          </span>
          <Link
            href="/features#diagnostic"
            className="underline underline-offset-2 hover:text-blue-200 font-semibold inline-flex items-center gap-1"
          >
            Learn more <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Main Header Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-surface/90 backdrop-blur-md">
        <Container size="lg" className="h-16 flex items-center justify-between">
          <Logo size="default" href="/" showTagline />

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center space-x-7 text-xs font-semibold tracking-wide uppercase">
            {navLinks.map((item) => {
              const isActive =
                item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "transition-colors hover:text-primary dark:hover:text-blue-400 py-1 border-b-2",
                    isActive
                      ? "text-primary dark:text-blue-400 border-primary dark:border-blue-400"
                      : "text-muted-foreground border-transparent"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Actions & Theme Toggle */}
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            <ThemeToggle />

            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-xs font-semibold text-foreground hover:text-primary"
            >
              <Link href="/login">Sign In</Link>
            </Button>

            <Button size="sm" asChild className="text-xs font-semibold">
              <Link href="/register">Start Preparing</Link>
            </Button>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg border border-border text-foreground hover:bg-muted focus:outline-hidden"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </Container>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b border-border bg-surface px-4 py-5 shadow-lg animate-in slide-in-from-top-2">
            <nav className="flex flex-col space-y-3">
              {navLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-sm font-semibold text-foreground hover:bg-muted hover:text-primary transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-3 border-t border-border flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="w-full justify-center"
                >
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    Sign In
                  </Link>
                </Button>
                <Button size="sm" asChild className="w-full justify-center">
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                    Start Preparing (Free)
                  </Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Page Body Content */}
      <main className="flex-1">{children}</main>

      {/* Comprehensive Public Footer */}
      <footer className="border-t border-border bg-surface text-muted-foreground text-xs py-14">
        <Container size="lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10 pb-12 border-b border-border">
            {/* Col 1: Brand & Rationale */}
            <div className="lg:col-span-2 space-y-4">
              <Logo size="default" />
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm">
                MockMate is a dedicated preparation and examination simulation platform
                for CUET UG aspirants across India. Built for authentic practice,
                trustworthy scoring, and actionable topic feedback.
              </p>
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>NTA-Pattern Computer-Based Test Simulation</span>
              </div>
            </div>

            {/* Col 2: Platform Features */}
            <div className="space-y-3">
              <h5 className="font-bold text-foreground uppercase tracking-wider text-[11px]">
                Preparation Features
              </h5>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/features#cbt-engine"
                    className="hover:text-foreground transition-colors"
                  >
                    CBT Test Simulation
                  </Link>
                </li>
                <li>
                  <Link
                    href="/features#topic-practice"
                    className="hover:text-foreground transition-colors"
                  >
                    Chapter & Topic Practice
                  </Link>
                </li>
                <li>
                  <Link
                    href="/features#solutions"
                    className="hover:text-foreground transition-colors"
                  >
                    Step-by-Step Solutions
                  </Link>
                </li>
                <li>
                  <Link
                    href="/features#analytics"
                    className="hover:text-foreground transition-colors"
                  >
                    Performance Analytics
                  </Link>
                </li>
                <li>
                  <Link
                    href="/features#weakness"
                    className="hover:text-foreground transition-colors"
                  >
                    Weak Topic Flagging
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: CUET Sections */}
            <div className="space-y-3">
              <h5 className="font-bold text-foreground uppercase tracking-wider text-[11px]">
                CUET Sections
              </h5>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/cuet-subjects#languages"
                    className="hover:text-foreground transition-colors"
                  >
                    Section IA & IB: Languages
                  </Link>
                </li>
                <li>
                  <Link
                    href="/cuet-subjects#domain"
                    className="hover:text-foreground transition-colors"
                  >
                    Section II: Domain Subjects
                  </Link>
                </li>
                <li>
                  <Link
                    href="/cuet-subjects#general"
                    className="hover:text-foreground transition-colors"
                  >
                    Section III: General Test
                  </Link>
                </li>
                <li>
                  <Link
                    href="/cuet-subjects#marking"
                    className="hover:text-foreground transition-colors"
                  >
                    NTA Marking Scheme (+5 / -1)
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 4: Platform & Support */}
            <div className="space-y-3">
              <h5 className="font-bold text-foreground uppercase tracking-wider text-[11px]">
                Platform & Help
              </h5>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="hover:text-foreground transition-colors">
                    About MockMate
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pricing"
                    className="hover:text-foreground transition-colors"
                  >
                    Test Packs & Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-foreground transition-colors"
                  >
                    Contact Support
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="hover:text-foreground transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-foreground transition-colors">
                    Terms & Conditions
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar & Disclaimer */}
          <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 dark:text-slate-400">
            <p>© 2026 {siteConfig.name}. Designed for CUET UG Aspirants.</p>
            <p className="text-center md:text-right max-w-md">
              Disclaimer: CUET UG is an examination conducted by the National Testing
              Agency (NTA). MockMate is an independent academic preparation platform and
              is not affiliated with or endorsed by the NTA.
            </p>
          </div>
        </Container>
      </footer>
    </div>
  );
}
