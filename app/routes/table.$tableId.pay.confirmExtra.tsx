import {PaymentMethod} from '@prisma/client'
import type {ActionArgs, LoaderArgs} from '@remix-run/node'
import {json, redirect} from '@remix-run/node'
import {
  Form,
  useLoaderData,
  useNavigate,
  useSearchParams,
  useSubmit,
} from '@remix-run/react'
import React from 'react'
import invariant from 'tiny-invariant'
import {BillAmount, Button, H1, H2, H3, H5, Payment, Spacer} from '~/components'
import {Modal} from '~/components/modal'
import {prisma} from '~/db.server'
import {EVENTS} from '~/events'
import {
  getBranchId,
  getPaymentMethods,
  getTipsPercentages,
} from '~/models/branch.server'
import {getMenu} from '~/models/menu.server'
import {createPayment} from '~/models/payments.server'
import {getPaidUsers} from '~/models/user.server'
import {validateRedirect} from '~/redirect.server'
import {getUserId, getUsername} from '~/session.server'
import {SendWhatsApp} from '~/twilio.server'
import {useLiveLoader} from '~/use-live-loader'
import {formatCurrency, getAmountLeftToPay, getCurrency} from '~/utils'
import {getDomainUrl, getStripeSession} from '~/utils/stripe.server'

export async function action({request, params}: ActionArgs) {
  const {tableId} = params
  invariant(tableId, 'No se encontró mesa')
  const formData = await request.formData()

  const redirectTo = validateRedirect(request.redirect, `/table/${tableId}`)

  const proceed = formData.get('_action') === 'proceed'
  const tip = formData.get('tip') as string
  const paymentMethod = formData.get('paymentMethod') as PaymentMethod
  const branchId = await getBranchId(tableId)
  const userName = await getUsername(request)

  const order = await prisma.order.findFirst({
    where: {tableId},
  })
  invariant(order, 'No se encontró la orden, o aun no ha sido creada.')
  invariant(branchId, 'No se encontró la sucursal')

  const url = new URL(request.url)
  const searchParams = new URLSearchParams(url.search)
  // const tip = Number(searchParams.get('tip')) as number

  //WHEN SUBMIT
  if (proceed) {
    const amountLeft = (await getAmountLeftToPay(tableId)) || 0
    const userId = await getUserId(request)

    const userPrevPaidData = await prisma.user.findFirst({
      where: {id: userId},
      select: {paid: true, tip: true, total: true},
    })
    const updateUser = await prisma.user.update({
      where: {id: userId},
      data: {
        paid: Number(userPrevPaidData?.paid) + Number(amountLeft),
        tip: Number(userPrevPaidData?.tip) + Number(tip),
        total:
          Number(userPrevPaidData?.total) + Number(amountLeft) + Number(tip),
      },
    })
    // NOTE - esto va aqui porque si el metodo de pago es otro que no sea tarjeta, entonces que cree el pago directo, sin stripe (ya que stripe tiene su propio create payment en el webhook)
    if (paymentMethod === 'card') {
      const stripeRedirectUrl = await getStripeSession(
        amountLeft * 100 + Number(tip) * 100,
        getDomainUrl(request),
        tableId,
        // FIX aqui tiene que tener congruencia con el currency del database, ya que stripe solo acepta ciertas monedas, puedo hacer una condicion o cambiar db a "eur"
        'eur',
        Number(tip),
        order.id,
        paymentMethod,
        userId,
        branchId,
      )
      return redirect(stripeRedirectUrl)
    } else if (paymentMethod === 'cash') {
      await createPayment(
        paymentMethod,
        amountLeft,
        Number(tip),
        order.id,
        userId,
        branchId,
      )
      SendWhatsApp(
        '14155238886',
        `5215512956265`,
        `El usuario ${userName} ha pagado quiere pagar en efectivo propina ${tip} y total ${amountLeft}`,
      )
    }
    //Create event to reload to all users
    EVENTS.ISSUE_CHANGED(tableId)

    return redirect(redirectTo)
  }

  return json({success: true})
}

