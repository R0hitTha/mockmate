import React from "react";
import { AlertCircle, HelpCircle, Clock, CheckCircle2, Layers } from "lucide-react";
import { Card, CardContent } from "@/components/layout/card";
import type { MistakeOverviewMetrics } from "@/lib/validations/mistakes";

interface MistakeOverviewCardsProps {
  overview: MistakeOverviewMetrics;
}

export function MistakeOverviewCards({ overview }: MistakeOverviewCardsProps) {
  const cards = [
    {
      title: "Incorrect Answers",
      value: overview.totalIncorrect,
      subtitle: `${overview.totalUniqueQuestions} unique questions`,
      icon: AlertCircle,
      iconColor: "text-rose-600 dark:text-rose-400",
      bgColor: "bg-rose-50 dark:bg-rose-950/30",
      borderColor: "border-rose-200 dark:border-rose-900/50",
    },
    {
      title: "Unanswered Questions",
      value: overview.totalUnanswered,
      subtitle: "Skipped during exams",
      icon: HelpCircle,
      iconColor: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-50 dark:bg-amber-950/30",
      borderColor: "border-amber-200 dark:border-amber-900/50",
    },
    {
      title: "Pending Review",
      value: overview.pendingReviewCount,
      subtitle: "Awaiting student analysis",
      icon: Clock,
      iconColor: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-950/30",
      borderColor: "border-purple-200 dark:border-purple-900/50",
    },
    {
      title: "Reviewed & Mastered",
      value: overview.reviewedCount + overview.masteredCount,
      subtitle: `${overview.masteredCount} marked Mastered`,
      icon: CheckCircle2,
      iconColor: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
      borderColor: "border-emerald-200 dark:border-emerald-900/50",
    },
    {
      title: "Recurring Topic Struggles",
      value: overview.recurringErrorTopicsCount,
      subtitle: "Topics needing practice",
      icon: Layers,
      iconColor: "text-indigo-600 dark:text-indigo-400",
      bgColor: "bg-indigo-50 dark:bg-indigo-950/30",
      borderColor: "border-indigo-200 dark:border-indigo-900/50",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <Card key={idx} className="border border-border shadow-xs hover:border-primary/30 transition-all">
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground line-clamp-1">{card.title}</span>
                <div className={`p-1.5 rounded-lg ${card.bgColor} ${card.iconColor}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold tracking-tight text-foreground">{card.value}</div>
                <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{card.subtitle}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

