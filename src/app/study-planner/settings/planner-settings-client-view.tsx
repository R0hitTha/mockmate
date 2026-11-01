"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save, CheckCircle2, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DAYS_OF_WEEK,
  type DayOfWeek,
  type StudyPreferenceInput,
} from "@/lib/validations/planner";
import { type StoredStudyPreference } from "@/lib/study-planner-service";
import { saveStudyPreferencesAction } from "@/actions/planner-actions";

interface PlannerSettingsClientViewProps {
  initialPreferences: StoredStudyPreference;
}

export function PlannerSettingsClientView({
  initialPreferences,
}: PlannerSettingsClientViewProps) {
  const [weeklyTargetHours, setWeeklyTargetHours] = useState(
    Math.round(initialPreferences.weeklyTargetMinutes / 60)
  );
  const [dailyTargetHours, setDailyTargetHours] = useState(
    Math.round((initialPreferences.dailyTargetMinutes / 60) * 10) / 10
  );
  const [preferredSessionMinutes, setPreferredSessionMinutes] = useState(
    initialPreferences.preferredSessionMinutes
  );
  const [preferredStudyDays, setPreferredStudyDays] = useState<DayOfWeek[]>(
    initialPreferences.preferredStudyDays
  );
  const [restDays, setRestDays] = useState<DayOfWeek[]>(
    initialPreferences.restDays
  );

  const [loading, setLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleStudyDay = (day: DayOfWeek) => {
    if (preferredStudyDays.includes(day)) {
      if (preferredStudyDays.length === 1) {
        setError("You must select at least 1 study day.");
        return;
      }
      setPreferredStudyDays(preferredStudyDays.filter((d) => d !== day));
      if (!restDays.includes(day)) {
        setRestDays([...restDays, day]);
      }
    } else {
      setPreferredStudyDays([...preferredStudyDays, day]);
      setRestDays(restDays.filter((d) => d !== day));
    }
    setError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSavedSuccess(false);

    try {
      const input: StudyPreferenceInput = {
        weeklyTargetMinutes: Math.round(weeklyTargetHours * 60),
        dailyTargetMinutes: Math.round(dailyTargetHours * 60),
        preferredSessionMinutes,
        preferredStudyDays,
        restDays,
        subjectPriorities: initialPreferences.subjectPriorities || [],
      };

      const res = await saveStudyPreferencesAction(input);
      if (!res.success) {
        setError(res.error || "Failed to save preferences");
      } else {
        setSavedSuccess(true);
      }
    } catch {
      setError("An unexpected error occurred while saving.");
    } finally {
      setLoading(false);
    }
  };

  const dayLabels: Record<DayOfWeek, string> = {
    MONDAY: "Mon",
    TUESDAY: "Tue",
    WEDNESDAY: "Wed",
    THURSDAY: "Thu",
    FRIDAY: "Fri",
    SATURDAY: "Sat",
    SUNDAY: "Sun",
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-border">
        <Link
          href="/study-planner"
          className="p-2 rounded-lg border border-border hover:bg-muted text-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground">Study Planner Settings</h1>
          <p className="text-xs text-muted mt-0.5">
            Customize your weekly study availability, session durations, and rest days
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-300 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Study preferences saved successfully! New plan generations will reflect these settings.</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-xs text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Card 1: Time Targets */}
        <div className="bg-surface rounded-xl border border-border p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2 pb-2 border-b border-border">
            <Clock className="w-4 h-4 text-primary" /> Target Hours &amp; Session Duration
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="weekly-hours" className="text-xs font-semibold text-foreground">
                Weekly Target (Hours)
              </Label>
              <Input
                id="weekly-hours"
                type="number"
                min="1"
                max="60"
                step="1"
                value={weeklyTargetHours}
                onChange={(e) => setWeeklyTargetHours(Number(e.target.value))}
                className="mt-1"
                required
              />
              <span className="text-[11px] text-muted mt-1 block">
                Total study time target per week
              </span>
            </div>

            <div>
              <Label htmlFor="daily-hours" className="text-xs font-semibold text-foreground">
                Daily Study Target (Hours)
              </Label>
              <Input
                id="daily-hours"
                type="number"
                min="0.5"
                max="12"
                step="0.5"
                value={dailyTargetHours}
                onChange={(e) => setDailyTargetHours(Number(e.target.value))}
                className="mt-1"
                required
              />
              <span className="text-[11px] text-muted mt-1 block">
                Maximum hours scheduled per active study day
              </span>
            </div>
          </div>

          <div>
            <Label htmlFor="session-mins" className="text-xs font-semibold text-foreground">
              Preferred Session Duration (Minutes)
            </Label>
            <Input
              id="session-mins"
              type="number"
              min="15"
              max="180"
              step="5"
              value={preferredSessionMinutes}
              onChange={(e) => setPreferredSessionMinutes(Number(e.target.value))}
              className="mt-1 max-w-xs"
              required
            />
            <span className="text-[11px] text-muted mt-1 block">
              Default time slot for revision and topic practice (usually 45–60 mins)
            </span>
          </div>
        </div>

        {/* Card 2: Study Days Selection */}
        <div className="bg-surface rounded-xl border border-border p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2 pb-2 border-b border-border">
            <Calendar className="w-4 h-4 text-primary" /> Active Study Days
          </h2>
          <p className="text-xs text-muted">
            Select the days of the week when you can study. Days left unselected are treated as rest days.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-1">
            {DAYS_OF_WEEK.map((day) => {
              const isSelected = preferredStudyDays.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleStudyDay(day)}
                  className={`p-3 rounded-lg border text-center transition-all ${
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary font-bold shadow-2xs"
                      : "bg-surface-elevated text-muted border-border hover:border-primary/40 font-medium"
                  }`}
                >
                  <div className="text-xs">{dayLabels[day]}</div>
                  <div className="text-[10px] mt-0.5 opacity-80">
                    {isSelected ? "Active" : "Rest"}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between pt-2">
          <Link href="/study-planner">
            <Button type="button" variant="outline" size="sm">
              Cancel
            </Button>
          </Link>
          <Button type="submit" variant="default" size="default" disabled={loading} className="gap-2">
            <Save className="w-4 h-4" />
            {loading ? "Saving..." : "Save Preferences"}
          </Button>
        </div>
      </form>
    </div>
  );
}
