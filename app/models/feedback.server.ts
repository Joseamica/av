import { prisma } from '~/db.server'

import { getBranchId } from './branch.server'

import { getDateTime } from '~/utils'

export async function createFeedBack(
  type: string,
  report: string,
  comments: string,
  tableId: string,
  userId: string,
  selected?: string[],
  connectTo?: string,
) {
  const date = getDateTime()

  // Prepare the connect data
  const connectData = selected ? selected.map(id => ({ id })) : []
  const branchId = await getBranchId(tableId)

  return prisma.feedback.create({
    data: {
      report,
      type,
      comments,
      tableId,
      branchId,
      userId,
      // Dynamically set the property name using square bracket notation
      ...(connectTo ? { [connectTo]: { connect: connectData } } : {}),
    },
  })
}
