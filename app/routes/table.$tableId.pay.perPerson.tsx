import type {CartItem} from '@prisma/client'
import type {ActionArgs, LoaderArgs} from '@remix-run/node'
import {json, redirect} from '@remix-run/node'
import {Form, useNavigate} from '@remix-run/react'
import {clsx} from 'clsx'
import React, {useState} from 'react'
import invariant from 'tiny-invariant'
import {
  FlexRow,
  H2,
  H4,
  H5,
  ItemContainer,
  Modal,
  Payment,
  SectionContainer,
} from '~/components'
import {prisma} from '~/db.server'
import {EVENTS} from '~/events'
import {
  getBranchId,
  getPaymentMethods,
  getTipsPercentages,
} from '~/models/branch.server'
import {getOrder} from '~/models/order.server'
import {createPayment} from '~/models/payments.server'
import {assignUserNewPayments} from '~/models/user.server'
import {validateRedirect} from '~/redirect.server'
import {getUserId, getUsername} from '~/session.server'
import {SendWhatsApp} from '~/twilio.server'
import {useLiveLoader} from '~/use-live-loader'
import {formatCurrency, getAmountLeftToPay, getCurrency} from '~/utils'
import {getDomainUrl, getStripeSession} from '~/utils/stripe.server'

export async function loader({request, params}: LoaderArgs) {
  const {tableId} = params
  invariant(tableId, 'No se encontró mesa')
  const currency = await getCurrency(tableId)
  const tipsPercentages = await getTipsPercentages(tableId)
  const paymentMethods = await getPaymentMethods(tableId)
  const usersInTable = await prisma.table.findFirst({
    where: {id: tableId},
    select: {users: {include: {cartItems: true}}},
  })
  invariant(usersInTable, 'No se encontró la orden')

  let userTotals = {} as Record<
    number,
    {user: User; cartItems: CartItem[]; total: number}
  >

  // Iterate over users and their cart items
  usersInTable.users.forEach((user: any) => {
    user.cartItems.forEach((item: any) => {
      if (!userTotals[user.id]) {
        userTotals[user.id] = {
          user: {
            id: user.id,
            name: user.name, // assuming your user model has a 'name' field
            // include other user fields you need
          },
          cartItems: [],
          total: 0,
        }
      }

      // Calculate the item's total price (quantity * price)
      let itemTotal = item.quantity * item.price

      // Check how many users have this item
      const usersWithItem = usersInTable.users.filter(u =>
        u.cartItems.some(i => i.id === item.id),
      )

      // If the item is shared among multiple users, divide its total by the number of users
      if (usersWithItem.length > 1) {
        itemTotal = itemTotal / usersWithItem.length
      }

      // Add the item's total to the user's total
      userTotals[user.id].total += itemTotal

      // Include item details
      userTotals[user.id].cartItems.push({
        id: item.id,
        name: item.name, // assuming your cartItem model has a 'name' field
        quantity: item.quantity,
        price: item.price,
        itemTotal: itemTotal,
        // include other cart item fields you need
      })
    })
  })
  const amountLeft = await getAmountLeftToPay(tableId)

  return json({
    userTotals,
    tipsPercentages,
    paymentMethods,
    currency,
    amountLeft,
  })
}

