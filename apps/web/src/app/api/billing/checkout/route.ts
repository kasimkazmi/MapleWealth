import { NextResponse } from "next/server";
import { stripe } from "../../../../server/stripe";
import { auth } from "../../../../server/auth";
import { headers } from "next/headers";

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const host = req.headers.get("origin") || "http://localhost:3000";
    const priceId = process.env.STRIPE_PREMIUM_PRICE_ID;
    
    if (!priceId) {
      return NextResponse.json(
        { message: "STRIPE_PREMIUM_PRICE_ID is not configured in environment variables." },
        { status: 400 }
      );
    }
    
    // Create Stripe subscription checkout session
    const stripeSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${host}/?billing=success`,
      cancel_url: `${host}/?billing=cancel`,
      subscription_data: {
        metadata: {
          userId: session.user.id,
        },
      },
      metadata: {
        userId: session.user.id,
      },
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
