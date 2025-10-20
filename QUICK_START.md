# Quick Start Guide - Steps 9-10

## ✅ What's New

### 🎫 Stripe Billing (Step 9)
- Full subscription management
- Monthly and yearly plans (20% off yearly)
- Upgrade from Free → Premium → Premium Plus
- Customer portal for subscription changes

### 👥 Teams Feature (Step 10)
- Create and manage teams
- Assign managers and members
- Role-based hierarchy
- Premium Plus only

---

## 🚀 Getting Started

### 1. Set Up Stripe (Required for Billing)

#### A. Create Stripe Account
1. Go to https://stripe.com and create account
2. Get your test API keys from Dashboard

#### B. Create Products and Prices

**Premium Plan:**
```
Product Name: Premium
Monthly Price: $9.99 (ID: price_xxx)
Yearly Price: $99.90 (ID: price_yyy)
```

**Premium Plus Plan:**
```
Product Name: Premium Plus  
Monthly Price: $29.99 (ID: price_xxx)
Yearly Price: $299.90 (ID: price_yyy)
```

#### C. Update Environment Variables

Create/update `.env.local`:
```bash
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_secret_here

# Stripe Price IDs (from step B)
STRIPE_PREMIUM_MONTHLY_PRICE_ID=price_xxx
STRIPE_PREMIUM_YEARLY_PRICE_ID=price_yyy
STRIPE_PREMIUM_PLUS_MONTHLY_PRICE_ID=price_xxx
STRIPE_PREMIUM_PLUS_YEARLY_PRICE_ID=price_yyy

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### D. Set Up Webhook Forwarding

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Copy the webhook secret (whsec_...) to .env.local
```

---

### 2. Test Billing Features

#### A. Upgrade Flow
1. **Start dev server:** `npm run dev`
2. **Sign in** as demo@example.com / password123
3. **Navigate to Settings:** http://localhost:3000/app/settings?tenant=demo
4. **Select a plan:**
   - Toggle between Monthly/Yearly
   - Click "Upgrade to Premium" or "Upgrade to Premium Plus"
5. **Complete checkout:**
   - Use test card: `4242 4242 4242 4242`
   - Any future expiry date
   - Any CVV
6. **Verify upgrade:**
   - Should redirect back to settings with success message
   - Check admin panel - plan should be updated
   - Check database - billing record created

#### B. Manage Subscription
1. After upgrading, click "Manage Subscription"
2. Should open Stripe Customer Portal
3. Can update payment method, cancel, etc.

#### C. Test Webhook Events
With Stripe CLI running:
```bash
# The terminal will show webhook events as they happen:
# - checkout.session.completed
# - customer.subscription.created  
# - customer.subscription.updated

# Check your app logs for processing confirmation
```

---

### 3. Test Teams Feature

#### A. Upgrade to Premium Plus First
Teams require Premium Plus plan. Either:
- **Option 1:** Upgrade via billing (see above)
- **Option 2:** Use admin panel to manually upgrade

**Using Admin Panel:**
1. Sign in as admin@example.com / admin123!
2. Click "Admin" in navigation
3. Find "Demo Workspace"
4. Change plan dropdown to "Premium Plus"
5. Plan updates immediately

#### B. Access Teams
1. Navigate to: http://localhost:3000/app/teams?tenant=demo
2. Should see team management interface

#### C. Create a Team
1. Click "Create Team"
2. Enter name: "Engineering Team"
3. Enter description: "Development team"
4. Click "Create Team"

#### D. Add Team Members
1. Click "Add Member" button on the team
2. See list of tenant members
3. Click "Add as Member" or "Add as Manager"
4. Member appears in team with role badge

#### E. Test Roles
**Managers can:**
- Add members to team
- Remove members from team
- Assign tasks to team (when implemented)

**Members can:**
- View team tasks
- Complete their assigned tasks

#### F. Delete a Team
1. Click "Delete" button on team card
2. Confirm deletion
3. Team and all memberships deleted

