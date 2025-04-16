import { NextRequest, NextResponse } from 'next/server'
import { Preference } from 'mercadopago'
import mpClient from "@/lib/mercado-pago"
import { auth } from "@/lib/auth"

export async function POST(req: NextRequest) {
  const session = await auth()
  const userId = session?.user?.id
  const userEmail = session?.user?.email

  if (!userId || !userEmail) {
    console.error('User not authenticated')
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    const preference = new Preference(mpClient)

    const createdPreference = await preference.create({
      body: {
        external_reference: userId, // Isso impacta na pontuação do Mercado Pago
        metadata: {
          userId, // Essa variável é convertida para snake_case -> teste_id
          userEmail
        },
        payer: { email: userEmail }, // Também é importante para a pontuação do Mercado Pago
        // Incluir as informações do produto
        items: [
          {
            id: "6c4244ad-e30d-4d78-92c1-a291036c4317",
            description: "Item teste para MP",
            title: 'Teste MP',
            quantity: 1,
            unit_price: 1,
            currency_id: 'BRL',
            category_id: 'services'
          }
        ],
        payment_methods: {
          installments: 12, //Maximo de parcelas permitido
          // excluded_payment_methods: [
          //   {
          //     id: 'bolbradesco',
          //   },
          //   {
          //     id: 'pec',
          //   }
          // ],
          // excluded_payment_types: [
          //   {
          //     id: 'debit_card',
          //   },
          //   {
          //     id: 'credit_card'
          //   }
          // ]
        },
        auto_return: 'approved',
        back_urls: {
          success: `${req.headers.get('origin')}/api/mp/pending`,
          failure: `${req.headers.get('origin')}/api/mp/pending`,
          pending: `${req.headers.get('origin')}/api/mp/pending`,
        }
      }
    })

    if (!createdPreference.id) {
      return new Response('Error ao criar checkout com Mercado Pago', { status: 500 })
    }

    return NextResponse.json({
      preferenceId: createdPreference.id,
      initPoint: createdPreference.init_point, // Link de redirecionamento para o checkout do Mercado Pago
    })
  } catch (error) {
    console.error(error)
    return new Response('Error ao criar checkout com Mercado Pago', { status: 500 })
  }
}