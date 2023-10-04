// PaymentProcessing.js
import { prisma } from '~/db.server'
import { getSession } from '~/session.server'
import { sendWaNotification } from '~/twilio.server'

import { EVENTS } from '~/events'

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

  const username = await prisma.user.findUnique({ where: { id: userId } }).then(user => user?.name)
  const tableNumber = await prisma.table.findUnique({ where: { id: extraData.tableId } }).then(table => table?.number)

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
      // sendWaNotification({ body: `El cliente ha pagado en efectivo la cantidad de ${total + tip} pesos`, to: '525512956265' })
      await prisma.notification.create({
        data: {
          message: `Cash payment`,
          amount: total,
          tip: tip,
          total: total + tip,
          method: 'push',
          status: 'pending',
          type: 'cash payment',
          branchId: extraData.branchId,
          tableId: extraData.tableId,
          userId: userId,
          orderId: extraData.order.id,
        },
      })
      await prisma.notification.create({
        data: {
          message: `Usuario ${username} de la mesa ${tableNumber} quiere pagar en efectivo un monto: $${total}, propina: ${tip} un total de ${
            total + tip
          } pesos`,
          type: 'informative',
          branchId: extraData.branchId,
          tableId: extraData.tableId,
          userId: userId,
          orderId: extraData.order.id,
          status: 'received',
        },
      })
      EVENTS.ISSUE_CHANGED(extraData.tableId)

      return { type: 'redirect', url: '..' }
    //NOTE: HABILITATE THIS WHEN WE WANT TO CREATE THE PAYMENT WITHOUT AUTORIZATION
    // const params = {
    //   typeOfPayment,
    //   amount: total + tip,
    //   tip: tip,
    //   paymentMethod: paymentMethod,
    //   isOrderAmountFullPaid: isOrderAmountFullPaid,
    //   itemData,
    // }
    // const queryString = createQueryString(params)

    // return {
    //   type: 'redirect',
    //   url: `${redirectTo}/payment/success?${queryString}`,
    // }
  }

  return { type: 'error', message: `Unknown payment method: ${paymentMethod}` }
}
