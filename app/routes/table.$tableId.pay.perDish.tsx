import type {CartItem} from '@prisma/client'
import type {ActionArgs, LoaderArgs} from '@remix-run/node'
import {json, redirect} from '@remix-run/node'
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
  useSubmit,
} from '@remix-run/react'
import React from 'react'
import invariant from 'tiny-invariant'
import {FlexRow, H1, H2, H5, H6, Payment} from '~/components'
import {Modal} from '~/components/modal'
import {prisma} from '~/db.server'
import {
  getBranchId,
  getPaymentMethods,
  getTipsPercentages,
} from '~/models/branch.server'
import {validateRedirect} from '~/redirect.server'
import {getUserId, getUsername} from '~/session.server'
import {formatCurrency} from '~/utils'
import {getAmountLeftToPay, getCurrency} from '~/utils'

type LoaderData = {
  cartItems: CartItem[]
  paidCartItems: CartItem[]
  unpaidCartItems: CartItem[]
  tipsPercentages: number[]
  paymentMethods: string[]
  currency: string
}

export async function loader({request, params}: LoaderArgs) {
  const {tableId} = params
  invariant(tableId, 'No se encontró mesa')
  const branchId = await getBranchId(tableId)
  const tipsPercentages = await getTipsPercentages(tableId)
  const paymentMethods = await getPaymentMethods(tableId)
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

  return json({
    cartItems,
    paidCartItems,
    unpaidCartItems,
    tipsPercentages,
    paymentMethods,
    currency,
  })
}

export async function action({request, params}: ActionArgs) {
  const {tableId} = params
  invariant(tableId, 'No se encontró mesa')
  const formData = await request.formData()

  const redirectTo = validateRedirect(request.redirect, `/table/${tableId}`)

  const proceed = formData.get('_action') === 'proceed'
  const tipPercentage = formData.get('tipPercentage') as string
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
  if (!total) {
    return json({error: 'No se ha seleccionado ningún platillo'}, {status: 400})
  }

  const tip = total * (Number(tipPercentage) / 100)
  console.log('tip', tipPercentage)

  const amountLeft = (await getAmountLeftToPay(tableId)) || 0
  let error = ''
  if (amountLeft < total) {
    error = 'Estas pagando de mas...'
  }

  if (proceed) {
    if (amountLeft < total) {
      return redirect(
        `/table/${tableId}/pay/confirmExtra?total=${total}&tip=${
          tip <= 0 ? total * 0.12 : tip
        }`,
      )
    }
    const userId = await getUserId(request)
    const userName = await getUsername(request)
    //loop through items and update price and paid
    for (const {itemId} of itemData) {
      const cartItem = await prisma.cartItem.findUnique({
        where: {id: itemId},
      })

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
    const updateUser = await prisma.user.update({
      where: {id: userId},
      data: {
        paid: Number(userPrevPaidData?.paid) + total,
        tip: Number(userPrevPaidData?.tip) + tip,
        total: Number(userPrevPaidData?.total) + total + tip,
      },
    })
    return redirect(redirectTo)
  }
  return json({total, tip, error})
}

export default function PerDish() {
  const navigate = useNavigate()
  const data = useLoaderData<LoaderData>()
  const actionData = useActionData()
  const submit = useSubmit()
  function handleChange(event: React.FormEvent<HTMLFormElement>) {
    submit(event.currentTarget, {replace: true})
  }

  return (
    <Modal
      onClose={() => navigate('..')}
      fullScreen={true}
      title="Dividir por platillo"
    >
      <Form method="POST" preventScrollReset onChange={handleChange}>
        <div className="space-y-2">
          {data.cartItems?.map((item: CartItem) => {
            return (
              <FlexRow
                key={item.id}
                justify="between"
                className="rounded-full bg-night-400 px-4 py-2"
              >
                <FlexRow>
                  <H5>{item.quantity}</H5>
                  <H1>{item.name}</H1>
                </FlexRow>

                <FlexRow>
                  <H2>{formatCurrency(data.currency, item.price)}</H2>
                  {item.paid ? (
                    <H6 className="rounded-full bg-night-300 p-1 text-green-500">{`Pagado por ${item.paidBy}`}</H6>
                  ) : (
                    <input type="checkbox" name={`item-${item.id}`} />
                  )}
                  <input
                    type="hidden"
                    name={`price-${item.id}`}
                    value={item.price}
                  />
                </FlexRow>
              </FlexRow>
            )
          })}
        </div>
        <H5 variant="error">{actionData?.error}</H5>
        <Payment
          total={actionData?.total}
          tip={actionData?.tip}
          tipsPercentages={data.tipsPercentages}
          paymentMethods={data.paymentMethods}
          currency={data.currency}
        />
      </Form>
    </Modal>
  )
}
