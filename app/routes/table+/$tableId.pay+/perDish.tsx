import { Form, useNavigate } from '@remix-run/react'
import React from 'react'

import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'

import type { CartItem, PaymentMethod } from '@prisma/client'
import clsx from 'clsx'
import invariant from 'tiny-invariant'
import { prisma } from '~/db.server'
import { validateRedirect } from '~/redirect.server'
import { useLiveLoader } from '~/use-live-loader'

import { getBranchId, getPaymentMethods, getTipsPercentages } from '~/models/branch.server'
import { getMenu } from '~/models/menu.server'
import { getOrder } from '~/models/order.server'

import { formatCurrency, getAmountLeftToPay, getCurrency } from '~/utils'
import { handlePaymentProcessing } from '~/utils/payment-processing.server'

import { FlexRow, H3, H4, H5, H6 } from '~/components'
import { ItemContainer } from '~/components/containers/item-container'
import { Modal } from '~/components/modal'
import Payment from '~/components/payment/paymentV3'

type LoaderData = {
  cartItems: CartItem[]
  paidCartItems: CartItem[]
  unpaidCartItems: CartItem[]
  tipsPercentages: number[]
  paymentMethods: string[]
  currency: string
  amountLeft: number
}

const getItemsAndTotalFromFormData = (formData: FormData) => {
  const entries = formData.entries()
  const items = [...entries].filter(([key]) => key.startsWith('item-'))
  const prices = [...formData.entries()].filter(([key]) => key.startsWith('price-'))

  const itemData = items.map(([key, value]) => {
    const itemId = key.split('-')[1]
    const price = prices.find(([priceKey]) => priceKey === `price-${itemId}`)?.[1] as string
    return { itemId, price }
  })

  const total = itemData.reduce((acc, item) => {
    return acc + parseFloat(item.price)
  }, 0)

  return { itemData, total }
}

export default function PerDish() {
  const navigate = useNavigate()
  const data = useLiveLoader<LoaderData>()

  const [amountToPay, setAmountToPay] = React.useState(0)

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>, amount: number) => {
    if (event.target.checked) {
      setAmountToPay(amountToPay + amount)
    } else {
      setAmountToPay(amountToPay - amount)
    }
  }

  return (
    <Modal onClose={() => navigate('..', { replace: true })} title="Dividir por platillo">
      <Payment
        state={{
          amountLeft: data.amountLeft,
          amountToPayState: amountToPay,
          currency: data.currency,
          paymentMethods: data.paymentMethods,
          tipsPercentages: data.tipsPercentages,
        }}
      >
        <Form method="POST" preventScrollReset>
          <H5 className="px-2 text-end">Selecciona los platillos que deseas pagar</H5>
          <div className="p-2 space-y-2">
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
                    <div className="flex flex-row space-x-2 items-center">
                      {item?.user?.map(u => {
                        return (
                          <H5 variant="secondary" key={u.id}>
                            {u.name}
                          </H5>
                        )
                      })}
                    </div>
                  </FlexRow>

                  <FlexRow>
                    <H4 className={clsx({ ' line-through ': item.paid })}>{formatCurrency(data.currency, item.price * item.quantity)}</H4>
                    {item.paid ? (
                      <H6 className="p-1 rounded-full text-success">{`Pagado ${item.paidBy}`}</H6>
                    ) : (
                      <input
                        type="checkbox"
                        onChange={event => handleAmountChange(event, item.price * item.quantity)}
                        name={`item-${item.id}`}
                        className="w-5 h-5"
                      />
                    )}
                    <input type="hidden" name={`price-${item.id}`} value={item.price * item.quantity} />
                  </FlexRow>
                </ItemContainer>
              )
            })}
          </div>
          <Payment.Form />
        </Form>
      </Payment>
    </Modal>
  )
}

// ANCHOR ACTION
export async function action({ request, params }: ActionFunctionArgs) {
  const { tableId } = params
  invariant(tableId, 'No se encontró mesa')

  const branchId = await getBranchId(tableId)
  const order = await getOrder(tableId)
  invariant(order, 'No se encontró la orden, o aun no ha sido creada.')
  invariant(branchId, 'No se encontró la sucursal')
  const formData = await request.formData()
  const data = Object.fromEntries(formData)

  const redirectTo = validateRedirect(request.redirect, `/table/${tableId}`)

  const { itemData, total } = getItemsAndTotalFromFormData(formData)

  const tip = total * (Number(data.tipPercentage) / 100)

  const amountLeft = (await getAmountLeftToPay(tableId)) || 0
  const menuCurrency = await getMenu(branchId).then((menu: any) => menu?.currency || 'mxn')

  if (amountLeft < total) {
    const url = new URL(request.url)
    const pathname = url.pathname
    return redirect(
      `/table/${tableId}/pay/confirmExtra?total=${total}&tip=${tip <= 0 ? total * 0.12 : tip}&pMethod=${
        data.paymentMethod
      }&redirectTo=${pathname}`,
    )
  }

  const isOrderAmountFullPaid = amountLeft <= total

  const result = await handlePaymentProcessing({
    paymentMethod: data.paymentMethod as string,
    total,
    tip,
    currency: menuCurrency,
    isOrderAmountFullPaid,
    request,
    redirectTo,
    typeOfPayment: 'perDish',
    itemData: JSON.stringify(itemData),
    extraData: { branchId, tableId, order },
  })

  if (result.type === 'redirect') {
    return redirect(result.url)
  }

  return json({ success: true })
}

// ANCHOR LOADER
export async function loader({ request, params }: LoaderFunctionArgs) {
  const { tableId } = params
  invariant(tableId, 'No se encontró mesa')
  const tipsPercentages = await getTipsPercentages(tableId)
  const paymentMethods = await getPaymentMethods(tableId)

  const order = await prisma.order.findFirst({
    where: { tableId },
  })

  invariant(order, 'No se encontró la orden, o aun no ha sido creada.')

  const cartItems = await prisma.cartItem.findMany({
    where: { orderId: order.id, activeOnOrder: true },
    include: { product: true, user: true },
  })

  const individualCartItems = cartItems.flatMap(item =>
    Array.from({ length: item.quantity }, (_, index) => ({
      ...item,
      quantity: 1,
      uniqueId: `${item.id}-${index}`, // Added a unique ID for each individual item
    })),
  )

  const paidCartItems = cartItems.filter(item => item.paid === true) || []
  const unpaidCartItems = cartItems.filter(item => item.paid === false) || []
  const currency = await getCurrency(tableId)

  const amountLeft = (await getAmountLeftToPay(tableId)) || 0

  return json({
    cartItems: individualCartItems,
    paidCartItems,
    unpaidCartItems,
    tipsPercentages,
    paymentMethods,
    currency,
    amountLeft,
  })
}
