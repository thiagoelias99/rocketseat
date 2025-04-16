import { getOrCreateStripeCustomerId } from "@/actions"
import { auth } from "@/lib/auth"
import { stripe } from "@/lib/stripe"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  console.log("User ID: aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
  const session = await auth()
  const userId = session?.user?.id
  const userEmail = session?.user?.email

  // const { testId } = await req.json()

  if (!userId || !userEmail) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 })
  }

  const price = process.env.STRIPE_SUBSCRIPTION_PRICE_ID as string
  if (!price) {
    return NextResponse.json({ error: "Price ID not found" }, { status: 500 })
  }

  // Pode ser qualquer informação que você queira passar para o Stripe, como o ID do teste e seja retornado no webhook
  const metadata = {
    userId,
    price
  }

  console.log("User Email:", userEmail)

  const customerId = await getOrCreateStripeCustomerId(userId)

  try {
    const session = await stripe.checkout.sessions.create({
      line_items: [{ price, quantity: 1 }],
      mode: "subscription",
      payment_method_types: ["card"],
      success_url: `${req.headers.get("origin")}/success`,
      cancel_url: `${req.headers.get("origin")}/cancel`,
      customer: customerId,
      metadata
    })
    // const session = await stripe.checkout.sessions.create({
    //   line_items: [{ price, quantity: 1 }],
    //   mode: "subscription",
    //   payment_method_types: ["card"],
    //   success_url: `${req.headers.get("origin")}/success?session_id={CHECKOUT_SESSION_ID}`,
    //   cancel_url: `${req.headers.get("origin")}/cancel`,
    //   customer_email: userEmail,
    //   metadata
    // })

    if (!session.url) {
      return NextResponse.json({ error: "Session URL not found" }, { status: 500 })
    }

    return NextResponse.json({ sessionId: session.id }, { status: 200 })
  } catch (error) {
    console.error("Error creating checkout session:", error)
    NextResponse.error()
  }
}