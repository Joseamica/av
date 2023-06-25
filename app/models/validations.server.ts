import type {Branch, Order, Table, User} from '@prisma/client'
import {json} from '@remix-run/node'
import {prisma} from '~/db.server'
import {EVENTS} from '~/events'

export async function validateUserIntegration(
  userId: User['id'],
  tableId: Table['id'],
  username: string,
  branchId: Branch['id'],
) {
  // If user is not in table, then connect
  const isUserInTable = await prisma.user
    .findFirst({where: {id: userId, tableId}})
    .then(user => (user ? true : false))

  if (!isUserInTable) {
    console.log(`🔌 Connecting '${username}' to the table`)

    await prisma.user.update({
      where: {id: userId},
      data: {
        tableId: tableId,
        branchId,
      },
    })
    console.log(`✅ Connected '${username}' to the table`)
    EVENTS.ISSUE_CHANGED(tableId)
  }

  //If user is not in order, then connect
  const order = await prisma.order.findFirst({
    where: {tableId, active: true},
  })

  const isUserInOrder = await prisma.user
    .findFirst({
      where: {id: userId, orderId: order?.id},
    })
    .then(user => (user ? true : false))

  if (!isUserInOrder) {
    console.log(`🔌 Connecting '${username}' to the order`)
    await prisma.order.update({
      where: {id: order?.id},
      data: {users: {connect: {id: userId}}},
    })
    console.log(`✅ Connected '${username}' to the order`)
  }

  // When user is already in both table and order
  if (isUserInTable && isUserInOrder) {
    return json({success: true})
  }
}

//CUSTOMPAY
function isValidAmount(amount: number) {
  return amount > 0 && !isNaN(amount)
}

function isValidTip(tip: number) {
  return tip >= 0
}

function isValidPaymentMethod(paymentMethod: string) {
  return paymentMethod !== undefined
}

export function validateCustom(input: any) {
  let validationErrors = {} as any

  if (!isValidAmount(input.amountToPay)) {
    validationErrors.amountToPay = 'El monto debe ser mayor a 0'
  }

  if (!isValidTip(input.tipPercentage)) {
    validationErrors.tipPercentage = 'La propina debe ser mayor o igual a 0'
  }

  if (!isValidPaymentMethod(input.paymentMethod)) {
    validationErrors.paymentMethod = 'Selecciona un método de pago'
  }

  if (Object.keys(validationErrors).length > 0) {
    throw validationErrors
  }
}

export function validateFullPay(input: any) {
  let validationErrors = {} as any

  if (!isValidTip(input.tipPercentage)) {
    validationErrors.tipPercentage = 'La propina debe ser mayor o igual a 0'
  }

  if (!isValidPaymentMethod(input.paymentMethod)) {
    validationErrors.paymentMethod = 'Selecciona un método de pago'
  }

  if (Object.keys(validationErrors).length > 0) {
    throw validationErrors
  }
}
