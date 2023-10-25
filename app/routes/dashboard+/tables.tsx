import { Link, Outlet, useLoaderData } from '@remix-run/react'

import { type ActionArgs, type LoaderArgs, json, redirect } from '@remix-run/node'

import { prisma } from '~/db.server'
import { getSession } from '~/session.server'

import { ChevronRightIcon, H1, OrderIcon, UserCircleIcon } from '~/components'

export async function loader({ request, params }: LoaderArgs) {
  const session = await getSession(request)
  const branchId = session.get('branchId')
  const tables = await prisma.table.findMany({
    where: {
      branchId,
    },
    include: {
      users: true,
      feedbacks: true,
      notifications: true,
      order: {
        include: {
          cartItems: true,
        },
      },
    },
  })

  const filteredTables = tables.filter(table => table.order)

  return json({ filteredTables })
}
export async function action({ request, params }: ActionArgs) {
  const formData = await request.formData()

  return json({ success: true })
}

export default function Tables() {
  const data = useLoaderData()
  return (
    <div>
      <H1>Mesas con ordenes activas</H1>
      <div className="flex flex-row text-center bg-gray-300 p-2">
        <p className="w-1/3">Mesa</p>
        <p className="w-1/3">Usuarios</p>
        <p className="w-1/3">Platillos</p>
      </div>
      <div>
        {data.filteredTables.map(table => {
          return (
            <Link to={table.id} key={table.id} className=" relative border p-3 flex flex-row justify-between items-center">
              <div className="absolute left-0 inset-y-0 bg-main w-2 rounded-l-full" />
              <p className="w-1/3 text-center">#{table.number}</p>
              <div className="flex flex-row space-x-2 w-1/3 text-center justify-center">
                <UserCircleIcon className="bg-black rounded-full" />
                <span>{table.users?.length}</span>
              </div>
              <div className="flex flex-row space-x-2 w-1/3 ext-center justify-center">
                <OrderIcon className="fill-black rounded-full" />
                <span>{table.order?.cartItems.length}</span>
              </div>
              <ChevronRightIcon className="border rounded-full" />
            </Link>
          )
        })}
      </div>
      <Outlet />
    </div>
  )
}
