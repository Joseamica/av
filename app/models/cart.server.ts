import type { CartItem } from "@prisma/client";
import { prisma } from "~/db.server";

export async function getCartItems(cart: CartItem[]) {
  const uniqueVariantIds = [...new Set(cart.map((item) => item.variantId))];
  const uniqueItems = await prisma.menuItem.findMany({
    where: {
      id: {
        in: uniqueVariantIds,
      },
    },
    include: { modifierGroups: { select: { id: !0, modifiers: true } } },
  });

  const itemsMap = new Map(uniqueItems.map((item) => [item.id, item]));
  //get all modifier groups for each item
  const modifierGroups = uniqueItems.map((item) => item.modifierGroups).flat();
  //get all modifiers for each modifier group
  const modifiers = modifierGroups.map((group) => group.modifiers).flat();

  const cartItems = cart.map((item) => ({
    ...itemsMap.get(item.variantId),
    quantity: item.quantity,
    modifiers: modifiers.filter((modifier) =>
      item.modifiers.includes(modifier.id)
    ),
  }));
  return cartItems;
}

export function removeCartItem(cart: CartItem[], variantId: string) {
  return cart.filter((item) => item.id !== variantId);
}
