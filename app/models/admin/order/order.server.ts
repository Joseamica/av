import { prisma } from '~/db.server'

export function getOrder(orderId: string, includes = {} as any) {
  return prisma.order.findFirst({
    where: { id: orderId },
    include: includes,
  })
}