export async function action({request, params}: ActionArgs) {
  const {tableId} = params
  invariant(tableId, 'No se encontró mesa')

  const branchId = await getBranchId(tableId)
  const order = await getOrder(tableId)
  invariant(order, 'No se encontró la orden')
  invariant(branchId, 'No se encontró la sucursal')

  const formData = await request.formData()
  const data = Object.fromEntries(formData)

  const selectedUsers = formData.getAll('selectedUsers')

  const total = Number(
    selectedUsers.reduce((acc, item: any) => {
      return acc + parseFloat(item)
    }, 0),
  )

  if (total <= 0) {
    return json({error: 'No se puede pagar $0'}, {status: 400})
  }

  const redirectTo = validateRedirect(request.redirect, `/table/${tableId}`)
  const userId = await getUserId(request)
  const tip = total * (Number(data.tipPercentage) / 100)

  const amountLeft = (await getAmountLeftToPay(tableId)) || 0

  // let error = ''
  // if (amountLeft < total) {
  //   error = `Estas pagando ${formatCurrency(
  //     currency,
  //     total - amountLeft,
  //   )} de más....`
  // }

  const userName = await getUsername(request)
  if (amountLeft < total) {
    const url = new URL(request.url)
    const pathname = url.pathname
    return redirect(
      `/table/${tableId}/pay/confirmExtra?total=${total}&tip=${
        tip <= 0 ? total * 0.12 : tip
      }&pMethod=${data.paymentMethod}&redirectTo=${pathname}`,
    )
  }

  // NOTE - esto va aqui porque si el metodo de pago es otro que no sea tarjeta, entonces que cree el pago directo, sin stripe (ya que stripe tiene su propio create payment en el webhook)
  switch (data.paymentMethod) {
    case 'card':
      const stripeRedirectUrl = await getStripeSession(
        total * 100 + tip * 100,
        getDomainUrl(request),
        tableId,
        // FIX aqui tiene que tener congruencia con el currency del database, ya que stripe solo acepta ciertas monedas, puedo hacer una condicion o cambiar db a "eur"
        'eur',
        tip,
        order.id,
        data.paymentMethod,
        userId,
        branchId,
      )
      return redirect(stripeRedirectUrl)

    case 'cash':
      await createPayment(
        data.paymentMethod,
        total,
        tip,
        order.id,
        userId,
        branchId,
      )
      await assignUserNewPayments(userId, total, tip)

      SendWhatsApp(
        '14155238886',
        `5215512956265`,
        `El usuario ${userName} ha pagado quiere pagar en efectivo propina ${tip} y total ${total}`,
      )
      EVENTS.ISSUE_CHANGED(tableId)
      return redirect(redirectTo)
  }

  return json({success: true})
}

interface User {
  id: number
  name: string
  cartItems: CartItem[]
}

export default function PerPerson() {
  const navigate = useNavigate()
  const data = useLiveLoader<typeof loader>()
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

  const [collapsedSections, setCollapsedSections] = useState({})

  const handleCollapse = (userId: string) => (e: Event) => {
    e.preventDefault()
    setCollapsedSections(prev => ({
      ...prev,
      [userId]: !prev[userId],
    }))
  }

  return (
    <Modal onClose={() => navigate('..')} title="Dividir por usuario">
      <H5 className="px-2 text-end">
        Selecciona a los usuarios que deseas pagar
      </H5>
      <Form method="POST" preventScrollReset>
        {Object.values(data.userTotals).length > 0
          ? Object.values(data.userTotals).map(user => (
              <UserItemContainer
                key={user.user.id}
                handleAmountChange={handleAmountChange}
                {...{user, handleCollapse, collapsedSections, data}}
              />
            ))
          : null}
        <Payment
          amountLeft={data.amountLeft}
          amountToPayState={amountToPay}
          currency={data.currency}
          paymentMethods={data.paymentMethods}
          tipsPercentages={data.tipsPercentages}
        />
      </Form>
    </Modal>
  )
}

const UserItemContainer = ({
  user,
  handleAmountChange,
  handleCollapse,
  collapsedSections,
  data,
}) => (
  <div className="p-2" key={user.user.id}>
    <FlexRow>
      <ItemContainer
        showCollapse={true}
        handleCollapse={handleCollapse(user.user.id)}
        collapse={collapsedSections[user.user.id]}
        className={clsx('justify-center', {
          'rounded-b-none': !collapsedSections[user.user.id],
        })}
      >
        <H4>{user.user.name}</H4>
        <FlexRow>
          <H2>{formatCurrency(data.currency, user.total)}</H2>
          <input
            type="checkbox"
            name="selectedUsers"
            value={user.total}
            className="h-5 w-5"
            onChange={e => handleAmountChange(e, user.total)}
            onClick={e => e.stopPropagation()} // Add this line
          />
        </FlexRow>
      </ItemContainer>
    </FlexRow>
    {collapsedSections[user.user.id] ? (
      <SectionContainer divider={true} className="rounded-t-none">
        {user.cartItems.map((item: CartItem) => (
          <CartItemComponent key={item.id} {...{item, data}} />
        ))}
      </SectionContainer>
    ) : null}
  </div>
)

const CartItemComponent = ({item, data}) => (
  <FlexRow key={item.id} className="p-2" justify="between">
    <FlexRow>
      <H5>{item.quantity}</H5>
      <H5>{item.name}</H5>
    </FlexRow>
    <FlexRow className="items-center justify-center">
      <H5>c/u:{formatCurrency(data.currency, item.price)}</H5>
      <H4>{formatCurrency(data.currency, item.itemTotal)}</H4>
    </FlexRow>
  </FlexRow>
)
