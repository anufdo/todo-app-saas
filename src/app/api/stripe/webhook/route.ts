import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "No signature provided" },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as {
          metadata?: { tenantId?: string };
          customer?: string;
          subscription?: string;
        };
        await handleCheckoutCompleted(session);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as {
          id: string;
          customer: string;
          status: string;
          current_period_start: number;
          current_period_end: number;
          items: { data: Array<{ price: { id: string } }> };
        };
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as {
          customer: string;
        };
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        console.log("Payment succeeded for invoice:", invoice.id);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        console.log("Payment failed for invoice:", invoice.id);
        // TODO: Send email notification to tenant owner
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Error processing webhook:", err);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: {
  metadata?: { tenantId?: string };
  customer?: string;
  subscription?: string;
}) {
  const tenantId = session.metadata?.tenantId;
  
  if (!tenantId) {
    console.error("No tenantId in session metadata");
    return;
  }

  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;

  // Update tenant with Stripe customer ID
  await db.tenant.update({
    where: { id: tenantId },
    data: {
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
    },
  });

  console.log(`Checkout completed for tenant ${tenantId}`);
}

async function handleSubscriptionUpdate(subscription: {
  id: string;
  customer: string;
  status: string;
  current_period_start: number;
  current_period_end: number;
  items: { data: Array<{ price: { id: string } }> };
}) {
  const customerId = subscription.customer;

  // Find tenant by Stripe customer ID
  const tenant = await db.tenant.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!tenant) {
    console.error(`No tenant found for customer ${customerId}`);
    return;
  }

  // Determine plan from subscription items
  const priceId = subscription.items.data[0]?.price.id;
  let plan: "free" | "premium" | "premium_plus" = "free";

  // Map price ID to plan
  if (priceId === process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID ||
      priceId === process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID) {
    plan = "premium";
  } else if (priceId === process.env.STRIPE_PREMIUM_PLUS_MONTHLY_PRICE_ID ||
             priceId === process.env.STRIPE_PREMIUM_PLUS_YEARLY_PRICE_ID) {
    plan = "premium_plus";
  }

  // Update tenant and billing
  await db.tenant.update({
    where: { id: tenant.id },
    data: {
      plan,
      stripeSubscriptionId: subscription.id,
    },
  });

  await db.billing.upsert({
    where: { tenantId: tenant.id },
    update: {
      stripeSubscriptionId: subscription.id,
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      priceId,
    },
    create: {
      tenantId: tenant.id,
      stripeSubscriptionId: subscription.id,
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      priceId,
    },
  });

  console.log(`Subscription updated for tenant ${tenant.id} to plan ${plan}`);
}

async function handleSubscriptionDeleted(subscription: {
  customer: string;
}) {
  const customerId = subscription.customer;

  const tenant = await db.tenant.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!tenant) {
    console.error(`No tenant found for customer ${customerId}`);
    return;
  }

  // Downgrade to free plan
  await db.tenant.update({
    where: { id: tenant.id },
    data: {
      plan: "free",
      stripeSubscriptionId: null,
    },
  });

  await db.billing.update({
    where: { tenantId: tenant.id },
    data: {
      status: "cancelled",
      canceledAt: new Date(),
    },
  });

  console.log(`Subscription cancelled for tenant ${tenant.id}`);
}
