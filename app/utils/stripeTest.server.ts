import { prisma } from '~/db.server'

export async function getStripePayment({ amount }) {
  const stripe = require('stripe')('sk_test_a5qO2sn2n6AYZEge444HVrXU00v1RQv7qr')
  //   const branch = await prisma.branch.findUnique({
  //     where: {
  //       id: extraData?.branchId,
  //     },
  //   })
  //   const stripeAccountId = branch?.stripeAccountId
  //   const ephemeralKey = await stripe.ephemeralKeys.create({ customer: '{{CUSTOMER_ID}}' }, { apiVersion: '2023-10-16' })

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100,
    currency: 'mxn',
    automatic_payment_methods: {
      enabled: true,
    },
    // payment_intent_data: {
    //   application_fee_amount: Math.floor(amount * 0.05) + 300,
    //   // transfer_data: {
    //   //   destination: stripeAccountId,
    //   // },
    //   // on_behalf_of: stripeAccountId,
    // },
  })

  return paymentIntent
}
