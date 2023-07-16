import type {Branch, Table} from '@prisma/client'
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

export async function getTipsPercentages(tableId: Table['id']) {
  const branchId = await getBranchId(tableId)
  return (
    prisma.branch
      .findFirst({
        where: {id: branchId},
        select: {tipsPercentages: true},
      })
      .then(branch => branch?.tipsPercentages) ??
    {tipsPercentages: ['10', '12', '15']}.tipsPercentages
  )
}

export async function getPaymentMethods(tableId: Table['id']) {
  const branchId = await getBranchId(tableId)
  const result = await prisma.branch.findFirst({
    where: {id: branchId},
    select: {
      // firstPaymentMethod: true,
      // secondPaymentMethod: true,
      // thirdPaymentMethod: true,
      // fourthPaymentMethod: true,
      paymentMethods: true,
    },
  })

  // Remove null fields
  if (result) {
    const nonNullResults = {}
    for (const [key, value] of Object.entries(result)) {
      if (value !== null) {
        nonNullResults[key] = value
      }
    }
    return nonNullResults
  } else {
    return null
  }
}
