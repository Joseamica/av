import { useFetcher, useLoaderData, useNavigate } from '@remix-run/react'
import { FaCheckCircle, FaExclamation } from 'react-icons/fa'

import { type ActionArgs, type LoaderArgs, json, redirect } from '@remix-run/node'

import clsx from 'clsx'
import { prisma } from '~/db.server'

import { EVENTS } from '~/events'

import { formatCurrency, getCurrency } from '~/utils'

import { CheckIcon, FlexRow, H3, Spacer } from '~/components'
import { SubModal } from '~/components/modal'

export async function loader({ request, params }: LoaderArgs) {
  const { tableId, paymentId } = params
  const payment = await prisma.payments.findUnique({
    where: {
      id: paymentId,
    },
    include: {
      user: true,
      order: {
        include: {
          cartItems: true,
        },
      },
    },
  })
  const currency = await getCurrency(tableId)
  return json({ payment, currency })
}
export async function action({ request, params }: ActionArgs) {
  const formData = await request.formData()
  const { tableId, paymentId } = params
  const intent = formData.get('intent') as string
  const userId = formData.get('userId') as string
  switch (intent) {
    case 'accept':
      await prisma.payments.update({
        where: {
          id: paymentId,
        },
        data: {
          status: 'accepted',
          userId,
        },
      })
      break
    case 'pending':
      await prisma.payments.update({
        where: {
          id: paymentId,
        },
        data: {
          status: 'pending',
          userId,
        },
      })
      break
    case 'disputed':
      await prisma.payments.update({
        where: {
          id: paymentId,
        },
        data: {
          status: 'disputed',
          userId,
        },
      })
      break
  }
  EVENTS.ISSUE_CHANGED(tableId)
  return redirect(`/dashboard/tables/${tableId}?activeNavMenu=Pagos`)
}

export default function TablePaymentId() {
  const data = useLoaderData()
  const navigate = useNavigate()
  const fetcher = useFetcher()
  const isSubmitting = fetcher.state !== 'idle'

  return (
    <SubModal onClose={() => navigate(-1)} title={data.payment.id.slice(-5).toUpperCase()}>
      <div className="py-3">
        <fetcher.Form method="POST">
          <button className="flex justify-end space-x-2 items-center" name="intent" value="disputed">
            <span>Disputar pago</span>
            <div className=" bg-warning text-white rounded-full items-center p-2">
              <FaExclamation className="h-3 w-3" />
            </div>
          </button>
        </fetcher.Form>
        <Spacer spaceY="2" />
        <div className="w-full justify-center  p-[10px] flex flex-col divide-y-2 bg-white rounded-lg">
          {/* Usuario {data.payment?.user?.name} quiere pagar {formatCurrency(data.currency, data.payment?.total)} */}
          <FlexRow justify="between" className="py-2">
            <H3>Fecha</H3>
            <H3>{data.payment?.createdAt}</H3>
          </FlexRow>
          <FlexRow justify="between" className="py-2">
            <H3>Usuario</H3>
            <H3>{data.payment?.user?.name}</H3>
          </FlexRow>
          <FlexRow justify="between" className="py-2">
            <H3>Metodo</H3>
            <H3>{data.payment?.method}</H3>
          </FlexRow>
          <FlexRow justify="between" className="py-2">
            <H3>Monto</H3>
            <H3>{formatCurrency(data.currency, data.payment?.amount)}</H3>
          </FlexRow>
          <FlexRow justify="between" className="py-2">
            <H3>Propina</H3>
            <H3>{formatCurrency(data.currency, data.payment?.tip)}</H3>
          </FlexRow>
          <FlexRow justify="between" className="py-2">
            <H3>Total</H3>
            <H3 boldVariant="bold">{formatCurrency(data.currency, data.payment?.total)}</H3>
          </FlexRow>
        </div>
      </div>
      <fetcher.Form method="POST" className="flex flex-col space-y-2">
        <button
          className={clsx('w-full rounded-lg  py-4 border-2  ', {
            'bg-button-successBg text-success': data.payment.status === 'accepted',
            'bg-success text-white': data.payment.status !== 'accepted',
          })}
          name="intent"
          value="accept"
          disabled={data.payment.status === 'accepted' || isSubmitting}
        >
          {data.payment.status === 'accepted' ? (
            <FlexRow className="justify-center space-x-4">
              <FaCheckCircle />
              <span>Pago Aceptado</span>
            </FlexRow>
          ) : (
            'Aceptar'
          )}
        </button>
        {/* {data.payment.status !== 'accepted' ? (
          <button
            className="w-full rounded-lg  py-4 border-2 border-dashb-text"
            name="intent"
            value="pending"
            disabled={data.payment.status === 'pending' || isSubmitting}
          >
            Atender después
          </button>
        ) : null} */}
        <input type="hidden" name="userId" value={data.payment?.user?.id} />
      </fetcher.Form>
    </SubModal>
  )
}
