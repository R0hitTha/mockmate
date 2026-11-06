# MockMate — Rise Above the Competition

A high-precision, server-authoritative CUET UG online examination and preparation platform engineered specifically for students preparing for **CUET UG 2026 and 2027**.

MockMate delivers an exact National Testing Agency (NTA) Computer-Based Test (CBT) simulation, granular question-level solutions, mistake intelligence diagnostics, rule-based personalized study planning, and actionable performance analytics across all CUET sections.

---

## 1. Project Introduction

MockMate is tailor-made for the National Testing Agency (NTA) CUET UG format. Unlike generic multi-exam test preparation portals, MockMate focuses solely on the CUET syllabus:

- **Section IA & IB:** Languages (Reading Comprehension, Vocabulary, Literary Aptitude)
- **Section II:** Domain Subjects (Physics, Chemistry, Mathematics, Biology, Economics, Accountancy, Business Studies, History, Political Science, Geography, Computer Science, etc.)
- **Section III:** General Test (General Knowledge, Current Affairs, General Mental Ability, Numerical Ability, Logical & Analytical Reasoning)

### Core Architectural Principles

- **CUET-First Scope:** Dedicated strictly to CUET UG aspirants; no clutter or cross-exam distraction.
- **Server-Authoritative CBT Engine:** Correct answers and explanations remain strictly server-side during active tests; scoring (+5 correct, -1 incorrect, 0 unattempted) and timer validation execute server-side to guarantee examination integrity.
- **Relational Integrity & Hybrid Persistence:** Standardized PostgreSQL models via Prisma ORM 7 with integrated in-memory fallback stores ensuring 100% offline resilience and zero test failure during network interruptions.
- **Calm, Distraction-Free UX:** Built with a light-first, clean visual hierarchy in Navy (`#0A192F`), Refined Blue, and Soft Neutrals with zero intrusive gamification.
- **Multi-Tenant Data Isolation:** Strict authorization boundaries ensure students can only view and modify their own test attempts, results, mistake banks, and study plans.
- **Monetization & Entitlement Layer:** Configurable subscription tiers (Free Diagnostic, Pro Aspirant, Ultimate Pass) with feature gating and safe mock payment simulation.

---

## 2. Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 (App Router with Partial Prerendering) | High-performance React application framework with Server Components & Actions |
| **UI Library** | React 19 | Modern React component architecture |
| **Styling** | Tailwind CSS v4 | Next-generation utility-first styling engine with CSS variables |
| **Icons** | Lucide React | Clean, consistent UI iconography |
| **Database** | PostgreSQL | Relational transactional database (compatible with Neon Serverless) |
| **ORM** | Prisma ORM 7 | Type-safe database client and migration toolchain with `@prisma/adapter-pg` |
| **Auth** | Better Auth / Custom Session | Secure session management with role-based access control (RBAC) |
| **Validation** | Zod | Runtime schema validation for forms, APIs, and environment variables |
| **Testing** | Vitest | Lightning-fast test runner with 15 test suites and 153 passing automated tests |
| **Linting & Types**| ESLint 9 & TypeScript 5 (Strict Mode) | Code quality, zero compilation errors, and robust typing |

---

## 3. Project Structure

