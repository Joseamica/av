import { prisma } from '~/db.server'

export function isUserAdmin(userId: string) {
  return prisma.admin.findFirst({
    where: {
      userId: userId,
      access: { gte: 2 },
    },
  })
}
