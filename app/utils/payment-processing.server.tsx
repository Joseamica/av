// PaymentProcessing.js
import { prisma } from '~/db.server'
import { getSession } from '~/session.server'

import { getDomainUrl, getStripeSession } from './stripe.server'

import { createQueryString } from '~/utils'

interface handlePaymentProcessingProps {
  paymentMethod: string
  total: number
  tip: number
  currency: string
  isOrderAmountFullPaid: boolean
  request: Request
  redirectTo: string
  typeOfPayment: string
  extraData?: any
  itemData?: string
}

/**
 *
 * @param paymentMethod
 * @param total
 * @param tip
 * @param currency
 * @param isOrderAmountFullPaid
 * @param request
 * @param redirectTo
 * @param typeOfPayment
 * @param extraData
 * @returns Promise<{ type: 'redirect'; url: string } | { type: 'error'; message: string }>
 */
export async function handlePaymentProcessing({
  paymentMethod,
  total,
  tip,
  currency,
  isOrderAmountFullPaid,
  request,
  redirectTo,
  typeOfPayment,
  extraData,
  itemData,
}: handlePaymentProcessingProps): Promise<{ type: 'redirect'; url: string } | { type: 'error'; message: string }> {
  const session = await getSession(request)
  const userId = session.get('userId')
  switch (paymentMethod) {
    case 'card':
      try {
        const stripeRedirectUrl = await getStripeSession(
          total * 100 + tip * 100,
          isOrderAmountFullPaid,
          getDomainUrl(request) + redirectTo,
          currency,
          tip,
          paymentMethod,
          'custom',
          extraData,
        )
        return { type: 'redirect', url: stripeRedirectUrl }
      } catch (error) {
        console.error('Failed to create payment session:', error)
        return { type: 'redirect', url: '/error' }
      }
    case 'cash':
      await prisma.notification.create({
        data: {
          message: `${total + tip}`,
          method: 'push',
          status: 'pending',
          type: 'payment',
          branchId: extraData.branchId,
          tableId: extraData.tableId,
          userId: userId,
        },
      })
      const params = {
        typeOfPayment,
        amount: total + tip,
        tip: tip,
        paymentMethod: paymentMethod,
        isOrderAmountFullPaid: isOrderAmountFullPaid,
        itemData,
      }
      const queryString = createQueryString(params)

      return {
        type: 'redirect',
        url: `${redirectTo}/payment/success?${queryString}`,
      }
  }

  return { type: 'error', message: `Unknown payment method: ${paymentMethod}` }
}
