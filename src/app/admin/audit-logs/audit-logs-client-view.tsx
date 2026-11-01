"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ScrollText,
  Filter,
  Clock,
  Eye,
  ChevronLeft,
  ChevronRight,
  Info,
} from "lucide-react";
import { Card, CardContent } from "@/components/layout/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { StoredAuditLog } from "@/lib/admin-service";

interface AuditLogsClientViewProps {
  logs: StoredAuditLog[];
  total: number;
  currentPage: number;
  totalPages: number;
  selectedAction?: string;
  selectedEntityType?: string;
}

export function AuditLogsClientView({
  logs,
  total,
  currentPage,
  totalPages,
  selectedAction = "",
  selectedEntityType = "",
}: AuditLogsClientViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [actionFilter, setActionFilter] = useState(selectedAction);
  const [entityFilter, setEntityFilter] = useState(selectedEntityType);

  // Inspector modal
  const [inspectLog, setInspectLog] = useState<StoredAuditLog | null>(null);

  const handleApplyFilter = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams();
    if (actionFilter) params.set("action", actionFilter);
    if (entityFilter) params.set("entityType", entityFilter);
    params.set("page", "1");

    startTransition(() => {
      router.push(`/admin/audit-logs?${params.toString()}`);
    });
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", String(newPage));
    startTransition(() => {
      router.push(`/admin/audit-logs?${params.toString()}`);
    });
  };

  const getActionBadge = (action: string) => {
    if (action.includes("SUSPEND")) {
      return (
        <Badge variant="destructive" className="text-[10px]">
          {action}
        </Badge>
      );
    }
    if (action.includes("REACTIVATE")) {
      return (
        <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
          {action}
        </Badge>
      );
    }
    if (action.includes("ROLE")) {
      return (
        <Badge variant="outline" className="text-[10px] bg-purple-500/10 text-purple-600 border-purple-500/20">
          {action}
        </Badge>
      );
    }
    if (action.includes("PLAN") || action.includes("SUBSCRIPTION")) {
      return (
        <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-600 border-blue-500/20">
          {action}
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="text-[10px]">
        {action}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ScrollText className="w-6 h-6 text-primary" />
            System Audit Trail
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Immutable log of administrative interventions, role modifications, and plan configurations.
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1 text-xs">
          Recorded Events: <strong className="ml-1 text-foreground">{total}</strong>
        </Badge>
      </div>

      {/* Filter Bar */}
      <Card className="border-border shadow-xs">
        <CardContent className="p-4">
          <form onSubmit={handleApplyFilter} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="w-full sm:w-auto flex-1">
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="w-full h-9 px-3 text-xs rounded-md border border-input bg-background text-foreground"
              >
                <option value="">All Actions</option>
                <option value="STUDENT_SUSPEND">STUDENT_SUSPEND</option>
                <option value="STUDENT_REACTIVATE">STUDENT_REACTIVATE</option>
                <option value="ROLE_CHANGE">ROLE_CHANGE</option>
                <option value="PLAN_CREATE">PLAN_CREATE</option>
                <option value="PLAN_UPDATE">PLAN_UPDATE</option>
                <option value="SUBSCRIPTION_ASSIGN">SUBSCRIPTION_ASSIGN</option>
                <option value="SETTING_UPDATE">SETTING_UPDATE</option>
              </select>
            </div>

            <div className="w-full sm:w-auto flex-1">
              <select
                value={entityFilter}
                onChange={(e) => setEntityFilter(e.target.value)}
                className="w-full h-9 px-3 text-xs rounded-md border border-input bg-background text-foreground"
              >
                <option value="">All Entity Types</option>
                <option value="USER">USER</option>
                <option value="SUBSCRIPTION_PLAN">SUBSCRIPTION_PLAN</option>
                <option value="PLATFORM_SETTING">PLATFORM_SETTING</option>
              </select>
            </div>

            <Button type="submit" size="sm" className="w-full sm:w-auto h-9 text-xs gap-1.5" disabled={isPending}>
              <Filter className="w-3.5 h-3.5" />
              Apply Filter
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card className="border-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground font-medium">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">Summary</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    No audit records found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
                        <span>
                          {new Date(log.createdAt).toLocaleString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">{getActionBadge(log.action)}</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-medium text-foreground">{log.actorName || "Admin"}</span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {log.entityType}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 max-w-md truncate text-foreground">{log.summary}</td>
                    <td className="py-3 px-4 text-right">
                      {log.metadata ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs px-2"
                          onClick={() => setInspectLog(log)}
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          JSON
                        </Button>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <div>
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2"
                disabled={currentPage <= 1 || isPending}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2"
                disabled={currentPage >= totalPages || isPending}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* JSON Inspector Dialog */}
      <Dialog open={inspectLog !== null} onOpenChange={(open) => !open && setInspectLog(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm font-semibold">
              <Info className="w-4 h-4 text-primary" />
              Audit Log Details: {inspectLog?.action}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Entity: {inspectLog?.entityType} ({inspectLog?.entityId})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div>
              <span className="font-semibold text-foreground">Summary:</span>
              <p className="text-muted-foreground mt-0.5">{inspectLog?.summary}</p>
            </div>

            <div>
              <span className="font-semibold text-foreground">Metadata Payload:</span>
              <pre className="mt-1 p-3 rounded-lg bg-muted text-[11px] font-mono overflow-x-auto max-h-60 text-foreground border border-border">
                {inspectLog?.metadata
                  ? JSON.stringify(JSON.parse(inspectLog.metadata), null, 2)
                  : "null"}
              </pre>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
