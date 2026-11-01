import { describe, it, expect } from "vitest";
import { normalizeIndianPhoneNumber, maskPhoneNumber } from "@/lib/phone";
import {
  registerSchema,
  loginSchema,
  passwordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/lib/validations/auth";
import {
  onboardingStep1Schema,
  onboardingStep2Schema,
  onboardingStep3Schema,
  onboardingStep4Schema,
  onboardingStep5Schema,
  completeOnboardingSchema,
} from "@/lib/validations/onboarding";

describe("Phase 4: Phone Number Normalization & Security", () => {
  it("normalizes a standard 10-digit Indian mobile number", () => {
    const res = normalizeIndianPhoneNumber("9876543210");
    expect(res.isValid).toBe(true);
    expect(res.normalized).toBe("+919876543210");
    expect(res.displayFormatted).toBe("+91 98765 43210");
  });

  it("handles numbers with +91, spaces, and hyphens", () => {
    const res = normalizeIndianPhoneNumber("+91 98123-45678");
    expect(res.isValid).toBe(true);
    expect(res.normalized).toBe("+919812345678");
  });

  it("handles numbers with leading 0", () => {
    const res = normalizeIndianPhoneNumber("09812345678");
    expect(res.isValid).toBe(true);
    expect(res.normalized).toBe("+919812345678");
  });

  it("rejects numbers not starting with 6, 7, 8, or 9", () => {
    const res = normalizeIndianPhoneNumber("5123456789");
    expect(res.isValid).toBe(false);
    expect(res.error).toBeDefined();
  });

  it("rejects numbers with invalid length", () => {
    const resShort = normalizeIndianPhoneNumber("98765");
    expect(resShort.isValid).toBe(false);

    const resLong = normalizeIndianPhoneNumber("9876543210123");
    expect(resLong.isValid).toBe(false);
  });

  it("masks phone numbers safely for privacy", () => {
    const masked = maskPhoneNumber("+919876543210");
    expect(masked).toBe("+91 98*** **210");
  });
});

describe("Phase 4: Authentication Validation Schemas", () => {
  it("validates strong passwords according to security requirements", () => {
    expect(passwordSchema.safeParse("WeakPass").success).toBe(false); // No number
    expect(passwordSchema.safeParse("weak1234").success).toBe(false); // No uppercase
    expect(passwordSchema.safeParse("WEAK1234").success).toBe(false); // No lowercase
    expect(passwordSchema.safeParse("P1a").success).toBe(false); // < 8 chars
    expect(passwordSchema.safeParse("SecurePass123").success).toBe(true);
  });

  it("validates registration payload and rejects mismatched passwords", () => {
    const valid = registerSchema.safeParse({
      name: "Aryan Sharma",
      email: "aryan@example.com",
      password: "StrongPassword1",
      confirmPassword: "StrongPassword1",
    });
    expect(valid.success).toBe(true);

    const mismatch = registerSchema.safeParse({
      name: "Aryan Sharma",
      email: "aryan@example.com",
      password: "StrongPassword1",
      confirmPassword: "DifferentPassword2",
    });
    expect(mismatch.success).toBe(false);
    if (!mismatch.success) {
      expect(mismatch.error.issues[0]?.message).toContain("Passwords do not match");
    }
  });

  it("validates login credentials correctly", () => {
    const valid = loginSchema.safeParse({
      email: "student@mockmate.in",
      password: "Password123",
      rememberMe: true,
    });
    expect(valid.success).toBe(true);

    const invalidEmail = loginSchema.safeParse({
      email: "invalid-email-string",
      password: "Password123",
    });
    expect(invalidEmail.success).toBe(false);
  });

  it("validates forgot and reset password inputs", () => {
    const forgotValid = forgotPasswordSchema.safeParse({ email: "student@example.com" });
    expect(forgotValid.success).toBe(true);

    const resetValid = resetPasswordSchema.safeParse({
      token: "valid-reset-token-abc",
      password: "NewPassword123",
      confirmPassword: "NewPassword123",
    });
    expect(resetValid.success).toBe(true);
  });
});

describe("Phase 4: Multi-Step Student Onboarding Schemas", () => {
  it("validates Step 1: Personal info with Indian phone", () => {
    const step1Valid = onboardingStep1Schema.safeParse({
      name: "Rohan Patel",
      phone: "9876543210",
      academicStatus: "CLASS_12_APPEARING",
    });
    expect(step1Valid.success).toBe(true);

    const step1InvalidPhone = onboardingStep1Schema.safeParse({
      name: "Rohan Patel",
      phone: "12345",
      academicStatus: "CLASS_12_APPEARING",
    });
    expect(step1InvalidPhone.success).toBe(false);
  });

  it("validates Step 2: Target year (2026 or 2027 only)", () => {
    const year2026 = onboardingStep2Schema.safeParse({
      targetExamYear: 2026,
      class12Status: "Pursuing 12th",
    });
    expect(year2026.success).toBe(true);

    const year2027 = onboardingStep2Schema.safeParse({
      targetExamYear: 2027,
      class12Status: "Pursuing 11th",
    });
    expect(year2027.success).toBe(true);

    const invalidYear = onboardingStep2Schema.safeParse({
      targetExamYear: 2024,
      class12Status: "Completed",
    });
    expect(invalidYear.success).toBe(false);
  });

  it("validates Step 3: Academic streams", () => {
    expect(onboardingStep3Schema.safeParse({ stream: "SCIENCE" }).success).toBe(true);
    expect(onboardingStep3Schema.safeParse({ stream: "COMMERCE" }).success).toBe(true);
    expect(onboardingStep3Schema.safeParse({ stream: "HUMANITIES" }).success).toBe(true);
    expect(onboardingStep3Schema.safeParse({ stream: "OTHER" }).success).toBe(true);
    expect(
      onboardingStep3Schema.safeParse({ stream: "ENGINEERING" as unknown as "SCIENCE" })
        .success
    ).toBe(false);
  });

  it("validates Step 4: Subject selection rules", () => {
    const valid = onboardingStep4Schema.safeParse({
      languages: ["101"], // English
      domains: ["314", "306"], // Physics, Chemistry
      generalTest: true,
    });
    expect(valid.success).toBe(true);

    const noLanguages = onboardingStep4Schema.safeParse({
      languages: [],
      domains: ["314"],
      generalTest: false,
    });
    expect(noLanguages.success).toBe(false);

    const noDomains = onboardingStep4Schema.safeParse({
      languages: ["101"],
      domains: [],
      generalTest: false,
    });
    expect(noDomains.success).toBe(false);
  });

  it("validates Step 5: Universities can be empty (skippable)", () => {
    const emptyUni = onboardingStep5Schema.safeParse({ universities: [] });
    expect(emptyUni.success).toBe(true);

    const withUni = onboardingStep5Schema.safeParse({ universities: ["DU", "BHU"] });
    expect(withUni.success).toBe(true);
  });

  it("validates complete composite onboarding payload", () => {
    const fullPayload = {
      name: "Aditya Verma",
      phone: "+91 9988776655",
      academicStatus: "CLASS_12_APPEARING",
      targetExamYear: 2026,
      class12Status: "CBSE Board 2026",
      stream: "SCIENCE",
      languages: ["101"],
      domains: ["314", "306", "312"],
      generalTest: true,
      universities: ["DU", "BHU", "JNU"],
    };

    const result = completeOnboardingSchema.safeParse(fullPayload);
    expect(result.success).toBe(true);
  });
});
