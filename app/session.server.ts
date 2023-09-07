import { type Session, createCookieSessionStorage, redirect } from '@remix-run/node'

import type { CartItem } from '@prisma/client'
import invariant from 'tiny-invariant'
import { v4 as uuidv4 } from 'uuid'

import type { User } from '~/models/user.server'
import { getUserById } from '~/models/user.server'

invariant(process.env.SESSION_SECRET, 'SESSION_SECRET must be set')

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: '__session',
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    // expires: new Date('1970-01-01'), // Set a past date so the cookie is deleted when the browser closes
    secrets: [process.env.SESSION_SECRET],
    secure: process.env.NODE_ENV === 'production',
  },
})

export let { commitSession, destroySession } = sessionStorage

const USER_SESSION_KEY = 'userId'
let cartSessionKey = 'cart'
const USER_TOTAL_SESSION_KEY = 'total'

export async function getSession(request: Request) {
  const cookie = request.headers.get('Cookie')
  return sessionStorage.getSession(cookie)
}

export async function sessionActions(request: Request) {
  let session = await getSession(request)
  return {
    commitSession() {
      return sessionStorage.commitSession(session)
    },
    async getCart(): Promise<CartItem[]> {
      let cart = JSON.parse(session.get(cartSessionKey) || '[]')
      return cart
    },
  }
}

// ! USER METHODS ESTOS METHODOS EN REALIDAD SIRVEN?
export async function getUserId(session: Session): Promise<User['id']> {
  const userId: User['id'] = session.get(USER_SESSION_KEY)
  return userId ?? `guest-${uuidv4()}`
}

export async function getAdminId(request: Request) {
  const session = await getSession(request)
  const adminId = session.get('adminId')
  if (adminId === undefined) return null
  return adminId
}

export async function getUsername(session: Session) {
  const username: string = session.get('username')

  if (username === undefined) return null

  return username
}
// ! END USER METHODS

export async function getTotal(request: Request) {
  const session = await getSession(request)
  const total = session.get(USER_TOTAL_SESSION_KEY)

  if (total === undefined) return null

  if (total) return total
}

export async function getUser(request: Request) {
  const userId = await getUserId(request)
  if (userId === undefined) return null

  const user = await getUserById(userId)
  if (user) return user

  throw await logout(request)
}

export async function requireUserId(request: Request, redirectTo: string = new URL(request.url).pathname) {
  const userId = await getUserId(request)
  if (!userId) {
    const searchParams = new URLSearchParams([['redirectTo', redirectTo]])
    throw redirect(`/login?${searchParams}`)
  }
  return userId
}

export async function requireUser(request: Request) {
  const userId = await requireUserId(request)

  const user = await getUserById(userId)
  if (user) return user

  throw await logout(request)
}

export async function createUserSession({
  adminId,
  request,
  userId,
  username,
  remember,
  redirectTo,
}: {
  adminId?: string
  request: Request
  userId: string
  username: string
  remember: boolean
  redirectTo: string
}) {
  const session = await getSession(request)
  session.set(USER_SESSION_KEY, userId)
  session.set('username', username)
  session.unset('employeeId')

  if (adminId) {
    session.set('adminId', adminId)
  }
  return redirect(adminId ? '/admin' : redirectTo, {
    headers: {
      'Set-Cookie': await sessionStorage.commitSession(session, {
        maxAge: remember
          ? 60 * 60 * 24 * 7 // 7 days
          : undefined,
      }),
    },
  })
}

export async function createEmployeeSession({
  request,
  employeeId,
  remember,
  redirectTo,
}: {
  request: Request
  employeeId: string
  remember: boolean
  redirectTo: string
}) {
  const session = await getSession(request)
  session.set('employeeId', employeeId)
  session.unset(USER_SESSION_KEY)
  return redirect(redirectTo, {
    headers: {
      'Set-Cookie': await sessionStorage.commitSession(session, {
        maxAge: remember
          ? 60 * 60 * 24 * 7 // 7 days
          : undefined,
      }),
    },
  })
}

export async function logout(request: Request, path = '/') {
  const session = await getSession(request)

  session.unset(USER_SESSION_KEY)
  session.unset('username')
  session.unset('user_color')
  session.unset('cart')
  session.unset('tableId')
  session.unset('employeeId')
  return redirect(`/login`, {
    headers: {
      // 'Set-Cookie': await sessionStorage.commitSession(session),
      'Set-Cookie': await sessionStorage.destroySession(session),
    },
  })
}

export function addToCart(cart: CartItem[], variantId: string, quantity: number, modifiers: string[]) {
  let added = false
  for (let item of cart) {
    if (item.variantId === variantId) {
      item.quantity += quantity
      added = true
      break
    }
  }
  if (!added) {
    cart.push({ variantId, quantity, modifiers })
  }
  return cart
}

export function removeCartItem(cart: CartItem[], variantId: string) {
  return cart.filter(item => item.variantId !== variantId)
}

export function updateCartItem(cart: CartItem[], variantId: string, quantity: number) {
  let updated = false
  for (let item of cart) {
    if (item.variantId === variantId) {
      console.log('item.quantity', item.quantity)
      if (quantity === 0) {
        return removeCartItem(cart, variantId)
      }
      item.quantity = quantity
      updated = true
      break
    }
  }
  if (!updated) {
    cart.push({ variantId, quantity })
  }
  return cart
}

//DELETE because orderId only is being used by only 1 user, we need a order to share
// export async function getOrderId(request: Request) {
//   const session = await getSession(request)
//   const orderId = session.get(ORDER_SESSION_KEY)
//   return orderId ?? uuidv4()
// }

export async function getUserDetails(session: Session) {
  return {
    userId: session.get(USER_SESSION_KEY),
    username: session.get('username'),
    user_color: session.get('user_color'),
  }
}
