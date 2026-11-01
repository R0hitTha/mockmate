"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronRight,
  GraduationCap,
  FileCheck2,
  ChevronLeft,
} from "lucide-react";
import { Card, CardContent } from "@/components/layout/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/lib/toast";
import type { AdminStudentListItem } from "@/lib/admin-service";
import { suspendStudentAction, reactivateStudentAction } from "@/actions/admin-actions";

interface StudentsClientViewProps {
  initialStudents: AdminStudentListItem[];
  total: number;
  currentPage: number;
  totalPages: number;
  initialQuery?: string;
  initialStatus?: string;
  initialYear?: number;
}

export function StudentsClientView({
  initialStudents,
  total,
  currentPage,
  totalPages,
  initialQuery = "",
  initialStatus = "ALL",
  initialYear,
}: StudentsClientViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [yearFilter, setYearFilter] = useState<string>(initialYear ? String(initialYear) : "ALL");

  // Modals state
  const [selectedStudent, setSelectedStudent] = useState<AdminStudentListItem | null>(null);
  const [actionType, setActionType] = useState<"suspend" | "reactivate" | null>(null);
  const [reasonInput, setReasonInput] = useState("");

  const handleApplyFilter = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    if (statusFilter !== "ALL") params.set("status", statusFilter);
    if (yearFilter !== "ALL") params.set("year", yearFilter);
    params.set("page", "1");

    startTransition(() => {
      router.push(`/admin/students?${params.toString()}`);
    });
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", String(newPage));
    startTransition(() => {
      router.push(`/admin/students?${params.toString()}`);
    });
  };

  const handleOpenSuspend = (student: AdminStudentListItem) => {
    setSelectedStudent(student);
    setActionType("suspend");
    setReasonInput("");
  };

  const handleOpenReactivate = (student: AdminStudentListItem) => {
    setSelectedStudent(student);
    setActionType("reactivate");
    setReasonInput("");
  };

  const handleConfirmAction = async () => {
    if (!selectedStudent || !actionType) return;

    if (actionType === "suspend" && !reasonInput.trim()) {
      toast.error("A suspension reason is mandatory for the audit log.");
      return;
    }

    startTransition(async () => {
      try {
        if (actionType === "suspend") {
          const res = await suspendStudentAction({
            studentId: selectedStudent.id,
            reason: reasonInput.trim(),
          });
          if (res.success) {
            toast.success(`Account for ${selectedStudent.name} has been suspended.`);
            setActionType(null);
            router.refresh();
          } else {
            toast.error(res.error || "Failed to suspend student.");
          }
        } else {
          const res = await reactivateStudentAction({
            studentId: selectedStudent.id,
            notes: reasonInput.trim() || undefined,
          });
          if (res.success) {
            toast.success(`Account for ${selectedStudent.name} has been reactivated.`);
            setActionType(null);
            router.refresh();
          } else {
            toast.error(res.error || "Failed to reactivate student.");
          }
        }
      } catch {
        toast.error("Operation failed. Please try again.");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            Student Directory
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage registered CUET UG aspirants, monitor study progress, and handle soft suspensions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1 text-xs">
            Total Students: <strong className="ml-1 text-foreground">{total}</strong>
          </Badge>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border-border shadow-xs">
        <CardContent className="p-4">
          <form onSubmit={handleApplyFilter} className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by student name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 px-3 text-xs rounded-md border border-input bg-background text-foreground"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active Only</option>
                <option value="SUSPENDED">Suspended Only</option>
              </select>

              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="h-9 px-3 text-xs rounded-md border border-input bg-background text-foreground"
              >
                <option value="ALL">All Exam Years</option>
                <option value="2026">CUET 2026</option>
                <option value="2027">CUET 2027</option>
              </select>

              <Button type="submit" size="sm" className="h-9 text-xs gap-1.5" disabled={isPending}>
                <Filter className="w-3.5 h-3.5" />
                Filter
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Student List Table */}
      <Card className="border-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground font-medium">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Target Exam</th>
                <th className="py-3 px-4">Subjects</th>
                <th className="py-3 px-4">Completed Tests</th>
                <th className="py-3 px-4">Subscription</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {initialStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted-foreground">
                    No students found matching your criteria.
                  </td>
                </tr>
              ) : (
                initialStudents.map((st) => (
                  <tr key={st.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-foreground">{st.name}</div>
                      <div className="text-[11px] text-muted-foreground">{st.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      {st.targetExamYear ? (
                        <div className="flex items-center gap-1.5 font-medium">
                          <GraduationCap className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span>CUET {st.targetExamYear}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Not set</span>
                      )}
                      {st.stream && (
                        <div className="text-[10px] text-muted-foreground uppercase">{st.stream}</div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="secondary" className="text-[10px] font-mono">
                        {st.enrolledSubjectCount} subjects
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <FileCheck2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{st.completedTestsCount} attempts</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="text-[10px]">
                        {st.subscriptionPlanName || "Free Tier"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      {st.banned ? (
                        <Badge variant="destructive" className="text-[10px] gap-1">
                          <XCircle className="w-3 h-3" />
                          Suspended
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20 gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Active
                        </Badge>
                      )}
                      {st.banned && st.banReason && (
                        <div className="text-[10px] text-destructive truncate max-w-[150px] mt-0.5" title={st.banReason}>
                          {st.banReason}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button asChild variant="ghost" size="sm" className="h-7 text-xs px-2">
                          <Link href={`/admin/students/${st.id}`}>
                            Details
                            <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                          </Link>
                        </Button>
                        {st.banned ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10"
                            onClick={() => handleOpenReactivate(st)}
                          >
                            Reactivate
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
                            onClick={() => handleOpenSuspend(st)}
                          >
                            Suspend
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
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

      {/* Confirmation Dialog */}
      <Dialog open={actionType !== null} onOpenChange={(open) => !open && setActionType(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              {actionType === "suspend" ? (
                <>
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  Soft Suspend Student Account
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  Reactivate Student Account
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {actionType === "suspend"
                ? `Suspending will block ${selectedStudent?.name} from taking tests or using MockMate. Test records and evaluations are fully preserved.`
                : `Reactivating will restore full access for ${selectedStudent?.name}.`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <label className="font-medium text-foreground">
              {actionType === "suspend" ? "Reason for Suspension (Required)" : "Reactivation Notes (Optional)"}
            </label>
            <Textarea
              placeholder={
                actionType === "suspend"
                  ? "E.g., Suspected fraudulent activity or unauthorized sharing..."
                  : "E.g., Verified student identity via helpdesk ticket..."
              }
              value={reasonInput}
              onChange={(e) => setReasonInput(e.target.value)}
              className="text-xs min-h-[80px]"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" size="sm" onClick={() => setActionType(null)} disabled={isPending}>
              Cancel
            </Button>
            <Button
              variant={actionType === "suspend" ? "destructive" : "default"}
              size="sm"
              onClick={handleConfirmAction}
              disabled={isPending}
            >
              {actionType === "suspend" ? "Confirm Suspension" : "Confirm Reactivation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
