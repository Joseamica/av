import { Form, useNavigate, useSearchParams } from '@remix-run/react'

import type { ActionArgs, LoaderArgs } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'

import type { PaymentMethod } from '@prisma/client'
import invariant from 'tiny-invariant'
import { prisma } from '~/db.server'
import { validateRedirect } from '~/redirect.server'
import { getSession, getUserId } from '~/session.server'
import { useLiveLoader } from '~/use-live-loader'

import { getBranchId, getPaymentMethods, getTipsPercentages } from '~/models/branch.server'
import { getMenu } from '~/models/menu.server'
import { getOrder } from '~/models/order.server'
import { getPaidUsers } from '~/models/user.server'

import { createQueryString, formatCurrency, getAmountLeftToPay, getCurrency } from '~/utils'
import { getDomainUrl, getStripeSession } from '~/utils/stripe.server'

import { BillAmount, Button, H1, H5, LinkButton, Spacer } from '~/components'
import { Modal } from '~/components/modal'

export async function action({ request, params }: ActionArgs) {
  const { tableId } = params
  invariant(tableId, 'No se encontró mesa')

  const branchId = await getBranchId(tableId)
  const order = await getOrder(tableId)
  invariant(order, 'No se encontró la orden, o aun no ha sido creada.')
  invariant(branchId, 'No se encontró la sucursal')

  const formData = await request.formData()

  const redirectTo = validateRedirect(request.redirect, `/table/${tableId}`)

  const paymentMethod = formData.get('paymentMethod') as PaymentMethod

  const action = formData.get('_action') as string

  const url = new URL(request.url)
  const searchParams = new URLSearchParams(url.search)
  const restAllToTip = formData.get('tip') as string
  const tip = Number(searchParams.get('tip')) as number

  const selectedTip = action === 'normal' ? Number(tip) : Number(restAllToTip)

  const amountLeft = (await getAmountLeftToPay(tableId)) || 0
  const menuCurrency = await getMenu(branchId).then((menu: any) => menu?.currency || 'mxn')
  const total = amountLeft

  if (paymentMethod === 'card') {
    const stripeRedirectUrl = await getStripeSession(
      total * 100 + Number(tip) * 100,
      true,
      getDomainUrl(request) + redirectTo,
      menuCurrency,
      selectedTip,
      paymentMethod,
    )
    return redirect(stripeRedirectUrl)
  } else if (paymentMethod === 'cash') {
    const params = {
      typeOfPayment: 'confirmExtra',
      amount: total + tip,
      tip: tip,
      paymentMethod: paymentMethod,
      // extraData: itemData ? JSON.stringify(itemData) : undefined,
      isOrderAmountFullPaid: true,
    }
    const queryString = createQueryString(params)
    return redirect(`${redirectTo}/payment/success?${queryString}`)
  }

  return json({ success: true })
}

export async function loader({ request, params }: LoaderArgs) {
  const { tableId } = params
  invariant(tableId, 'No se encontró mesa')

  const order = await getOrder(tableId)
  invariant(order, 'No se encontró la orden, o aun no ha sido creada.')
  const tipsPercentages = await getTipsPercentages(tableId)
  const paymentMethods = await getPaymentMethods(tableId)

  const cartItems = await prisma.cartItem.findMany({
    // FIX
    where: { orderId: order.id, activeOnOrder: true },
    include: { product: true, user: true },
  })

  const session = await getSession(request)

  const userId = await getUserId(session)
  const amountLeft = await getAmountLeftToPay(tableId)
  const currency = await getCurrency(tableId)

  const paidUsers = await getPaidUsers(order.id)

  const total = order.total

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
  const data = useLiveLoader<typeof loader>()

  const [searchParams, setSearchParams] = useSearchParams()

  const redirectTo = searchParams.get('redirectTo')
  const tip = Number(searchParams.get('tip')) as number
  const total = Number(searchParams.get('total')) as number
  const paymentMethod = searchParams.get('pMethod') as PaymentMethod

  return (
    <Modal onClose={() => navigate('..')} title="Estás siendo super generoso">
      <Form method="POST" preventScrollReset className="p-2">
        <BillAmount
          amountLeft={data.amountLeft}
          currency={data.currency}
          paidUsers={data.paidUsers}
          total={Number(data.total)}
          userId={data.userId}
        />
        <Spacer spaceY="2" />
        <div className="flex flex-col items-center justify-center p-2 bg-white rounded-lg shadow-lg">
          <H5>Quieres pagar</H5>
          <H1 className="text-3xl">{formatCurrency(data.currency, total)}</H1>
          <H5>Estas pagando de mas</H5>
          <H1 className="text-3xl">{formatCurrency(data.currency, Number(total) - Number(data.amountLeft))}</H1>
        </div>
        <Spacer spaceY="2" />
        <div className="space-y-2">
          <Button name="_action" value="normal" fullWith={true}>
            <H5>
              Pagar {formatCurrency(data.currency, Number(data.amountLeft || 0))} y da {formatCurrency(data.currency, tip)} de propina
            </H5>
          </Button>
          <Button fullWith={true} name="_action" value="restInTip">
            <H5>Da {formatCurrency(data.currency, Number(total) - Number(data.amountLeft))} de propina y paga el resto</H5>
          </Button>

          <LinkButton variant="danger" fullWith={true} to={redirectTo || '..'}>
            Cancelar
          </LinkButton>
        </div>
        <input type="hidden" name="paymentMethod" value={paymentMethod} />
        <Spacer spaceY="1" />
        {/* FIX MAKE IT WORK */}
        <input type="hidden" name="tip" value={Number(total || 0) - Number(data.amountLeft || 0)} />
      </Form>
    </Modal>
  )
}
