import { Form, Outlet, useFetcher, useLoaderData, useNavigate } from '@remix-run/react'

import { type ActionArgs, type LoaderArgs, json, redirect } from '@remix-run/node'

import { prisma } from '~/db.server'
import { getSession, sessionStorage } from '~/session.server'
import { useLiveLoader } from '~/use-live-loader'

import { EVENTS } from '~/events'

import { Button, DeleteIcon } from '~/components'
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
  const data = useLiveLoader()
  const navigate = useNavigate()
  const fetcher = useFetcher()
  const isSubmitting = fetcher.state !== 'idle'

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th className="p-1 border text-center text-xs">Fecha</th>
            <th className="p-1 border text-center text-xs">Tipo de solicitud</th>
            {/* <th className="p-1 border text-center text-xs">Estado</th> */}
            <th className="p-1 border text-center text-xs">Mensaje</th>
            <th className="p-1 border text-center text-xs"></th>
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
                onClick={() => navigate(payment ? '/dashboard/payments' : order ? '/dashboard/orders?active=true' : '')}
                className=""
              >
                <td className="p-1 border text-center text-xs">{formattedDate}</td>
                <td className="p-1 border text-center text-xs">{translate(notification.type_temp)}</td>
                {/* <td className="p-1 border text-center text-xs">{notification.status}</td> */}
                <td className="p-1 border text-center text-xs">{notification.message}</td>
                <td className="p-1 flex justify-center items-center">
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
      </table>
      <Outlet />
    </div>
  )
}

const translate = word => {
  switch (word) {
    case 'CALL':
      return 'Llamada'
    case 'PAYMENT':
      return 'PAGO'
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
