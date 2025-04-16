import { getOrCreateStripeCustomerId } from "@/actions"
import { auth } from "@/lib/auth"
import { stripe } from "@/lib/stripe"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const session = await auth()
  const userId = session?.user?.id
  const userEmail = session?.user?.email

  console.log("User ID:", userEmail)

  if (!userId || !userEmail) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 })
  }

  const { testId } = await req.json()

  const price = process.env.STRIPE_PRODUCT_PRICE_ID as string
  if (!price) {
    return NextResponse.json({ error: "Price ID not found" }, { status: 500 })
  }

  const customerId = await getOrCreateStripeCustomerId(userId)

  // Pode ser qualquer informação que você queira passar para o Stripe, como o ID do teste e seja retornado no webhook
  const metadata = {
    testId,
    price
  }

  try {
    const session = await stripe.checkout.sessions.create({
      line_items: [{ price, quantity: 1 }],
      mode: "payment",
      payment_method_types: ["card", "boleto"],
      success_url: `${req.headers.get("origin")}/success`,
      cancel_url: `${req.headers.get("origin")}/cancel`,
      customer: customerId,
      metadata
    })

    if (!session.url) {
      return NextResponse.json({ error: "Session URL not found" }, { status: 500 })
    }

    return NextResponse.json({ sessionId: session.id }, { status: 200 })
  } catch (error) {
    console.error("Error creating checkout session:", error)
    NextResponse.error()
  }
}