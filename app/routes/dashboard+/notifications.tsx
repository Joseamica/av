import { Form, Link, Outlet, useFetcher, useLoaderData, useNavigate } from '@remix-run/react'
import { FaMoneyBill } from 'react-icons/fa'
import { IoFastFood } from 'react-icons/io5'

import { type ActionArgs, type LoaderArgs, json, redirect } from '@remix-run/node'

import { prisma } from '~/db.server'
import { getSession, sessionStorage } from '~/session.server'
import { useLiveLoader } from '~/use-live-loader'

import { EVENTS } from '~/events'

import { Button, CashIcon, DeleteIcon, FlexRow, H2, H5, H6, OrderIcon } from '~/components'
import { DropDownMenu } from '~/components/dashboard/dropdown'

export const handle = {
  sub: true,
}

export async function loader({ request, params }: LoaderArgs) {
  const session = await getSession(request)
  const branchId = session.get('branchId')
  const employeeId = session.get('employeeId')
  const pendingNotifications = await prisma.notification.findMany({
    where: {
      branchId: branchId,
      status: 'pending',
      employees: {
        some: {
          id: employeeId,
        },
      },
    },
  })
  await prisma.notification.updateMany({
    where: {
      branchId: branchId,
      status: 'pending',
      employees: {
        some: {
          id: employeeId,
        },
      },
    },
    data: {
      status: 'received',
    },
  })
  if (pendingNotifications.length > 0) {
    EVENTS.ISSUE_CHANGED()
  }
  const notifications = await prisma.notification.findMany({
    where: {
      branchId: branchId,
      employees: {
        some: {
          id: employeeId,
        },
      },
    },
    include: {
      table: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
  return json({ notifications })
}
export async function action({ request, params }: ActionArgs) {
  const formData = await request.formData()
  const notificationId = formData.get('notificationId') as string
  await prisma.notification.delete({
    where: {
      id: notificationId,
    },
  })
  return json({ success: true })
}

export default function Notifications() {
  const data = useLiveLoader<any>()
  const navigate = useNavigate()
  const fetcher = useFetcher()
  const isSubmitting = fetcher.state !== 'idle'
  console.log('data', data)
  return (
    <div className="p-4">
      <H2>Notificaciones</H2>
      <div className="bg-white rounded-lg space-y-2">
        {data.notifications.map(notification => {
          const tableNumber = notification.table ? notification.table.number : ''
          const formattedDate = new Date(notification.createdAt).toLocaleDateString('en-US')
          const payment = notification.type_temp === 'PAYMENT'
          const order = notification.type_temp === 'ORDER'

          return (
            <Link to={''} className="flex flex-row space-x-2 items-center border rounded-lg h-14 px-2" key={notification.id}>
              {/* <H6>{formattedDate}</H6> */}
              <div className="h-8 w-8 rounded-full bg-white border flex items-center justify-center">
                {payment ? <FaMoneyBill className="fill-success" /> : null}
                {order ? <IoFastFood /> : null}
              </div>

              <H5>Mesa {tableNumber}</H5>
            </Link>
          )
        })}
      </div>
      {/* <table>
        <thead>
          <tr>
            <th className="p-1 text-xs text-center border">Fecha</th>
            <th className="p-1 text-xs text-center border">Tipo de solicitud</th>

            <th className="p-1 text-xs text-center border">Mensaje</th>
            <th className="p-1 text-xs text-center border"></th>
          </tr>
        </thead>
        <tbody>
          {data.notifications.map(notification => {
            const formattedDate = new Date(notification.createdAt).toLocaleDateString('en-US')
            const payment = notification.type_temp === 'PAYMENT'
            const order = notification.type_temp === 'ORDER'
            return (
              <tr
                key={notification.id}
                // onClick={() => navigate(payment ? '/dashboard/payments' : order ? '/dashboard/orders?active=true' : '')}
                className=""
              >
                <td className="p-1 text-xs text-center border">{formattedDate}</td>
                <td className="p-1 text-xs text-center border">{translate(notification.type_temp)}</td>

                <td className="p-1 text-xs text-center border">{notification.message}</td>
                <td className="flex items-center justify-center p-1">
                  <fetcher.Form method="POST">
                    <button disabled={isSubmitting}>
                      <DeleteIcon />
                    </button>
                    <input type="hidden" name="notificationId" value={notification.id} />
                  </fetcher.Form>
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

const translate = word => {
  switch (word) {
    case 'CALL':
      return 'Llamada'
    case 'PAYMENT':
      return 'Pago'
    case 'FEEDBACK':
      return 'Retroalimentación'
    case 'ORDER':
      return 'Orden'
    case 'OTHER':
      return 'Other'
    case 'OTRO':
      return 'Nueva reserva'
    default:
      return word
  }
}
