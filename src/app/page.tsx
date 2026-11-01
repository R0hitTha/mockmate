import Link from "next/link";
import { siteConfig } from "@/config/site";
import {
  CheckCircle2,
  Shield,
  Layers,
  Database,
  Terminal,
  ArrowRight,
} from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col justify-between p-6 sm:p-12 lg:p-16 max-w-5xl mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-slate-200 pb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-bold text-xl shadow-sm">
            M
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              {siteConfig.name}
            </h1>
            <p className="text-xs font-medium text-slate-500">{siteConfig.tagline}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
            Phase 1 Foundation
          </span>
        </div>
      </header>

      {/* Main Content */}
      <section className="my-auto py-12">
        <div className="max-w-2xl space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
            <span>Targeting {siteConfig.targetExams.join(" & ")}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            High-Precision CUET Preparation Platform
          </h2>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            {siteConfig.description}
          </p>

          <div className="pt-2">
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Current Milestone
                </span>
                <span className="text-xs font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  {siteConfig.currentPhase}
                </span>
              </div>
              <p className="text-sm text-slate-700">
                Core architecture, PostgreSQL / Prisma ORM setup, Next.js App Router
                layout, and quality assurance toolchain initialized.
              </p>
            </div>
          </div>

          {/* Architecture Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-lg bg-white border border-slate-200 flex items-start space-x-3">
              <Shield className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-slate-900">
                  CUET UG Dedicated
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Strictly focused on Sections IA/IB, II, and III.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-white border border-slate-200 flex items-start space-x-3">
              <Database className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-slate-900">
                  PostgreSQL + Prisma
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Server-authoritative relational schema foundation.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-white border border-slate-200 flex items-start space-x-3">
              <Layers className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-slate-900">
                  Modular Feature Layout
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Domain-driven structure for clean iterative scale.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-white border border-slate-200 flex items-start space-x-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-slate-900">
                  Strict Quality Verification
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Typechecked, linted, and unit-tested foundation.
                </p>
              </div>
            </div>
          </div>

          {/* Developer / Inspection Links */}
          <div className="flex flex-wrap items-center gap-3 pt-4">
            <Link
              href="/api/health"
              className="inline-flex items-center space-x-2 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 px-4 py-2 rounded-lg transition-colors shadow-sm"
              target="_blank"
            >
              <Terminal className="w-4 h-4 text-slate-500" />
              <span>Inspect Health Endpoint</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
        <p>© 2026 {siteConfig.name}. CUET UG Preparation Platform.</p>
        <p className="font-mono text-slate-400">
          Next.js App Router • Tailwind v4 • TypeScript Strict
        </p>
      </footer>
    </main>
  );
}
