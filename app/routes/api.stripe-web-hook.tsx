import type {ActionArgs} from '@remix-run/node'
import {json} from '@remix-run/node'
import Stripe from 'stripe'
import {prisma} from '~/db.server'
import {EVENTS} from '~/events'
import {getUserId} from '~/session.server'

const stripe = new Stripe('sk_test_a5qO2sn2n6AYZEge444HVrXU00v1RQv7qr', {
  apiVersion: '2022-11-15',
})

// [credit @kiliman to get this webhook working](https://github.com/remix-run/remix/discussions/1978)
export const action = async ({request}: ActionArgs) => {
  const payload = await request.text()
  const sig = request.headers.get('stripe-signature')
  let event: Stripe.EventListParams
  try {
    event = stripe.webhooks.constructEvent(
      payload,
      sig,
      'whsec_OmlEqs14gM07LHgqQPw7XpzTLB7g6qA9',
    )
    if (event.type === 'checkout.session.completed') {
      console.log('✅ se ha registrado un pago')
    }
  } catch (err: any) {
    console.log(err)
    throw json({errors: [{message: err.message}]}, 400)
  }
  console.log('event', event)

  console.log('event.data.object.metadata', event.data.object.metadata)

  const metadata = event.data.object.metadata
  console.log(
    'data',
    Number(event.data.object.amount_total) / 100 - Number(metadata.tip),
  )

  if (event.data.object.payment_status === 'paid') {
    console.time('Creating...')
    try {
      await prisma.payments.create({
        data: {
          amount:
            Number(event.data.object.amount_total) / 100 - Number(metadata.tip),
          method: metadata.paymentMethod,
          orderId: metadata.orderId,
          tip: Number(metadata.tip),
          total: Number(event.data.object.amount_total) / 100,
          branchId: metadata.branchId,
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
