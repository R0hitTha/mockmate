# MockMate — Production Deployment Guide

This guide details the prerequisites, architecture, environment configuration, migration workflows, and smoke-testing protocols required to deploy **MockMate** to production.

---

## 1. Architecture Overview

```text
[ Client Browser ]
        │
        ▼ HTTPS
[ CDN / Edge Network (Cloudflare / Vercel Edge) ]
        │
        ▼
[ Next.js 16 Application Server (Vercel Serverless / Node.js Standalone) ]
   ├── Edge Proxy / Middleware (Route Protection & RBAC)
   ├── Server Components & Server Actions (Authoritative Business Logic)
   └── Route Handlers (/api/health, /api/auth)
        │
        ├────────────────────────┬────────────────────────┐
        ▼                        ▼                        ▼
[ Neon / Supabase ]      [ Google Gemini API ]    [ Razorpay Gateway ]
 (PostgreSQL Pooler)      (AI Study Assistant)     (Subscription Portal)
```

---

## 2. Recommended Hosting Targets

### Option A: Vercel (Recommended)
Vercel is the native platform for Next.js 16 App Router applications with Partial Prerendering and Turbopack optimizations:
- Automatic edge caching and global asset distribution.
- Zero-configuration Server Actions and Route Handlers.
- Seamless environment variable management per branch.

### Option B: Self-Hosted Docker Container / PM2
For organizations hosting on AWS ECS, DigitalOcean, or private VPS infrastructure:
- Build standalone Next.js output (`output: 'standalone'` in `next.config.ts`).
- Execute via Node.js runtime (`node server.js`).
- Manage process lifecycle via PM2 (`pm2 start server.js -i max --name mockmate`).

---

## 3. Database Architecture & Connection Pooling

MockMate uses **Prisma ORM 7** with the `@prisma/adapter-pg` driver adapter. For production serverless deployments (such as Vercel or AWS Lambda), connection pooling is essential to prevent PostgreSQL connection exhaustion.

### Connection Strings
Provide two distinct database URLs in production:

1. **`DATABASE_URL` (Pooled Connection):**
   - Connects through a connection pooler (e.g., PgBouncer or Neon connection pooler).
   - Used by the running application for concurrent queries.
   - Example: `postgres://user:password@ep-sample-pooler.us-east-2.aws.neon.tech/mockmate?sslmode=require&pgbouncer=true`

2. **`DIRECT_URL` (Direct Connection):**
   - Connects directly to the PostgreSQL instance without pooling.
   - Required by Prisma for running schema migrations (`prisma migrate deploy`).
   - Example: `postgres://user:password@ep-sample.us-east-2.aws.neon.tech/mockmate?sslmode=require`

---

## 4. Required Production Environment Variables

| Variable | Required? | Example Value | Description |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | **Yes** | `production` | Enables production optimizations and disables debug traces. |
| `DATABASE_URL` | **Yes** | `postgresql://user:pass@pooler.neon.tech/db?sslmode=require` | Pooled connection string for transactional application queries. |
| `DIRECT_URL` | **Yes** | `postgresql://user:pass@ep-host.neon.tech/db?sslmode=require` | Direct connection string for executing migrations. |
| `BETTER_AUTH_SECRET` | **Yes** | `64_char_cryptographically_secure_hex` | Cryptographic secret used for signing session tokens and cookies. |
| `BETTER_AUTH_URL` | **Yes** | `https://mockmate.in` | Canonical public URL of the application. |
| `NEXT_PUBLIC_APP_URL` | **Yes** | `https://mockmate.in` | Client-accessible canonical URL. |
| `GOOGLE_CLIENT_ID` | Optional | `your-id.apps.googleusercontent.com` | Google OAuth client ID for student single sign-on. |
| `GOOGLE_CLIENT_SECRET`| Optional | `your-google-oauth-secret` | Google OAuth client secret. |
| `GEMINI_API_KEY` | Optional | `AIzaSy...` | API key for Gemini Flash-powered CUET AI study assistant. |
| `OPENAI_API_KEY` | Optional | `sk-...` | Optional fallback provider for AI study assistant. |
| `RAZORPAY_KEY_ID` | Optional | `rzp_live_...` | Razorpay live API key ID for subscription monetization. |
| `RAZORPAY_KEY_SECRET`| Optional| `rzp_secret_...` | Razorpay live API secret key. |
| `RAZORPAY_WEBHOOK_SECRET`| Optional | `whsec_...` | Cryptographic signature secret for incoming payment webhooks. |

