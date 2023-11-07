import { Link, Outlet, useLoaderData } from '@remix-run/react'
import React from 'react'
import { IoCard, IoList, IoPerson, IoShieldCheckmarkOutline } from 'react-icons/io5'

import { type LoaderArgs, json } from '@remix-run/node'

import { prisma } from '~/db.server'
import { getSession } from '~/session.server'

import { formatCurrency } from '~/utils'

import { ChevronRightIcon, H4, Spacer, XIcon } from '~/components'
import { NavMenu } from '~/components/dashboard/navmenu'
import { SearchBar } from '~/components/dashboard/searchbar'

export async function loader({ request, params }: LoaderArgs) {
  const session = await getSession(request)
  const branchId = session.get('branchId')

  const tables = await prisma.table.findMany({
    where: {
      branchId,
      // number: Number(search),
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

  return json({ tables })
}
// export async function action({ request, params }: ActionArgs) {
//   const formData = await request.formData()

//   return json({ success: true })
// }

export default function Tables() {
  const data = useLoaderData()
  const [search, setSearch] = React.useState<string>('')
  const [activeNavMenu, setActiveNavMenu] = React.useState<string>('Activas')

  return (
    <div className=" flex flex-col ">
      <NavMenu categories={['Todas', 'Activas', 'Inactivas']} activeNavMenu={activeNavMenu} setActiveNavMenu={setActiveNavMenu} />

      <div className="px-[10px]">
        <Spacer spaceY="2" />

        <SearchBar placeholder={'Buscar por numero de mesa'} setSearch={setSearch} />

        <Spacer spaceY="2" />
        <div className="space-y-1">
          {search
            ? data.tables
                .filter(table => table.number === Number(search))
                .map(table => {
                  return (
                    <Table
                      key={table.id}
                      to={table.id}
                      tableNumber={table.number}
                      clients={table.users?.length}
                      products={table.order?.cartItems ?? []}
                    />
                  )
                })
            : null}
        </div>
        {!search ? (
          <div className="space-y-1">
            {activeNavMenu === 'Todas' ? (
              <>
                {data.tables.map(table => {
                  return (
                    <Table
                      key={table.id}
                      to={table.id}
                      tableNumber={table.number}
                      clients={table.users?.length}
                      products={table.order?.cartItems}
                    />
                  )
                })}
              </>
            ) : null}
            {activeNavMenu === 'Activas' ? (
              <>
                {data.tables.filter(table => table.order).length === 0 ? <H4 variant="secondary">Aun no hay mesas activas</H4> : null}
                {data.tables
                  .filter(table => table.order)
                  .map(table => {
                    return (
                      <Table
                        key={table.id}
                        to={table.id}
                        tableNumber={table.number}
                        clients={table.users?.length}
                        products={table.order?.cartItems}
                      />
                    )
                  })}
              </>
            ) : null}
            {activeNavMenu === 'Inactivas' ? (
              <>
                {data.tables
                  .filter(table => !table.order)
                  .map(table => {
                    return (
                      <Table
                        key={table.id}
                        to={table.id}
                        tableNumber={table.number}
                        clients={table.users?.length}
                        products={table.order?.cartItems}
                      />
                    )
                  })}
              </>
            ) : null}
          </div>
        ) : null}
      </div>
      <Outlet />
    </div>
  )
}

export function Table({ to, clients, products, tableNumber }: { to: string; clients: string; products: any; tableNumber: string }) {
  const total = products?.reduce((acc, curr) => {
    return Number(acc) + Number(curr.price)
  }, 0)

  return (
    <Link to={products ? to : ''} className="w-full  relative flex items-center justify-between space-x-4" preventScrollReset>
      <div className="border rounded-lg flex justify-around w-full">
        <div className="flex justify-center items-center  bg-dashb-bg w-14 rounded-lg">
          <p className="text-3xl">{tableNumber}</p>
        </div>
        <div className="flex flex-row  divide-x divide-gray-300 items-center w-full h-full  bg-white rounded-lg  ">
          <TableContainer title="Clientes" value={clients} icon={<IoPerson className="bg-indigo-500 rounded-sm p-1 fill-white" />} />
          <TableContainer
            title="Productos"
            value={products?.length}
            icon={<IoList className="bg-[#F19F82] rounded-sm p-1 fill-white text-white" />}
          />
          <TableContainer
            title="Total"
            value={total ? formatCurrency('$', total || 0) : null}
            icon={<IoCard className="bg-[#548AF7] rounded-sm p-1 fill-white" />}
          />
        </div>
      </div>
      {products ? (
        <div className=" border rounded-full flex justify-center items-center bg-white">
          <ChevronRightIcon />
        </div>
      ) : // <div className=" border rounded-full flex justify-center items-center bg-white">
      //   <XIcon />
      // </div>
      null}
    </Link>
  )
}

export function TableContainer({ title, value, icon }: { title: string; value: string | number; icon: JSX.Element }) {
  return (
    <div className="flex flex-col space-y-1  px-3 py-2 w-full">
      <div />
      <div className="flex flex-row space-x-2 items-center ">
        {icon}
        <span className="text-xs font-medium">{title}</span>
      </div>
      <p className="text-sm font-bold">{value ? value : '-'}</p>
    </div>
  )
}
