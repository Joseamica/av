import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { H1, H2 } from "~/components";
import { prisma } from "~/db.server";

export async function loader({ request, params }: LoaderArgs) {
  const { tableId } = params;
  const table = await prisma.table.findUnique({
    where: { id: tableId },
    include: { order: { include: { cartItems: true } } },
  });
  return json({ table });
}

export default function AdminTables() {
  const data = useLoaderData();

  return (
    <div>
      <H1>Table {data.table.table_number}</H1>
      <data>
        {data.table.order ? (
          <div>
            <h2>ORDEN {data.table.order.id}</h2>
            <ul>
              <li>{data.table.order.paid ? "Pagado" : "Por Pagar"}</li>
              <li>{data.table.order.tip}</li>
              <li>{data.table.order.total}</li>
              <H2>Platillos</H2>

              {data.table.order.cartItems.map((item) => (
                <li key={item.id}>
                  {item.name} - ${item.price}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p>No order</p>
        )}
      </data>
    </div>
  );
}
