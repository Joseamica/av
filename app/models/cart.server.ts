import type {CartItem} from '@prisma/client'
import {prisma} from '~/db.server'

export async function getCartItems(cart: CartItem[]) {
  const uniqueVariantIds = [...new Set(cart.map(item => item.variantId))]
  const uniqueItems = await prisma.menuItem.findMany({
    where: {
      id: {
        in: uniqueVariantIds,
      },
    },
  })

  const itemsMap = new Map(uniqueItems.map(item => [item.id, item]))

  const cartItems = cart.map(item => ({
    ...itemsMap.get(item.variantId),
    quantity: item.quantity,
  }))
  return cartItems
}

export function removeCartItem(cart: CartItem[], variantId: string) {
  return cart.filter(item => item.id !== variantId)
}
