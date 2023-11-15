import type { CartItem } from '@prisma/client'
import { prisma } from '~/db.server'

export async function getCartItems(cart: CartItem[]) {
  // console.log('%ccart.server.ts line:5 cart', 'color: white; background-color: #007acc;', cart[0].modifiers)
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
  // console.log('itemsMap', itemsMap)

  const cartItems = cart.map((item: any) => {
    const modifierExtraPrices = Number(
      item.modifiers.flatMap(modifier => modifier.extraPrice * modifier.quantity).reduce((a, b) => a + b, 0),
    )

    return {
      ...itemsMap.get(item.variantId),
      quantity: item.quantity,
      price: Number({ ...itemsMap.get(item.variantId) }.price) + modifierExtraPrices,
      modifiers: item.modifiers,

      comments: item.sendComments,
    }
  })
  return cartItems
}

export function removeCartItem(cart: CartItem[], variantId: string) {
  return cart.filter(item => item.id !== variantId)
}

export function createCartItems(cartItems: any, shareDish: any, userId: string, orderId: string, branchId: string, items: any) {
  return Promise.all(
    cartItems.map(item => {
      console.log(
        Number(item.price) +
          Number(item.modifiers.flatMap(modifier => modifier.extraPrice * modifier.quantity).reduce((a, b) => a + b, 0) as number),
      )
      return prisma.cartItem.create({
        data: {
          image: item.image,
          plu: item.name.substring(0, 1) + item.id.substring(0, 3) + item.name.substring(item.name.length - 1, item.name.length),
          quantity: Number(item.quantity),
          price: Number(item.price),
          comments: item.comments,
          // Number(item.modifiers.flatMap(modifier => modifier.extraPrice * modifier.quantity).reduce((a, b) => a + b, 0) as number),
          name: item.name,
          productId: item.id,
          // modifier: {
          //   item.modifierGroup.flatMap(modifierGroup => modifierGroup.modifiers),
          // },

          productModifiers: {
            create: item.modifiers.map(modifier => ({
              name: modifier.name,
              extraPrice: Number(modifier.extraPrice),
              quantity: Number(modifier.quantity),
              total: modifier.quantity * modifier.extraPrice,
              branchId: branchId,
              comments: modifier.comments,
            })),
          },

          //if shareDish is not empty, connect the users to the cartItem
          user: {
            connect: shareDish.length > 0 ? [{ id: userId }, ...shareDish.map(id => ({ id: id }))] : { id: userId },
          } as any,
          activeOnOrder: true,
          orderId: orderId,
        },
      })
    }),
  )
}
