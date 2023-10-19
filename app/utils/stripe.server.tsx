import type { PaymentMethod } from '@prisma/client'
import Stripe from 'stripe'

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
  //2% of the amount
  const avoqadoCommission = Math.floor(amount * 0.02)
  console.log('avoqado comission', avoqadoCommission)
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2022-11-15',
  })
  // const account = await stripe.accounts.retrieve('acct_1NuRFGBAuNoVK1pM')
  // console.log('account' , account)
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
        unit_amount: amount + avoqadoCommission,
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
  // const paymentIntent = await stripe.paymentIntents.create(
  //   {
  //     amount: amount,
  //     currency: currency,
  //     automatic_payment_methods: {
  //       enabled: true,
  //     },
  //     application_fee_amount: 123,
  //   },
  //   {
  //     stripeAccount: 'acct_1O2JglK0u0kbLQyR',
  //   },
  // )

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
    // invoice_creation:true,
    // invoice_creation: {

    // },
    // invoice_creation: {
    //   enabled: true,
    //   invoice_data: {
    //     custom_fields: [
    //       {
    //         name: 'productos',
    //         value: 'TEST',
    //       },
    //     ],
    //   },
    // },
    payment_intent_data: {
      // application_fee_amount: Math.floor(avoqadoCommission),
      application_fee_amount: 1000,
      transfer_data: {
        destination: 'acct_1O2JglK0u0kbLQyR',
      },
      on_behalf_of: 'acct_1O2JglK0u0kbLQyR', // The account you are acting on behalf of
    },
    success_url: `${domainUrl}/payment/success?${queryString}`,
    cancel_url: `${domainUrl}`,
  })

  return session.url
}
