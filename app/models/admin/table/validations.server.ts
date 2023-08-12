import type { Table } from '@prisma/client'

function isValidNumber(number: number) {
  return number > 0 && !isNaN(number)
}

function isValidSeats(seats: number) {
  console.log('seats', seats)
  return seats > 0 && !isNaN(seats)
}

function isExistingTable(existingTable: Table | null) {
  return existingTable === null
}
export function validateCreateTables(input: any, existingTable: Table | null) {
  let validationErrors = {} as any

  if (!isValidNumber(Number(input.number))) {
    validationErrors.number = 'El numero de mesa debe ser mayor o igual 0'
  }

  if (!isValidSeats(input.seats)) {
    validationErrors.seats = 'El numero de asientos debe ser mayor a 0'
  }

  if (!isExistingTable(existingTable)) {
    validationErrors.number = 'El numero de mesa ya existe'
  }

  if (Object.keys(validationErrors).length > 0) {
    throw validationErrors
  }
}