---

### 4. Verify Free/Premium Users Can't Access Teams

1. Sign in as regular user (or create new account)
2. Make sure they're on Free or Premium plan
3. Navigate to /app/teams
4. Should see upgrade prompt
5. Can't create or manage teams

---

## 🧪 Test Scenarios

### Scenario 1: Complete Upgrade Flow
```
1. Sign in as demo user (Free plan)
2. Go to Settings
3. Choose Premium plan, yearly
4. Complete checkout with test card
5. Verify:
   - Success message appears
   - Plan badge shows "Premium"
   - Admin panel shows Premium
   - Database billing record exists
   - Can create more tasks (500 limit)
```

### Scenario 2: Downgrade via Portal
```
1. After upgrading to Premium
2. Click "Manage Subscription"
3. In portal, cancel subscription
4. Webhook fires → plan downgrades to Free
5. Verify:
   - Plan shows Free
   - Task limit back to 50
   - Can no longer create tasks over limit
```

### Scenario 3: Team Hierarchy
```
1. Upgrade to Premium Plus
2. Create "Engineering" team
3. Add Alice as Manager
4. Add Bob as Member
5. Create "Marketing" team
6. Add Charlie as Manager
7. Verify:
   - Alice can manage Engineering team
   - Bob can only view Engineering tasks
   - Charlie can manage Marketing team
   - Teams are isolated
```

---

## 🐛 Troubleshooting

### Webhook Not Working
```bash
# Check Stripe CLI is running
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Verify webhook secret in .env.local matches CLI output
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Check terminal logs for errors
```

### Checkout Fails
```bash
# Verify all price IDs are correct
echo $STRIPE_PREMIUM_MONTHLY_PRICE_ID

# Test in Stripe Dashboard that prices exist
# Make sure test mode is enabled
```

### Teams Show "Requires Upgrade"
```bash
# Check tenant plan in database or admin panel
# Must be "premium_plus"

# Manually upgrade via admin panel if needed
```

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies  
npm install

# Rebuild
npm run build
```

---

## 📊 Database Inspection

### Check Billing Records
```sql
SELECT * FROM "Billing" WHERE "tenantId" = 'your_tenant_id';
```

### Check Subscription Status
```sql
SELECT 
  t.name,
  t.plan,
  t."stripeCustomerId",
  t."stripeSubscriptionId",
  b.status,
  b."currentPeriodEnd"
FROM "Tenant" t
LEFT JOIN "Billing" b ON t.id = b."tenantId"
WHERE t.subdomain = 'demo';
```

### Check Teams
```sql
SELECT 
  te.name as team_name,
  COUNT(tm.id) as member_count,
  COUNT(ta.id) as task_count
FROM "Team" te
LEFT JOIN "TeamMembership" tm ON te.id = tm."teamId"
LEFT JOIN "Task" ta ON te.id = ta."teamId"
WHERE te."tenantId" = 'your_tenant_id'
GROUP BY te.id, te.name;
```

---

## 🎯 Success Criteria

### Billing is Working When:
- ✅ Can complete checkout flow
- ✅ Webhook events are received
- ✅ Plan updates automatically
- ✅ Billing records are created
- ✅ Customer portal works
- ✅ Task limits respect new plan

### Teams are Working When:
- ✅ Only Premium Plus users can access
- ✅ Can create teams
- ✅ Can add members with roles
- ✅ Managers can manage team
- ✅ Members can view team
- ✅ Can delete teams
- ✅ Member count is accurate

---

## 🚀 Next: Deploy to Vercel

Once testing is complete:
1. Create Vercel project
2. Add environment variables
3. Set up custom domain with wildcard
4. Configure Stripe webhook to production URL
5. Test in production with live mode

---

## 📚 Related Documentation

- [Stripe Testing](https://stripe.com/docs/testing)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - Full feature list

---

**Have questions? Check the main README or IMPLEMENTATION_SUMMARY.md!**
