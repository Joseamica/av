import { prisma } from '~/db.server'

export function getOrder(orderId: string, includes = {} as any) {
  return prisma.order.findFirst({
    where: { id: orderId },
    orderBy: { createdAt: 'asc' },
    include: includes,
  })
}
