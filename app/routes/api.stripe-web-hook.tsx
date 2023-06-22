import type {PaymentMethod} from '@prisma/client'
import type {ActionArgs} from '@remix-run/node'
import {json} from '@remix-run/node'
import Stripe from 'stripe'
import {prisma} from '~/db.server'
import {EVENTS} from '~/events'
// import { getUserId } from "~/session.server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15',
})

interface Metadata {
  tip: string
  paymentMethod: PaymentMethod
  orderId: string
  branchId: string
  userId: string
  sseURL: string
}

// [credit @kiliman to get this webhook working](https://github.com/remix-run/remix/discussions/1978)
export const action = async ({request}: ActionArgs) => {
  const payload = await request.text()
  const sig = request.headers.get('stripe-signature')
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      payload,
      sig,
      process.env.STRIPE_WEBHOOK_ENDPOINT_SECRET,
    )
    if (event.type === 'checkout.session.completed') {
      console.log('✅ se ha registrado un pago')
    }
  } catch (err: any) {
    console.log(err)
    throw json({errors: [{message: err.message}]}, 400)
  }
  console.log('event', event)

  const session = event.data.object as Stripe.Checkout.Session
  const metadata = session.metadata ?? ({} as Metadata)

  if (session.payment_status === 'paid') {
    console.time('Creating...')
    try {
      await prisma.payments.create({
        data: {
          amount: Number(session.amount_total) / 100 - Number(metadata.tip),
          method: metadata.paymentMethod,
          orderId: metadata.orderId,
          tip: Number(metadata.tip),
          total: Number(session.amount_total) / 100,
          branchId: metadata.branchId,
          user: {},
          userId: metadata.userId,
        },
      })
      EVENTS.ISSUE_CHANGED(metadata.sseURL)
      console.timeEnd('Creating...')
    } catch (err) {
      console.error('Error creating payment:', err)
      // Here, you can handle the error as needed. For example:
      // - Send an alert or notification
      // - Retry the operation
      // - Exit the function or throw the error to be caught higher up
    }
  }
  return new Response(null, {status: 200})
}
