import {Table} from '@prisma/client'
import {prisma} from '~/db.server'

export function getBranch(tableId: string) {
  return prisma.branch.findFirst({
    where: {
      table: {
        some: {
          id: tableId,
        },
      },
    },
  })
}

export async function getBranchId(tableId: Table['id']) {
  const branch = await getBranch(tableId)
  return branch?.id
}
