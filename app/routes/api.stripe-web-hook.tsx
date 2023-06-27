import type {PaymentMethod} from '@prisma/client'
import type {ActionArgs} from '@remix-run/node'
import {json} from '@remix-run/node'
import Stripe from 'stripe'
import {prisma} from '~/db.server'
import {EVENTS} from '~/events'
import {assignUserNewPayments} from '~/models/user.server'
// import { getUserId } from "~/session.server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15',
})

interface Metadata {
  isOrderAmountFullPaid: boolean
  tip: string
  paymentMethod: PaymentMethod
  orderId: string
  branchId: string
  userId: string
  sseURL: string
  typeOfPayment: string
  extraData: string
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
    if (event.type === 'checkout.session.expired') {
      console.log('❌ se ha expirado la sesión de pago')
    }
  } catch (err: any) {
    console.log(err)
    throw json({errors: [{message: err.message}]}, 400)
  }

  // console.log('event', event)

  const stripeSession = event.data.object as Stripe.Checkout.Session
  const metadata = stripeSession.metadata ?? ({} as Metadata)
  const extraData = metadata.extraData ? JSON.parse(metadata.extraData) : null
  const paymentIntentId = stripeSession.payment_intent as string
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

  if (paymentIntent.status === 'succeeded') {
    try {
      const amount =
        Number(stripeSession.amount_total) / 100 - Number(metadata.tip)
      const tip = Number(metadata.tip)
      const total = Number(stripeSession.amount_total) / 100

      //NOTE - get and update user tip,paid,total
      await assignUserNewPayments(metadata.userId, amount, tip)

      console.time('Creating...')

      if (metadata.isOrderAmountFullPaid === 'true') {
        const order = await prisma.order.findFirst({
          where: {id: metadata.orderId, active: true},
        })
        await prisma.order.update({
          where: {id: metadata.orderId},
          data: {
            paid: true,
            paidDate: new Date(),
            tip: Number(order?.tip) + tip,
          },
        })
      }
      await prisma.payments.create({
        data: {
          amount: amount,
          method: metadata.paymentMethod as PaymentMethod,
          orderId: metadata.orderId,
          tip: tip,
          total: total,
          branchId: metadata.branchId,
          userId: metadata.userId,
        },
      })
      if (metadata.typeOfPayment === 'perDish') {
        const user = await prisma.user.findUnique({
          where: {id: metadata.userId},
        })
        const userName = user?.name
        const itemData = extraData
        await updatePaidItemsAndUserData(itemData, userName || '')
      }
      if (metadata.typeOfPayment === 'fullpay') {
        await prisma.order.update({
          where: {id: metadata.orderId},
          data: {
            active: false,
            paid: true,
            paidDate: new Date(),
          },
        })
      }

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

const updatePaidItemsAndUserData = async (
  itemData: {itemId: string; price: string}[],
  userName: string,
) => {
  // Loop through items and update price and paid
  for (const {itemId} of itemData) {
    const cartItem = await prisma.cartItem.findUnique({where: {id: itemId}})
    if (cartItem) {
      await prisma.cartItem.update({
        where: {id: itemId},
        data: {paid: true, paidBy: userName},
      })
    }
  }
}
