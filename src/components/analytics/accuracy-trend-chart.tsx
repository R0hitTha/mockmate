"use client";

import React, { useState } from "react";
import { Target } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/layout/card";
import { Badge } from "@/components/ui/badge";
import type { ScoreTrendPoint } from "@/lib/validations/analytics";

interface AccuracyTrendChartProps {
  data: ScoreTrendPoint[];
}

export function AccuracyTrendChart({ data }: AccuracyTrendChartProps) {
  const [activePoint, setActivePoint] = useState<ScoreTrendPoint | null>(null);

  if (!data || data.length === 0) {
    return null;
  }

  const width = 650;
  const height = 240;
  const paddingLeft = 45;
  const paddingRight = 30;
  const paddingTop = 25;
  const paddingBottom = 40;

  const innerWidth = width - paddingLeft - paddingRight;
  const innerHeight = height - paddingTop - paddingBottom;

  const getX = (index: number) => {
    if (data.length === 1) return paddingLeft + innerWidth / 2;
    return paddingLeft + (index / (data.length - 1)) * innerWidth;
  };

  const getY = (accuracy: number) => {
    const clamped = Math.max(0, Math.min(100, accuracy));
    return paddingTop + innerHeight - (clamped / 100) * innerHeight;
  };

  const points = data.map((d, i) => ({
    x: getX(i),
    y: getY(d.accuracy),
    data: d,
  }));

  const pathD = points.reduce((acc, curr, idx) => {
    return `${acc} ${idx === 0 ? "M" : "L"} ${curr.x} ${curr.y}`;
  }, "");

  const areaD =
    data.length > 1
      ? `${pathD} L ${points[points.length - 1].x} ${
          paddingTop + innerHeight
        } L ${points[0].x} ${paddingTop + innerHeight} Z`
      : "";

  return (
    <Card className="border-border shadow-xs">
      <CardHeader className="p-5 border-b border-border flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <CardTitle className="text-base font-bold text-foreground">
            Precision &amp; Accuracy Trend
          </CardTitle>
        </div>
        <Badge variant="outline" className="text-xs font-mono text-emerald-600 dark:text-emerald-400">
          Correct / Attempted Ratio
        </Badge>
      </CardHeader>

      <CardContent className="p-5 space-y-4">
        <div className="relative w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-56 select-none overflow-visible"
          >
            <defs>
              <linearGradient id="accuracyAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Gridlines */}
            {[0, 25, 50, 75, 100].map((val) => {
              const y = getY(val);
              return (
                <g key={val}>
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={width - paddingRight}
                    y2={y}
                    stroke="currentColor"
                    className="text-border/60"
                    strokeDasharray="3 3"
                    strokeWidth="1"
                  />
                  <text
                    x={paddingLeft - 8}
                    y={y + 3.5}
                    textAnchor="end"
                    className="fill-muted-foreground text-[10px] font-mono"
                  >
                    {val}%
                  </text>
                </g>
              );
            })}

            {/* Area */}
            {areaD && <path d={areaD} fill="url(#accuracyAreaGradient)" />}

            {/* Line */}
            {data.length > 1 && (
              <path
                d={pathD}
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Points */}
            {points.map((pt) => {
              const isHovered = activePoint?.resultId === pt.data.resultId;
              return (
                <g
                  key={pt.data.resultId}
                  className="cursor-pointer"
                  onMouseEnter={() => setActivePoint(pt.data)}
                >
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? 6 : 4}
                    className="fill-emerald-600 stroke-background transition-all"
                    strokeWidth="2"
                  />
                  <text
                    x={pt.x}
                    y={paddingTop + innerHeight + 18}
                    textAnchor="middle"
                    className="fill-muted-foreground text-[10px] font-mono"
                  >
                    {pt.data.formattedDate}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Hover Tooltip Card */}
        {activePoint ? (
          <div className="p-3 rounded-xl bg-muted/40 border border-border flex items-center justify-between text-xs">
            <div>
              <span className="font-semibold text-foreground">
                {activePoint.testTitle}
              </span>
              <div className="text-muted-foreground text-[11px]">
                {activePoint.testCode}
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-muted-foreground block">
                Accuracy
              </span>
              <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400 text-sm">
                {activePoint.accuracy.toFixed(1)}%
              </span>
            </div>
          </div>
        ) : (
          <div className="text-[11px] text-muted-foreground text-center pt-1">
            Accuracy indicates the proportion of attempted questions answered correctly (excluding unanswered questions).
          </div>
        )}
      </CardContent>
    </Card>
  );
}

