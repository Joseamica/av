import type {ActionArgs} from '@remix-run/node'
import {json} from '@remix-run/node'
import Stripe from 'stripe'
import {prisma} from '~/db.server'
import {EVENTS} from '~/events'
import {getUserId} from '~/session.server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
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

  const metadata = event.data.object.metadata
  if (event.data.object.payment_status === 'paid') {
    console.time('Creating...')
    // const userId = await getUserId(request)
    await prisma.payments.create({
      data: {
        id: event.data.object.id,
        amount: Number(event.data.object.amount_total) / 100,
        method: metadata.paymentMethod,
        orderId: metadata.orderId,
        tip: Number(metadata.tip),
        branchId: metadata.branchId,
        userId: metadata.userId,
      },
    })
    EVENTS.ISSUE_CHANGED(metadata.sseURL)
    console.timeEnd('Creating...')
  }

  return new Response(null, {status: 200})
}
