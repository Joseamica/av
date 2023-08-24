import type { CartItem } from '@prisma/client'
import { prisma } from '~/db.server'

export async function getCartItems(cart: CartItem[]) {
  const uniqueVariantIds = [...new Set(cart.map(item => item.variantId))]
  const uniqueItems = await prisma.product.findMany({
    where: {
      id: {
        in: uniqueVariantIds,
      },
    },
    include: { modifierGroups: { select: { id: !0, modifiers: true } } },
  })

  const itemsMap = new Map(uniqueItems.map(item => [item.id, item]))
  //get all modifier groups for each item
  const modifierGroups = uniqueItems.map(item => item.modifierGroups).flat()
  //get all modifiers for each modifier group
  const modifiers = modifierGroups.map(group => group.modifiers).flat()

  const cartItems = cart.map(item => ({
    ...itemsMap.get(item.variantId),
    quantity: item.quantity,
    modifiers: modifiers.filter(modifier => item.modifiers.includes(modifier.id)),
  }))
  return cartItems
}

export function removeCartItem(cart: CartItem[], variantId: string) {
  return cart.filter(item => item.id !== variantId)
}

export function createCartItems(cartItems: any, shareDish: any, userId: string, orderId: string) {
  return Promise.all(
    cartItems.map(item =>
      prisma.cartItem.create({
        data: {
          image: item.image,
          quantity: Number(item.quantity),
          price: Number(item.price),
          name: item.name,
          productId: item.id,
          modifier: {
            connect: item.modifiers.map(modifier => ({
              id: modifier.id,
            })),
          },

          //if shareDish is not empty, connect the users to the cartItem
          user: {
            connect: shareDish.length > 0 ? [{ id: userId }, ...shareDish.map(id => ({ id: id }))] : { id: userId },
          } as any,
          activeOnOrder: true,
          orderId: orderId,
        },
      }),
    ),
  )
}
