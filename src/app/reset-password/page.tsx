"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { PublicLayout } from "@/components/layout/public-layout";
import { Container } from "@/components/layout/container";
import { Card, CardContent } from "@/components/layout/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validations/auth";
import { executePasswordReset } from "@/actions/auth-actions";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
      token: token,
    },
  });

  if (!token) {
    return (
      <div className="space-y-4 text-center">
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-2.5 text-left">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Invalid or Missing Reset Token</p>
            <p className="text-xs text-muted-foreground mt-1">
              The password reset link is invalid, incomplete, or has already expired.
              Please request a new reset link.
            </p>
          </div>
        </div>
        <Button asChild className="w-full">
          <Link href="/forgot-password">Request New Reset Link</Link>
        </Button>
      </div>
    );
  }

  const onSubmit = async (data: ResetPasswordInput) => {
    try {
      setIsSubmitting(true);
      setServerError(null);

      const result = await executePasswordReset(
        token,
        data.password,
        data.confirmPassword
      );
      if (result.success) {
        setSuccess(true);
      } else {
        setServerError(result.error || "Failed to update password");
      }
    } catch {
      setServerError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-5 text-center">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center mx-auto border border-emerald-100 dark:border-emerald-800">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-foreground">Password Reset Complete</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Your MockMate account password has been updated successfully.
          </p>
        </div>
        <Button asChild className="w-full h-11">
          <Link href="/login">
            <span>Sign In with New Password</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      <input type="hidden" {...register("token")} value={token} />

      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-xs font-semibold text-foreground">
          New Password
        </Label>
        <Input
          id="password"
          type="password"
          placeholder="At least 8 characters with 1 number & 1 letter"
          {...register("password")}
          disabled={isSubmitting}
          className={
            errors.password ? "border-destructive focus-visible:ring-destructive" : ""
          }
        />
        {errors.password && (
          <p className="text-xs text-destructive">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor="confirmPassword"
          className="text-xs font-semibold text-foreground"
        >
          Confirm New Password
        </Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Repeat your new password"
          {...register("confirmPassword")}
          disabled={isSubmitting}
          className={
            errors.confirmPassword
              ? "border-destructive focus-visible:ring-destructive"
              : ""
          }
        />
        {errors.confirmPassword && (
          <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full h-11 text-sm font-semibold"
        disabled={isSubmitting}
        isLoading={isSubmitting}
      >
        <span>Set New Password</span>
        <ArrowRight className="w-4 h-4 ml-1.5" />
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <PublicLayout>
      <div className="py-12 sm:py-20 bg-background">
        <Container size="sm">
          <div className="max-w-md mx-auto space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 flex items-center justify-center mx-auto mb-2 border border-blue-100 dark:border-blue-900/60 shadow-xs">
                <Lock className="w-6 h-6" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                Create New Password
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Set a secure password for your MockMate student profile.
              </p>
            </div>

            <Card className="border-border shadow-xs">
              <CardContent className="p-6 sm:p-8">
                <Suspense
                  fallback={
                    <div className="py-8 text-center text-xs text-muted-foreground">
                      Loading verification token...
                    </div>
                  }
                >
                  <ResetPasswordForm />
                </Suspense>
              </CardContent>
            </Card>
          </div>
        </Container>
      </div>
    </PublicLayout>
  );
}
