import { useMatches } from '@remix-run/react'
import { useMemo } from 'react'

import type { Order, Table } from '@prisma/client'
import type { Decimal } from '@prisma/client/runtime'
import { format, utcToZonedTime } from 'date-fns-tz'
import invariant from 'tiny-invariant'

import type { User } from '~/models/user.server'

import { prisma } from './db.server'
import { getBranchId } from './models/branch.server'
import { getMenu } from './models/menu.server'
import { getOrder } from './models/order.server'

const DEFAULT_REDIRECT = '/'

/**
 * This should be used any time the redirect path is user-provided
 * (Like the query string on our login/signup pages). This avoids
 * open-redirect vulnerabilities.
 * @param {string} to The redirect destination
 * @param {string} defaultRedirect The redirect to use if the to is unsafe.
 */
export function safeRedirect(to: FormDataEntryValue | string | null | undefined, defaultRedirect: string = DEFAULT_REDIRECT) {
  console.log('to', to)
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
export function useMatchesData(id: string): Record<string, unknown> | undefined {
  const matchingRoutes = useMatches()
  const route = useMemo(() => matchingRoutes.find(route => route.id === id), [matchingRoutes, id])
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
    throw new Error('No user found in root loader, but user is required by useUser. If user is optional, try useOptionalUser instead.')
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
      return `$${Number(amount).toFixed(1)}`
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

  const currency = await getMenu(branchId).then((menu: any) => menu?.currency || 'mxn')

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
  if (!order) return null

  const payments = await prisma.payments.aggregate({
    where: { orderId: order.id },
    _sum: { amount: true },
  })

  const totalPayments = Number(payments._sum.amount)
  const getTotalBill = await prisma.order.aggregate({
    _sum: { total: true },
    where: { id: order.id },
  })
  const totalBill = Number(getTotalBill._sum.total)
  return Number(totalBill - totalPayments)
}

export function getRandomColor() {
  let color = '#'
  for (let i = 0; i < 3; i++) {
    const value = Math.floor(Math.random() * 100) + 100 // adjust range as needed
    color += value.toString(16)
  }
  return color
}

export async function getDateTimeTz(tableId: string) {
  const branchId = await getBranchId(tableId)

  const timeZone = await prisma.branch
    .findUnique({
      where: { id: branchId },
      select: { timezone: true },
    })
    .then(branch => branch?.timezone)

  if (!timeZone) {
    return null
  }

  const date = new Date()

  const zonedDate = utcToZonedTime(date, timeZone)
  // zonedDate could be used to initialize a date picker or display the formatted local date/time

  // Set the output to "1.9.2018 18:01:36.386 GMT+02:00 (CEST)"
  const pattern = "d.M.yyyy HH:mm:ss.SSS 'GMT' XXX (z)"
  const output = format(zonedDate, pattern, {
    timeZone: 'America/Mexico_City',
  })
  const d = new Date(output)
  console.log('d', d)
  return output
}

export function isOrderExpired(orderPaidDate: Date | null, hoursToExpire = 2) {
  if (!orderPaidDate) {
    return null
  }
  const MILLISECONDS_IN_AN_HOUR = 3600000
  const currentDate = new Date()
  const expiryDate = new Date(orderPaidDate.getTime() + hoursToExpire * MILLISECONDS_IN_AN_HOUR)

  return currentDate.getTime() >= expiryDate.getTime()
}

export function getTableIdFromUrl(pathname: string) {
  let segments = pathname.split('/')
  let tableIndex = segments.indexOf('table')
  let tableId = segments[tableIndex + 1]
  return tableId
}

export function getMenuIdFromUrl(pathname: string) {
  let segments = pathname.split('/')
  let menuIndex = segments.indexOf('menu')
  let menuId = segments[menuIndex + 1]
  return menuId
}

const TRANSLATIONS = {
  en: {
    card: 'Card',
    cash: 'Cash',
    paypal: 'Paypal',
  },
  es: {
    card: 'Tarjeta',
    cash: 'Efectivo',
    paypal: 'Paypal',
  },
}

export function Translate(wishLanguage, textToTranslate) {
  return TRANSLATIONS[wishLanguage][textToTranslate] || textToTranslate
}

export function createQueryString(params) {
  let queryString = ''
  for (const key in params) {
    if (queryString !== '') {
      queryString += '&'
    }
    queryString += `${key}=${encodeURIComponent(params[key])}`
  }
  return queryString
}

export async function getIsDvctTokenExpired() {
  const dvct = await prisma.deliverect.findFirst({})
  const dvctExpiration = dvct.deliverectExpiration
  const dvctToken = dvct.deliverectToken

  const currentTime = Math.floor(Date.now() / 1000) // Get the current time in Unix timestamp
  if (!dvctToken || !dvctExpiration) {
    console.log('%cutils.ts line:256 🔴  dvctToken or dvctExpiration on db is null', 'color: #007acc;')
    return true
  }
  const isTokenExpired = dvct && dvctExpiration <= currentTime ? true : false
  console.log('isDvctTokenExpired', isTokenExpired === false ? '🟢 token is not expired' : '🔴 needs to refresh!')
  return isTokenExpired
}

export function getUrl(name: string, pathname: string, params?: { userId?: string }) {
  const tableId = getTableIdFromUrl(pathname)
  const menuId = getMenuIdFromUrl(pathname)
  const mainPath = `/table/${tableId}`
  const menuIdPath = `${mainPath}/menu/${menuId}`

  switch (name) {
    case 'userProfile':
      return `${mainPath}/user/${params.userId}?redirect=${pathname}`
    case 'back':
      return `${mainPath}`
    case 'main':
      return mainPath
    case 'search':
      return `${menuIdPath}/search`
  }
}

export function getSearchParams({ request }) {
  return new URL(request.url).searchParams
}

export const dayOfWeek = number => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  return days[number - 1]
}
export function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export const isValidE164Number = phoneNumber => {
  const e164Regex = /^\+[1-9]\d{1,14}$/
  return e164Regex.test(phoneNumber)
}
