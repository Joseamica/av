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
    prisma.branch.findFirst({
      where: {id: branchId},
      select: {firstTip: true, secondTip: true, thirdTip: true},
    }) || {firstTip: 12, secondTip: 12, thirdTip: 15}
  )
}

export async function getPaymentMethods(tableId: Table['id']) {
  const branchId = await getBranchId(tableId)
  return (
    prisma.branch.findFirst({
      where: {id: branchId},
      select: {
        firstPaymentMethod: true,
        secondPaymentMethod: true,
        thirdPaymentMethod: true,
        fourthPaymentMethod: true,
      },
    }) || {
      firstPaymentMethod: 'cash',
      secondPaymentMethod: 'card',
      thirdPaymentMethod: 'paypal',
      fourthPaymentMethod: 'apple pay',
    }
  )
}
