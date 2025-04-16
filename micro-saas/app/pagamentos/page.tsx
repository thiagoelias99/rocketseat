"use client"

import useMercadoPago from "@/hooks/use-mercado-pago"
import { useStripe } from "@/hooks/use-stripe"

export default function Payments() {
  const { createPaymentIntent, createPortalSession, createSubscriptionIntent } = useStripe()
  const { createMercadoPagoCheckout } = useMercadoPago()

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4">
      <h2 className="text-3xl font-bold">Criar Pagamentos (Stripe)</h2>
      <button onClick={() => {
        createPaymentIntent({ testId: "test123" })
      }}>Criar pagamento único stripe</button>
      <button onClick={() => {
        createSubscriptionIntent({ testId: "test123" })
      }}>Criar assinatura stripe</button>
      <button onClick={() => {
        createPortalSession()
      }}>Acessar portal stripe</button>
      <h2 className="text-3xl font-bold">Criar Pagamentos (Mercado Pago)</h2>
      <button onClick={() => {
        createMercadoPagoCheckout()
      }}>Criar pagamento único mercado pago</button>
    </div>
  )
}
