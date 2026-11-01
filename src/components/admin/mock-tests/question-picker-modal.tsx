"use client";

import React, { useState } from "react";
import {
  Search,
  Check,
  X,
  BookOpen,
  Filter,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export interface AvailableQuestion {
  id: string;
  questionCode: string;
  questionType: string;
  difficulty: string;
  questionText: string;
  marks: number;
  negativeMarks: number;
  subjectName: string;
  subjectCode: string;
  unitTitle?: string | null;
  topicTitle?: string | null;
}

interface QuestionPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectionTitle: string;
  subjectName: string;
  targetCount: number;
  currentlySelectedIds: string[];
  availableQuestions: AvailableQuestion[];
  onConfirmSelection: (selectedIds: string[]) => void;
}

export function QuestionPickerModal({
  isOpen,
  onClose,
  sectionTitle,
  subjectName,
  targetCount,
  currentlySelectedIds,
  availableQuestions,
  onConfirmSelection,
}: QuestionPickerModalProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(currentlySelectedIds);
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");

  if (!isOpen) return null;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredQuestions = availableQuestions.filter((q) => {
    const matchesSearch =
      q.questionCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.questionText.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty =
      difficultyFilter === "ALL" || q.difficulty === difficultyFilter;
    const matchesType = typeFilter === "ALL" || q.questionType === typeFilter;
    return matchesSearch && matchesDifficulty && matchesType;
  });

  const handleSave = () => {
    onConfirmSelection(selectedIds);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-surface border border-border rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-border flex items-center justify-between bg-muted/30">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Question Bank Selector
              </span>
              <Badge variant="outline" className="text-[10px]">
                {subjectName}
              </Badge>
            </div>
            <h3 className="text-lg font-bold text-foreground mt-0.5">
              Select Questions for {sectionTitle}
            </h3>
            <p className="text-xs text-muted-foreground">
              Target: {targetCount} questions required. Currently selected:{" "}
              <span
                className={
                  selectedIds.length === targetCount
                    ? "font-bold text-emerald-600 dark:text-emerald-400"
                    : "font-bold text-amber-600 dark:text-amber-400"
                }
              >
                {selectedIds.length} / {targetCount}
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-muted-foreground hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Controls */}
        <div className="p-4 border-b border-border bg-surface flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by question code, concept or problem text..."
              className="pl-9 h-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-muted-foreground" />
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="h-9 px-2.5 rounded-lg border border-border bg-background text-xs"
            >
              <option value="ALL">All Difficulties</option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-9 px-2.5 rounded-lg border border-border bg-background text-xs"
            >
              <option value="ALL">All Types</option>
              <option value="MCQ_SINGLE">Single MCQ</option>
              <option value="ASSERTION_REASON">Assertion & Reason</option>
              <option value="PASSAGE_BASED">Passage Based</option>
            </select>
          </div>
        </div>

        {/* Question List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredQuestions.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-border rounded-xl">
              <BookOpen className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-sm font-semibold text-foreground">No questions found</p>
              <p className="text-xs text-muted-foreground mt-1">
                Try adjusting your search keywords or filter settings.
              </p>
            </div>
          ) : (
            filteredQuestions.map((q) => {
              const isSelected = selectedIds.includes(q.id);
              return (
                <div
                  key={q.id}
                  onClick={() => toggleSelect(q.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                    isSelected
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                      : "border-border hover:border-primary/40 bg-surface"
                  }`}
                >
                  <div
                    className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? "bg-primary border-primary text-primary-foreground"
                        : "border-muted-foreground/40 bg-background"
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="font-mono text-xs font-bold text-foreground">
                        {q.questionCode}
                      </span>
                      <Badge variant="outline" className="text-[10px] py-0">
                        {q.questionType.replace("_", " ")}
                      </Badge>
                      <Badge
                        variant={
                          q.difficulty === "HARD"
                            ? "destructive"
                            : q.difficulty === "MEDIUM"
                            ? "secondary"
                            : "outline"
                        }
                        className="text-[10px] py-0"
                      >
                        {q.difficulty}
                      </Badge>
                      {q.unitTitle && (
                        <span className="text-[10px] text-muted-foreground truncate max-w-[200px]">
                          {q.unitTitle}
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-primary ml-auto font-medium">
                        +{q.marks} / -{q.negativeMarks}
                      </span>
                    </div>

                    <p className="text-xs text-foreground line-clamp-2 leading-relaxed">
                      {q.questionText}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-border flex items-center justify-between bg-muted/20">
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <span>
              {selectedIds.length} question{selectedIds.length !== 1 ? "s" : ""} selected
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave}>
              Apply Selection ({selectedIds.length})
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
