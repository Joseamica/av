import type {CartItem, PaymentMethod} from '@prisma/client'
import type {ActionArgs, LoaderArgs} from '@remix-run/node'
import {json, redirect} from '@remix-run/node'
import {
  Form,
  useActionData,
  useNavigate,
  useSearchParams,
  useSubmit,
} from '@remix-run/react'
import clsx from 'clsx'
import React from 'react'
import invariant from 'tiny-invariant'
import {FlexRow, H3, H4, H5, H6, Payment} from '~/components'
import {ItemContainer} from '~/components/containers/itemContainer'
import {Modal} from '~/components/modal'
import {prisma} from '~/db.server'
import {EVENTS} from '~/events'
import {
  getBranchId,
  getPaymentMethods,
  getTipsPercentages,
} from '~/models/branch.server'
import {createPayment} from '~/models/payments.server'
import {validateRedirect} from '~/redirect.server'
import {getSession, getUserId, getUsername} from '~/session.server'
import {SendWhatsApp} from '~/twilio.server'
import {useLiveLoader} from '~/use-live-loader'
import {formatCurrency, getAmountLeftToPay, getCurrency} from '~/utils'
import {getDomainUrl, getStripeSession} from '~/utils/stripe.server'

type LoaderData = {
  cartItems: CartItem[]
  paidCartItems: CartItem[]
  unpaidCartItems: CartItem[]
  tipsPercentages: number[]
  paymentMethods: string[]
  currency: string
  amountLeft: number
}

export async function loader({request, params}: LoaderArgs) {
  const {tableId} = params
  invariant(tableId, 'No se encontró mesa')
  const tipsPercentages = await getTipsPercentages(tableId)
  const paymentMethods = await getPaymentMethods(tableId)
  const session = await getSession(request)
  const order = await prisma.order.findFirst({
    where: {tableId},
  })

  invariant(order, 'No se encontró la orden, o aun no ha sido creada.')

  const cartItems = await prisma.cartItem.findMany({
    // FIX
    where: {orderId: order.id, activeOnOrder: true},
    include: {menuItem: true, user: true},
  })

  const paidCartItems = cartItems.filter(item => item.paid === true) || []
  const unpaidCartItems = cartItems.filter(item => item.paid === false) || []
  const currency = await getCurrency(tableId)

  const amountLeft = (await getAmountLeftToPay(tableId)) || 0
  // EVENTS.ISSUE_CHANGED(tableId, `userIsPaying ${username}`)

  return json({
    cartItems,
    paidCartItems,
    unpaidCartItems,
    tipsPercentages,
    paymentMethods,
    currency,
    amountLeft,
  })
}

const getItemsAndTotalFromFormData = (formData: FormData) => {
  const entries = formData.entries()
  const items = [...entries].filter(([key]) => key.startsWith('item-'))
  const prices = [...formData.entries()].filter(([key]) =>
    key.startsWith('price-'),
  )

  const itemData = items.map(([key, value]) => {
    const itemId = key.split('-')[1]
    const price = prices.find(
      ([priceKey]) => priceKey === `price-${itemId}`,
    )?.[1] as string
    return {itemId, price}
  })

  const total = itemData.reduce((acc, item) => {
    return acc + parseFloat(item.price)
  }, 0)

  return {itemData, total}
}

const updatePaidItemsAndUserData = async (
  itemData: {itemId: string; price: string}[],
  total: number,
  tip: number,
  userName: string,
  userId: string,
) => {
  // Loop through items and update price and paid
  for (const {itemId} of itemData) {
    const cartItem = await prisma.cartItem.findUnique({where: {id: itemId}})
    if (cartItem) {
      await prisma.cartItem.update({
        where: {id: itemId},
        data: {paid: true, paidBy: userName},
      })
    }
  }

  const userPrevPaidData = await prisma.user.findFirst({
    where: {id: userId},
    select: {paid: true, tip: true, total: true},
  })

  await prisma.user.update({
    where: {id: userId},
    data: {
      paid: Number(userPrevPaidData?.paid) + total,
      tip: Number(userPrevPaidData?.tip) + tip,
      total: Number(userPrevPaidData?.total) + total + tip,
    },
  })
}

