import type { PaymentMethod } from '@prisma/client'
import initStripe from 'stripe'

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
  // const encodedExtraData = encodeURIComponent(JSON.stringify(extraData))

  // const e = JSON.parse(decodeURIComponent(encodedExtraData))
  // console.log('e', extraData)

  const stripe = initStripe(process.env.STRIPE_SECRET_KEY)
  const account = await stripe.accounts.retrieve('acct_1NuRFGBAuNoVK1pM')
  console.log('acount', account)
  const lineItems = [
    {
      price_data: {
        currency: currency,
        product_data: {
          name: 'Tu pago',
          // Add more product data if needed
        },
        unit_amount: amount,
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

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',

    payment_method_types: ['card'],
    line_items: lineItems,
    metadata: {
      isOrderAmountFullPaid,
      tip,
      paymentMethod,
      typeOfPayment,
      extraData: extraData ? JSON.stringify(extraData) : undefined,
    },
    // FIXME - add dynamic destination depending of the branch
    payment_intent_data: {
      application_fee_amount: 100,
      transfer_data: {
        destination: 'acct_1NuRFGBAuNoVK1pM',
      },
    },
    success_url: `${domainUrl}/payment/success?${queryString}`,
    cancel_url: `${domainUrl}`,
  })

  return session.url
}
