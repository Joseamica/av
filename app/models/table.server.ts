import {prisma} from '~/db.server'

export function getTable(tableId: string) {
  return prisma.table.findUnique({
    where: {id: tableId},
  })
}