export async function action({request, params}: ActionArgs) {
  const {tableId} = params
  invariant(tableId, 'No se encontró mesa')
  const formData = await request.formData()

  const branchId = await getBranchId(tableId)
  const order = await prisma.order.findFirst({
    where: {tableId},
  })
  invariant(order, 'No se encontró la orden, o aun no ha sido creada.')
  invariant(branchId, 'No se encontró la sucursal')
  const paymentMethod = formData.get('paymentMethod') as PaymentMethod

  const redirectTo = validateRedirect(request.redirect, `/table/${tableId}`)

  const proceed = formData.get('_action') === 'proceed'
  const tipPercentage = formData.get('tipPercentage') as string

  const {itemData, total} = getItemsAndTotalFromFormData(formData)

  if (!total) {
    return json({error: 'No se ha seleccionado ningún platillo'}, {status: 400})
  }

  const tip = total * (Number(tipPercentage) / 100)
  const currency = await getCurrency(tableId)
  const amountLeft = (await getAmountLeftToPay(tableId)) || 0

  //ERROR HANDLING
  let error = ''
  if (amountLeft < total) {
    error = `Estas pagando ${formatCurrency(
      currency,
      total - amountLeft,
    )} de más....`
  }

  if (proceed) {
    if (amountLeft < total) {
      return redirect(
        `/table/${tableId}/pay/confirmExtra?total=${total}&tip=${
          tip <= 0 ? total * 0.12 : tip
        }&pMethod=${paymentMethod}`,
      )
    }
    const userId = await getUserId(request)
    const userName = await getUsername(request)

    await updatePaidItemsAndUserData(itemData, total, tip, userName, userId)
    // NOTE - esto va aqui porque si el metodo de pago es otro que no sea tarjeta, entonces que cree el pago directo, sin stripe (ya que stripe tiene su propio create payment en el webhook)
    if (paymentMethod === 'card') {
      const stripeRedirectUrl = await getStripeSession(
        total * 100 + tip * 100,
        getDomainUrl(request) + `/table/${tableId}`,
        tableId,
        // FIX aqui tiene que tener congruencia con el currency del database, ya que stripe solo acepta ciertas monedas, puedo hacer una condicion o cambiar db a "eur"
        'eur',
        tip,
        order.id,
        paymentMethod,
        userId,
        branchId,
        'perUser',
      )

      return redirect(stripeRedirectUrl)
    } else if (paymentMethod === 'cash') {
      await createPayment(paymentMethod, total, tip, order.id, userId, branchId)

      SendWhatsApp(
        '14155238886',
        `5215512956265`,
        `El usuario ${userName} ha pagado quiere pagar en efectivo propina ${tip} y total ${total}`,
      )
    }
    EVENTS.ISSUE_CHANGED(tableId, `userPaid ${userName}`)

    return redirect(redirectTo)
  }
  return json({total, tip, error})
}

export default function PerDish() {
  const navigate = useNavigate()
  const data = useLiveLoader<LoaderData>()
  const actionData = useActionData()
  const submit = useSubmit()
  function handleChange(event: React.FormEvent<HTMLFormElement>) {
    submit(event.currentTarget, {replace: true})
  }

  // const [searchParams] = useSearchParams()
  return (
    <Modal
      onClose={() => navigate('..', {replace: true})}
      // fullScreen={true}
      title="Dividir por platillo"
    >
      <Form method="POST" preventScrollReset onChange={handleChange}>
        <H5 className="px-2 text-end">
          Selecciona los platillos que deseas pagar
        </H5>
        <div className="space-y-2 p-2">
          {data.cartItems?.map((item: CartItem, index: number) => {
            return (
              <ItemContainer
                key={index}
                unActive={item.paid ? true : false}
                // showCollapse={true}
              >
                <FlexRow>
                  <H4>{item.quantity}</H4>
                  <H3>{item.name}</H3>
                </FlexRow>

                <FlexRow>
                  <H4 className={clsx({' line-through ': item.paid})}>
                    {formatCurrency(data.currency, item.price)}
                  </H4>
                  {item.paid ? (
                    <H6 className="rounded-full p-1 text-success">{`Pagado ${item.paidBy}`}</H6>
                  ) : (
                    <input
                      type="checkbox"
                      name={`item-${item.id}`}
                      className="h-5 w-5"
                    />
                  )}
                  <input
                    type="hidden"
                    name={`price-${item.id}`}
                    value={item.price}
                  />
                </FlexRow>
              </ItemContainer>
            )
          })}
        </div>
        {/* {actionData?.total && ( */}
        <Payment
          total={actionData?.total}
          tip={actionData?.tip}
          tipsPercentages={data.tipsPercentages}
          paymentMethods={data.paymentMethods}
          currency={data.currency}
          error={actionData?.error}
          amountLeft={data.amountLeft}
        />
        {/* )} */}
      </Form>
    </Modal>
  )
}
