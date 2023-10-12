import { type LoaderArgs, redirect } from '@remix-run/node'

import { type PaymentMethod } from '@prisma/client'
import { prisma } from '~/db.server'
import { getSession, getUserId, sessionStorage } from '~/session.server'
import { sendWaNotification } from '~/twilio.server'

import { getBranchId } from '~/models/branch.server'
import { assignExpirationAndValuesToOrder, getOrder } from '~/models/order.server'
import { getTable } from '~/models/table.server'
import { assignUserNewPayments } from '~/models/user.server'

import { EVENTS } from '~/events'

import { getAmountLeftToPay } from '~/utils'

export const loader = async ({ params, request }: LoaderArgs) => {
  const { tableId } = params

  const session = await getSession(request)
  const branchId = await getBranchId(tableId)
  const userId = await getUserId(session)
  const order = await getOrder(tableId)
  const user = await prisma.user.findUnique({ where: { id: userId } })
  const amountLeft = await getAmountLeftToPay(tableId)
  const table = await getTable(tableId)

  const searchParams = new URL(request.url).searchParams
  const paymentMethod = searchParams.get('paymentMethod')

  const typeOfPayment = searchParams.get('typeOfPayment')
  const total = Number(searchParams.get('amount'))
  const tip = Number(searchParams.get('tip'))
  const isOrderAmountFullPaid = searchParams.get('isOrderAmountFullPaid')
  const amount = Number(total) - Number(tip)

  await assignUserNewPayments(userId, amount, tip)
  await prisma.payments.create({
    data: {
      amount: amount,
      method: paymentMethod as PaymentMethod,
      orderId: order.id,
      tip: tip,
      total: amount + tip,
      branchId: branchId,
      userId: userId,
    },
  })

  if (isOrderAmountFullPaid === 'true') {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paid: true,
        paidDate: new Date(),
        tip: Number(order?.tip) + tip,
      },
    })
  }
  const username = user?.name
  const employeesNumbers = await prisma.employee
    .findMany({
      where: { branchId: branchId },
      select: { phone: true },
    })
    .then(employees => employees.map(employee => employee.phone))

  if (paymentMethod === 'cash') {
    console.log(
      `Usuario \x1b[34m${username}\x1b[0m de la mesa \x1b[32m${
        table.number
      }\x1b[0m ha pagado en efectivo ${amount},propina \x1b[33m${tip}\x1b[0m dando un total \x1b[35m${amount + tip}\x1b[0m`,
    )
    await prisma.notification.create({
      data: {
        message: `El usuario ${username} de la mesa ${table.number} quiere pagar en efectivo: ${amount} propina: ${tip} dando un total ${
          amount + tip
        }`,
        amount: amount,
        tip: tip,
        total: amount + tip,
        method: 'push',
        status: 'received',
        type: 'informative',
        branchId: branchId,
        tableId: tableId,
        userId: userId,
        orderId: order.id,
      },
    })
    sendWaNotification({
      to: employeesNumbers,
      body: `El usuario ${username} de la mesa ${table.number} quiere pagar en efectivo: ${amount} propina: ${tip} dando un total ${
        amount + tip
      }`,
    })
  } else if (paymentMethod === 'card') {
    console.log(
      `Usuario \x1b[34m${username}\x1b[0m de la mesa \x1b[32m${
        table.number
      }\x1b[0m ha pagado en tarjeta ${amount}, propina \x1b[33m${tip}\x1b[0m dando un total \x1b[35m${amount + tip}\x1b[0m`,
    )
    sendWaNotification({
      to: employeesNumbers,
      body: `El usuario ${username} de la mesa ${table.number} quiere pagar en tarjeta ${amount} propina: ${tip} dando un total ${
        amount + tip
      }`,
    })
  }

  switch (typeOfPayment) {
    case 'cartPay':
      session.flash('notification', 'Haz pagado productos con éxito')
      session.unset('cart')
      //TODO assign payments to dishes connect to user
      // await updatePaidItemsAndUserData(itemData, username || '')
      break
    case 'perDish':
      const itemData = searchParams.get('itemData') ? JSON.parse(searchParams.get('itemData')) : null
      await updatePaidItemsAndUserData(itemData, username || '')
      session.flash('notification', 'Pago realizado con éxito')
      break
    case 'full-bill':
      session.flash('notification', 'Haz pagado la cuenta completa con éxito')
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paid: true,
          paidDate: new Date(),
        },
      })
      break
    case 'custom':
      session.flash('notification', 'Pago realizado con éxito')
  }

  await assignExpirationAndValuesToOrder(amountLeft, tip, amount, order)
  EVENTS.ISSUE_CHANGED(tableId, branchId)

  return redirect(`/table/${tableId}`, {
    headers: { 'Set-Cookie': await sessionStorage.commitSession(session) },
  })
}

const updatePaidItemsAndUserData = async (itemData: { itemId: string; price: string }[], userName: string) => {
  // Loop through items and update price and paid
  for (const { itemId } of itemData) {
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
    })
    if (cartItem) {
      await prisma.cartItem.update({
        where: { id: itemId },
        data: { paid: true, paidBy: userName },
      })
    }
  }
}