> [!CAUTION]
> Never commit actual credentials, secret tokens, or production API keys into Git. Always configure these via your hosting platform's secure environment variable dashboard.

---

## 5. Deployment Step-by-Step

### Step 1: Pre-Deployment Build Verification (Local or CI)
Before initiating deployment, verify that all validation steps pass cleanly:
```bash
# 1. Type check
npm run typecheck

# 2. Linting
npm run lint

# 3. Automated tests
npm test

# 4. Production build test
npm run build
```

### Step 2: Database Migration
In your deployment pipeline (e.g., GitHub Actions, Vercel Build Step, or Docker entrypoint), execute:
```bash
npx prisma migrate deploy
```
*Note: This command applies all pending migrations using `DIRECT_URL` without resetting database state.*

### Step 3: Seed Reference Data (First-Time Only)
For new production environments, initialize standard CUET exam years, subjects, units, and initial question banks:
```bash
npx tsx src/lib/seed.ts
```

### Step 4: Deploy Next.js Artifact
- **On Vercel:** Connect your Git repository to Vercel. Each push to `main` triggers automated builds, previews, and production releases.
- **On Docker/Node:** Build the container and start the process:
```bash
docker build -t mockmate:production .
docker run -p 3000:3000 --env-file .env.production mockmate:production
```

---

## 6. Post-Deployment Smoke Testing Checklist

Once deployed, execute the following verification steps on the live production URL:

| # | Inspection Item | Verification Action | Expected Outcome |
| :- | :--- | :--- | :--- |
| 1 | **System Health** | Query `GET /api/health` | HTTP 200 with `status: "healthy"` and latency metrics. |
| 2 | **Public Pages** | Visit `/`, `/about`, `/features`, `/cuet-subjects`, `/pricing` | Clean visual rendering, no console errors, fast LCP. |
| 3 | **Authentication** | Register a new test account at `/register` and login at `/login` | Successful session creation and redirect to `/dashboard`. |
| 4 | **Onboarding** | Complete onboarding at `/onboarding` | Selected subjects and target exam year saved correctly. |
| 5 | **Test Library** | Navigate to `/mock-tests` | Published CUET mock tests display with question counts and time limits. |
| 6 | **CBT Engine** | Start a mock test at `/mock-tests/[testId]` | Distraction-free exam UI renders, timer starts, options selectable. |
| 7 | **Answer Persistence**| Select options, flag questions, refresh the browser | Previously selected answers and review states persist accurately. |
| 8 | **Submission & Scoring**| Click "Submit Test" and confirm submission | Immediate redirection to `/results/[resultId]` with +5/-1 scoring. |
| 9 | **Mistake Intelligence**| Navigate to `/mistakes` | Missed questions are categorized with evidence-based diagnostics. |
| 10 | **Study Planner** | Navigate to `/study-planner` | Weekly schedule generates with prioritized weak topics. |
| 11 | **Admin Security** | Attempt accessing `/admin` as a standard student | Immediate redirect to `/dashboard` with 403 authorization guard. |
| 12 | **SEO & Crawlers** | Inspect `/robots.txt` | Disallow rules active for `/admin/`, `/exam/`, `/results/`, `/api/`. |

---

## 7. Rollback & Incident Recovery

### Instant Rollback (Vercel)
1. Open the **Deployments** tab in the Vercel Dashboard.
2. Locate the previous healthy deployment.
3. Click the **...** menu and select **Promote to Production**.
4. The DNS routing flips instantaneously to the previous deployment build.

### Database Rollback Strategy
If a database migration fails or causes data incompatibility:
1. Revert to the point-in-time recovery snapshot (Neon supports instantaneous branching and PITR to any second within the retention window).
2. For programmatic rollback:
```bash
# Mark failed migration as rolled back
npx prisma migrate resolve --rolled-back "<migration_name>"
```
3. Deploy a compensatory migration rather than altering applied migration files in production.
