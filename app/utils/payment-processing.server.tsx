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
  const employees = await prisma.employee.findMany({
    where: { branchId: extraData.branchId, active: true, role: 'waiter', phone: { startsWith: '521' } },
  })

  const user = await prisma.user.findUnique({ where: { id: userId } })
  const username = user?.name
  const table = await prisma.table.findUnique({ where: { id: extraData.tableId } })
  const tableNumber = table?.number
  const branch = await prisma.branch.findUnique({
    where: { id: extraData.branchId },
  })

  const branchName = branch?.name
  switch (paymentMethod) {
    case 'terminal': {
      sendWaNotification({
        body: `${branchName}: El cliente ${username} de la mesa ${tableNumber} quiere pagar en terminal fisica la cantidad de ${
          total + tip
        } pesos`,
        to: employees.map(employee => employee.phone),
      })
      const payment = await prisma.payments.create({
        data: {
          method: 'terminal',
          status: 'pending',
          amount: total,
          avoFee: 2.5,
          tip: tip,
          total: total + tip,
          branchId: extraData.branchId,
          userId: userId,
          orderId: extraData.order.id,
          employees: {
            connect: employees.map(employee => ({ id: employee.id })),
          },
        },
      })

      await prisma.notification.create({
        data: {
          message: `${branchName}: El cliente ${username} de la mesa ${tableNumber} quiere pagar con la terminal un monto: $${total}, propina: ${tip} un total de ${
            total + tip
          } pesos`,
          type: 'informative',
          branchId: extraData.branchId,
          tableId: extraData.tableId,
          userId: userId,
          orderId: extraData.order.id,
          paymentId: payment.id,
          status: 'pending',
          type_temp: 'PAYMENT',
          employees: {
            connect: employees.map(employee => ({ id: employee.id })),
          },
        },
      })
      EVENTS.ISSUE_CHANGED(extraData.tableId, extraData.branchId)

      return { type: 'redirect', url: '..' }
    }
    case 'card': {
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
    }
    case 'cash': {
      sendWaNotification({
        body: `${branchName}: El cliente  ${username} de la mesa ${tableNumber} quiere pagar en efectivo la cantidad de ${
          total + tip
        } pesos`,
        to: employees.map(employee => employee.phone),
      })
      const payment = await prisma.payments.create({
        data: {
          method: 'cash',
          status: 'pending',
          amount: total,
          tip: tip,
          avoFee: 2.5,
          total: total + tip,
          branchId: extraData.branchId,
          userId: userId,
          orderId: extraData.order.id,
          employees: {
            connect: employees.map(employee => ({ id: employee.id })),
          },
        },
      })

      await prisma.notification.create({
        data: {
          message: `${branchName}: El cliente  ${username} de la mesa ${tableNumber} quiere pagar en efectivo un monto: $${total}, propina: ${tip} un total de ${
            total + tip
          } pesos`,
          type: 'PAYMENT',
          paymentId: payment.id,

          branchId: extraData.branchId,
          tableId: extraData.tableId,
          userId: userId,
          orderId: extraData.order.id,
          status: 'pending',
          type_temp: 'PAYMENT',

          employees: {
            connect: employees.map(employee => ({ id: employee.id })),
          },
        },
      })
      EVENTS.ISSUE_CHANGED(extraData.tableId, extraData.branchId)

      return { type: 'redirect', url: '..' }
    }
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
