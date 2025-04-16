import mpClient from "@/lib/mercado-pago"
import { Payment } from "mercadopago"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  const paymentId = searchParams.get("payment_id")

  const userId = searchParams.get("external_reference")

  if (!paymentId || !userId) {
    return new Response("Payment ID or userId not found", { status: 400 })
  }

  const payment = new Payment(mpClient)

  const paymentData = await payment.get({ id: paymentId })

  // Approved não aparece em caso de Pix, então verificamos se o campo date_approved é diferente de null
  if (paymentData.status === 'approved' || paymentData.date_approved !== null) {
    return NextResponse.redirect(new URL('/success', req.url))
  }

  return NextResponse.redirect(new URL('/', req.url))
}