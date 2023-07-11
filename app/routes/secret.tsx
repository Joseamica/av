import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import { Button, H2, LinkButton } from "~/components";
import { prisma } from "~/db.server";
import { getSession } from "~/session.server";

export async function loader({ request, params }: LoaderArgs) {
  const session = await getSession(request);
  const userId = session.get("userId");
  const isName = session.has("username");
  const isAdmin = await prisma.user.findFirst({
    where: {
      id: userId,
      role: "admin",
    },
  });

  if (!isName) {
    return redirect("/");
  }
  if (isAdmin) {
    return redirect("/admin");
  }
  const tables = await prisma.table.findMany({});
  return json({ tables });
}

export async function action({ request, params }: ActionArgs) {
  const session = await getSession(request);
  const userId = session.get("userId");

  const updateUserToAdmin = await prisma.user.update({
    where: { id: userId },
    data: {
      role: "admin",
    },
  });
  return redirect("/admin");
}

export default function Secret() {
  const data = useLoaderData();
  return (
    <>
      {data.tables.map((table: Table) => (
        <LinkButton size="small" key={table.id} to={`/table/${table.id}`}>
          {table.table_number}
        </LinkButton>
      ))}
      <Form method="post">
        {/* <label htmlFor="email">Email</label>
      <input type="email" name="email" id="email" /> */}
        <H2>MAKE ME ADMIN?</H2>
        <Button type="submit">Submit</Button>
      </Form>
    </>
  );
}
