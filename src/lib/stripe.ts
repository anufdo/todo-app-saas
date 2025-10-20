import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
  typescript: true,
});

// Stripe Product and Price IDs
export const STRIPE_PLANS = {
  premium: {
    monthly: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID || "",
    yearly: process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID || "",
  },
  premium_plus: {
    monthly: process.env.STRIPE_PREMIUM_PLUS_MONTHLY_PRICE_ID || "",
    yearly: process.env.STRIPE_PREMIUM_PLUS_YEARLY_PRICE_ID || "",
  },
} as const;

export type BillingInterval = "monthly" | "yearly";

export function getPriceId(plan: "premium" | "premium_plus", interval: BillingInterval): string {
  return STRIPE_PLANS[plan][interval];
}
