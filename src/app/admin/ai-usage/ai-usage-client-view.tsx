"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Bot,
  DollarSign,
  TrendingUp,
  Clock,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Cpu,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/layout/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";
import type { AITelemetryStats } from "@/lib/admin-service";
import { updatePlatformSettingAction } from "@/actions/admin-actions";

interface AIUsageClientViewProps {
  stats: AITelemetryStats;
}

export function AIUsageClientView({ stats }: AIUsageClientViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [aiEnabled, setAiEnabled] = useState(stats.globalEnabled);

  const handleToggleGlobalAI = () => {
    const nextState = !aiEnabled;
    startTransition(async () => {
      const res = await updatePlatformSettingAction({
        key: "AI_ASSISTANT_ENABLED",
        value: String(nextState),
        category: "AI",
        description: "Global toggle for student AI study assistant",
      });

      if (res.success) {
        setAiEnabled(nextState);
        toast.success(
          nextState
            ? "AI Study Assistant enabled globally."
            : "AI Study Assistant suspended globally."
        );
        router.refresh();
      } else {
        toast.error(res.error || "Failed to toggle AI Assistant.");
      }
    });
  };

  const percentSpend = Math.min(
    100,
    Math.round((stats.estimatedMonthlyCostUSD / stats.monthlyBudgetCapUSD) * 100)
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Bot className="w-6 h-6 text-primary" />
            AI Telemetry & Quota Monitoring
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track student AI token consumption, API budget caps, and global service availability.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">Global AI Assistant:</span>
            {aiEnabled ? (
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs">
                Enabled
              </Badge>
            ) : (
              <Badge variant="destructive" className="text-xs">
                Disabled
              </Badge>
            )}
          </div>

          <Button
            variant={aiEnabled ? "outline" : "default"}
            size="sm"
            onClick={handleToggleGlobalAI}
            disabled={isPending}
            className="text-xs"
          >
            {aiEnabled ? (
              <>
                <ToggleLeft className="w-4 h-4 mr-1.5 text-muted-foreground" />
                Suspend AI Globally
              </>
            ) : (
              <>
                <ToggleRight className="w-4 h-4 mr-1.5" />
                Enable AI Globally
              </>
            )}
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Total AI Queries</span>
              <Bot className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold mt-2 text-foreground">
              {stats.totalQueries.toLocaleString()}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">
              {stats.activeStudentsToday} students today
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Avg Tokens / Query</span>
              <Cpu className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-2xl font-bold mt-2 text-foreground">
              {stats.averageTokensPerQuery.toLocaleString()}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">
              Prompt + Completion
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Est. Monthly Cost</span>
              <DollarSign className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold mt-2 text-foreground">
              ${stats.estimatedMonthlyCostUSD.toFixed(2)}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">
              Budget cap: ${stats.monthlyBudgetCapUSD.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Budget Consumption</span>
              <TrendingUp className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold mt-2 text-foreground">
              {percentSpend}%
            </div>
            <div className="w-full bg-muted rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all"
                style={{ width: `${percentSpend}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Two columns: Subject Breakdown & Recent Queries */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subject Breakdown */}
        <Card className="border-border shadow-xs">
          <CardHeader className="p-5 pb-3 border-b border-border">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Queries by Subject
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            {stats.subjectBreakdown.map((item) => (
              <div key={item.subject} className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">{item.subject}</span>
                  <span className="text-muted-foreground font-mono">
                    {item.queries} ({item.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}

            <div className="pt-4 border-t border-border text-[11px] text-muted-foreground flex items-start gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
              <span>
                STEM domains (Physics & Chemistry) account for 67% of token volume due to step-by-step LaTeX formula derivations.
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Recent Queries */}
        <Card className="lg:col-span-2 border-border shadow-xs">
          <CardHeader className="p-5 pb-3 border-b border-border flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Recent AI Assistant Interactions
            </CardTitle>
            <Badge variant="outline" className="text-[10px]">
              Live Stream
            </Badge>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            {stats.recentQueries.map((q) => (
              <div
                key={q.id}
                className="p-3 rounded-lg border border-border bg-muted/10 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">{q.studentName}</span>
                    <Badge variant="secondary" className="text-[10px]">
                      {q.subject}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-mono">
                    <span>{q.tokensUsed} tokens</span>
                    <span>{q.latencyMs} ms</span>
                    <span>{new Date(q.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                </div>
                <p className="text-muted-foreground italic text-[11px]">
                  &ldquo;{q.queryPreview}&rdquo;
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
