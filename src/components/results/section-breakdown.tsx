import React from "react";
import { CheckCircle2, XCircle, HelpCircle, Layers } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/layout/card";
import { Badge } from "@/components/ui/badge";
import type { TestResultSectionData } from "@/lib/validations/evaluation";

interface SectionBreakdownProps {
  sections: TestResultSectionData[];
}

export function SectionBreakdown({ sections }: SectionBreakdownProps) {
  if (!sections || sections.length === 0) {
    return null;
  }

  return (
    <Card className="border-border shadow-xs">
      <CardHeader className="p-6 border-b border-border flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-primary" />
          <CardTitle className="text-lg font-bold text-foreground">
            Section-Wise Performance
          </CardTitle>
        </div>
        <Badge variant="outline" className="text-xs">
          {sections.length} {sections.length === 1 ? "Section" : "Sections"}
        </Badge>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground font-medium">
                <th className="py-3 px-4 font-semibold">Section &amp; Subject</th>
                <th className="py-3 px-4 text-center font-semibold">Questions</th>
                <th className="py-3 px-4 text-center font-semibold text-emerald-600 dark:text-emerald-400">
                  Correct
                </th>
                <th className="py-3 px-4 text-center font-semibold text-rose-600 dark:text-rose-400">
                  Incorrect
                </th>
                <th className="py-3 px-4 text-center font-semibold text-muted-foreground">
                  Unanswered
                </th>
                <th className="py-3 px-4 text-center font-semibold">Accuracy</th>
                <th className="py-3 px-4 text-right font-semibold">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sections.map((sec) => (
                <tr key={sec.id} className="hover:bg-muted/20 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-foreground text-sm">
                      {sec.sectionTitle}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {sec.subjectName}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-center font-mono font-medium">
                    {sec.totalQuestions}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <div className="inline-flex items-center gap-1 font-mono font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{sec.correctCount}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <div className="inline-flex items-center gap-1 font-mono font-bold text-rose-700 dark:text-rose-300 bg-rose-500/10 px-2 py-0.5 rounded-md">
                      <XCircle className="w-3 h-3" />
                      <span>{sec.incorrectCount}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <div className="inline-flex items-center gap-1 font-mono font-medium text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md">
                      <HelpCircle className="w-3 h-3" />
                      <span>{sec.unansweredCount}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span className="font-mono font-bold text-foreground">
                      {sec.accuracy.toFixed(1)}%
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="font-mono font-bold text-sm text-foreground">
                      {sec.totalMarks}{" "}
                      <span className="text-[11px] text-muted-foreground font-normal">
                        / {sec.maximumMarks}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

