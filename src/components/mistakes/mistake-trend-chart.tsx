"use client";

import React, { useState } from "react";
import { TrendingDown, Calendar } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/layout/card";
import type { MistakeTrendPoint } from "@/lib/validations/mistakes";

interface MistakeTrendChartProps {
  trend: MistakeTrendPoint[];
  hasEnoughData: boolean;
}

export function MistakeTrendChart({ trend, hasEnoughData }: MistakeTrendChartProps) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  if (!hasEnoughData || trend.length < 2) {
    return (
      <Card className="border border-border">
        <CardHeader className="pb-3 border-b border-border/60">
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-primary" />
            <span>Mistake Frequency Progression</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 text-center">
          <Calendar className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-sm font-medium text-foreground">Insufficient Attempt History</p>
          <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1">
            Complete at least 2 evaluated mock tests to generate a chronological mistake frequency progression curve.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Calculate SVG dimensions
  const width = 600;
  const height = 200;
  const paddingLeft = 35;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const innerWidth = width - paddingLeft - paddingRight;
  const innerHeight = height - paddingTop - paddingBottom;

  const maxVal = Math.max(...trend.map((t) => t.incorrectCount + t.unansweredCount), 5);

  const getX = (index: number) => {
    return paddingLeft + (index / (trend.length - 1)) * innerWidth;
  };

  const getY = (val: number) => {
    return paddingTop + innerHeight - (val / maxVal) * innerHeight;
  };

  const incorrectPoints = trend.map((t, i) => `${getX(i)},${getY(t.incorrectCount)}`).join(" ");

  const activePoint = activeIdx !== null ? trend[activeIdx] : null;

  return (
    <Card className="border border-border">
      <CardHeader className="pb-3 border-b border-border/60">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-primary" />
            <span>Mistake Trend Progression</span>
          </CardTitle>
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="text-muted-foreground">Incorrect</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-muted-foreground">Reviewed</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5">
        <div className="relative w-full aspect-[3/1] min-h-[180px]">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-full overflow-visible"
            preserveAspectRatio="none"
          >
            {/* Grid Lines */}
            {[0, 0.5, 1].map((ratio) => {
              const y = paddingTop + innerHeight * (1 - ratio);
              return (
                <g key={ratio}>
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={width - paddingRight}
                    y2={y}
                    stroke="currentColor"
                    className="text-border"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                  <text
                    x={paddingLeft - 8}
                    y={y + 3}
                    textAnchor="end"
                    className="fill-muted-foreground text-[10px]"
                  >
                    {Math.round(ratio * maxVal)}
                  </text>
                </g>
              );
            })}

            {/* Path for Incorrect Count */}
            <polyline
              fill="none"
              stroke="#f43f5e"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={incorrectPoints}
            />

            {/* Interactive Data Dots */}
            {trend.map((t, idx) => {
              const cx = getX(idx);
              const cy = getY(t.incorrectCount);
              const isHovered = activeIdx === idx;

              return (
                <g
                  key={idx}
                  className="cursor-pointer"
                  onMouseEnter={() => setActiveIdx(idx)}
                >
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isHovered ? 6 : 4}
                    className="fill-rose-500 stroke-background transition-all"
                    strokeWidth="2"
                  />
                  {/* Date Label on X Axis */}
                  <text
                    x={cx}
                    y={height - 8}
                    textAnchor="middle"
                    className="fill-muted-foreground text-[10px]"
                  >
                    {t.formattedDate}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Tooltip Card */}
          {activePoint && (
            <div className="mt-2 p-2.5 rounded-lg bg-muted/70 border border-border/80 flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground">{activePoint.formattedDate}</span>
              <div className="flex items-center gap-4">
                <span className="text-rose-600 font-medium">
                  {activePoint.incorrectCount} Incorrect
                </span>
                <span className="text-amber-600 font-medium">
                  {activePoint.unansweredCount} Unanswered
                </span>
                <span className="text-emerald-600 font-medium">
                  {activePoint.reviewedCount} Reviewed
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

