import type { PaymentMethod } from '@prisma/client'
import Stripe from 'stripe'
import { prisma } from '~/db.server'

import { createQueryString } from '~/utils'

// copied from (https://github.com/kentcdodds/kentcdodds.com/blob/ebb36d82009685e14da3d4b5d0ce4d577ed09c63/app/utils/misc.tsx#L229-L237)
export function getDomainUrl(request: Request) {
  const host = request.headers.get('X-Forwarded-Host') ?? request.headers.get('host')
  if (!host) {
    throw new Error('Could not determine domain URL.')
  }
  const protocol = host.includes('localhost') ? 'http' : 'https'
  return `${protocol}://${host}`
}

/**
 *
 * @param amount
 * @param isOrderAmountFullPaid
 * @param domainUrl
 * @param currency
 * @param tip
 * @param paymentMethod
 * @param typeOfPayment (optional)
 * @param extraData (optional)
 * @returns
 */
export const getStripeSession = async (
  amount: number, // Amount in cents (or the smallest currency unit)
  isOrderAmountFullPaid: boolean,
  domainUrl: string,

  currency: string = 'usd', // Default to USD
  tip: number,

  paymentMethod: PaymentMethod,

  typeOfPayment?: string,
  extraData?: any,
): Promise<string> => {
  const avocadoFee = Math.floor(amount * 0.05)

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2022-11-15',
  })

  const branch = await prisma.branch.findUnique({
    where: {
      id: extraData?.branchId,
    },
  })
  const stripeAccountId = branch?.stripeAccountId
  console.log('amount', amount / 100)
  console.log(avocadoFee)

  if (!stripeAccountId) {
    throw new Error(`No Stripe account found for branch ID: ${extraData.branchId}`)
  }

  const lineItems = [
    {
      price_data: {
        currency: currency,
        product_data: {
          name: 'Estas pagando tu cuenta con Avoqado services',
          description: 'Recibirás un correo de Avoqado Services con el detalle de tu pago',

          images: [
            'https://firebasestorage.googleapis.com/v0/b/avoqado-d0a24.appspot.com/o/AVOQADO.png?alt=media&token=fae6250d-743c-4dbc-8432-19b4bbdcc35a',
          ],
        },
        unit_amount: amount + Math.floor(avocadoFee) + 300,
      },
      quantity: 1,
    },
  ]

  const params = {
    typeOfPayment: typeOfPayment,
    amount: amount / 100,
    tip: tip,
    paymentMethod: paymentMethod,
    extraData: extraData ? JSON.stringify(extraData) : undefined,
    isOrderAmountFullPaid: isOrderAmountFullPaid,
  }
  const queryString = createQueryString(params)

  const session = await stripe.checkout.sessions.create(
    {
      mode: 'payment',

      payment_method_types: ['card'],
      line_items: lineItems,

      payment_intent_data: {
        application_fee_amount: Math.floor(amount * 0.05) + 300,
        transfer_data: {
          destination: stripeAccountId,
        },
        on_behalf_of: stripeAccountId, // The account you are acting on behalf of
      },
      success_url: `${domainUrl}/payment/success?${queryString}`,
      cancel_url: `${domainUrl}`,
    },
    // {
    //   stripeAccount: stripeAccountId,
    // },
  )

  return session.url
}
