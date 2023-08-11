import { prisma } from '~/db.server'

export function getExistingTable(tableNumber: string, branchId: string) {
  return prisma.table.findFirst({
    where: {
      number: Number(tableNumber),
      branchId: branchId,
    },
  })
}
