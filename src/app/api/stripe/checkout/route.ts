import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { stripe, getPriceId } from "@/lib/stripe";
import { db } from "@/lib/db";
import type { BillingInterval } from "@/lib/stripe";

export async function POST(req: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { plan, interval, tenantId } = body as {
      plan: "premium" | "premium_plus";
      interval: BillingInterval;
      tenantId: string;
    };

    if (!plan || !interval || !tenantId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify user has access to this tenant
    const membership = await db.membership.findFirst({
      where: {
        userId: session.user.id,
        tenantId,
        role: { in: ["owner", "admin"] },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "You don't have permission to manage billing for this tenant" },
        { status: 403 }
      );
    }

    const tenant = await db.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      return NextResponse.json(
        { error: "Tenant not found" },
        { status: 404 }
      );
    }

    const priceId = getPriceId(plan, interval);

    if (!priceId) {
      return NextResponse.json(
        { error: "Invalid plan or price configuration" },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Create Stripe Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: tenant.stripeCustomerId || undefined,
      customer_email: tenant.stripeCustomerId ? undefined : session.user.email!,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/app/settings?tenant=${tenant.subdomain}&success=true`,
      cancel_url: `${baseUrl}/app/settings?tenant=${tenant.subdomain}&canceled=true`,
      metadata: {
        tenantId: tenant.id,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
