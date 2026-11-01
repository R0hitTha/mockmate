# MockMate — Rise Above the Competition

A focused, high-precision CUET UG online examination and preparation platform engineered for students preparing for **CUET UG 2026 and 2027**.

MockMate provides a distraction-free, server-authoritative Computer-Based Test (CBT) simulation, granular question-level solutions, and actionable performance insights across all CUET sections.

---

## 1. Project Introduction

MockMate is specifically tailored to the National Testing Agency (NTA) CUET UG format. Unlike generic multi-exam test preparation portals, MockMate focuses solely on the CUET syllabus:

- **Section IA & IB:** Languages
- **Section II:** Domain Subjects (e.g., Physics, Chemistry, Mathematics, Accountancy, Economics, etc.)
- **Section III:** General Test (General Knowledge, Numerical Ability, Reasoning)

### Core Architectural Principles

- **CUET-First Scope:** Dedicated strictly to CUET UG aspirants; no clutter or multi-exam distraction.
- **Server-Authoritative CBT Engine:** Correct answers and solutions remain strictly server-side during active tests; scoring and timing algorithms run on the server to ensure exam integrity.
- **Relational Integrity:** Data models utilize normalized PostgreSQL schemas rather than opaque JSON blobs to ensure reliable attempt tracking and analytics.
- **Calm, High-End UX:** Built with a light-first, clean visual hierarchy in Navy (`#0A192F`), Refined Blue, and Soft Neutrals with zero intrusive gamification.
- **Free-First Stack:** Core examination engine, scoring, and analytics operate without mandatory paid AI or cloud API dependencies.

---

## 2. Technology Stack

| Layer                | Technology               | Purpose                                                                           |
| :------------------- | :----------------------- | :-------------------------------------------------------------------------------- |
| **Framework**        | Next.js 16 (App Router)  | High-performance React application framework with Server Actions & Route Handlers |
| **Language**         | TypeScript (Strict Mode) | End-to-end type safety                                                            |
| **Frontend Styling** | Tailwind CSS v4          | Next-generation utility-first styling engine                                      |
| **Icons**            | Lucide React             | Clean, consistent UI iconography                                                  |
| **Database**         | PostgreSQL               | Relational transactional database (compatible with Neon Serverless)               |
| **ORM**              | Prisma ORM 7             | Type-safe database client and migration toolchain with `@prisma/adapter-pg`       |
| **Validation**       | Zod                      | Runtime schema validation for data integrity and environment variables            |
| **Testing**          | Vitest                   | Lightning-fast unit and integration test runner                                   |
| **Code Formatting**  | Prettier & ESLint 9      | Code style consistency and automated linting                                      |

---

## 3. Prerequisites

Ensure your development environment meets the following minimum requirements:

- **Node.js:** `v20.19.0` or higher (verified on `v24.14.0`)
- **npm:** `v10.0.0` or higher (verified on `v11.9.0`)
- **PostgreSQL:** Local PostgreSQL instance or a hosted Neon PostgreSQL database

---

## 4. Installation Instructions

1. Clone or open the repository:

   ```bash
   git clone https://github.com/R0hitTha/mockmate.git
   cd mockmate
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Generate Prisma client artifacts:
   ```bash
   npm run prisma:generate
   ```

---

## 5. Environment Variable Setup

MockMate uses environment variables for database connections and runtime flags.

1. Copy the example configuration template:

   ```bash
   cp .env.example .env
   ```

2. Open `.env` and configure your credentials:
   ```env
   NODE_ENV="development"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"

   # Neon PostgreSQL or local database connection string
   DATABASE_URL="postgresql://username:password@localhost:5432/mockmate_db?schema=public"
   ```

> **Security Note:** Real credentials must **never** be committed to Git. `.env` and `.env.*` are excluded by `.gitignore`.

---

## 6. Database Configuration

MockMate utilizes **Prisma ORM 7** with direct adapter support (`@prisma/adapter-pg`).

- **Configuration File:** `prisma7.config.ts` (manages datasource and migration paths).
- **Schema Location:** `prisma/schema.prisma`.
- **Generated Client:** Output to `src/generated/prisma`.
- **Database Client Singleton:** Managed in `src/lib/prisma.ts` with development re-use to prevent connection pool exhaustion.

### Database Commands

- **Generate Client:**
  ```bash
  npm run prisma:generate
  ```
- **Apply Schema Migrations:**
  ```bash
  npm run prisma:migrate
  ```
- **Open Prisma Studio:**
  ```bash
  npm run prisma:studio
  ```

---

## 7. Development Commands

Start the local development server with Turbopack:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 8. Build and Testing Commands

Run full verification suite:

```bash
# Run unit tests
npm run test

