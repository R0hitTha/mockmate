import React from "react";
import Link from "next/link";
import {
  AlertCircle,
  HelpCircle,
  Layers,
  Repeat,
  Zap,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/layout/card";
import { Badge } from "@/components/ui/badge";
import type { MistakeCategoryStat } from "@/lib/validations/mistakes";

interface MistakeCategoriesCardProps {
  categories: MistakeCategoryStat[];
}

export function MistakeCategoriesCard({ categories }: MistakeCategoriesCardProps) {
  if (!categories || categories.length === 0) {
    return null;
  }

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "INCORRECT":
        return <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />;
      case "UNANSWERED":
        return <HelpCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case "REPEATED_TOPIC_ERROR":
        return <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
      case "REPEATED_QUESTION_ERROR":
        return <Repeat className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      case "CONCEPT_GAP":
        return <Zap className="w-4 h-4 text-rose-600 dark:text-rose-400" />;
      case "TIME_PRESSURE":
        return <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-primary" />;
    }
  };

  const getFilterUrl = (cat: string) => {
    switch (cat) {
      case "INCORRECT":
        return "/mistakes/review?category=INCORRECT";
      case "UNANSWERED":
        return "/mistakes/review?category=UNANSWERED";
      case "REPEATED_QUESTION_ERROR":
      case "REPEATED_TOPIC_ERROR":
        return "/mistakes/review?category=REPEATED_ERROR";
      case "CONCEPT_GAP":
        return "/mistakes/review?category=CONCEPT_GAP";
      default:
        return "/mistakes/review";
    }
  };

  return (
    <Card className="border border-border">
      <CardHeader className="pb-3 border-b border-border/60">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-foreground">
              Evidence-Based Mistake Classifications
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Categories assigned strictly from evaluated student attempt records and explicit signals.
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            {categories.length} Active Categories
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.category}
              href={getFilterUrl(cat.category)}
              className="p-3.5 rounded-lg border border-border/70 hover:border-primary/40 bg-card hover:bg-muted/40 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-muted/60">
                      {getCategoryIcon(cat.category)}
                    </div>
                    <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                      {cat.label}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-foreground">
                    {cat.count}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground line-clamp-2">
                  {cat.description}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-border/40 flex items-center justify-between text-[11px] font-medium text-primary">
                <span>Filter in Review</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

