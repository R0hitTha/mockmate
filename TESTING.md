# MockMate — Automated Testing & Quality Assurance Guide

Comprehensive automated testing ensures that MockMate maintains flawless reliability, strict examination integrity, and zero regressions across all core features and security controls.

---

## 1. Test Architecture & Runner

MockMate uses **Vitest** as its primary test runner:
- **Test Runner:** Vitest v5 with TypeScript ESM support.
- **Environment:** Node.js with isolated virtual globals.
- **Coverage Strategy:** 15 modular test suites covering unit functions, database services, business logic algorithms, and multi-step end-to-end user journeys.
- **Hermetic In-Memory Fallback Stores:** All core services (`mock-test-service`, `cbt-service`, `evaluation-service`, `mistake-service`, `study-planner-service`, `admin-service`, `entitlement-service`) feature memory-store fallbacks. This architecture enables the entire test suite to execute in isolated CI/CD environments without requiring an active PostgreSQL database instance.

---

## 2. Test Suites Overview (153 Passing Tests)

| # | Test Suite File | Phase / Focus | Test Count | Key Invariants Verified |
| :- | :--- | :--- | :-: | :--- |
| 1 | `foundation.test.ts` | Phase 1: Foundation | 4 | Brand metadata, CUET sections (IA, IB, II, III), `cn()` utility class merging, Zod schema validation. |
| 2 | `design-system.test.ts` | Phase 2: Design System | 4 | Design tokens, color palette contrast, typography styles, button variant classes. |
| 3 | `public-website.test.ts` | Phase 3: Public Website | 10 | Route availability, marketing page sections, navigation links, SEO meta tags, sitemap entries. |
| 4 | `auth-onboarding.test.ts` | Phase 4: Auth & Onboarding | 16 | Registration validation, password complexity, login flow, onboarding subject selection, exam year setup. |
| 5 | `student-dashboard.test.ts`| Phase 5: Student Cockpit | 5 | Dashboard data hydration, recent attempts display, active notifications, quick test launcher. |
| 6 | `subject-syllabus.test.ts` | Phase 6: CUET Syllabus | 6 | Standard exam years (2026/2027), subject classification, unit/chapter hierarchy, curriculum lookup. |
| 7 | `question-bank.test.ts` | Phase 7: Question Bank | 14 | Question authoring, LaTeX formula support, option validation, status transitions, bulk CSV import. |
| 8 | `mock-test-library.test.ts` | Phase 8: Mock Test Library | 15 | Test creation, section assembly, question allocation, publishing constraints, student library filtering. |
| 9 | `cbt-engine.test.ts` | Phase 9: CBT Exam Engine | 18 | Attempt initiation, answer auto-save, server timer calculation, answer concealment, final submission locking. |
| 10 | `evaluation-engine.test.ts` | Phase 10: Evaluation & Results | 12 | Exact NTA marking (+5/-1), sectional scoring, rank estimation, detailed solution rendering. |
| 11 | `performance-analytics.test.ts` | Phase 11: Analytics | 12 | Subject mastery index, accuracy rate, time-per-question calculations, historical progress trends. |
| 12 | `mistake-intelligence.test.ts` | Phase 12: Mistake Intelligence | 12 | Evidence-based diagnosis, sample size threshold ($N \ge 3$), review lifecycle (`PENDING` $\to$ `MASTERED`). |
| 13 | `study-planner.test.ts` | Phase 13: Study Planner & AI | 15 | Weekly schedule generation, mistake-based priority re-weighting, study preferences, AI assistant guardrails. |
| 14 | `admin-monetization.test.ts` | Phase 14: Admin & Monetization | 6 | Admin RBAC, audit log immutability, subscription tiers, feature gating and mock payment flows. |
| 15 | `e2e-user-journeys.test.ts` | Phase 15: Critical E2E Journeys | 4 | Complete 15-step student lifecycle, cross-student attempt isolation, super admin safeguards, tier upgrades. |

---

## 3. Running Automated Tests

### Run All Test Suites
```bash
npm test
```
*Executes all 15 test suites in parallel and reports total passing tests, duration, and memory utilization.*

### Run a Specific Test Suite
```bash
# Run only End-to-End User Journeys
npx vitest run tests/e2e-user-journeys.test.ts

# Run CBT Engine tests
npx vitest run tests/cbt-engine.test.ts

# Run Mistake Intelligence tests
npx vitest run tests/mistake-intelligence.test.ts
```

### Watch Mode for Interactive Development
```bash
npx vitest
```
*Watches modified files and automatically re-runs affected test suites in milliseconds.*

### Code Coverage Report
```bash
npx vitest run --coverage
```
*Generates a code coverage report covering line, branch, and function metrics.*

---

## 4. End-to-End User Journey Verification Matrix

The suite `tests/e2e-user-journeys.test.ts` simulates the complete lifecycle of a CUET aspirant and exercises all system boundaries:

```text
[Step 1: Student Enrollment] 
       │
       ▼
[Step 2: Subject & Exam Year Setup]
       │
       ▼
[Step 3: Test Discovery & Instructions]
       │
       ▼
[Step 4: CBT Exam Attempt Start] 
       │
       ▼
[Step 5: Answer Selection & State Persistence]
       │
       ▼
[Step 6: Exam Submission & State Locking]
       │
       ▼
[Step 7: Automated Server-Side Evaluation (+5/-1)]
       │
       ▼
[Step 8: Mistake Bank Categorization & Review]
       │
       ▼
[Step 9: Performance Analytics Metrics Update]
       │
       ▼
[Step 10: Study Preference Configuration]
       │
       ▼
[Step 11: Dynamic Weekly Study Plan Generation]
       │
       ▼
[Step 12: Study Task Completion & Progress Tracking]
       │
       ▼
[Step 13: AI Assistant Contextual Doubt Resolution]
       │
       ▼
[Step 14: Security & Cross-Student Isolation Enforcement]
       │
       ▼
[Step 15: Monetization Tier Upgrade & Quota Expansion]
```

---

## 5. Quality Assurance Pre-Commit Checklist

Before opening a pull request or deploying a release, verify:
- [ ] `npm run typecheck` exits with code 0 (zero TypeScript errors).
- [ ] `npm run lint` exits with code 0 (zero ESLint errors).
- [ ] `npm test` passes all 153 tests with zero failures.
- [ ] `npm run build` succeeds across all 58 routes without compilation warnings.
- [ ] No hardcoded passwords, test tokens, or live API keys exist in git status.

