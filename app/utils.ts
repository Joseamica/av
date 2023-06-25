import {Branch, Order, Table} from '@prisma/client'
import {Decimal} from '@prisma/client/runtime'
import {useMatches} from '@remix-run/react'
import {useMemo} from 'react'

import type {User} from '~/models/user.server'
import {prisma} from './db.server'
import {getMenu} from './models/menu.server'
import {getBranchId} from './models/branch.server'
import invariant from 'tiny-invariant'
import clsx from 'clsx'
import {getOrder} from './models/order.server'

const DEFAULT_REDIRECT = '/'

/**
 * This should be used any time the redirect path is user-provided
 * (Like the query string on our login/signup pages). This avoids
 * open-redirect vulnerabilities.
 * @param {string} to The redirect destination
 * @param {string} defaultRedirect The redirect to use if the to is unsafe.
 */
export function safeRedirect(
  to: FormDataEntryValue | string | null | undefined,
  defaultRedirect: string = DEFAULT_REDIRECT,
) {
  if (!to || typeof to !== 'string') {
    return defaultRedirect
  }

  if (!to.startsWith('/') || to.startsWith('//')) {
    return defaultRedirect
  }

  return to
}

/**
 * This base hook is used in other hooks to quickly search for specific data
 * across all loader data using useMatches.
 * @param {string} id The route id
 * @returns {JSON|undefined} The router data or undefined if not found
 */
export function useMatchesData(
  id: string,
): Record<string, unknown> | undefined {
  const matchingRoutes = useMatches()
  const route = useMemo(
    () => matchingRoutes.find(route => route.id === id),
    [matchingRoutes, id],
  )
  return route?.data
}

function isUser(user: any): user is User {
  return user && typeof user === 'object' && typeof user.email === 'string'
}

export function useOptionalUser(): User | undefined {
  const data = useMatchesData('root')
  if (!data || !isUser(data.user)) {
    return undefined
  }
  return data.user
}

export function useUser(): User {
  const maybeUser = useOptionalUser()
  if (!maybeUser) {
    throw new Error(
      'No user found in root loader, but user is required by useUser. If user is optional, try useOptionalUser instead.',
    )
  }
  return maybeUser
}

export async function getFundamentals() {
  return null
}

export function validateEmail(email: unknown): email is string {
  return typeof email === 'string' && email.length > 3 && email.includes('@')
}

export function getTotal(order: Order) {
  return null
}

export function formatCurrency(currency: string, amount: number | Decimal) {
  switch (currency) {
    case '$':
      return `$ ${Number(amount).toFixed(1)}`
    case '€':
      return `${Number(amount).toFixed(1)} €`
    default:
      return `${Number(amount).toFixed(1)}`
  }
}

export async function getCurrency(tableId: Table['id']) {
  let branchId = null

  if (!branchId) {
    branchId = await getBranchId(tableId)
  }
  invariant(branchId, 'branchId should be defined')

  const currency = await getMenu(branchId).then(
    (menu: Menu) => menu?.currency || 'mxn',
  )

  switch (currency) {
    case 'mxn':
      return '$'
    case 'usd':
      return '$'
    case 'eur':
      return '€'
    default:
      return '$'
  }
}

export function getHour() {
  const now = new Date()
  const hours = now.getHours()
  const minutes = now.getMinutes()

  const timeNow = Number(`${hours}.${String(minutes).padStart(2, '0')}`)
  return timeNow
}
export function getDateTime() {
  const now = new Date()
  const day = String(now.getDate()).padStart(2, '0')
  const month = String(now.getMonth() + 1).padStart(2, '0') // JS months start at 0
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')

  const timeNow = `${day}/${month}:${hours}.${minutes}`
  return timeNow
}

export async function getAmountLeftToPay(
  tableId: Table['id'],
  // orderId?: Order[`id`],
) {
  const order = await getOrder(tableId)
  if (order) {
    const payments = await prisma.payments.aggregate({
      where: {orderId: order.id},
      _sum: {amount: true},
    })

    const totalPayments = Number(payments._sum.amount)
    const getTotalBill = await prisma.order.aggregate({
      _sum: {total: true},
      where: {id: order.id},
    })
    const totalBill = Number(getTotalBill._sum.total)
    return Number(totalBill - totalPayments)
  }
}

export function getRandomColor() {
  let color = '#'
  for (let i = 0; i < 3; i++) {
    const value = Math.floor(Math.random() * 100) + 100 // adjust range as needed
    color += value.toString(16)
  }
  return color
}