export async function loader({request, params}: LoaderArgs) {
  const {tableId} = params
  invariant(tableId, 'No se encontró mesa')

  const order = await prisma.order.findFirst({
    where: {tableId},
  })
  invariant(order, 'No se encontró la orden, o aun no ha sido creada.')
  const tipsPercentages = await getTipsPercentages(tableId)
  const paymentMethods = await getPaymentMethods(tableId)
  const cartItems = await prisma.cartItem.findMany({
    // FIX
    where: {orderId: order.id, activeOnOrder: true},
    include: {menuItem: true, user: true},
  })
  const userId = await getUserId(request)
  const amountLeft = await getAmountLeftToPay(tableId)
  const currency = await getCurrency(tableId)

  let paidUsers = null
  if (order) {
    paidUsers = await getPaidUsers(order.id)
  }
  const total = await prisma.order
    .aggregate({
      where: {id: order.id},
      _sum: {total: true},
    })
    .then(res => res._sum.total)

  return json({
    cartItems,
    total,
    tipsPercentages,
    paymentMethods,
    amountLeft,
    paidUsers,
    userId,
    currency,
  })
}

export default function EqualParts() {
  const navigate = useNavigate()
  const data = useLiveLoader()

  const [searchParams] = useSearchParams()
  const tip = Number(searchParams.get('tip')) as number
  const total = Number(searchParams.get('total')) as number
  const paymentMethod = searchParams.get('pMethod') as PaymentMethod
  console.log('paymentMethod', paymentMethod)

  const submit = useSubmit()
  function handleChange(event: React.FormEvent<HTMLFormElement>) {
    submit(event.currentTarget, {replace: true})
  }

  return (
    <Modal
      onClose={() => navigate('..')}
      // fullScreen={true}
      title="Estás siendo super generoso"
    >
      <Form
        method="POST"
        preventScrollReset
        onChange={handleChange}
        className="p-2"
      >
        <BillAmount
          amountLeft={data.amountLeft}
          currency={data.currency}
          paidUsers={data.paidUsers}
          total={data.total}
          userId={data.userId}
        />
        <Spacer spaceY="2" />
        <div className="flex flex-col items-center justify-center rounded-lg bg-white p-2 shadow-lg">
          <H5>Quieres pagar</H5>
          <H1 className="text-3xl">{formatCurrency(data.currency, total)}</H1>
        </div>
        <Spacer spaceY="2" />

        {/* <div>
          <H1>Total: {formatCurrency(data.currency, data.amountLeft)}</H1>
          <H1>Propina: {formatCurrency(data.currency, tip)}</H1>
        </div> */}
        <Button name="_action" value="proceed" fullWith={true}>
          Da{' '}
          {formatCurrency(
            data.currency,
            Number(total || 0) - Number(data.amountLeft || 0),
          )}{' '}
          como propina y paga{' '}
          {formatCurrency(data.currency, +Number(data.amountLeft || 0))}
        </Button>
        <input
          type="hidden"
          name="tip"
          value={Number(total || 0) - Number(data.amountLeft || 0)}
        />
        <input type="hidden" name="paymentMethod" value={paymentMethod} />
        <Spacer spaceY="1" />
        {/* FIX MAKE IT WORK */}
        {/* <Button name="_action" value="proceed" fullWith={true}>
          Pagar {formatCurrency(data.currency, Number(total || 0))} y dejar{' '}
          {formatCurrency(data.currency, +Number(tip || 0))} de propina
        </Button> */}
        {/* <Payment
          total={data.amountLeft}
          tip={tip}
          tipsPercentages={data.tipsPercentages}
          paymentMethods={data.paymentMethods}
          currency={data.currency}
        /> */}
      </Form>
    </Modal>
  )
}
