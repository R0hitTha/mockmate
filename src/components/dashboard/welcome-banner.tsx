import React from "react";
import Link from "next/link";
import { Sparkles, GraduationCap, User, ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface WelcomeBannerProps {
  name: string;
  targetExamYear: number;
  stream?: string | null;
  academicStatus?: string | null;
}

export function WelcomeBanner({
  name,
  targetExamYear,
  stream,
  academicStatus,
}: WelcomeBannerProps) {
  // Safe static calculation of days remaining until CUET May window
  // Fixed reference date May 15 of the target year
  const examDate = new Date(`${targetExamYear}-05-15T09:00:00Z`);
  const now = new Date("2026-11-01T00:00:00Z");
  const diffTime = examDate.getTime() - now.getTime();
  const daysRemaining = Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 1);

  const formattedStream =
    stream === "SCIENCE"
      ? "Science"
      : stream === "COMMERCE"
        ? "Commerce"
        : stream === "HUMANITIES"
          ? "Humanities"
          : stream || "General";

  const formattedStatus =
    academicStatus === "CLASS_12_APPEARING"
      ? "Class 12 Appearing"
      : academicStatus === "CLASS_12_PASSED"
        ? "Class 12 Passed"
        : academicStatus === "DROPPER"
          ? "CUET Retaker"
          : null;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-950 text-white p-6 sm:p-8 shadow-sm">
      {/* Background decorative glow */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-white/5 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold backdrop-blur-xs border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>CUET UG {targetExamYear} Aspirant</span>
            </span>

            {formattedStream && (
              <Badge
                variant="secondary"
                className="bg-white/15 text-white border-transparent text-xs font-medium"
              >
                <GraduationCap className="w-3 h-3 mr-1" />
                <span>{formattedStream} Stream</span>
              </Badge>
            )}

            {formattedStatus && (
              <span className="hidden sm:inline-flex text-xs text-blue-200/90 font-medium">
                • {formattedStatus}
              </span>
            )}
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {name}!
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
              Your CUET preparation journey continues. Let&apos;s make today&apos;s
              practice count.
            </p>
          </div>
        </div>

        {/* Countdown & Quick Action */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-3 shrink-0">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 border border-white/15 backdrop-blur-xs text-xs">
            <Clock className="w-4 h-4 text-amber-300" />
            <div>
              <span className="font-bold text-white text-sm mr-1.5">
                ~{daysRemaining}
              </span>
              <span className="text-blue-100 text-[11px]">
                days to CUET UG {targetExamYear}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white text-xs font-semibold"
            >
              <Link href="/profile">
                <User className="w-3.5 h-3.5 mr-1.5" />
                <span>Manage Profile</span>
              </Link>
            </Button>
            <Button
              size="sm"
              asChild
              className="bg-white text-blue-900 hover:bg-blue-50 text-xs font-bold shadow-xs"
            >
              <Link href="/cuet-subjects">
                <span>Syllabus Info</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
