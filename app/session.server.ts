import {CartItem} from '@prisma/client'
import {createCookieSessionStorage, redirect} from '@remix-run/node'
import invariant from 'tiny-invariant'
import {v4 as uuidv4} from 'uuid'

import type {User} from '~/models/user.server'
import {getUserById} from '~/models/user.server'
import {prisma} from './db.server'

invariant(process.env.SESSION_SECRET, 'SESSION_SECRET must be set')

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: '__session',
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secrets: [process.env.SESSION_SECRET],
    secure: process.env.NODE_ENV === 'production',
  },
})

const USER_SESSION_KEY = 'userId'
let cartSessionKey = 'cart'
const USER_TOTAL_SESSION_KEY = 'total'
const RANDOM_COLOR = '#' + (((1 << 24) * Math.random()) | 0).toString(16)

export async function getSession(request: Request) {
  const cookie = request.headers.get('Cookie')
  let session = await sessionStorage.getSession(cookie)

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

export async function getUserId(request: Request): Promise<User['id']> {
  const session = await getSession(request)
  const userId = session.get(USER_SESSION_KEY)
  return userId ?? `guest-${uuidv4()}`
}
//DELETE because orderId only is being used by only 1 user, we need a order to share
// export async function getOrderId(request: Request) {
//   const session = await getSession(request)
//   const orderId = session.get(ORDER_SESSION_KEY)
//   return orderId ?? uuidv4()
// }

export async function getUsername(request: Request) {
  const session = await getSession(request)
  const username = session.get('username')

  if (username === undefined) return null

  if (username) return username
}

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

export async function requireUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname,
) {
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
  request,
  userId,
  remember,
  redirectTo,
}: {
  request: Request
  userId: string
  remember: boolean
  redirectTo: string
}) {
  const session = await getSession(request)
  session.set(USER_SESSION_KEY, userId)
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

export async function logout(request: Request) {
  const session = await getSession(request)
  return redirect('/', {
    headers: {
      'Set-Cookie': await sessionStorage.destroySession(session),
    },
  })
}

export function addToCart(
  cart: CartItem[],
  variantId: string,
  quantity: number,
  modifiers: string[],
) {
  let added = false
  for (let item of cart) {
    if (item.variantId === variantId) {
      item.quantity += quantity
      added = true
      break
    }
  }
  if (!added) {
    cart.push({variantId, quantity, modifiers})
  }
  return cart
}

export function removeCartItem(cart: CartItem[], variantId: string) {
  return cart.filter(item => item.variantId !== variantId)
}

export function updateCartItem(
  cart: CartItem[],
  variantId: string,
  quantity: number,
) {
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
    cart.push({variantId, quantity})
  }
  return cart
}
