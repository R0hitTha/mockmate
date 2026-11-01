"use client";

import React from "react";
import Link from "next/link";
import { type LucideIcon, ArrowLeft, Clock, Sparkles } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Card, CardContent } from "@/components/layout/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface FutureModuleCardProps {
  moduleName: string;
  phaseLabel: string;
  description: string;
  icon: LucideIcon;
  capabilities: string[];
  ctaLabel?: string;
  ctaHref?: string;
}

export function FutureModuleCard({
  moduleName,
  phaseLabel,
  description,
  icon: Icon,
  capabilities,
  ctaLabel = "Return to Student Dashboard",
  ctaHref = "/dashboard",
}: FutureModuleCardProps) {
  return (
    <Container size="default">
      <div className="py-6 sm:py-10 max-w-2xl mx-auto space-y-6">
        <Card className="border-border shadow-xs overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-primary" />
          <CardContent className="p-6 sm:p-8 space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 flex items-center justify-center border border-blue-100 dark:border-blue-900/60 shadow-2xs">
                <Icon className="w-6 h-6" />
              </div>
              <Badge
                variant="secondary"
                className="flex items-center gap-1.5 px-3 py-1 text-xs"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Scheduled for {phaseLabel}</span>
              </Badge>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                {moduleName}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {description}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-muted/50 border border-border/80 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-foreground uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>Planned Module Capabilities</span>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1.5 pl-1">
                {capabilities.map((cap) => (
                  <li key={cap} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    <span>{cap}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <Button asChild className="w-full sm:w-auto">
                <Link href={ctaHref}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  <span>{ctaLabel}</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full sm:w-auto">
                <Link href="/profile">Manage CUET Subjects</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
