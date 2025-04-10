import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import { updateOrderTopaid } from "@/lib/actions/order.actions";

export async function POST(req: NextRequest) {
  const event = await Stripe.webhooks.constructEvent(
    await req.text(),
    req.headers.get("stripe-signature") as string,
    process.env.STRIPE_WEBHOOK_SECRET as string
  );

  if (event.type === "charge.succeeded") {
    const { object } = event.data;

    await updateOrderTopaid({
      orderId: object.metadata.orderId,
      paymentResult: {
        id: object.id,
        status: "COMPLETED",
        email_address: object.billing_details.email!,
        price_paid: (object.amount / 100).toFixed(),
      },
    });
    return NextResponse.json({
      message: "Order marked as paid",
    });
  }

  return NextResponse.json({ message: "Failed to marked order as paid" });
}