```text
├── prisma/
│   └── schema.prisma             # Complete Prisma schema with 18+ normalized models
├── public/                       # Static public assets, logos, and favicons
├── src/
│   ├── app/                      # Next.js App Router (58 production routes)
│   │   ├── (public)/             # Marketing routes (/, /about, /features, /cuet-subjects, /pricing, /contact)
│   │   ├── (auth)/               # Auth routes (/login, /register, /forgot-password, /reset-password)
│   │   ├── (student)/            # Student portal routes:
│   │   │   ├── /dashboard        # Student cockpit & quick test launcher
│   │   │   ├── /onboarding       # Subject selection & target exam year configuration
│   │   │   ├── /mock-tests       # Test library, filtering, and instruction briefings
│   │   │   ├── /exam             # Distraction-free CBT exam simulator
│   │   │   ├── /results          # Detailed scorecards, sectional breakdowns, and solutions
│   │   │   ├── /analytics        # Subject mastery, time-per-question, and percentile trends
│   │   │   ├── /mistakes         # Evidence-based mistake bank & review workflows
│   │   │   ├── /study-planner    # Rule-based study planner & task tracking
│   │   │   ├── /ai-assistant     # Contextual CUET doubt solver
│   │   │   └── /subscription     # Tier selection, billing portal, and upgrade flows
│   │   ├── admin/                # Role-gated administrative suite:
│   │   │   ├── /admin/question-bank # Question authoring, LaTeX preview, and bulk CSV import
│   │   │   ├── /admin/mock-tests    # Test builder, section configuration, and publishing
│   │   │   ├── /admin/students      # Student directory and attempt management
│   │   │   ├── /admin/plans         # Monetization tier management
│   │   │   ├── /admin/audit-logs    # Immutable administrative audit logging
│   │   │   └── /admin/ai-usage      # Token consumption & cost tracking
│   │   ├── api/
│   │   │   ├── auth/             # Better Auth route handlers
│   │   │   └── health/           # System health check monitoring endpoint
│   │   ├── error.tsx             # Global application error boundary
│   │   ├── not-found.tsx         # Branded 404 page
│   │   ├── robots.ts             # SEO crawler instructions (strict disallows for private routes)
│   │   ├── sitemap.ts            # Dynamic sitemap generator
│   │   └── globals.css           # Global Tailwind CSS v4 styling & design system tokens
│   ├── components/               # Modular UI component library
│   │   ├── ui/                   # Reusable atomic UI elements (buttons, inputs, dialogs, badges)
│   │   ├── shared/               # Shared compound components (navbar, footer, stat cards)
│   │   └── layout/               # Header, sidebar, and container components
│   ├── lib/                      # Core business logic services & data layers:
│   │   ├── admin-service.ts      # Administrative controls and audit logging
│   │   ├── ai-service.ts         # AI doubt resolution & syllabus-grounded assistance
│   │   ├── analytics-service.ts  # Performance aggregation and mastery scoring
│   │   ├── cbt-service.ts        # Attempt lifecycle and server-authoritative timer
│   │   ├── entitlement-service.ts# Subscription limits and feature gating
│   │   ├── evaluation-service.ts # NTA scoring (+5/-1) and solution generator
│   │   ├── mistake-service.ts    # Mistake classification (CONCEPT_GAP, TIME_PRESSURE, etc.)
│   │   ├── mock-test-service.ts  # Test library and test builder operations
│   │   ├── question-service.ts   # Question bank CRUD, filtering, and bulk import
│   │   ├── study-planner-service.ts # Weekly study plan generation & task tracking
│   │   ├── syllabus-service.ts   # CUET subjects, units, and chapters hierarchy
│   │   ├── prisma.ts             # Singleton Prisma Client with PostgreSQL adapter
│   │   └── utils.ts              # CSS class merging (clsx + tailwind-merge)
│   ├── config/
│   │   └── site.ts               # Centralized application settings & metadata
│   └── middleware.ts             # Route protection & role-based redirection
├── tests/                        # 15 Vitest test suites (153 automated tests)
│   ├── foundation.test.ts        # Phase 1: Foundation & configuration
│   ├── design-system.test.ts     # Phase 2: Design system tokens
│   ├── public-website.test.ts    # Phase 3: Marketing pages & SEO
│   ├── auth-onboarding.test.ts   # Phase 4: Authentication & onboarding
│   ├── student-dashboard.test.ts # Phase 5: Student dashboard
│   ├── subject-syllabus.test.ts  # Phase 6: Syllabus hierarchy
│   ├── question-bank.test.ts     # Phase 7: Question bank management
│   ├── mock-test-library.test.ts # Phase 8: Mock test library & builder
│   ├── cbt-engine.test.ts        # Phase 9: CBT exam engine
│   ├── evaluation-engine.test.ts # Phase 10: Evaluation & result system
│   ├── performance-analytics.test.ts # Phase 11: Analytics & metrics
│   ├── mistake-intelligence.test.ts  # Phase 12: Mistake intelligence
│   ├── study-planner.test.ts     # Phase 13: Study planner & AI assistant
│   ├── admin-monetization.test.ts# Phase 14: Admin panel & monetization
│   └── e2e-user-journeys.test.ts # Phase 15: End-to-end critical user journeys
├── DEPLOYMENT.md                 # Production deployment & infrastructure guide
├── SECURITY.md                   # Security architecture, anti-tampering & RBAC
├── TESTING.md                    # Automated testing guide & test matrix
├── OPERATIONS.md                 # Runbooks, monitoring, and backup protocols
└── package.json                  # Dependencies and scripts
```

