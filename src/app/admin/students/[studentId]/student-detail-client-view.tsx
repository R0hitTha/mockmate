"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Phone,
  GraduationCap,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Award,
  BookOpen,
  CreditCard,
  Shield,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/layout/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import type { AdminStudentDetail } from "@/lib/admin-service";
import {
  suspendStudentAction,
  reactivateStudentAction,
  updateUserRoleAction,
} from "@/actions/admin-actions";
import { assignStudentSubscriptionAction } from "@/actions/subscription-actions";
import { isSuperAdmin } from "@/lib/admin-roles";

interface StudentDetailClientViewProps {
  student: AdminStudentDetail;
  currentUserRole: string;
}

export function StudentDetailClientView({
  student,
  currentUserRole,
}: StudentDetailClientViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Modals
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");

  const [reactivateModalOpen, setReactivateModalOpen] = useState(false);
  const [reactivateNotes, setReactivateNotes] = useState("");

  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(student.role);

  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [selectedPlanCode, setSelectedPlanCode] = useState("PRO_SEASON");
  const [durationDays, setDurationDays] = useState(90);

  const handleSuspend = () => {
    if (!suspendReason.trim()) {
      toast.error("Suspension reason is mandatory.");
      return;
    }
    startTransition(async () => {
      const res = await suspendStudentAction({
        studentId: student.id,
        reason: suspendReason.trim(),
      });
      if (res.success) {
        toast.success("Student account suspended.");
        setSuspendModalOpen(false);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to suspend account.");
      }
    });
  };

  const handleReactivate = () => {
    startTransition(async () => {
      const res = await reactivateStudentAction({
        studentId: student.id,
        notes: reactivateNotes.trim() || undefined,
      });
      if (res.success) {
        toast.success("Student account reactivated.");
        setReactivateModalOpen(false);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to reactivate account.");
      }
    });
  };

  const handleUpdateRole = () => {
    startTransition(async () => {
      const res = await updateUserRoleAction({
        userId: student.id,
        role: selectedRole as "STUDENT" | "ADMIN" | "SUPER_ADMIN" | "CONTENT_ADMIN" | "SUPPORT_ADMIN" | "FINANCE_ADMIN",
      });
      if (res.success) {
        toast.success(`User role updated to ${selectedRole}.`);
        setRoleModalOpen(false);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to update user role.");
      }
    });
  };

  const handleAssignSubscription = () => {
    startTransition(async () => {
      const res = await assignStudentSubscriptionAction({
        studentId: student.id,
        planId: selectedPlanCode,
        durationDays: Number(durationDays),
        notes: `Admin manually assigned from student profile`,
      });
      if (res.success) {
        toast.success("Subscription granted successfully.");
        setSubscriptionModalOpen(false);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to assign subscription.");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/students">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Student Directory
          </Link>
        </Button>

        <div className="flex items-center gap-2">
          {student.banned ? (
            <Button
              variant="outline"
              size="sm"
              className="text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10"
              onClick={() => setReactivateModalOpen(true)}
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              Reactivate Account
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="text-destructive border-destructive/30 hover:bg-destructive/10"
              onClick={() => setSuspendModalOpen(true)}
            >
              <AlertTriangle className="w-4 h-4 mr-1.5" />
              Suspend Account
            </Button>
          )}

          {isSuperAdmin(currentUserRole) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRoleModalOpen(true)}
            >
              <Shield className="w-4 h-4 mr-1.5" />
              Change Role
            </Button>
          )}

          <Button size="sm" onClick={() => setSubscriptionModalOpen(true)}>
            <CreditCard className="w-4 h-4 mr-1.5" />
            Assign Plan
          </Button>
        </div>
      </div>

      {/* Main Student Header Card */}
      <Card className="border-border shadow-xs">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl shrink-0">
                {student.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-foreground">{student.name}</h1>
                  <Badge variant="outline" className="text-xs">
                    {student.role}
                  </Badge>
                  {student.banned ? (
                    <Badge variant="destructive" className="text-xs">
                      Suspended
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                      Active
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mt-2">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" />
                    {student.email}
                  </span>
                  {student.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" />
                      {student.phone}
                      {student.phoneVerified && (
                        <CheckCircle2 className="w-3 h-3 text-emerald-500 ml-0.5" />
                      )}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Joined {new Date(student.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex md:flex-col items-center md:items-end gap-2 text-right">
              <div className="text-xs text-muted-foreground">Current Subscription</div>
              <Badge className="bg-primary text-primary-foreground font-semibold px-3 py-1">
                {student.subscriptionPlanName || "Free Diagnostic"}
              </Badge>
            </div>
          </div>

          {student.banned && student.banReason && (
            <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span><strong>Suspension Reason:</strong> {student.banReason}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grid: Academic Info & Quick Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border">
          <CardContent className="p-4">
            <span className="text-xs text-muted-foreground">Target Exam Year</span>
            <div className="text-xl font-bold mt-1 text-foreground">
              {student.targetExamYear ? `CUET ${student.targetExamYear}` : "Not Set"}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1 capitalize">
              Stream: {student.stream?.toLowerCase() || "General"}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4">
            <span className="text-xs text-muted-foreground">Enrolled Subjects</span>
            <div className="text-xl font-bold mt-1 text-foreground">
              {student.enrolledSubjectCount}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">
              Active domain & languages
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4">
            <span className="text-xs text-muted-foreground">Completed Tests</span>
            <div className="text-xl font-bold mt-1 text-foreground">
              {student.completedTestsCount}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">
              Evaluated CBT attempts
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4">
            <span className="text-xs text-muted-foreground">Mistakes Tracked</span>
            <div className="text-xl font-bold mt-1 text-foreground">
              {student.mistakeCount}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">
              Recorded in Mistake Bank
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Two columns: Subjects & Test Attempts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subjects & Universities */}
        <div className="space-y-6">
          <Card className="border-border">
            <CardHeader className="p-5 pb-3 border-b border-border">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                Selected CUET Subjects
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              {student.subjects.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {student.subjects.map((s) => (
                    <div
                      key={s.code}
                      className="p-2.5 rounded-lg border border-border bg-muted/20 text-xs flex items-center justify-between"
                    >
                      <span className="font-medium text-foreground">{s.name}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {s.code}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-muted-foreground">No subjects selected yet.</div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="p-5 pb-3 border-b border-border">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-primary" />
                Target Universities
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              {student.universities.length > 0 ? (
                <div className="space-y-2">
                  {student.universities.map((u) => (
                    <div
                      key={u.code}
                      className="p-2.5 rounded-lg border border-border bg-muted/20 text-xs flex items-center justify-between"
                    >
                      <span className="font-medium text-foreground">{u.name}</span>
                      <Badge variant="outline" className="text-[10px]">
                        {u.code}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-muted-foreground">No universities selected yet.</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Test Attempts History */}
        <Card className="border-border">
          <CardHeader className="p-5 pb-3 border-b border-border flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Award className="w-4 h-4 text-primary" />
              Recent CBT Test Attempts
            </CardTitle>
            <Badge variant="secondary" className="text-xs font-mono">
              {student.testAttempts.length} attempts
            </Badge>
          </CardHeader>
          <CardContent className="p-5">
            {student.testAttempts.length > 0 ? (
              <div className="space-y-3">
                {student.testAttempts.map((att) => (
                  <div
                    key={att.id}
                    className="p-3 rounded-lg border border-border bg-muted/10 hover:border-primary/40 transition-colors text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">{att.testTitle}</span>
                      <Button asChild variant="ghost" size="sm" className="h-6 text-[11px] px-1.5">
                        <Link href={`/attempts/${att.id}/results`}>
                          View Scorecard
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </Link>
                      </Button>
                    </div>
                    <div className="flex items-center gap-4 text-muted-foreground text-[11px]">
                      <span>
                        Marks: <strong className="text-foreground">{att.totalMarks}</strong> / {att.maximumMarks}
                      </span>
                      <span>
                        Accuracy: <strong className="text-foreground">{att.accuracy}%</strong>
                      </span>
                      <span>{new Date(att.evaluatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-muted-foreground">
                Student has not submitted any CBT mock tests yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Suspend Modal */}
      <Dialog open={suspendModalOpen} onOpenChange={setSuspendModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Soft Suspend Student
            </DialogTitle>
            <DialogDescription className="text-xs">
              Account suspension restricts test taking. All historical attempts and scores are retained.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2 text-xs">
            <label className="font-medium text-foreground">Mandatory Reason</label>
            <Textarea
              placeholder="Provide reason for audit trail..."
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              className="text-xs min-h-[80px]"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setSuspendModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={handleSuspend} disabled={isPending}>
              Confirm Suspension
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reactivate Modal */}
      <Dialog open={reactivateModalOpen} onOpenChange={setReactivateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
              Reactivate Student Account
            </DialogTitle>
            <DialogDescription className="text-xs">
              Restores full student login and test simulation access immediately.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2 text-xs">
            <label className="font-medium text-foreground">Optional Reactivation Notes</label>
            <Textarea
              placeholder="E.g., Ticket resolved, student identity verified..."
              value={reactivateNotes}
              onChange={(e) => setReactivateNotes(e.target.value)}
              className="text-xs min-h-[80px]"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setReactivateModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleReactivate} disabled={isPending}>
              Confirm Reactivation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Role Change Modal */}
      <Dialog open={roleModalOpen} onOpenChange={setRoleModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Change User Role
            </DialogTitle>
            <DialogDescription className="text-xs">
              Assign administrative privileges to this user. Protected by Super Admin safeguards.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            <label className="font-medium text-foreground">Select New Role</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full h-9 px-3 text-xs rounded-md border border-input bg-background text-foreground"
            >
              <option value="STUDENT">STUDENT (Standard Aspirant)</option>
              <option value="CONTENT_ADMIN">CONTENT_ADMIN (Questions & Tests Builder)</option>
              <option value="SUPPORT_ADMIN">SUPPORT_ADMIN (Student Support & Review)</option>
              <option value="FINANCE_ADMIN">FINANCE_ADMIN (Subscriptions & Plans)</option>
              <option value="SUPER_ADMIN">SUPER_ADMIN (Full Platform Authority)</option>
            </select>
          </div>
          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setRoleModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleUpdateRole} disabled={isPending}>
              Apply Role Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Subscription Assign Modal */}
      <Dialog open={subscriptionModalOpen} onOpenChange={setSubscriptionModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              Assign Subscription Plan
            </DialogTitle>
            <DialogDescription className="text-xs">
              Grant test pack entitlements directly to this student account.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            <div>
              <label className="font-medium text-foreground">Select Plan</label>
              <select
                value={selectedPlanCode}
                onChange={(e) => setSelectedPlanCode(e.target.value)}
                className="w-full h-9 px-3 text-xs rounded-md border border-input bg-background text-foreground mt-1"
              >
                <option value="FREE">Free Diagnostic Tier</option>
                <option value="PRO_SEASON">Pro Aspirant Pass (Full Mock Library)</option>
                <option value="SUBJECT_PACK">Subject Specialist Pack</option>
              </select>
            </div>

            <div>
              <label className="font-medium text-foreground">Validity Duration</label>
              <select
                value={durationDays}
                onChange={(e) => setDurationDays(Number(e.target.value))}
                className="w-full h-9 px-3 text-xs rounded-md border border-input bg-background text-foreground mt-1"
              >
                <option value={30}>30 Days</option>
                <option value={60}>60 Days</option>
                <option value={90}>90 Days (Recommended for CUET Season)</option>
                <option value={180}>180 Days (Half Year)</option>
                <option value={365}>365 Days (Full Year)</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setSubscriptionModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleAssignSubscription} disabled={isPending}>
              Grant Subscription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
