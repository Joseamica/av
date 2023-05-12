import type {Branch, Order, Table, User} from '@prisma/client'
import {prisma} from '~/db.server'

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
    where: {id: orderId},
    select: {total: true},
  })
}
