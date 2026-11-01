"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { PublicLayout } from "@/components/layout/public-layout";
import { Container } from "@/components/layout/container";
import { Card, CardContent } from "@/components/layout/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations/auth";
import { requestPasswordReset } from "@/actions/auth-actions";

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      const result = await requestPasswordReset(data.email);
      if (result.success) {
        setSuccessMessage(result.message || "Password reset instructions sent.");
      } else {
        setErrorMessage(result.error || "Unable to process request.");
      }
    } catch {
      setSuccessMessage(
        "If an account exists for this email address, you will receive password reset instructions shortly."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PublicLayout>
      <div className="py-12 sm:py-20 bg-background">
        <Container size="sm">
          <div className="max-w-md mx-auto space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 flex items-center justify-center mx-auto mb-2 border border-blue-100 dark:border-blue-900/60 shadow-xs">
                <KeyRound className="w-6 h-6" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                Reset Your Password
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Enter your registered student email and we&apos;ll send you instructions
                to reset your password.
              </p>
            </div>

            <Card className="border-border shadow-xs">
              <CardContent className="p-6 sm:p-8 space-y-5">
                {successMessage ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs sm:text-sm text-emerald-800 dark:text-emerald-300 space-y-2">
                      <div className="flex items-center gap-2 font-semibold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>Instructions Dispatched</span>
                      </div>
                      <p className="leading-relaxed">{successMessage}</p>
                    </div>

                    <div className="p-3.5 rounded-lg bg-muted/60 text-xs text-muted-foreground space-y-1">
                      <p className="font-medium text-foreground">Next steps:</p>
                      <ul className="list-disc list-inside space-y-0.5 pl-1">
                        <li>Check your inbox and spam/junk folder.</li>
                        <li>The reset link remains active for 1 hour.</li>
                        <li>
                          In local development, the reset link is logged to the server
                          terminal.
                        </li>
                      </ul>
                    </div>

                    <Button asChild className="w-full h-11">
                      <Link href="/login">
                        <ArrowLeft className="w-4 h-4 mr-1.5" />
                        <span>Return to Sign In</span>
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {errorMessage && (
                      <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <Label
                        htmlFor="email"
                        className="text-xs font-semibold text-foreground"
                      >
                        Registered Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="student@example.com"
                        {...register("email")}
                        disabled={isSubmitting}
                        className={
                          errors.email
                            ? "border-destructive focus-visible:ring-destructive"
                            : ""
                        }
                      />
                      {errors.email && (
                        <p className="text-xs text-destructive">{errors.email.message}</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-11 text-sm font-semibold"
                      disabled={isSubmitting}
                      isLoading={isSubmitting}
                    >
                      <span>Send Reset Link</span>
                      <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>

                    <div className="text-center pt-2">
                      <Link
                        href="/login"
                        className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground font-medium transition-colors"
                      >
                        <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                        Back to Sign In
                      </Link>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </Container>
      </div>
    </PublicLayout>
  );
}
