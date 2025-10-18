# Multi-Tenant Todo SaaS - Sprint Plan for Mini AI Agent

You are a build bot. Follow these steps exactly, in order.  
Do not add features not listed. Do not skip tests.  
Stack: **Next.js 15 (App Router) + TypeScript + Prisma + Postgres (Neon) + Auth.js + Stripe + Tailwind + shadcn/ui**.  
Deploy target: **Vercel (Free Tier)**.

---

## 0. Project Setup
**Vars**
- APP_NAME=todo-saas  
- PRIMARY_DOMAIN=myapp.com  
- DATABASE_PROVIDER=postgres  
- Plans: `free`, `premium`, `premium_plus`  
- Yearly discount: 20%

---

## 1. Repo & Tooling Bootstrap
**Goal:** Create a clean Next.js + TS project.

**Steps:**
1. Init Next.js 15 (App Router + TS).
2. Add Tailwind + shadcn/ui.
3. Install deps: Prisma, Zod, React Hook Form, React Query, NextAuth, Stripe, Pino, Dotenv, Date-fns.
4. Add Vitest, Testing Library, Playwright.
5. Add scripts: dev, build, start, db:push, db:migrate, lint, test, test:e2e.

**Deliverables:**
- Working Next.js app
- README + .env.example

**Test:** `npm run dev` works.

---

## 2. Database & Prisma Schema
**Goal:** Define data structure for tenants, users, teams, tasks.

**Steps:**
1. Create models: Tenant, User, Membership, Team, TeamMembership, Task, Billing, UsageCounter, Invite.
2. Add tenantId to all multi-tenant models.
3. Create Prisma middleware to inject tenant filter.
4. Push schema and create seed data.

**Test:** Database seeds successfully.

---

## 3. Auth (NextAuth)
**Goal:** Add user sign-in with credentials + Google/GitHub.

**Steps:**
1. Setup Auth.js route `/api/auth/[...nextauth]`.
2. Add signin page `/auth/signin`.
3. Store users, redirect to onboarding.

**Test:** Can sign up/sign in locally.

---

## 4. Subdomain Routing
**Goal:** Enable `{tenant}.myapp.com`.

**Steps:**
1. Add middleware to read subdomain.
2. Load tenant via DB.
3. Store context in request header.

**Test:** Subdomain maps to correct tenant.

---

## 5. Onboarding Flow
**Goal:** First user creates tenant.

**Steps:**
1. After login, redirect to `/onboarding`.
2. Form fields: org name + subdomain.
3. Create tenant, membership (owner).
4. Redirect to subdomain.

**Test:** Creates tenant + redirects.

---

## 6. Todo CRUD (Tenant Scoped)
**Goal:** Basic todo functions.

**Steps:**
1. Add layout + nav.
2. Create `/` and `/tasks` pages.
3. Add actions: create, update, complete, delete.
4. Use Zod validation.

**Test:** CRUD works, no cross-tenant access.

---

## 7. Plan Limits & Upgrade CTA
**Goal:** Enforce task cap for Free plan.

**Steps:**
1. Check plan cap before create.
2. Show upgrade CTA.
3. Track usage counters.

**Test:** Hitting cap blocks new tasks.

---

## 8. Platform Admin Panel
**Goal:** Superadmin controls tenants.

**Steps:**
1. `/admin` panel (protected).
2. CRUD tenants, set plan, cap, status.

**Test:** Admin changes reflect instantly.

---

## 9. Stripe Billing
**Goal:** Handle paid plans.

**Steps:**
1. Setup products: premium, premium_plus.
2. Add monthly + yearly prices (20% off yearly).
3. Checkout, portal, webhook routes.
4. Update tenant plan via webhook.

**Test:** Stripe upgrade changes plan.

---

## 10. Premium Plus Teams & Managers
**Goal:** Hierarchical team system.

**Steps:**
1. Create Teams + TeamMembership.
2. Add manager/member roles.
3. Adjust visibility rules.

**Test:** Manager sees team tasks; members see own.

---

## 11. Invites & Emails
**Goal:** Invite flow via Resend.

**Steps:**
1. Invite model + API.
2. Email templates.
3. Accept invite flow.

**Test:** Invite accepted + correct role applied.

---

## 12. Logs & Security
**Goal:** Add pino logs + activity.

**Steps:**
1. Log tenantId, userId, route.
2. Add rate limit, CSRF checks.
3. Store key events in TaskActivity.

**Test:** Logs visible, rate limits work.

---

## 13. Testing
**Goal:** Auto validation.

**Steps:**
1. Unit: schema + logic.
2. Integration: actions.
3. E2E: signup, tenant, upgrade, team.

**Test:** All tests pass in CI.

---

## 14. Deployment
**Goal:** Live app.

**Steps:**
1. Deploy to Vercel.
2. Setup wildcard domain.
3. Seed demo tenant.

**Test:** `demo.myapp.com` live.

---

## 15. Documentation
**Goal:** Ready for handoff.

**Steps:**
1. Update README + docs.
2. Include env vars, setup, billing, RBAC.
3. Add SECURITY.md.

**Test:** New dev can follow docs and build.

---

## Environment Variables
```
DATABASE_URL=
NEXTAUTH_URL=
NEXTAUTH_SECRET=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
APP_DOMAIN=
RESEND_API_KEY=
```

---

## Done Criteria
✅ Tenant subdomains isolated  
✅ Auth + onboarding create tenant  
✅ CRUD + plan limits work  
✅ Admin panel active  
✅ Stripe billing synced  
✅ Premium Plus hierarchy enforced  
✅ Tests pass + deployed on Vercel  
✅ Docs complete

