import { redirect } from '@remix-run/node'

import { prisma } from '~/db.server'

import { validateCreateTables } from './validations.server'

export function getExistingTable(tableNumber: string, branchId: string) {
  return prisma.table.findFirst({
    where: {
      number: Number(tableNumber),
      branchId: branchId,
    },
  })
}

export function getTable(tableId: string, includes = {} as any) {
  return prisma.table.findFirst({
    where: { id: tableId },
    include: includes,
  })
}

export function deleteTable(tableId: string) {
  return prisma.table.delete({
    where: { id: tableId },
  })
}

export function createTable(tableNumber: string, branchId: string) {
  return prisma.table.create({
    data: {
      number: Number(tableNumber),
      branchId: branchId,
    },
  })
}

export function updateTable(tableId: string, params: { number: string; seats: string }) {
  return prisma.table.update({
    where: { id: tableId },
    data: {
      number: Number(params.number),
      seats: Number(params.seats),
    },
  })
}

export async function handleAddAction(data: any, branchId: string, redirectTo: string) {
  const existingTable = data.number ? await getExistingTable(String(data.number), branchId) : null
  try {
    validateCreateTables(data, existingTable)
    await createTable(String(data.number), branchId)
    return redirect(redirectTo)
  } catch (error) {
    console.log('error', error)
    return error
  }
}

export async function handleEditAction(tableId: string, data: any, redirectTo: string) {
  await updateTable(tableId, { number: String(data.number), seats: String(data.seats) })
  return redirect(redirectTo)
}

export async function handleDeleteAction(tableId: string, redirectTo: string) {
  await deleteTable(tableId)
  return redirect(redirectTo)
}
