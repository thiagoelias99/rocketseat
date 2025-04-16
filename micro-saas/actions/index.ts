"use server"

import { signIn, signOut } from "@/lib/auth"
import { db } from "@/lib/firebase"
import { stripe } from "@/lib/stripe"
import Stripe from "stripe"
import { PaymentResponse } from "mercadopago/dist/clients/payment/commonTypes"

export async function handleGoogleAuth() {
  await signIn("google", {
    redirectTo: "/dashboard"
  })
}

export async function handleLogout() {
  await signOut({ redirectTo: "/" })
}

export async function getOrCreateStripeCustomerId(userId: string) {
  try {
    const userDoc = await db.collection("users").doc(userId).get()

    if (!userDoc.exists) {
      throw new Error("User not found")
    }

    const stripeCustomerId = userDoc.data()?.stripeCustomerId

    if (stripeCustomerId) {
      return stripeCustomerId
    } else {
      const stripeCustomer = await stripe.customers.create({
        email: userDoc.data()?.email,
        name: userDoc.data()?.name,
        metadata: {
          userId
        }
      })

      await userDoc.ref.update({
        stripeCustomerId: stripeCustomer.id
      })

      return stripeCustomer.id
    }

  } catch (error) {
    console.error("Error getting or creating customer ID:", error)
    throw new Error("Failed to get or create customer ID")
  }
}

export async function handleStripePaymentConfirmed(event: Stripe.CheckoutSessionCompletedEvent) {
  if (event.data.object.payment_status === "paid") {
    console.log("Payment confirmed")
  }
}

export async function handleStripeSubscriptionConfirmed(event: Stripe.CheckoutSessionCompletedEvent) {
  if (event.data.object.payment_status === "paid") {
    console.log("Subscription confirmed")
  }
}

export async function handleStripeSubscriptionCanceled(event: Stripe.CustomerSubscriptionDeletedEvent) {
  console.log(event)
  console.log("Subscription canceled")
}

export async function handleMercadoPagoPayment(paymentData: PaymentResponse) {
  const metadata = paymentData.metadata
  const userEmail = metadata.user_mail
  const userId = metadata.userId
  console.log("PAGAMENTO COM SUCESSO", { userEmail, userId, paymentData })

  // const { data, error } = await resend.emails.send({
  //   from: 'Acme <me@example.com>',
  //   to: [userEmail],
  //   subject: 'Pagamento realizado com sucesso',
  //   text: 'Pagamento realizado com sucesso'
  // })

  // if (error) {
  //   console.error(error);
  // }

  // console.log(data)
}