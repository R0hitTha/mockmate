# MockMate — Security Policy & Technical Safeguards

Security, examination integrity, and student data privacy are foundational to MockMate. This document details the security architecture, authorization controls, anti-tampering mechanisms, and vulnerability reporting procedures implemented across the application.

---

## 1. Authentication & Session Architecture

### Session Management
- **Provider:** Better Auth session management backed by PostgreSQL storage and secure session cookies.
- **Cookie Security Flags:**
  - `HttpOnly`: Session tokens cannot be accessed or manipulated via client-side JavaScript (`document.cookie`), mitigating Cross-Site Scripting (XSS) session hijacking.
  - `Secure`: Transmitted strictly over encrypted HTTPS connections in production.
  - `SameSite=Lax`: Prevents Cross-Site Request Forgery (CSRF) on ambient requests while preserving smooth redirection after authentication.
- **Password Security:**
  - Passwords are never stored in plaintext. Passwords undergo irreversible cryptographic hashing via Argon2id / bcrypt with salted parameters before persisting.
  - Password policies enforce minimum 8 characters with required uppercase, lowercase, and numeric characters.

---

## 2. Role-Based Access Control (RBAC)

MockMate defines three explicit user roles:
1. **`STUDENT`:** Standard candidate preparing for CUET UG. Can take exams, view personal results, manage personal mistake banks, and generate personal study plans.
2. **`ADMIN`:** Faculty or content manager. Can author questions, build and publish mock tests, manage student subscriptions, and inspect aggregate analytics.
3. **`SUPER_ADMIN`:** Platform owner. Has complete access to administrative panels, system configurations, audit logs, and monetization parameters.

### RBAC Permission Matrix

| Capability / Route | Student | Admin | Super Admin |
| :--- | :---: | :---: | :---: |
| Public Website & Pricing (`/`, `/about`, `/pricing`) | ✅ | ✅ | ✅ |
| Student Cockpit (`/dashboard`) | ✅ | ✅ | ✅ |
| CBT Exam Simulation (`/exam/[attemptId]`) | ✅ (Own Attempt) | ❌ | ❌ |
| Personal Results & Solutions (`/results/[id]`) | ✅ (Own Results) | ❌ | ❌ |
| Personal Mistake Intelligence (`/mistakes`) | ✅ (Own Mistakes)| ❌ | ❌ |
| Personal Study Planner (`/study-planner`) | ✅ (Own Schedule)| ❌ | ❌ |
| Question Authoring (`/admin/question-bank`) | ❌ | ✅ | ✅ |
| Test Builder & Publishing (`/admin/mock-tests`) | ❌ | ✅ | ✅ |
| Student Directory & Subscription Management | ❌ | ✅ | ✅ |
| Immutable Audit Logs (`/admin/audit-logs`) | ❌ | ❌ | ✅ |
| Monetization & Tier Plans (`/admin/plans`) | ❌ | ❌ | ✅ |

### Multi-Layer Enforcement Mechanism
Authorization is enforced through defense-in-depth:
1. **Edge Proxy / Middleware Guard (`src/middleware.ts`):** Evaluates incoming route requests before execution. Unauthenticated users are redirected to `/login`, and non-admin users attempting to access `/admin/*` are immediately redirected to `/dashboard`.
2. **Server-Side Session Verification:** Server Actions and Route Handlers independently verify the authenticated user's session and role using `auth.api.getSession` or session token lookup.
3. **Audit Logging:** Critical administrative actions (question edits, test publishing, student subscription overrides) are logged in the immutable `AdminAuditLog` table with IP, timestamp, and actor details.

---

## 3. Multi-Tenant Student Data Isolation

Student data is strictly isolated at the database query layer:
- **Test Attempts:** Every database query for `TestAttempt` or `AttemptAnswer` requires `where: { id: attemptId, studentId: currentUser.id }`.
- **Cross-Account Prevention:** If Student Bob attempts to query or save an answer to Student Alice's `attemptId`, the service throws an explicit `403 Forbidden` error.
- **Mistake Bank Isolation:** The mistake analysis engine (`getStudentMistakesPayload`) queries results filtered exclusively by the session's authenticated student ID.
- **Study Planner Tasks:** Status updates and task rescheduling check plan ownership before applying mutations.

---

## 4. CBT Examination Anti-Tampering Engine

MockMate implements an exam simulation engine with strict server-authoritative enforcement:

### 1. No Client-Side Answer Leakage
During an active examination (`IN_PROGRESS`), the API payload delivered to the client contains:
- Question texts, passages, and equations.
- Option IDs and option text/labels.
- Section constraints and time limits.
**Exempted from client payload:** Correct option IDs, scoring weights, solution steps, and subject explanations are stripped server-side. Inspecting network payloads or browser dev tools yields zero examination answers.

### 2. Server-Authoritative Timer & Drift Resilience
- When an attempt begins, the server records the exact ISO timestamp (`startedAt`) and total allowed duration (`durationMinutes`).
- The remaining time is calculated server-side: $\text{Remaining} = \text{Duration} - (\text{Current Server Time} - \text{Started At})$.
- Tampering with the client device's clock or freezing JavaScript execution has zero effect on the true exam expiration time.
- If an answer submission arrives after the server window has expired, the submission is automatically marked as `TIMED_OUT` and evaluated as of the cutoff time.

### 3. Submission Finality & State Locking
- Once a test attempt is submitted (`SUBMITTED`), its state is atomically transitioned in the database.
- Any subsequent attempt to invoke `saveAttemptAnswer` on that attempt ID is rejected immediately.
- Evaluation runs as a deterministic server-side transaction applying the exact NTA marking scheme (+5 for correct, -1 for incorrect, 0 for unattempted).

---

## 5. AI Assistant & Monetization Guards

### Prompt Injection & Syllabus Grounding
- The AI Study Assistant is instructed via system prompt to act strictly as a CUET UG academic tutor.
- Context injection restricts queries to standard CUET subjects, concepts, and NCERT-aligned solutions.
- Student prompts containing instruction overrides (e.g., "ignore previous instructions") are neutralized by strict boundary delimiters and defensive validation.

### Payment Safety (Mock / Preparation Mode)
- During development and staging, MockMate runs in **Preparation Mode**.
- Payment verification simulates successful order creation and activation without communicating with live card networks or processing real currency.
- Transition to live mode requires valid `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` variables and cryptographically validates incoming webhook signatures (`X-Razorpay-Signature`).

---

## 6. HTTP Security Headers

MockMate configures enterprise HTTP security headers in `next.config.ts`:

```typescript
{
  key: "X-Content-Type-Options",
  value: "nosniff",
},
{
  key: "X-Frame-Options",
  value: "SAMEORIGIN",
},
{
  key: "X-XSS-Protection",
  value: "1; mode=block",
},
{
  key: "Referrer-Policy",
  value: "strict-origin-when-cross-origin",
},
{
  key: "Permissions-Policy",
  value: "camera=(), microphone=(), geolocation=()",
}
```

---

## 7. Vulnerability Reporting & Disclosure

If you discover a security vulnerability within MockMate, we encourage responsible disclosure:
1. **Email:** Report findings directly to `security@mockmate.in` (or the repository administrator).
2. **Information to Include:**
   - Detailed description of the vulnerability.
   - Exact steps or proof-of-concept script to reproduce the issue.
   - Affected routes, parameters, or models.
3. **Commitment:** We commit to acknowledging receipt within 24 hours, evaluating the severity, and deploying a remediation patch within 72 hours for critical issues.
4. **Public Disclosure:** Please refrain from publicly disclosing the issue until a patch has been deployed to production.

