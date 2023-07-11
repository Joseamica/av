import type { Branch, Order, Table, User } from '@prisma/client'
import { prisma } from '~/db.server'

/**
 *
 * @param tableId
 *
 * @returns order that has the flag "Active" = true
 */
export function getOrder(tableId: Table['id']) {
  return prisma.order.findFirst({
    where: { tableId, active: true },
  })
}

export async function findOrCreateOrder(
  branchId: Branch['id'],
  tableId: Table['id'],
  userId: User['id'],
) {
  const order = await prisma.order.findFirst({
    where: {
      tableId,
    },
    include: {
      users: true,
    },
  })

  if (!order && tableId) {
    return await prisma.order.create({
      data: {
        paid: false,
        active: true,
        creationDate: new Date(),
        orderedDate: new Date(),
        branch: {
          connect: {
            id: branchId,
          },
        },
        table: {
          connect: {
            id: tableId,
          },
        },
        users: {
          connect: {
            id: userId,
          },
        },
      },
    })
  }

  return order
}

export function getOrderTotal(orderId: Order['id']) {
  return prisma.order.findUnique({
    where: { id: orderId },
    select: { total: true },
  })
}

export async function assignExpirationAndValuesToOrder(
  amountLeft: number,
  tip: number,
  total: number,
  order: Order | null,
) {
  if (!order) {
    return null
  }
  console.time('⏲️Expiration begins and order is updated')
  if (amountLeft <= total) {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paid: true,
        paidDate: new Date(),
        tip: Number(order?.tip) + tip,
      },
    })

    return console.log('⏲️Expiration begins and order is updated')
  }
}
