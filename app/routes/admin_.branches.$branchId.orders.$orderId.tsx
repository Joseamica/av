import type { CartItem } from "@prisma/client";
import { json, type ActionArgs, type LoaderArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { CartItemDetails, H2, H3 } from "~/components";
import { prisma } from "~/db.server";

export async function loader({ request, params }: LoaderArgs) {
  const { branchId, orderId } = params;
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { cartItems: { include: { user: true } } },
  });
  return json({ order });
}

export async function action({ request, params }: ActionArgs) {
  const formData = await request.formData();
  return json({ success: true });
}

export default function AdminOrderId() {
  const data = useLoaderData();
  return (
    <div>
      <H2>Order Id: {data.order.id}</H2>
      <H3>Total: {data.order.total}</H3>
      <H3>Cart Items: {data.order.cartItems.length}</H3>
      <div>
        {data.order.cartItems.map((cartItem: CartItem) => (
          <CartItemDetails key={cartItem.id} cartItem={cartItem} />
        ))}
      </div>
    </div>
  );
}
