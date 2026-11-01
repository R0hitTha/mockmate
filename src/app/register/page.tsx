"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { PublicLayout } from "@/components/layout/public-layout";
import { Container } from "@/components/layout/container";
import { Card, CardContent } from "@/components/layout/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { GoogleButton } from "@/components/auth/google-button";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { authClient } from "@/lib/auth-client";

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const passwordValue = watch("password", "");

  const hasMinLength = passwordValue.length >= 8;
  const hasUppercase = /[A-Z]/.test(passwordValue);
  const hasLowercase = /[a-z]/.test(passwordValue);
  const hasNumber = /[0-9]/.test(passwordValue);

  const onSubmit = async (data: RegisterInput) => {
    try {
      setIsSubmitting(true);
      setServerError(null);

      const response = await authClient.signUp.email({
        email: data.email,
        password: data.password,
        name: data.name,
      });

      if (response.error) {
        if (
          response.error.status === 422 ||
          response.error.message?.toLowerCase().includes("already exists")
        ) {
          setServerError(
            "An account with this email address already exists. Please sign in instead."
          );
        } else {
          setServerError(
            response.error.message ||
              "Registration failed. Please check your details and try again."
          );
        }
        return;
      }

      // On successful registration, redirect to onboarding flow
      router.push("/onboarding");
      router.refresh();
    } catch (err: unknown) {
      console.error("[REGISTER_ERROR]", err);
      setServerError(
        "A network or system error occurred. Please check your connection and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PublicLayout>
      <div className="py-12 sm:py-16 bg-background">
        <Container size="sm">
          <div className="max-w-md mx-auto space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 flex items-center justify-center mx-auto mb-2 border border-blue-100 dark:border-blue-900/60 shadow-xs">
                <UserPlus className="w-6 h-6" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                Create Your Student Account
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Join thousands of CUET UG 2026/2027 aspirants practicing with authentic
                NTA-format tests.
              </p>
            </div>

            <Card className="border-border shadow-xs">
              <CardContent className="p-6 sm:p-8 space-y-6">
                <GoogleButton mode="signup" />

                <div className="relative flex items-center justify-center">
                  <Separator className="w-full" />
                  <span className="absolute bg-card px-3 text-xs text-muted-foreground font-medium uppercase tracking-wider">
                    Or sign up with email
                  </span>
                </div>

                {serverError && (
                  <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs sm:text-sm flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{serverError}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="name"
                      className="text-xs font-semibold text-foreground"
                    >
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      placeholder="e.g. Aryan Sharma"
                      {...register("name")}
                      disabled={isSubmitting}
                      className={
                        errors.name
                          ? "border-destructive focus-visible:ring-destructive"
                          : ""
                      }
                    />
                    {errors.name && (
                      <p className="text-xs text-destructive">{errors.name.message}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="email"
                      className="text-xs font-semibold text-foreground"
                    >
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
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

                  {/* Password */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="password"
                      className="text-xs font-semibold text-foreground"
                    >
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create a strong password"
                      {...register("password")}
                      disabled={isSubmitting}
                      className={
                        errors.password
                          ? "border-destructive focus-visible:ring-destructive"
                          : ""
                      }
                    />
                    {errors.password && (
                      <p className="text-xs text-destructive">
                        {errors.password.message}
                      </p>
                    )}

                    {/* Password criteria checklist */}
                    {passwordValue && (
                      <div className="p-2.5 rounded-lg bg-muted/60 text-xs space-y-1 text-muted-foreground mt-1.5 border border-border/60">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2
                            className={`w-3.5 h-3.5 ${hasMinLength ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground/50"}`}
                          />
                          <span
                            className={hasMinLength ? "text-foreground font-medium" : ""}
                          >
                            At least 8 characters
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2
                            className={`w-3.5 h-3.5 ${hasUppercase ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground/50"}`}
                          />
                          <span
                            className={hasUppercase ? "text-foreground font-medium" : ""}
                          >
                            One uppercase letter (A-Z)
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2
                            className={`w-3.5 h-3.5 ${hasLowercase ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground/50"}`}
                          />
                          <span
                            className={hasLowercase ? "text-foreground font-medium" : ""}
                          >
                            One lowercase letter (a-z)
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2
                            className={`w-3.5 h-3.5 ${hasNumber ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground/50"}`}
                          />
                          <span
                            className={hasNumber ? "text-foreground font-medium" : ""}
                          >
                            At least one number (0-9)
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="confirmPassword"
                      className="text-xs font-semibold text-foreground"
                    >
                      Confirm Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Repeat your password"
                      {...register("confirmPassword")}
                      disabled={isSubmitting}
                      className={
                        errors.confirmPassword
                          ? "border-destructive focus-visible:ring-destructive"
                          : ""
                      }
                    />
                    {errors.confirmPassword && (
                      <p className="text-xs text-destructive">
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  {/* Terms notice */}
                  <p className="text-xs text-muted-foreground leading-relaxed pt-1">
                    By registering, you agree to MockMate&apos;s{" "}
                    <Link
                      href="/terms"
                      className="text-primary hover:underline font-medium"
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/privacy"
                      className="text-primary hover:underline font-medium"
                    >
                      Privacy Policy
                    </Link>
                    .
                  </p>

                  <Button
                    type="submit"
                    className="w-full h-11 text-sm font-semibold"
                    disabled={isSubmitting}
                    isLoading={isSubmitting}
                  >
                    <span>Create Account & Continue</span>
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </form>

                <div className="text-center pt-2 text-xs sm:text-sm text-muted-foreground">
                  Already have a MockMate account?{" "}
                  <Link
                    href="/login"
                    className="text-primary font-semibold hover:underline"
                  >
                    Sign in here
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </Container>
      </div>
    </PublicLayout>
  );
}
