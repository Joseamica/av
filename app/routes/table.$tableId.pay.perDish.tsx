import type {CartItem} from '@prisma/client'
import type {ActionArgs, LoaderArgs} from '@remix-run/node'
import {json, redirect} from '@remix-run/node'
import {Form, useNavigate} from '@remix-run/react'
import clsx from 'clsx'
import React from 'react'
import invariant from 'tiny-invariant'
import {FlexRow, H3, H4, H5, H6, Payment} from '~/components'
import {ItemContainer} from '~/components/containers/item-container'
import {Modal} from '~/components/modal'

import {prisma} from '~/db.server'
import {
  getBranchId,
  getPaymentMethods,
  getTipsPercentages,
} from '~/models/branch.server'
import {getMenu} from '~/models/menu.server'
import {getOrder} from '~/models/order.server'
import {assignUserNewPayments} from '~/models/user.server'
import {validateRedirect} from '~/redirect.server'
import {getSession} from '~/session.server'
import {useLiveLoader} from '~/use-live-loader'
import {formatCurrency, getAmountLeftToPay, getCurrency} from '~/utils'
import {handlePaymentProcessing} from '~/utils/paymentProcessing.server'

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
  await assignUserNewPayments(userId, total, tip)
}

export async function action({request, params}: ActionArgs) {
  const {tableId} = params
  invariant(tableId, 'No se encontró mesa')

  const branchId = await getBranchId(tableId)
  const order = await getOrder(tableId)
  invariant(order, 'No se encontró la orden, o aun no ha sido creada.')
  invariant(branchId, 'No se encontró la sucursal')
  const formData = await request.formData()
  const data = Object.fromEntries(formData)

  const redirectTo = validateRedirect(request.redirect, `/table/${tableId}`)

  const {itemData, total} = getItemsAndTotalFromFormData(formData)

  // if (!total) {
  //   return json({error: 'No se ha seleccionado ningún platillo'}, {status: 400})
  // }

  const tip = total * (Number(data.tipPercentage) / 100)

  const amountLeft = (await getAmountLeftToPay(tableId)) || 0
  const menuCurrency = await getMenu(branchId).then(
    (menu: any) => menu?.currency || 'mxn',
  )

  //ERROR HANDLING

  // if (amountLeft < total) {
  //   const error = `Estas pagando ${formatCurrency(
  //     currency,
  //     total - amountLeft,
  //   )} de más....`
  //   return json({error}, {status: 400})
  // }

  if (amountLeft < total) {
    const url = new URL(request.url)
    const pathname = url.pathname
    return redirect(
      `/table/${tableId}/pay/confirmExtra?total=${total}&tip=${
        tip <= 0 ? total * 0.12 : tip
      }&pMethod=${data.paymentMethod}&redirectTo=${pathname}`,
    )
  }

  const isOrderAmountFullPaid = amountLeft <= total

  const result = await handlePaymentProcessing(
    data.paymentMethod as string,
    total,
    tip,
    menuCurrency,
    isOrderAmountFullPaid,
    request,
    redirectTo,
    'perDish',
    itemData ? JSON.stringify(itemData) : undefined,
  )

  if (result.type === 'redirect') {
    return redirect(result.url)
  }

  return json({success: true})
}

export default function PerDish() {
  const navigate = useNavigate()
  const data = useLiveLoader<LoaderData>()

  const [amountToPay, setAmountToPay] = React.useState(0)

  const handleAmountChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    amount: number,
  ) => {
    if (event.target.checked) {
      setAmountToPay(amountToPay + amount)
    } else {
      setAmountToPay(amountToPay - amount)
    }
  }

  // const [searchParams] = useSearchParams()
  return (
    <Modal
      onClose={() => navigate('..', {replace: true})}
      // fullScreen={true}
      title="Dividir por platillo"
    >
      <Form method="POST" preventScrollReset>
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
                    {formatCurrency(data.currency, item.price * item.quantity)}
                  </H4>
                  {item.paid ? (
                    <H6 className="rounded-full p-1 text-success">{`Pagado ${item.paidBy}`}</H6>
                  ) : (
                    <input
                      type="checkbox"
                      onChange={event =>
                        handleAmountChange(event, item.price * item.quantity)
                      }
                      name={`item-${item.id}`}
                      className="h-5 w-5"
                    />
                  )}
                  <input
                    type="hidden"
                    name={`price-${item.id}`}
                    value={item.price * item.quantity}
                  />
                </FlexRow>
              </ItemContainer>
            )
          })}
        </div>

        <Payment
          amountLeft={data.amountLeft}
          amountToPayState={amountToPay}
          currency={data.currency}
          paymentMethods={data.paymentMethods}
          tipsPercentages={data.tipsPercentages}
        />
        {/* )} */}
      </Form>
    </Modal>
  )
}
