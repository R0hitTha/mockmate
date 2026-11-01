"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  ArrowUpDown,
  Award,
  ChevronRight,
  FileCheck2,
  Calendar,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/layout/card";
import type { TestResultData } from "@/lib/validations/evaluation";

interface ResultsHistoryTableProps {
  initialResults: TestResultData[];
  totalResults: number;
}

export function ResultsHistoryTable({
  initialResults,
  totalResults,
}: ResultsHistoryTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedYear, setSelectedYear] = useState("ALL");
  const [sortBy, setSortBy] = useState<"date" | "marks" | "percentage" | "accuracy">("date");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  // Client-side filtering and sorting for instant snappy feel
  const filteredResults = initialResults
    .filter((r) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matchesTitle = r.testTitle.toLowerCase().includes(q);
        const matchesCode = r.testCode.toLowerCase().includes(q);
        if (!matchesTitle && !matchesCode) return false;
      }
      if (selectedCategory !== "ALL" && r.testCategory !== selectedCategory) {
        return false;
      }
      if (selectedYear !== "ALL" && String(r.examYear) !== selectedYear) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      const factor = sortOrder === "asc" ? 1 : -1;
      if (sortBy === "marks") return (a.totalMarks - b.totalMarks) * factor;
      if (sortBy === "percentage") return (a.percentage - b.percentage) * factor;
      if (sortBy === "accuracy") return (a.accuracy - b.accuracy) * factor;
      return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * factor;
    });

  const categories = Array.from(
    new Set(
      initialResults
        .map((r) => r.testCategory)
        .filter((c): c is string => Boolean(c))
    )
  );

  const years = Array.from(
    new Set(initialResults.map((r) => r.examYear).filter(Boolean))
  );

  return (
    <Card className="border-border shadow-xs">
      <CardHeader className="p-4 sm:p-6 border-b border-border space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-xl font-bold text-foreground">
              Examination Results &amp; Performance History
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Access your evaluated scores, question reviews, and official answer keys.
            </p>
          </div>

          <Badge variant="outline" className="font-mono text-xs self-start sm:self-auto">
            {totalResults} Evaluated {totalResults === 1 ? "Test" : "Tests"}
          </Badge>
        </div>

        {/* Filter & Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
            <Input
              placeholder="Search tests by title or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-9 px-3 text-xs bg-background border border-border rounded-xl text-foreground"
          >
            <option value="ALL">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.replace("_", " ")}
              </option>
            ))}
          </select>

          {/* Year Filter */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="h-9 px-3 text-xs bg-background border border-border rounded-xl text-foreground"
          >
            <option value="ALL">All Exam Years</option>
            {years.map((y) => (
              <option key={String(y)} value={String(y)}>
                CUET UG {y}
              </option>
            ))}
          </select>

          {/* Sort Control */}
          <div className="flex items-center gap-1.5">
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(
                  e.target.value as "date" | "marks" | "percentage" | "accuracy"
                )
              }
              className="h-9 px-3 text-xs bg-background border border-border rounded-xl text-foreground flex-1"
            >
              <option value="date">Date</option>
              <option value="marks">Score</option>
              <option value="percentage">Percentage</option>
              <option value="accuracy">Accuracy</option>
            </select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))}
              className="h-9 px-2 text-xs"
              title={`Sorting: ${sortOrder.toUpperCase()}`}
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {filteredResults.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-muted/80 text-muted-foreground flex items-center justify-center mx-auto">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                No Evaluated Results Found
              </h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                {initialResults.length === 0
                  ? "You have not completed any mock examinations yet. Start a test to view your scorecard and solutions."
                  : "No completed tests matched your active filters. Try adjusting your search query."}
              </p>
            </div>
            {initialResults.length === 0 && (
              <Link href="/mock-tests">
                <Button size="sm" className="text-xs">
                  <FileCheck2 className="w-3.5 h-3.5 mr-1.5" />
                  <span>Explore Mock Test Library</span>
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-muted-foreground font-medium">
                  <th className="py-3 px-4 font-semibold">Test Details</th>
                  <th className="py-3 px-4 font-semibold">Category</th>
                  <th className="py-3 px-4 font-semibold">Date</th>
                  <th className="py-3 px-4 text-center font-semibold">Score</th>
                  <th className="py-3 px-4 text-center font-semibold">Percentage</th>
                  <th className="py-3 px-4 text-center font-semibold">Accuracy</th>
                  <th className="py-3 px-4 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredResults.map((result) => {
                  const formattedDate = new Date(result.evaluatedAt).toLocaleDateString(
                    "en-IN",
                    {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }
                  );

                  return (
                    <tr
                      key={result.id}
                      className="hover:bg-muted/20 transition-colors group"
                    >
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/results/${result.id}`}
                          className="font-semibold text-foreground text-sm hover:text-primary transition-colors flex items-center gap-1.5"
                        >
                          <span>{result.testTitle}</span>
                        </Link>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                          <span className="font-mono">{result.testCode}</span>
                          <span>•</span>
                          <span>CUET UG {result.examYear || 2026}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge variant="outline" className="text-[10px]">
                          {(result.testCategory || "MOCK_TEST").replace("_", " ")}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4 text-muted-foreground whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-muted-foreground" />
                          <span>{formattedDate}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="font-mono font-bold text-sm text-foreground">
                          {result.totalMarks}{" "}
                          <span className="text-[11px] text-muted-foreground font-normal">
                            / {result.maximumMarks}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono font-bold text-sky-600 dark:text-sky-400">
                        {result.percentage.toFixed(1)}%
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {result.accuracy.toFixed(1)}%
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Link href={`/results/${result.id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2.5 text-xs text-primary font-medium hover:bg-primary/10 group-hover:translate-x-0.5 transition-transform"
                          >
                            <span>View Scorecard</span>
                            <ChevronRight className="w-3.5 h-3.5 ml-1" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
