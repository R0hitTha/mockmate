# MockMate — Operational Runbook & Maintenance Guide

This operations guide defines the day-to-day monitoring procedures, database backup strategies, error incident handling, and third-party service lifecycle workflows for the MockMate platform.

---

## 1. System Health Monitoring

MockMate exposes an operational health endpoint at `GET /api/health`.

### Health Check Endpoint Contract
```http
GET /api/health
```

#### Successful Response (`HTTP 200 OK`)
```json
{
  "status": "healthy",
  "version": "Phase 15: Testing, Security & Production Deployment",
  "timestamp": "2026-11-06T08:45:00.000Z",
  "database": {
    "status": "connected",
    "latencyMs": 14
  },
  "stores": {
    "questions": "ready",
    "mockTests": "ready",
    "attempts": "ready"
  }
}
```

#### Degraded Response (`HTTP 503 Service Unavailable`)
```json
{
  "status": "degraded",
  "timestamp": "2026-11-06T08:45:00.000Z",
  "database": {
    "status": "disconnected",
    "error": "Connection timed out"
  },
  "stores": {
    "status": "in_memory_fallback_active"
  }
}
```

### Automated Uptime Monitoring Setup
Configure an external ping service (e.g., Better Uptime, UptimeRobot, or Pingdom):
- **Target URL:** `https://your-domain.com/api/health`
- **Interval:** Every 60 seconds
- **Alert Condition:** HTTP status $\ne 200$ or response time $> 3000\text{ ms}$
- **Notification Channels:** Slack `#ops-alerts`, PagerDuty, or email

---

## 2. Database Backup & Disaster Recovery

### Backup Policy
| Type | Frequency | Retention Window | Storage Target |
| :--- | :--- | :--- | :--- |
| **Point-in-Time Recovery (PITR)** | Continuous (WAL logs) | 7 to 30 days | Neon / AWS S3 Cloud Storage |
| **Daily Full Snapshot** | Every 24 hours (02:00 UTC) | 90 days | Encrypted Off-Site Cold Storage |
| **Pre-Migration Snapshot** | Immediately prior to running `prisma migrate deploy` | 14 days | Automated Tagged Snapshot |

### Recovery Objectives
- **Recovery Point Objective (RPO):** $< 5\text{ minutes}$ (maximum allowable data loss).
- **Recovery Time Objective (RTO):** $< 15\text{ minutes}$ (maximum downtime to restore service).

### Disaster Recovery Restoration Steps
1. In the Neon or PostgreSQL provider console, initiate point-in-time recovery to the desired timestamp.
2. Update the application's `DATABASE_URL` and `DIRECT_URL` environment variables if a new branch or host is provisioned.
3. Redeploy the application or restart running containers to re-establish pooled connection connections.
4. Execute `GET /api/health` to confirm database connectivity and latency.

---

## 3. AI Service Operations & Cost Control

The AI Study Assistant utilizes the Google Gemini API (with optional OpenAI fallback):

### Quota & Rate Limiting Controls
- Students on the **Free Diagnostic Plan** are limited to 3 AI queries per day.
- Students on **Pro** and **Ultimate** tiers receive expanded daily limits (e.g., 50 queries/day).
- System-level rate limiting prevents burst abuse ($> 10\text{ queries/minute}$ per IP/student).

### Graceful Fallback Mode
If the Gemini API key expires, encounters quota exhaustion (`HTTP 429`), or experiences an outage:
- The service gracefully intercepts the error without crashing the UI.
- It returns structured, curriculum-grounded guidance from the local CUET syllabus knowledge base.
- An alert is logged in `/admin/ai-usage` for administrative review.

---

## 4. Monetization Transition: Preparation Mode to Live Gateway

MockMate is designed to run safely in **Preparation / Mock Mode** during development and staging. To activate live transactions:

### Step 1: Obtain Production Gateway Credentials
1. Log in to your approved [Razorpay Dashboard](https://dashboard.razorpay.com).
2. Generate live API Keys under **Settings $\to$ API Keys**.
3. Generate a Webhook Secret under **Settings $\to$ Webhooks**.

### Step 2: Configure Production Environment Variables
Update your production environment settings (e.g., in Vercel or your secrets manager):
```env
RAZORPAY_KEY_ID="rzp_live_xxxxxxxxxxxxxxxx"
RAZORPAY_KEY_SECRET="your_actual_live_secret_key"
RAZORPAY_WEBHOOK_SECRET="your_webhook_signature_secret"
```

### Step 3: Register Webhook URL
In the payment gateway dashboard, configure the webhook endpoint:
- **Webhook URL:** `https://your-domain.com/api/webhooks/razorpay`
- **Active Events:**
  - `payment.captured`
  - `subscription.charged`
  - `subscription.cancelled`

### Step 4: Verification Run
1. Create a ₹1 test subscription order on the live website.
2. Complete the payment using a live UPI or test credit card.
3. Confirm that:
   - Webhook signature verifies successfully.
   - The student's subscription record updates to `ACTIVE`.
   - Feature entitlements (unlimited mock tests, advanced analytics) unlock immediately.
   - The transaction appears in `/admin/students` and audit logs.

---

## 5. Common Operational Runbooks

### Runbook 1: High Database Latency / Pooler Exhaustion
**Symptoms:** `/api/health` reports `database.latencyMs > 500ms`, or Prisma throws `P1001: Can't reach database server`.
1. Inspect active connection count in the PostgreSQL provider dashboard.
2. Check for connection pooler limits. Ensure the pooler URL (`?pgbouncer=true`) is configured in `DATABASE_URL`.
3. If necessary, increase the maximum pool connections in your provider console.
4. Scale up computing compute units (CU) or restart the connection pooler.

### Runbook 2: Student Stuck in CBT Exam Session
**Symptoms:** A student experiences local browser crash or power failure and cannot submit their attempt.
1. Navigate to `/admin/students/[studentId]`.
2. Locate the active test attempt with status `IN_PROGRESS`.
3. Click **Force Auto-Submit**.
4. The system validates answers saved up to the moment of failure, calculates the final score, transitions the attempt to `COMPLETED`, and generates the student's result scorecard.

### Runbook 3: Schema Migration Rollback
**Symptoms:** A newly deployed migration fails during `prisma migrate deploy` or introduces unexpected schema constraints.
1. Prevent new traffic by setting maintenance mode or routing traffic to the previous deployment.
2. Inspect migration error logs.
3. If necessary, mark the migration as rolled back:
```bash
npx prisma migrate resolve --rolled-back "<migration_name>"
```
4. Deploy the fix via a forward corrective migration.
