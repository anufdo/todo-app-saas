# Multi-Tenant Todo SaaS

A production-ready SaaS todo application with multi-tenant support, authentication, billing, and team management.

## Features

- 🔐 **Multi-tenant architecture** with subdomain isolation
- 👤 **Authentication** with credentials, Google, GitHub
- 💳 **Stripe billing** with free/premium/premium_plus plans
- 👥 **Team management** with roles and permissions
- ✅ **Todo CRUD** with real-time updates
- 📊 **Admin panel** for tenant management
- 🔍 **Audit logs** and security tracking

## Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js Server Actions, API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: NextAuth v5
- **Payment**: Stripe
- **Email**: Resend
- **Testing**: Vitest, Playwright
- **Deployment**: Vercel

## Prerequisites

- Node.js 18+
- PostgreSQL database
- Stripe account
- Resend account (for emails)

## Setup

1. Clone the repository
```bash
git clone <repo-url>
cd todo-app-saas
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
```bash
cp .env.example .env.local
# Edit .env.local with your credentials
```

4. Setup database
```bash
npm run db:push
npm run db:seed
```

5. Run development server
```bash
npm run dev
```

Visit `http://localhost:3000`

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run unit tests
- `npm run test:e2e` - Run E2E tests
- `npm run db:push` - Sync Prisma schema with database
- `npm run db:migrate` - Create a migration
- `npm run db:seed` - Seed database with demo data

## Environment Variables

See `.env.example` for all required environment variables.

Key variables:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_URL` - Auth callback URL
- `NEXTAUTH_SECRET` - Auth secret (generate with `openssl rand -base64 32`)
- `STRIPE_SECRET_KEY` - Stripe API key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- `RESEND_API_KEY` - Resend email API key

## Project Structure

```
src/
├── app/              # Next.js app directory
├── components/       # React components
├── lib/              # Utility functions
│   ├── auth.ts       # NextAuth configuration
│   ├── db.ts         # Prisma client
│   └── stripe.ts     # Stripe utilities
├── actions/          # Server actions
├── middleware.ts     # Subdomain routing middleware
└── types/            # TypeScript types

prisma/
├── schema.prisma     # Database schema
└── seed.ts           # Seed script
```

## Database Schema

Key models:
- **Tenant** - Multi-tenant workspace
- **User** - Authentication user
- **Membership** - User's tenant memberships
- **Team** - Teams within a tenant (premium_plus)
- **TeamMembership** - User roles in teams
- **Task** - Todos with multi-tenant isolation
- **Billing** - Stripe subscription tracking
- **UsageCounter** - Plan limits enforcement

## Authentication

Supports:
- Email/password (local)
- Google OAuth
- GitHub OAuth

First-time users are redirected to onboarding to create a tenant.

## Billing

Plans:
- **Free**: 50 tasks, basic features
- **Premium**: 500 tasks, unlimited team members
- **Premium Plus**: Unlimited tasks, advanced team management

Monthly and yearly pricing (20% discount for yearly).

## Multi-Tenant Architecture

- Requests are routed via subdomains: `{tenant}.myapp.com`
- Middleware extracts tenant from subdomain/domain
- All queries automatically filtered by tenantId
- Prisma middleware enforces tenant isolation

## Admin Panel

Accessible at `/admin` with admin email.

Features:
- View all tenants
- Modify plans and usage caps
- Suspend/activate tenants
- View activity logs

## Testing

- Unit tests for utilities and schemas
- Integration tests for server actions
- E2E tests for user flows (signup, upgrade, etc.)

Run all tests:
```bash
npm test && npm run test:e2e
```

## Deployment

Deployed to Vercel with:
- Wildcard domain support: `*.myapp.com`
- Environment variables configured
- Database migrations on deploy

## Security

- CSRF protection on all forms
- Rate limiting on auth routes
- SQL injection prevention via Prisma
- XSS protection via React
- Audit logging for sensitive actions
- HTTPS enforced in production

See `SECURITY.md` for details.

## Contributing

This is a reference SaaS template. Customize as needed for your use case.

## License

MIT