# Run TypeScript strict type-checking
npm run typecheck

# Run ESLint checks
npm run lint

# Check code formatting
npm run format:check

# Format code with Prettier
npm run format

# Compile production build
npm run build
```

---

## 9. Project Structure

```text
mockmate/
├── prisma/
│   └── schema.prisma             # Database schema definition
├── prisma7.config.ts             # Prisma 7 configuration file
├── public/                       # Static public assets
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (public)/             # Public marketing routes (Phase 3)
│   │   ├── (auth)/               # Auth routes (Phase 4)
│   │   ├── (student)/            # Student portal routes (Phase 5+)
│   │   ├── admin/                # Admin content portal (Phase 14)
│   │   ├── api/
│   │   │   └── health/           # System health check API endpoint
│   │   │       └── route.ts
│   │   ├── error.tsx             # Global application error boundary
│   │   ├── not-found.tsx         # Branded 404 page
│   │   ├── globals.css           # Global Tailwind CSS v4 styling & CSS variables
│   │   ├── layout.tsx            # Root layout with typography & metadata
│   │   └── page.tsx              # Phase 1 architectural landing placeholder
│   ├── components/               # Modular UI component library
│   │   ├── ui/                   # Reusable atomic UI elements (buttons, inputs)
│   │   ├── shared/               # Shared compound components
│   │   └── layout/               # Header, sidebar, and container components
│   ├── features/                 # Domain-driven feature modules
│   │   ├── authentication/       # User sessions, signup, signin (Phase 4)
│   │   ├── students/             # Profile & learning preferences (Phase 4-5)
│   │   ├── subjects/             # CUET syllabus and subject taxonomy (Phase 5)
│   │   ├── questions/            # Question bank & item authoring (Phase 6)
│   │   ├── tests/                # Test assembly & configuration (Phase 7-8)
│   │   ├── examination/          # Server-authoritative CBT engine (Phase 9)
│   │   ├── results/              # Scoring, ranking, and solutions (Phase 10)
│   │   └── analytics/            # Performance & weakness insights (Phase 11)
│   ├── lib/
│   │   ├── prisma.ts             # Singleton Prisma Client with PostgreSQL adapter
│   │   └── utils.ts              # CSS class merging (clsx + tailwind-merge)
│   ├── hooks/                    # Reusable React hooks
│   ├── types/                    # Shared TypeScript interfaces & types
│   └── config/
│       └── site.ts               # Centralized application settings & metadata
├── tests/
│   └── foundation.test.ts        # Phase 1 unit tests
├── .env.example                  # Safe template for environment variables
├── .gitignore                    # Git exclusion rules
├── .prettierrc                   # Prettier formatting configuration
├── .prettierignore               # Files excluded from formatting
├── eslint.config.mjs             # ESLint configuration
├── vitest.config.mts             # Vitest test runner configuration
├── tsconfig.json                 # TypeScript compiler configuration
├── package.json                  # Dependencies and execution scripts
└── README.md                     # Project documentation
```

---

## 10. Current Development Phase

- **Active Milestone:** **Phase 3: Public Website Development** (Completed).
- **Status:** Verified and stable.
  - Complete public website built using Phase 2 design system tokens and components.
  - Homepage (`/`) with all 12 structured sections: Hero, The Preparation Problem, MockMate Solution, Core Features, How It Works (6-step sequence), CUET Sections, CBT Exam Preview, Performance Insights, FAQ Accordion, Final CTA, and Footer.
  - Features Deep-Dive (`/features`): 6 comprehensive feature modules with NTA alignment details.
  - CUET Subjects & Syllabus (`/cuet-subjects`): Full breakdown of Section IA/IB Languages, Section II Domains, and Section III General Test with +5 / -1 marking scheme.
  - Transparent Pricing (`/pricing`): Freemium model (Free Diagnostic, Pro Aspirant Pass, Subject Test Packs).
  - About MockMate (`/about`): Academic mission, CUET-only focus, and examination integrity principles.
  - Support & Contact (`/contact`): Inquiry form with client-side validation and demonstration status banner.
  - Legal & Auth Placeholders: `/privacy`, `/terms`, `/login`, `/register`.
  - SEO Foundations: Dynamic `sitemap.xml` and `robots.txt`.
  - 10/10 Vitest tests passing; ESLint, TypeScript strict checking, and Turbopack production builds passing with 0 errors.
- **Next Milestone:** **Phase 4: Authentication & Onboarding** (Awaiting approval).
