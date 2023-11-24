import { Link, Outlet, useFetcher, useNavigate } from '@remix-run/react'
import { FaMoneyBill } from 'react-icons/fa'
import { IoCall, IoFastFood, IoPersonCircle } from 'react-icons/io5'

import { type ActionFunctionArgs, type LoaderFunctionArgs, json } from '@remix-run/node'

import { prisma } from '~/db.server'
import { getSession } from '~/session.server'
import { useLiveLoader } from '~/use-live-loader'

import { EVENTS } from '~/events'

import { formatCurrency } from '~/utils'

import { FlexRow, H2, H3, H5, H6 } from '~/components'

export const handle = {
  sub: true,
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const session = await getSession(request)
  const branchId = session.get('branchId')
  const employeeId = session.get('employeeId')

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
      payment: true,
      user: true,
      order: { include: { cartItems: true } },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  const pendingNotifications = notifications.filter(notification => notification.status === 'pending')

  if (pendingNotifications.length) {
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
  }

  if (pendingNotifications.length) {
    EVENTS.ISSUE_CHANGED()
  }

  return json({ notifications })
}
export async function action({ request, params }: ActionFunctionArgs) {
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
  // const navigate = useNavigate()
  // const fetcher = useFetcher()
  // const isSubmitting = fetcher.state !== 'idle'
  const groupedNotifications = data.notifications.reduce((groups, notification) => {
    const age = getNotificationAge(notification.createdAt)
    if (!groups[age]) {
      groups[age] = []
    }
    if (!groups[age].some(n => n.id === notification.id)) {
      groups[age].push(notification)
    }
    return groups
  }, {})

  return (
    <div className="p-4">
      <H2 className="underline">Notificaciones</H2>
      <div className="py-2">
        {Object.entries(groupedNotifications).map(([age, notifications]) => (
          <div key={age} className="py-1">
            <H3>{age}</H3>
            <div className="space-y-2 rounded-lg">
              {notifications.map(notification => {
                const tableNumber = notification.table ? notification.table.number : ''

                const payment = notification.type_temp === 'PAYMENT'
                const order = notification.type_temp === 'ORDER'
                const call = notification.type_temp === 'CALL'
                const amount = notification.payment ? notification.payment.amount : 0
                const tip = notification.payment ? notification.payment.tip : 0
                const paymentTotal = notification.payment ? notification.payment.total : 0

                return (
                  <div className="flex flex-row items-center h-16 px-2 space-x-2 bg-white border rounded-lg" key={notification.id}>
                    {/* <H6>{formattedDate}</H6> */}
                    {payment ? (
                      <Link
                        to={`/dashboard/tables/${notification.table.id}/${notification.paymentId}`}
                        className="flex flex-row items-center justify-between w-full space-x-3"
                      >
                        <FlexRow className="gap-2">
                          <div className="flex flex-col items-center">
                            <div className="flex items-center justify-center w-8 h-8 bg-white border rounded-full">
                              <FaMoneyBill className="fill-success" />
                            </div>
                            <H6 variant="secondary">Pago</H6>
                          </div>
                          <div>
                            <H5>Mesa {tableNumber}</H5>
                            <FlexRow>
                              <IoPersonCircle className="w-3 h-3" />
                              <H6 className="">{notification.user?.name}</H6>
                            </FlexRow>
                          </div>
                        </FlexRow>
                        <div>{notification.payment?.status === 'pending' ? <H6 variant="secondary">Aceptación pendiente</H6> : null}</div>
                        <div className="flex flex-col justify-between px-1 ">
                          <H6>Monto {formatCurrency('$', amount)}</H6>
                          <H6>Propina {formatCurrency('$', tip)}</H6>
                          <H6>Total {formatCurrency('$', paymentTotal)}</H6>
                        </div>
                      </Link>
                    ) : null}
                    {order ? (
                      <div className="flex flex-row items-center justify-between w-full space-x-2">
                        <FlexRow className="gap-2">
                          <div className="flex flex-col items-center">
                            <div className="flex items-center justify-center w-8 h-8 bg-white border rounded-full">
                              <IoFastFood className="fill-yellow-400" />
                            </div>
                            <H6 variant="secondary">Orden</H6>
                          </div>
                          <div>
                            <H5>Mesa {tableNumber}</H5>
                            <FlexRow>
                              <IoPersonCircle className="w-3 h-3" />
                              <H6 className="">{notification.user?.name}</H6>
                            </FlexRow>
                          </div>
                        </FlexRow>
                        <div>
                          <span>Ordeno: {notification.order?.cartItems.length} platillos</span>
                        </div>
                      </div>
                    ) : null}
                    {call ? (
                      <Link
                        to={`/dashboard/tables/${notification.table.id}/${notification.paymentId}`}
                        className="flex flex-row items-center justify-between w-full space-x-3"
                      >
                        <FlexRow className="gap-2">
                          <div className="flex flex-col items-center">
                            <div className="flex items-center justify-center w-8 h-8 bg-white border rounded-full">
                              <IoCall className="fill-warning" />
                            </div>
                            <H6 variant="secondary" className="truncate">
                              Llamada
                            </H6>
                          </div>
                          <div>
                            <H5>Mesa {tableNumber}</H5>
                            <FlexRow>
                              <IoPersonCircle className="w-3 h-3" />
                              <H6 className="">{notification.user?.name}</H6>
                            </FlexRow>
                          </div>
                        </FlexRow>
                        {/* <div>{notification.payment?.status === 'pending' ? <H6 variant="secondary">Aceptación pendiente</H6> : null}</div> */}
                        <div className="flex flex-col justify-between px-1 ">
                          <H5>Te solicitan en la mesa {tableNumber}</H5>
                        </div>
                      </Link>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
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

const getNotificationAge = createdAt => {
  const now = new Date()
  const notificationDate = new Date(createdAt)
  const diffMs = now - notificationDate // Difference in milliseconds

  const oneHour = 1000 * 60 * 60
  const oneDay = oneHour * 24

  if (diffMs < oneHour) {
    return 'New'
  } else if (diffMs < oneDay) {
    return 'Today'
  } else if (diffMs < oneDay * 7) {
    return 'Last 7 days'
  } else {
    return 'Last 30 days'
  }
}
