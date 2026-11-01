import React from "react";
import Link from "next/link";
import { Compass, Lightbulb, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/layout/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface PreparationRecommendationsProps {
  targetExamYear: number;
  stream?: string | null;
  subjectCount: number;
  hasGeneralTest: boolean;
  universityCount: number;
}

export function PreparationRecommendations({
  targetExamYear,
  stream,
  subjectCount,
  hasGeneralTest,
  universityCount,
}: PreparationRecommendationsProps) {
  // Purely deterministic, transparent rule-based recommendations
  const recommendations: Array<{ title: string; desc: string; tag: string }> = [];

  // Stream-based recommendation
  if (stream) {
    const streamName =
      stream === "SCIENCE"
        ? "Science"
        : stream === "COMMERCE"
          ? "Commerce"
          : stream === "HUMANITIES"
            ? "Humanities"
            : stream;
    recommendations.push({
      title: `${streamName} Stream Alignment`,
      desc: `Your enrolled subjects align with your high school ${streamName} curriculum. Focus on high-frequency NCERT concepts and application-based MCQs.`,
      tag: `${streamName} Prep`,
    });
  }

  // Rule 1: Target Year strategy
  if (targetExamYear === 2026) {
    recommendations.push({
      title: "Class 12 NCERT Mastery",
      desc: "For CUET UG 2026, ensure strict chapter-by-chapter conceptual clarity across NCERT Class 12 textbooks, which form 100% of the domain syllabus.",
      tag: "Target Year 2026",
    });
  } else {
    recommendations.push({
      title: "Foundational Conceptual Building",
      desc: "Targeting CUET UG 2027 gives you a strategic advantage. Focus on building strong core fundamentals before commencing timed CBT speed drills.",
      tag: "Target Year 2027",
    });
  }

  // Rule 2: General Test strategy
  if (hasGeneralTest) {
    recommendations.push({
      title: "Daily General Test Quota",
      desc: "Section III tests General Awareness, Current Affairs, Mental Ability, and Quantitative Reasoning. Dedicate 30 minutes daily to current affairs and speed arithmetic.",
      tag: "General Test (Sec III)",
    });
  } else {
    recommendations.push({
      title: "Review University General Test Requirements",
      desc: "Many top central universities require the General Test for competitive courses (e.g., B.A. Program, B.Com). Check your target university criteria in your profile.",
      tag: "Eligibility Check",
    });
  }

  // Rule 3: Domain Subject load
  if (subjectCount >= 4) {
    recommendations.push({
      title: "Balanced Revision Rotation",
      desc: `With ${subjectCount} test papers selected, rotate subjects on alternating days to prevent conceptual fade and maintain equal preparation velocity.`,
      tag: "Study Rotation",
    });
  }

  // Rule 4: Target University alignment
  if (universityCount > 0) {
    recommendations.push({
      title: "University Course Mapping",
      desc: `You have selected ${universityCount} target university preferences. Ensure your domain subjects fulfill specific program eligibility under the latest NTA bulletin.`,
      tag: "Course Admissions",
    });
  }

  return (
    <Card className="border-border shadow-2xs">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground">Preparation Guidance</h2>
          </div>
          <Badge variant="secondary" className="text-[10px] font-medium">
            Rule-Based Strategy
          </Badge>
        </div>

        <div className="space-y-3">
          {recommendations.map((rec) => (
            <div
              key={rec.title}
              className="p-3.5 rounded-xl border border-border/80 bg-muted/20 space-y-1.5"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>{rec.title}</span>
                </div>
                <Badge variant="outline" className="text-[9px] px-1.5 py-0 font-normal">
                  {rec.tag}
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed pl-5">
                {rec.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="pt-2 flex items-center justify-between text-xs text-muted-foreground border-t border-border">
          <span>
            Derived from your profile preferences • Non-synthetic recommendations
          </span>
          <Button variant="ghost" size="sm" asChild className="text-xs h-8">
            <Link href="/profile">
              <span>Update Profile</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
