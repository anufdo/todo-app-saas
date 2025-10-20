import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";

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
    const { tenantId } = body as { tenantId: string };

    if (!tenantId) {
      return NextResponse.json(
        { error: "Missing tenantId" },
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

    if (!tenant || !tenant.stripeCustomerId) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 404 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Create Stripe Customer Portal Session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: tenant.stripeCustomerId,
      return_url: `${baseUrl}/app/settings?tenant=${tenant.subdomain}`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error("Portal error:", error);
    return NextResponse.json(
      { error: "Failed to create portal session" },
      { status: 500 }
    );
  }
}
