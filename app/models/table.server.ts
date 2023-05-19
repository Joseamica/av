import {prisma} from '~/db.server'

export function getTable(tableId: string) {
  return prisma.table.findFirst({
    where: {id: tableId},
  })
}