---

## 4. Quick Start & Local Setup

### Prerequisites
- **Node.js:** `v20.19.0` or higher
- **npm:** `v10.0.0` or higher
- **PostgreSQL:** Local PostgreSQL database or Neon cloud instance

### 1. Clone the repository & install dependencies
```bash
git clone https://github.com/your-org/mockmate.git
cd mockmate
npm install
```

### 2. Configure environment variables
Copy the sample environment configuration file:
```bash
cp .env.example .env
```
Fill in the necessary values in `.env` (refer to `.env.example` for comprehensive parameter documentation).

### 3. Generate Prisma client & initialize database
```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 4. Seed database (optional)
To populate the database with standard CUET subjects, units, question banks, and sample mock tests:
```bash
npx tsx src/lib/seed.ts
```

### 5. Launch the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 5. Available Scripts

| Script | Command | Description |
| :--- | :--- | :--- |
| **Development** | `npm run dev` | Starts Next.js development server with Turbopack on port 3000 |
| **Typecheck** | `npm run typecheck` | Executes strict TypeScript static analysis (`tsc --noEmit`) |
| **Lint** | `npm run lint` | Runs ESLint 9 checks across the codebase |
| **Unit & E2E Tests** | `npm test` | Runs all 15 Vitest test suites (153 automated tests) |
| **Production Build** | `npm run build` | Compiles an optimized production build of all 58 routes |
| **Production Server**| `npm run start` | Starts the production server |

---

## 6. Project Architecture Highlights

### Examination Security & Anti-Tampering
- Active exam sessions operate under strict server-side authority:
  - Correct options, explanations, and scoring weights are stripped from the test payload delivered to the client during active examinations.
  - The exam countdown timer is validated against server-persisted timestamps (`startedAt` + `durationMinutes`), neutralizing client clock manipulation.
  - Test attempts are locked upon submission; subsequent attempts to mutate answers are rejected with `403 Forbidden`.

### Evidence-Based Mistake Intelligence
- The platform identifies learning gaps without superficial categorization:
  - `CONCEPT_GAP` is triggered only when $\ge 3$ questions are missed within the same syllabus topic.
  - `TIME_PRESSURE` is tagged when questions are answered during the final 5% of exam duration.
  - `CARELESS_ERROR` is reserved exclusively for explicit student self-attributions.

### Rule-Based Study Planning
- Automated weekly study schedules dynamically distribute preparation hours:
  - Priority weightings automatically elevate topics diagnosed as `CONCEPT_GAP` in recent mock tests.
  - Full-length mock test drills are scheduled for weekends (Fridays and Saturdays).
  - Daily workloads automatically respect configured student rest days.

---

## 7. Documentation Index

- [**Deployment Guide**](file:///DEPLOYMENT.md): Infrastructure architecture, hosting options, environment configuration, database pooling, and smoke testing.
- [**Security Policy**](file:///SECURITY.md): RBAC model, student isolation, exam anti-tampering, secret handling, and vulnerability reporting.
- [**Testing Guide**](file:///TESTING.md): Vitest test suite breakdown, mock store mechanics, and E2E verification matrix.
- [**Operations Runbook**](file:///OPERATIONS.md): Operational monitoring (`/api/health`), database backups, incident response, and payment gateway transition.

---

## 8. License & Acknowledgements

- **License:** Proprietary. All rights reserved.
- **Target Exam:** Central Universities Entrance Test (CUET UG) conducted by the National Testing Agency (NTA), India.
