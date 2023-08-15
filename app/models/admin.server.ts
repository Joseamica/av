import { prisma } from '~/db.server'

export function isUserAdmin(userId: string) {
  return prisma.admin.findFirst({
    where: {
      user: {
        some: {
          id: userId,
        },
      },
      access: { gte: 2 },
    },
  })
}
