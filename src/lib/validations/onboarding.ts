import { z } from "zod";
import { normalizeIndianPhoneNumber } from "@/lib/phone";

export const ACADEMIC_STATUSES = [
  { value: "CLASS_12_APPEARING", label: "Class 12 Appearing (Currently in 12th)" },
  { value: "CLASS_12_PASSED", label: "Class 12 Passed" },
  { value: "DROPPER", label: "CUET Retaker / Dropper" },
] as const;

export const TARGET_YEARS = [
  { value: 2026, label: "CUET UG 2026 (Recommended for current 12th)" },
  { value: 2027, label: "CUET UG 2027 (Recommended for current 11th)" },
] as const;

export const STREAMS = [
  { value: "SCIENCE", label: "Science (PCM / PCB / PCMB)" },
  { value: "COMMERCE", label: "Commerce (With/Without Maths)" },
  { value: "HUMANITIES", label: "Humanities / Arts" },
  { value: "OTHER", label: "Vocational / Other" },
] as const;

/**
 * Provisional CUET Subject Catalogue
 * (Phase 6 will expand this to full NTA syllabus mapping)
 */
export const PROVISIONAL_LANGUAGES = [
  { code: "101", name: "English", section: "IA" },
  { code: "102", name: "Hindi", section: "IA" },
  { code: "103", name: "Assamese", section: "IA" },
  { code: "104", name: "Bengali", section: "IA" },
  { code: "105", name: "Gujarati", section: "IA" },
  { code: "106", name: "Kannada", section: "IA" },
  { code: "107", name: "Malayalam", section: "IA" },
  { code: "108", name: "Marathi", section: "IA" },
  { code: "109", name: "Odia", section: "IA" },
  { code: "110", name: "Punjabi", section: "IA" },
  { code: "111", name: "Tamil", section: "IA" },
  { code: "112", name: "Telugu", section: "IA" },
  { code: "113", name: "Urdu", section: "IA" },
  { code: "201", name: "French", section: "IB" },
  { code: "202", name: "German", section: "IB" },
  { code: "203", name: "Sanskrit", section: "IB" },
];

export const PROVISIONAL_DOMAINS = [
  { code: "301", name: "Accountancy / Book Keeping", stream: "COMMERCE" },
  { code: "302", name: "Agriculture", stream: "SCIENCE" },
  { code: "303", name: "Anthropology", stream: "HUMANITIES" },
  { code: "304", name: "Biology / Biological Studies", stream: "SCIENCE" },
  { code: "305", name: "Business Studies", stream: "COMMERCE" },
  { code: "306", name: "Chemistry", stream: "SCIENCE" },
  { code: "307", name: "Computer Science / IP", stream: "SCIENCE" },
  { code: "308", name: "Economics / Business Economics", stream: "COMMERCE" },
  { code: "309", name: "Geography / Geology", stream: "HUMANITIES" },
  { code: "310", name: "History", stream: "HUMANITIES" },
  { code: "311", name: "Legal Studies", stream: "HUMANITIES" },
  { code: "312", name: "Mathematics / Applied Mathematics", stream: "SCIENCE" },
  { code: "313", name: "Physical Education", stream: "OTHER" },
  { code: "314", name: "Physics", stream: "SCIENCE" },
  { code: "315", name: "Political Science", stream: "HUMANITIES" },
  { code: "316", name: "Psychology", stream: "HUMANITIES" },
  { code: "317", name: "Sociology", stream: "HUMANITIES" },
];

export const PROVISIONAL_UNIVERSITIES = [
  { code: "DU", name: "University of Delhi (DU)", state: "New Delhi" },
  { code: "BHU", name: "Banaras Hindu University (BHU)", state: "Varanasi, UP" },
  { code: "JNU", name: "Jawaharlal Nehru University (JNU)", state: "New Delhi" },
  { code: "JMI", name: "Jamia Millia Islamia (JMI)", state: "New Delhi" },
  { code: "AU", name: "University of Allahabad (AU)", state: "Prayagraj, UP" },
  { code: "AMU", name: "Aligarh Muslim University (AMU)", state: "Aligarh, UP" },
  {
    code: "BBAU",
    name: "Babasaheb Bhimrao Ambedkar University (BBAU)",
    state: "Lucknow, UP",
  },
  { code: "AUD", name: "Dr. B.R. Ambedkar University Delhi (AUD)", state: "New Delhi" },
  { code: "HYD", name: "University of Hyderabad (UoH)", state: "Hyderabad, Telangana" },
];

// Step 1: Personal Info Schema
export const onboardingStep1Schema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(60, "Full name must not exceed 60 characters"),
  phone: z
    .string()
    .trim()
    .min(10, "Please enter your 10-digit mobile number")
    .refine((val) => normalizeIndianPhoneNumber(val).isValid, {
      message: "Please enter a valid 10-digit Indian mobile number (+91)",
    }),
  academicStatus: z.enum(["CLASS_12_APPEARING", "CLASS_12_PASSED", "DROPPER"], {
    error: "Please select your academic status",
  }),
});

// Step 2: Target Year Schema
export const onboardingStep2Schema = z.object({
  targetExamYear: z.coerce
    .number()
    .int()
    .refine((val) => val === 2026 || val === 2027, {
      message: "Please select a valid CUET target year (2026 or 2027)",
    }),
  class12Status: z.string().min(1, "Please specify your Class 12 completion status"),
});

// Step 3: Stream Schema
export const onboardingStep3Schema = z.object({
  stream: z.enum(["SCIENCE", "COMMERCE", "HUMANITIES", "OTHER"], {
    error: "Please select your stream/background",
  }),
});

// Step 4: Subject Preferences Schema
export const onboardingStep4Schema = z.object({
  languages: z
    .array(z.string())
    .min(1, "Select at least 1 language (e.g. English or Hindi)"),
  domains: z
    .array(z.string())
    .min(1, "Select at least 1 domain subject for CUET preparation"),
  generalTest: z.boolean().default(true),
});

// Step 5: Target Universities Schema (Skippable)
export const onboardingStep5Schema = z.object({
  universities: z.array(z.string()).default([]),
});

// Comprehensive Onboarding Payload Schema
export const completeOnboardingSchema = z.object({
  name: z.string().trim().min(2),
  phone: z.string().refine((val) => normalizeIndianPhoneNumber(val).isValid),
  academicStatus: z.enum(["CLASS_12_APPEARING", "CLASS_12_PASSED", "DROPPER"]),
  targetExamYear: z.coerce.number().int(),
  class12Status: z.string(),
  stream: z.enum(["SCIENCE", "COMMERCE", "HUMANITIES", "OTHER"]),
  languages: z.array(z.string()).min(1),
  domains: z.array(z.string()).min(1),
  generalTest: z.boolean(),
  universities: z.array(z.string()).default([]),
});

export type CompleteOnboardingInput = z.infer<typeof completeOnboardingSchema>;
