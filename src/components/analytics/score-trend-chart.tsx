"use client";

import React, { useState } from "react";
import Link from "next/link";
import { LineChart, ChevronRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/layout/card";
import { Badge } from "@/components/ui/badge";
import type { ScoreTrendPoint } from "@/lib/validations/analytics";

interface ScoreTrendChartProps {
  data: ScoreTrendPoint[];
}

export function ScoreTrendChart({ data }: ScoreTrendChartProps) {
  const [activePoint, setActivePoint] = useState<ScoreTrendPoint | null>(null);

  if (!data || data.length === 0) {
    return null;
  }

  // Width, height, and paddings for pure SVG chart
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

  const getY = (percentage: number) => {
    const clamped = Math.max(0, Math.min(100, percentage));
    return paddingTop + innerHeight - (clamped / 100) * innerHeight;
  };

  // Build SVG Path string
  const points = data.map((d, i) => ({
    x: getX(i),
    y: getY(d.percentage),
    data: d,
  }));

  const pathD = points.reduce((acc, curr, idx) => {
    return `${acc} ${idx === 0 ? "M" : "L"} ${curr.x} ${curr.y}`;
  }, "");

  // Area fill below line
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
          <LineChart className="w-4 h-4 text-primary" />
          <CardTitle className="text-base font-bold text-foreground">
            Normalized Score Progression Curve
          </CardTitle>
        </div>
        <Badge variant="outline" className="text-xs font-mono">
          {data.length} {data.length === 1 ? "Attempt" : "Attempts"}
        </Badge>
      </CardHeader>

      <CardContent className="p-5 space-y-4">
        {data.length === 1 && (
          <div className="text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-xl border border-border">
            Note: 1 test completed. Progression trends become active after completing 2 or more tests.
          </div>
        )}

        <div className="relative w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-56 select-none overflow-visible"
          >
            <defs>
              <linearGradient id="scoreAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.25" />
                <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Y Axis Gridlines (0%, 25%, 50%, 75%, 100%) */}
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

            {/* Area Fill */}
            {areaD && <path d={areaD} fill="url(#scoreAreaGradient)" />}

            {/* Main Score Trend Line */}
            {data.length > 1 && (
              <path
                d={pathD}
                fill="none"
                stroke="var(--color-primary)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Interactive Data Points */}
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
                    className="fill-primary stroke-background transition-all"
                    strokeWidth="2"
                  />

                  {/* X Axis Labels */}
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

        {/* Hover / Active Point Tooltip Card */}
        {activePoint ? (
          <div className="p-3 rounded-xl bg-muted/40 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-semibold text-foreground">
                {activePoint.testTitle}
              </span>
              <div className="text-muted-foreground text-[11px] mt-0.5">
                {activePoint.testCode} • {activePoint.formattedDate}
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <div>
                <span className="text-[10px] text-muted-foreground block">
                  Raw Score
                </span>
                <span className="font-bold font-mono text-foreground">
                  {activePoint.totalMarks} / {activePoint.maximumMarks}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-muted-foreground block">
                  Normalized %
                </span>
                <span className="font-bold font-mono text-primary">
                  {activePoint.percentage.toFixed(1)}%
                </span>
              </div>

              <Link href={`/results/${activePoint.resultId}`}>
                <Badge variant="outline" className="text-[10px] flex items-center gap-1 hover:bg-muted transition-colors">
                  <span>View Scorecard</span>
                  <ChevronRight className="w-3 h-3" />
                </Badge>
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-[11px] text-muted-foreground text-center pt-1">
            Hover over any point on the progression curve to inspect detailed test marks.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

