import { CheckCircledIcon, ClockIcon } from '@radix-ui/react-icons'
import { Link, Outlet, useFetcher, useNavigate } from '@remix-run/react'
import { useState } from 'react'
import { FaCheck, FaCheckCircle, FaMoneyBill, FaStripe, FaStripeS } from 'react-icons/fa'
import { IoCall, IoCard, IoFastFood, IoPersonCircle } from 'react-icons/io5'

import { type ActionArgs, type LoaderArgs, json } from '@remix-run/node'

import clsx from 'clsx'
import { prisma } from '~/db.server'
import { getSession } from '~/session.server'
import { useLiveLoader } from '~/use-live-loader'

import { EVENTS } from '~/events'

import { formatCurrency } from '~/utils'

import { FlexRow, H2, H3, H4, H5, H6, Modal, Spacer, Underline } from '~/components'

export const handle = {
  sub: true,
}

export async function loader({ request, params }: LoaderArgs) {
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
      order: {
        include: {
          cartItems: {
            include: {
              productModifiers: true,
            },
          },
        },
      },
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
  // const navigate = useNavigate()
  // const fetcher = useFetcher()
  // const isSubmitting = fetcher.state !== 'idle'
  const [showOrderModal, setShowOrderModal] = useState({ id: '' })
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
            <div className="space-y-1 rounded-lg">
              {notifications.map(notification => {
                const tableNumber = notification.table ? notification.table.number : ''

                const payment = notification.type_temp === 'PAYMENT'
                const order = notification.type_temp === 'ORDER'
                const call = notification.type_temp === 'CALL'
                const amount = notification.payment ? notification.payment.amount : 0
                const tip = notification.payment ? notification.payment.tip : 0
                const paymentTotal = notification.payment ? notification.payment.total : 0

                const method = notification.payment
                  ? notification.payment.method === 'cash'
                    ? 'Efectivo'
                    : notification.payment.method === 'terminal'
                    ? 'Terminal'
                    : notification.payment.method === 'card'
                    ? 'Stripe'
                    : null
                  : null

                return (
                  <div
                    className={clsx('flex flex-row items-center h-[70px] px-2 space-x-2 bg-white border rounded-lg', {
                      // 'bg-yellow-500 border-2': notification.payment?.status === 'pending',
                    })}
                    key={notification.id}
                  >
                    {/* <H6>{formattedDate}</H6> */}
                    {payment ? (
                      <Link
                        to={`/dashboard/tables/${notification.table.id}/${notification.paymentId}`}
                        className="flex flex-row items-center justify-between w-full space-x-3"
                      >
                        <FlexRow className="">
                          <div className="flex flex-col items-center  w-14 ">
                            <div className="flex items-center justify-center w-8 h-8 bg-green-700 border rounded-full">
                              {notification.payment?.method === 'cash' ? (
                                <FaMoneyBill className="fill-white" />
                              ) : notification.payment?.method === 'terminal' ? (
                                <IoCard className="fill-white" />
                              ) : notification.payment?.method === 'card' ? (
                                <FaStripeS className="fill-white" />
                              ) : null}
                            </div>
                            <H6 variant="secondary">{method}</H6>
                          </div>
                          <div className="p-1  rounded-xl shrink-0">
                            <H6>Mesa {tableNumber}</H6>

                            {/* <IoPersonCircle className="w-3 h-3" /> */}
                            <H6 className="">{notification.user?.name}</H6>

                            {/* {notification.payment?.status === 'pending' ? <ClockIcon className="w-3 h-3" /> : null} */}
                          </div>
                          <div className="flex flex-row items-center space-x-1 ">
                            <H6 className="px-1">
                              Monto <span className="font-bold text-xs">{formatCurrency('$', amount)}</span>
                            </H6>
                            •
                            <H6 className="px-1">
                              Propina <span className="font-bold text-xs">{formatCurrency('$', tip)}</span>
                            </H6>
                            •
                            <H6 className="px-1">
                              Total <span className="font-bold text-xs">{formatCurrency('$', paymentTotal)}</span>
                            </H6>
                          </div>
                          <div>
                            {notification.payment?.status === 'pending' ? (
                              <ClockIcon className="text-yellow-500" />
                            ) : (
                              <FaCheckCircle className="text-success" />
                            )}
                          </div>
                        </FlexRow>
                      </Link>
                    ) : null}
                    {order ? (
                      <button
                        onClick={() => setShowOrderModal({ id: notification.id })}
                        className="flex flex-row items-center justify-between w-full space-x-3"
                      >
                        <FlexRow className="">
                          <div className="flex flex-col items-center  w-14 ">
                            <div className="flex items-center justify-center w-8 h-8 bg-purple-400 border rounded-full">
                              <IoFastFood className="fill-white" />
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
                          <span>
                            Ordeno: {notification.order?.cartItems.reduce((acc, cartItem) => acc + cartItem.quantity, 0)} productos
                          </span>
                        </div>
                      </button>
                    ) : null}
                    {call ? (
                      <Link
                        to={`/dashboard/tables/${notification.table.id}/${notification.paymentId}`}
                        className="flex flex-row items-center justify-between w-full space-x-3"
                      >
                        <FlexRow className="gap-2">
                          <div className="flex flex-col items-center w-14 ">
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

      {showOrderModal.id && (
        <Modal
          title={data.notifications.find(notification => notification.id === showOrderModal.id).order?.cartItems?.length + ' productos'}
          onClose={() =>
            setShowOrderModal({
              id: '',
            })
          }
        >
          <div className="p-4">
            <H2>Orden</H2>
            <div className="p-2 space-y-2 border rounded-xl bg-white">
              {data.notifications
                .find(notification => notification.id === showOrderModal.id)
                .order?.cartItems?.map((cartItem: any) => {
                  return (
                    <div key={cartItem.id} className="flex flex-col ">
                      <FlexRow>
                        <H4>{cartItem.quantity}</H4>
                        <H3>{cartItem.name}</H3>
                        <H3>{formatCurrency('$', cartItem.price)}</H3>
                      </FlexRow>
                      <div>
                        {cartItem.productModifiers.map(pm => {
                          return (
                            <div key={pm.id} className="flex flex-row space-x-2">
                              <H6>{pm.name}</H6>
                              <H6>{formatCurrency('$', pm.extraPrice)}</H6>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
            </div>
            <Spacer size="md" />
            <hr />
            <Spacer size="md" />

            <FlexRow>
              <H2>Total</H2>
              <H3>
                <Underline>
                  {formatCurrency(
                    '$',
                    data.notifications
                      .find(notification => notification.id === showOrderModal.id)
                      .order?.cartItems?.reduce((acc, cartItem) => {
                        return acc + cartItem.price * cartItem.quantity
                      }, 0),
                  )}
                </Underline>
              </H3>
            </FlexRow>
          </div>
        </Modal>
      )}
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
    return 'Nuevo'
  } else if (diffMs < oneDay) {
    return 'Hoy'
  } else if (diffMs < oneDay * 7) {
    return 'Ultimos 7 días'
  } else {
    return 'Ultimos 30 días'
  }
}
