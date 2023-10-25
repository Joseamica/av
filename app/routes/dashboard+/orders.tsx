import { Link, Outlet, useLoaderData, useNavigate, useSearchParams } from '@remix-run/react'
import React from 'react'

import { type ActionArgs, type LoaderArgs, json, redirect } from '@remix-run/node'

import clsx from 'clsx'
import { prisma } from '~/db.server'
import { getSession } from '~/session.server'

import { formatCurrency, getSearchParams } from '~/utils'

import { Button, ChevronDownIcon, FlexRow, MenuIcon } from '~/components'
import { DropDownMenu } from '~/components/dashboard/dropdown'
import { ButtonLink, LinkButton } from '~/components/ui/buttons/button'
import { DropDown } from '~/components/ui/buttons/dropdown'

export async function loader({ request, params }: LoaderArgs) {
  const session = await getSession(request)
  const branchId = session.get('branchId')
  const searchParams = getSearchParams({ request })
  const active = searchParams.get('active') === 'true'
  const orders = await prisma.order.findMany({
    where: {
      branchId,
      active: active,
    },
    include: {
      cartItems: true,
      table: true,
    },
  })
  return json({ orders })
}
export async function action({ request, params }: ActionArgs) {
  const formData = await request.formData()
  return json({ success: true })
}

export default function Orders() {
  const data = useLoaderData()
  // const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const active = searchParams.get('active') === 'true'

  return (
    <div className="max-w-full overflow-x-auto  py-1">
      <div className="flex justify-center space-x-2">
        <LinkButton to="?active=true" size="small" variant={active ? 'primary' : 'secondary'}>
          Activas
        </LinkButton>
        <LinkButton to="?active=false" size="small" variant={!active ? 'primary' : 'secondary'}>
          Inactivas
        </LinkButton>
      </div>

      <div className="flex flex-col divide-y mt-2">
        {data.orders.map(order => {
          const hour = new Date(order.createdAt).getHours()
          const minutes = new Date(order.createdAt).getMinutes()
          const formattedDate = `${hour}:${minutes}`
          return (
            <Link to={order.id} key={order.id}>
              <div className="relative w-full h-12  items-center flex pl-4 bg-white">
                <div
                  className={clsx(' left-0 top-0 bottom-0 absolute w-2 h-full ', {
                    'bg-success': order.paid,
                    'bg-warning': !order.paid,
                  })}
                ></div>
                <FlexRow justify="between" className="w-full">
                  <FlexRow className="space-x-4">
                    <p className="text-sm">Mesa: {order.tableNumber ? order.tableNumber : 'n/a'}</p>
                  </FlexRow>
                  <FlexRow>
                    <p
                      className={clsx('px-2 py-1 rounded-full overflow-hidden text-xs text-white', {
                        'bg-success': order.active,
                        'bg-warning': !order.active,
                      })}
                    >
                      {order.active ? 'Activa' : 'Inactiva'}
                    </p>
                    <p
                      className={clsx('px-2 py-1 rounded-full overflow-hidden text-xs text-white', {
                        'bg-success': order.paid,
                        'bg-warning': !order.paid,
                      })}
                    >
                      {order.paid ? 'Pagada' : 'No pagada'}
                    </p>
                    <p className="text-zinc-700 text-lg font-bold">{formattedDate}</p>
                    {/* <button onClick={() => setOrder({ ...order, id: order.id })} className="h-8 w-8 border rounded-full items-center flex "> */}
                    <ChevronDownIcon className="w-7 h-7" />
                    {/* </button> */}
                  </FlexRow>
                </FlexRow>
              </div>
            </Link>
          )
        })}
      </div>

      {/* <table className="min-w-full">
        <thead className="bg-zinc-200">
          <tr>
            <th className="p-1 border text-xs">Fecha</th>
            <th className="p-1 border text-xs">Propina</th>
            <th className="p-1 border text-xs">Total</th>
            <th className="p-1 border text-xs"></th>
          </tr>
        </thead>
        <tbody>
          {data.orders.map(order => {
            const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
              // month: 'long',
              // day: 'numeric',
              // hour: 'numeric',
              // minute: '2-digit',
            })
            return (
              <tr key={order.id} onClick={() => navigate(order.id)} className="">
                <td className="p-1 border text-center text-xs">{formattedDate}</td>
                <td className="p-1 border text-center text-xs">{formatCurrency('$', order.tip)}</td>
                <td className="p-1 border text-center text-xs">{formatCurrency('$', order.total)}</td>
                <td className="p-1 flex justify-center border">
                  <DropDownMenu />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table> */}
      <Outlet />
    </div>
  )
}
