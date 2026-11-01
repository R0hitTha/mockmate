/**
 * MockMate — CBT Engine Fallback & In-Memory Store
 *
 * Provides a resilient persistence layer for offline test runs, CI environments,
 * and seamless development without hard database coupling.
 */

import { type AttemptStatus, type AnswerStatus } from "./validations/cbt";

export interface StoredAttemptAnswer {
  id: string;
  attemptId: string;
  questionId: string;
  selectedOptionId: string | null;
  selectedOptionIds: string[];
  answerPayload: string | null;
  answerStatus: AnswerStatus;
  markedForReview: boolean;
  answeredAt: string | null;
  version: number;
  updatedAt: string;
}

export interface StoredTestAttempt {
  id: string;
  studentId: string;
  mockTestId: string;
  status: AttemptStatus;
  startedAt: string;
  expiresAt: string;
  submittedAt: string | null;
  timeTaken: number | null; // in seconds
  totalQuestions: number;
  attemptNumber: number;
  createdAt: string;
  updatedAt: string;
  answers: Map<string, StoredAttemptAnswer>; // questionId -> answer
}

export interface StoredAttemptEvent {
  id: string;
  attemptId: string;
  eventType: string;
  payload: string | null;
  createdAt: string;
}

// Global in-memory storage for active sessions & test executions
class CBTMemoryStore {
  private attempts = new Map<string, StoredTestAttempt>();
  private events: StoredAttemptEvent[] = [];

  constructor() {
    // Seed an initial demo attempt for Physics Mock Test
    const attemptId = "demo-attempt-phy-01";
    const now = new Date();
    const expires = new Date(now.getTime() + 45 * 60 * 1000);

    const demoAttempt: StoredTestAttempt = {
      id: attemptId,
      studentId: "student-sample-01",
      mockTestId: "test-cuet-phy-01",
      status: "IN_PROGRESS",
      startedAt: now.toISOString(),
      expiresAt: expires.toISOString(),
      submittedAt: null,
      timeTaken: null,
      totalQuestions: 50,
      attemptNumber: 1,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      answers: new Map<string, StoredAttemptAnswer>(),
    };

    demoAttempt.answers.set("Q-PHY-2026-001", {
      id: "ans-demo-01",
      attemptId,
      questionId: "Q-PHY-2026-001",
      selectedOptionId: "opt-1",
      selectedOptionIds: ["opt-1"],
      answerPayload: null,
      answerStatus: "ANSWERED",
      markedForReview: false,
      answeredAt: now.toISOString(),
      version: 1,
      updatedAt: now.toISOString(),
    });

    this.attempts.set(attemptId, demoAttempt);
  }

  getAttempt(id: string): StoredTestAttempt | undefined {
    return this.attempts.get(id);
  }

  findActiveAttempt(studentId: string, mockTestId: string): StoredTestAttempt | undefined {
    for (const attempt of this.attempts.values()) {
      if (
        attempt.studentId === studentId &&
        attempt.mockTestId === mockTestId &&
        attempt.status === "IN_PROGRESS"
      ) {
        return attempt;
      }
    }
    return undefined;
  }

  countStudentAttempts(studentId: string, mockTestId: string): number {
    let count = 0;
    for (const attempt of this.attempts.values()) {
      if (attempt.studentId === studentId && attempt.mockTestId === mockTestId) {
        count++;
      }
    }
    return count;
  }

  saveAttempt(attempt: StoredTestAttempt): void {
    this.attempts.set(attempt.id, attempt);
  }

  recordEvent(event: StoredAttemptEvent): void {
    this.events.push(event);
  }

  getEvents(attemptId: string): StoredAttemptEvent[] {
    return this.events.filter((e) => e.attemptId === attemptId);
  }

  clear(): void {
    this.attempts.clear();
    this.events = [];
  }
}

// Global singleton to persist state across module reloads in development
const globalForCBT = globalThis as unknown as { cbtMemoryStore: CBTMemoryStore };
export const cbtMemoryStore = globalForCBT.cbtMemoryStore || new CBTMemoryStore();
if (process.env.NODE_ENV !== "production") globalForCBT.cbtMemoryStore = cbtMemoryStore;

