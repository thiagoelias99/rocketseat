import { handleStripePaymentConfirmed, handleStripeSubscriptionCanceled, handleStripeSubscriptionConfirmed } from "@/actions"
import { stripe } from "@/lib/stripe"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const stripeSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!stripeSecret) {
      console.error("Stripe webhook secret is not set")
      return NextResponse.json({ error: "Webhook secret is not set" }, { status: 500 })
    }

    const body = await req.text()
    const stripeSignature = req.headers.get("stripe-signature")

    if (!stripeSignature) {
      console.error("Stripe signature is missing")
      return NextResponse.json({ error: "Stripe signature is missing" }, { status: 400 })
    }

    const event = stripe.webhooks.constructEvent(body, stripeSignature, stripeSecret)

    switch (event.type) {
      // Quando um pagamento é confirmado (único ou recorrente)
      case "checkout.session.completed":
        const metadata = event.data.object.metadata

        if (metadata?.price === process.env.STRIPE_PRODUCT_PRICE_ID) {
          await handleStripePaymentConfirmed(event)
        }

        if (metadata?.price === process.env.STRIPE_SUBSCRIPTION_PRICE_ID) {
          await handleStripeSubscriptionConfirmed(event)
        }
        break
      // Quando o pagamento não é confirmado em 24hrs
      case "checkout.session.expired":
        console.log("Pagamento expirado")
        break

      // Quando a confirmação do boleto é confirmada
      case "checkout.session.async_payment_succeeded":
        console.log("Pagamento de boleto confirmado")
        break
      // Quando a confirmação do boleto falha
      case "checkout.session.async_payment_failed":
        console.log("Pagamento de boleto falhou")
        break
      // Quando uma assinatura é criada
      case "customer.subscription.created":
        console.log("Assinatura criada")
        break
      // Quando uma assinatura é atualizada
      case "customer.subscription.updated":
        console.log("Assinatura atualizada")
        break
      // Quando uma assinatura é cancelada
      case "customer.subscription.deleted":
        await handleStripeSubscriptionCanceled(event)
        break
      default:
        console.log(`Unhandled event type ${event.type}`)
        break
    }

    return NextResponse.json({ message: "Webhook success" }, { status: 200 })
  } catch (error) {
    console.error("Error processing webhook", error)
    return NextResponse.json({ error: "Webhook error" }, { status: 500 })
  }
}