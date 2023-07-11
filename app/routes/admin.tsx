import type { Branch, Restaurant } from "@prisma/client";
import type { LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Outlet, useLoaderData, useSearchParams } from "@remix-run/react";
import { H1, H2, H5, LinkButton, Spacer } from "~/components";
import { prisma } from "~/db.server";
import { getSession } from "~/session.server";

export async function loader({ request, params }: LoaderArgs) {
  const session = await getSession(request);
  const userId = session.get("userId");
  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);
  const restId = searchParams.get("restId") || "";

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restId },
    include: { branches: true },
  });

  const isAdmin = await prisma.user.findFirst({
    where: {
      id: userId,
      role: "admin",
    },
  });
  if (!isAdmin) {
    return redirect("/unauthorized");
  }

  const restaurants = await prisma.restaurant.findMany();
  return json({ restaurants, restaurant });
}

// const LINKS = {
//   restaurants: 'Restaurants',
//   branches: 'Branches',
//   users: 'Users',
//   tables: 'Tables',
//   menu: 'Menus',
// }

export default function Admin() {
  const data = useLoaderData();
  const [searchParams] = useSearchParams();
  const restId = searchParams.get("restId");
  return (
    <div>
      TODO - MAKE A ADMIN FOR CREATORS AND ADMIN FOR ADMIN OF EACH RESTAURANT
      <H1>Restaurantes</H1>
      <Spacer spaceY="2" />
      {restId ? (
        <div>
          <H1>{data.restaurant.name}</H1>
          <Spacer spaceY="2" />
          <H2>Sucursales</H2>
          <Spacer spaceY="2" />

          {data.restaurant.branches.map((branch: Branch) => {
            return (
              <LinkButton
                size="small"
                to={`branches/${branch.id}`}
                key={branch.id}
              >
                {branch.name}
              </LinkButton>
            );
          })}
          <H5>
            {data.restaurant.branches.length === 0 && "No hay sucursales"}
          </H5>
        </div>
      ) : (
        <div className="flex flex-col space-y-2 ">
          {data.restaurants.map((restaurant: Restaurant) => {
            return (
              <LinkButton
                size="small"
                key={restaurant.id}
                to={`?restId=${restaurant.id}`}
              >
                {restaurant.name}
              </LinkButton>
            );
          })}
        </div>
      )}
      <Outlet />
    </div>
  );
}
