import type { CartItem } from '@prisma/client'
import { prisma } from '~/db.server'

export async function getCartItems(cart: CartItem[]) {
  const uniqueVariantIds = [...new Set(cart.map(item => item.variantId))]
  const uniqueItems = await prisma.menuItem.findMany({
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

  const cartItems = cart.map((item: any) => ({
    ...itemsMap.get(item.variantId),
    quantity: item.quantity,
    modifierGroups: modifierGroups,
    modifiers: item.modifiers,
  }))
  return cartItems
}

export function removeCartItem(cart: CartItem[], variantId: string) {
  return cart.filter(item => item.id !== variantId)
}

export function createCartItems(cartItems: any, shareDish: any, userId: string, orderId: string, branchId: string) {
  return Promise.all(
    cartItems.map(item =>
      prisma.cartItem.create({
        data: {
          image: item.image,
          plu: item.name.substring(0, 1) + item.id.substring(0, 3) + item.name.substring(item.name.length - 1, item.name.length),
          quantity: Number(item.quantity),
          price:
            Number(item.price) +
            Number(item.modifiers.flatMap(modifier => modifier.extraPrice * modifier.quantity).reduce((a, b) => a + b, 0) as number),
          name: item.name,
          menuItemId: item.id,
          // modifier: {
          //   connect: item.modifiers.map(modifier => ({
          //     id: modifier.id,
          //   })),
          // },
          productModifiers: {
            createMany: {
              data: item.modifiers.flatMap(modifier => ({
                quantity: modifier.quantity,
                extraPrice: modifier.extraPrice,
                total: modifier.quantity * modifier.extraPrice,
                branchId: branchId,
              })),
            },
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
