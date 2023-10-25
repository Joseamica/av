import type { Branch, PaymentMethod, User } from '@prisma/client'
import { prisma } from '~/db.server'

export function createPayment(
  paymentMethod: PaymentMethod,
  amount: number,
  tip: number,
  orderId: any,
  userId: User['id'],
  branchId?: Branch['id'],
) {
  // const time = getDateTime()
  return prisma.payments.create({
    data: {
      createdAt: new Date(),
      method: paymentMethod,
      amount: Number(amount),
      tip: Number(tip),
      total: Number(amount + tip),
      branchId,
      orderId,
      userId,
      status: 'accepted',
    },
  })
}
