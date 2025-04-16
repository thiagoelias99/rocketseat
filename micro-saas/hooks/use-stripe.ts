import { useEffect, useState } from "react"
import { loadStripe, Stripe } from "@stripe/stripe-js"


export function useStripe() {
  const [stripe, setStripe] = useState<Stripe | null>(null)

  useEffect(() => {
    async function loadStripeAsync() {
      const stripeInstance = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string)
      setStripe(stripeInstance)
    }

    loadStripeAsync()
  }, [])

  // Pagamento Único
  async function createPaymentIntent(checkoutData: unknown) {
    if (!stripe) {
      throw new Error("Stripe has not been initialized")
    }
    try {
      const response = await fetch("/api/stripe/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(checkoutData),
      })

      const data = await response.json()
      await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      })
    } catch (error) {
      console.error("Error creating payment intent:", error)
    }
  }

  // Pagamento Recorrente
  async function createSubscriptionIntent(checkoutData: unknown) {
    if (!stripe) {
      throw new Error("Stripe has not been initialized")
    }
    try {
      const response = await fetch("/api/stripe/create-subscription-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(checkoutData),
      })

      const data = await response.json()

      await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      })
    } catch (error) {
      console.error("Error creating subscription intent:", error)
    }
  }

  // Portal do Cliente, para gerenciar assinaturas
  async function createPortalSession() {
    if (!stripe) {
      throw new Error("Stripe has not been initialized")
    }
    try {
      const response = await fetch("/api/stripe/create-portal-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      console.log("Portal session data:", data)

      window.location.href = data.url
    } catch (error) {
      console.error("Error creating portal session:", error)
    }
  }

  return {
    createPaymentIntent,
    createSubscriptionIntent,
    createPortalSession
  }
}