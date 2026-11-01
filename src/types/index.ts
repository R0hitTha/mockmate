/**
 * Shared foundational types for MockMate
 */

export type UserRole = "STUDENT" | "ADMIN";

export interface HealthCheckResponse {
  status: "ok" | "degraded" | "error";
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
  database: "connected" | "pending_configuration" | "error";
}

export type CUETSection = "LANGUAGES" | "DOMAIN" | "GENERAL_TEST";

export interface SubjectMeta {
  code: string;
  name: string;
  section: CUETSection;
  totalQuestions: number;
  maxToAttempt: number;
  durationMinutes: number;
}
