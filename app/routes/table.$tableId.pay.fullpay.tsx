import type {ActionArgs, LoaderArgs} from '@remix-run/node'
import {json, redirect} from '@remix-run/node'
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
  useSubmit,
} from '@remix-run/react'
import invariant from 'tiny-invariant'
import {BillAmount, Payment, Spacer} from '~/components'
import {Modal} from '~/components/modal'
import {prisma} from '~/db.server'
import {
  getBranchId,
  getPaymentMethods,
  getTipsPercentages,
} from '~/models/branch.server'
import {getMenu} from '~/models/menu.server'
import {getOrder} from '~/models/order.server'
import {getPaidUsers} from '~/models/user.server'
import {validateRedirect} from '~/redirect.server'
import {getUserId, getUsername} from '~/session.server'
import {getAmountLeftToPay, getCurrency} from '~/utils'
import type {Order, PaymentMethod, User} from '@prisma/client'
import {EVENTS} from '~/events'
import {useLiveLoader} from '~/use-live-loader'
import {createPayment} from '~/models/payments.server'
import {SendWhatsApp} from '~/twilio.server'
import {getStripeSession, getDomainUrl} from '~/utils/stripe.server'

type LoaderData = {
  amountLeft: number
  total: number
  tableId: string
  paidUsers: any
  currency: string
  tipsPercentages: number[]
  paymentMethods: string[]
  userId: string
}

export async function loader({request, params}: LoaderArgs) {
  const {tableId} = params
  invariant(tableId, 'No se encontró mesa')
  const amountLeft = await getAmountLeftToPay(tableId)
  const order = await getOrder(tableId)
  const total = order?.total
  const userId = await getUserId(request)

  const tipsPercentages = await getTipsPercentages(tableId)
  const paymentMethods = await getPaymentMethods(tableId)

  let paidUsers = null

  if (order) {
    paidUsers = await getPaidUsers(order.id)
  }

  const currency = await getCurrency(tableId)

  // const currency = getCurrency(menu?.currency)

  const data = {
    amountLeft,
    total,
    tableId,
    paidUsers,
    currency,
    tipsPercentages,
    paymentMethods,
    userId,
  }

  return json(data)
}

export async function action({request, params}: ActionArgs) {
  const formData = await request.formData()

  const {tableId} = params
  invariant(tableId, 'tableId no encontrado')
  const branchId = await getBranchId(tableId)

  const order = await getOrder(tableId)
  invariant(order, 'No se encontró la orden')
  invariant(branchId, 'No se encontró la sucursal')

  const redirectTo = validateRedirect(request.redirect, `/table/${tableId}`)

  const userId = await getUserId(request)
  const proceed = formData.get('_action') === 'proceed'
  const tipPercentage = formData.get('tipPercentage') as string
  const paymentMethod = formData.get('paymentMethod') as PaymentMethod

  const userPrevPaid = await prisma.user.findFirst({
    where: {id: userId},
    select: {paid: true},
  })

  const amountLeft = (await getAmountLeftToPay(tableId)) || 0
  const total = Number(amountLeft) + Number(userPrevPaid?.paid)
  //FIX this \/
  //@ts-expect-error
  const tip = amountLeft * Number(tipPercentage / 100)

  if (proceed) {
    const userName = await getUsername(request)
    await prisma.order.update({
      where: {tableId: tableId},
      data: {
        paid: true,
        users: {
          update: {
            where: {id: userId},
            data: {
              paid: total,
              tip: tip,
              total: tip + total,
            },
          },
        },
      },
    })
    // NOTE - esto va aqui porque si el metodo de pago es otro que no sea tarjeta, entonces que cree el pago directo, sin stripe (ya que stripe tiene su propio create payment en el webhook)
    if (paymentMethod === 'card') {
      const stripeRedirectUrl = await getStripeSession(
        amountLeft * 100 + tip * 100,
        getDomainUrl(request),
        tableId,
        // FIX aqui tiene que tener congruencia con el currency del database, ya que stripe solo acepta ciertas monedas, puedo hacer una condicion o cambiar db a "eur"
        'eur',
        tip,
        order.id,
        paymentMethod,
        userId,
        branchId,
      )
      return redirect(stripeRedirectUrl)
    } else if (paymentMethod === 'cash') {
      await prisma.payments.create({
        data: {
          createdAt: new Date(),
          method: paymentMethod,
          amount: amountLeft,
          tip: Number(tip),
          total: amountLeft + tip,
          branchId,
          orderId: order?.id,
        },
      })
      SendWhatsApp(
        '14155238886',
        `5215512956265`,
        `El usuario ${userName} ha pagado quiere pagar en efectivo propina ${tip} y total ${amountLeft}`,
      )
    }
    EVENTS.ISSUE_CHANGED(tableId)
    return redirect(redirectTo)
  }

  return json({tip, total})
}

export default function FullPay() {
  const data = useLiveLoader<LoaderData>()
  const actionData = useActionData()
  const navigate = useNavigate()
  const submit = useSubmit()
  function handleChange(event: React.FormEvent<HTMLFormElement>) {
    submit(event.currentTarget, {replace: true})
  }

  return (
    <Modal
      onClose={() => navigate('..')}
      // fullScreen={true}
      title="Pagar cuenta completa"
    >
      <div>
        <BillAmount
          amountLeft={data.amountLeft}
          currency={data.currency}
          paidUsers={data.paidUsers}
          total={data.total}
          userId={data.userId}
        />
        <Spacer spaceY="2" />
        <Form method="POST" preventScrollReset onChange={handleChange}>
          <Payment
            total={data.amountLeft}
            tip={actionData?.tip}
            tipsPercentages={data.tipsPercentages}
            paymentMethods={data.paymentMethods}
            currency={data.currency}
          />
        </Form>
      </div>
    </Modal>
  )
}
