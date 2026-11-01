import React from "react";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { siteConfig } from "@/config/site";

interface PublicLayoutProps {
  children: React.ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Public Top Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-surface/85 backdrop-blur-md">
        <Container size="lg" className="h-16 flex items-center justify-between">
          <Logo size="default" href="/" />

          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-muted-foreground">
            <Link href="#features" className="hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#subjects" className="hover:text-foreground transition-colors">
              CUET Subjects
            </Link>
            <Link href="#cbt-demo" className="hover:text-foreground transition-colors">
              CBT Simulation
            </Link>
            <Link href="#pricing" className="hover:text-foreground transition-colors">
              Test Packs
            </Link>
          </nav>

          <div className="flex items-center space-x-3">
            <ThemeToggle />
            <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/register">Start Free Mock</Link>
            </Button>
          </div>
        </Container>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">{children}</main>

      {/* Public Footer Foundation */}
      <footer className="border-t border-border bg-surface text-muted-foreground text-xs py-10">
        <Container
          size="lg"
          className="flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center space-x-3">
            <Logo size="sm" />
            <span className="text-slate-400">|</span>
            <p>© 2026 {siteConfig.name}. CUET UG Preparation Platform.</p>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
            <Link href="/contact" className="hover:text-foreground transition-colors">
              Contact Support
            </Link>
          </div>
        </Container>
      </footer>
    </div>
  );
}
