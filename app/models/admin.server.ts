import { prisma } from '~/db.server'

export function isUserAdmin(userId: string, name: string) {
  return prisma.user.findFirst({
    where: { id: userId, roles: { some: { permissions: { some: { name } } } } },
  })
}
