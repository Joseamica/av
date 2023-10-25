import { Form, Link, useFetcher, useLoaderData, useSearchParams } from '@remix-run/react'
import { FaHourglass, FaHourglassHalf } from 'react-icons/fa'

import { type ActionArgs, type LoaderArgs, json, redirect } from '@remix-run/node'

import clsx from 'clsx'
import { prisma } from '~/db.server'
import { getSession } from '~/session.server'

import { EVENTS } from '~/events'

import { getSearchParams } from '~/utils'

import { Button, CheckIcon, LinkButton, XIcon } from '~/components'

export async function loader({ request, params }: LoaderArgs) {
  const session = await getSession(request)
  const branchId = session.get('branchId')
  const searchParams = getSearchParams({ request })
  const status = searchParams.get('status') as any
  //TODO IF there is a request of a full pay, we need to erase all the pending payments
  const payments = await prisma.payments.findMany({
    where: {
      branchId,
      status: status,
    },
    include: {
      order: {
        select: {
          tableNumber: true,
        },
      },
    },
  })
  return json({ payments })
}
export async function action({ request, params }: ActionArgs) {
  const formData = await request.formData()
  const intent = formData.get('intent') as string
  const id = formData.get('id') as string
  switch (intent) {
    case 'accept':
      await prisma.payments.update({
        where: {
          id,
        },
        data: {
          status: 'accepted',
        },
      })
      break
    case 'reject':
      await prisma.payments.update({
        where: {
          id,
        },
        data: {
          status: 'rejected',
        },
      })
      break
  }
  EVENTS.ISSUE_CHANGED()
  return json({ success: true })
}

export default function Payments() {
  const data = useLoaderData()
  const fetcher = useFetcher()
  const isSubmitting = fetcher.state !== 'idle'
  const [searchParams] = useSearchParams()
  const status = searchParams.get('status')

  const columns = ['Hora', 'Método', 'Mesa', 'Propina', 'Total', 'Acciones']
  const columnWidth = 100 / columns.length
  return (
    <div>
      <div className="flex justify-center space-x-1 py-4">
        <Link
          to="?status=pending"
          type="button"
          className={clsx(
            'flex flex-row text-xs items-center justify-center space-x-1 border rounded-full px-2',
            status === 'pending' && 'bg-button-primary text-white',
          )}
        >
          <FaHourglassHalf />
          <span>Pendientes</span>
        </Link>
        <Link
          to="?status=accepted"
          type="button"
          className={clsx(
            'flex flex-row text-xs items-center justify-center space-x-1 border rounded-full px-2',
            status === 'accepted' && 'bg-button-primary text-white',
          )}
        >
          <CheckIcon />
          <span>Aceptados</span>
        </Link>
        <Link
          to="?status=rejected"
          type="button"
          className={clsx(
            'flex flex-row text-xs items-center justify-center space-x-1 border rounded-full px-2',
            status === 'rejected' && 'bg-button-primary text-white',
          )}
        >
          <XIcon
            className={clsx({
              'fill-white': status === 'rejected',
            })}
          />
          <span>Rechazados</span>
        </Link>
      </div>
      <div className="flex flex-col">
        {/* Header */}
        <div className="flex flex-row bg-gray-300 p-2">
          {columns.map((col, index) => {
            if (status !== 'pending' && index === columns.length - 1) return null
            return (
              <div key={index} style={{ width: `${columnWidth}%` }} className="text-center">
                {col}
              </div>
            )
          })}
        </div>

        {/* Data */}
        {data.payments.map(payment => {
          const hour = new Date(payment.createdAt).getHours()
          const minutes = new Date(payment.createdAt).getMinutes()
          const formattedDate = `${hour}:${minutes}`
          return (
            <div key={payment.id} className="flex flex-row p-2 border-t">
              <div style={{ width: `${columnWidth}%` }} className="text-center">
                {formattedDate}
              </div>
              <div style={{ width: `${columnWidth}%` }} className="text-center">
                {payment.method}
              </div>
              <div style={{ width: `${columnWidth}%` }} className="text-center">
                {payment.order?.tableNumber ? payment.order?.tableNumber : 'n/a'}
              </div>
              <div style={{ width: `${columnWidth}%` }} className="text-center">
                {payment.tip}
              </div>
              <div style={{ width: `${columnWidth}%` }} className="text-center">
                {payment.total}
              </div>
              {status === 'pending' ? (
                <div style={{ width: `${columnWidth}%` }} className="text-center">
                  <fetcher.Form method="POST" className="flex space-x-2">
                    <button
                      disabled={isSubmitting}
                      name="intent"
                      value="accept"
                      className="flex bg-success rounded-full items-center justify-center text-white"
                    >
                      <CheckIcon />
                    </button>
                    <button
                      disabled={isSubmitting}
                      name="intent"
                      value="reject"
                      className="flex bg-warning items-center rounded-full justify-center"
                    >
                      <XIcon />
                    </button>
                    <input type="hidden" name="id" value={payment.id} />
                  </fetcher.Form>
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}
