"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn, ArrowRight, Eye, EyeOff, AlertCircle } from "lucide-react";
import { PublicLayout } from "@/components/layout/public-layout";
import { Container } from "@/components/layout/container";
import { Card, CardContent } from "@/components/layout/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { GoogleButton } from "@/components/auth/google-button";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { authClient } from "@/lib/auth-client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const rememberMe = watch("rememberMe");

  const onSubmit = async (data: LoginInput) => {
    try {
      setIsSubmitting(true);
      setServerError(null);

      const response = await authClient.signIn.email({
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
      });

      if (response.error) {
        setServerError(
          "Invalid email address or password. Please verify your credentials."
        );
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch (err: unknown) {
      console.error("[LOGIN_ERROR]", err);
      setServerError(
        "Invalid email address or password. Please verify your credentials."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-border shadow-xs">
      <CardContent className="p-6 sm:p-8 space-y-6">
        <GoogleButton mode="signin" />

        <div className="relative flex items-center justify-center">
          <Separator className="w-full" />
          <span className="absolute bg-card px-3 text-xs text-muted-foreground font-medium uppercase tracking-wider">
            Or sign in with email
          </span>
        </div>

        {serverError && (
          <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs sm:text-sm flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold text-foreground">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              {...register("email")}
              disabled={isSubmitting}
              className={
                errors.email ? "border-destructive focus-visible:ring-destructive" : ""
              }
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-xs font-semibold text-foreground">
                Password
              </Label>
              <Link
                href="/forgot-password"
                className="text-xs text-primary hover:underline font-medium"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                {...register("password")}
                disabled={isSubmitting}
                className={`pr-10 ${errors.password ? "border-destructive focus-visible:ring-destructive" : ""}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>

          {/* Remember Me */}
          <div className="flex items-center space-x-2 pt-0.5">
            <Checkbox
              id="rememberMe"
              checked={rememberMe}
              onCheckedChange={(checked) => setValue("rememberMe", Boolean(checked))}
            />
            <label
              htmlFor="rememberMe"
              className="text-xs text-muted-foreground cursor-pointer select-none"
            >
              Remember me for 30 days
            </label>
          </div>

          <Button
            type="submit"
            className="w-full h-11 text-sm font-semibold"
            disabled={isSubmitting}
            isLoading={isSubmitting}
          >
            <span>Sign In to MockMate</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </form>

        <div className="text-center pt-2 text-xs sm:text-sm text-muted-foreground">
          Don&apos;t have an account yet?{" "}
          <Link href="/register" className="text-primary font-semibold hover:underline">
            Create free account
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <PublicLayout>
      <div className="py-12 sm:py-16 bg-background">
        <Container size="sm">
          <div className="max-w-md mx-auto space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 flex items-center justify-center mx-auto mb-2 border border-blue-100 dark:border-blue-900/60 shadow-xs">
                <LogIn className="w-6 h-6" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                Welcome Back to MockMate
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Sign in to continue your CUET UG tests, practice modules, and analytics.
              </p>
            </div>

            <Suspense
              fallback={
                <div className="p-8 text-center text-xs text-muted-foreground bg-card rounded-xl border border-border">
                  Loading sign in form...
                </div>
              }
            >
              <LoginForm />
            </Suspense>
          </div>
        </Container>
      </div>
    </PublicLayout>
  );
}
