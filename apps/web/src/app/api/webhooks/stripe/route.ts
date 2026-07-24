import { NextResponse } from "next/server";
import { stripe } from "../../../../server/stripe";
import { prisma } from "../../../../lib/prisma";
import Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature") || "";

  let event: Stripe.Event;

  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return NextResponse.json({ message: "Stripe Webhook Secret not configured" }, { status: 500 });
    }
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ message: "Invalid Signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const subscriptionId = session.subscription as string;

        if (userId && subscriptionId) {
          const subDetails = await stripe.subscriptions.retrieve(subscriptionId) as any;

          await prisma.subscription.upsert({
            where: { userId },
            create: {
              userId,
              status: "active",
              planId: "premium",
              currentPeriodEnd: new Date(subDetails.current_period_end * 1000),
            },
            update: {
              status: "active",
              currentPeriodEnd: new Date(subDetails.current_period_end * 1000),
            },
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const stripeSub = event.data.object as Stripe.Subscription;
        const userId = stripeSub.metadata?.userId;

        if (userId) {
          await prisma.subscription.update({
            where: { userId },
            data: {
              status: "canceled",
            },
          });
        }
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Stripe webhook execution error:", err);
    return NextResponse.json({ message: "Webhook handler failed" }, { status: 500 });
  }
}
