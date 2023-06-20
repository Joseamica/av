import type {CartItem, PaymentMethod} from '@prisma/client'
import type {ActionArgs, LoaderArgs} from '@remix-run/node'
import {json, redirect} from '@remix-run/node'
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
  useSubmit,
} from '@remix-run/react'
import {clsx} from 'clsx'
import {useEffect, useState} from 'react'
import invariant from 'tiny-invariant'
import {
  FlexRow,
  H2,
  H4,
  H5,
  ItemContainer,
  Payment,
  SectionContainer,
  Modal,
} from '~/components'
import {prisma} from '~/db.server'
import {EVENTS} from '~/events'
import {
  getBranchId,
  getPaymentMethods,
  getTipsPercentages,
} from '~/models/branch.server'
import {createPayment} from '~/models/payments.server'
import {validateRedirect} from '~/redirect.server'
import {getUserId} from '~/session.server'
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

  return json({userTotals, tableId, tipsPercentages, paymentMethods, currency})
}

export async function action({request, params}: ActionArgs) {
  const formData = await request.formData()
  const {tableId} = params
  invariant(tableId, 'No se encontró mesa')

  const branchId = await getBranchId(tableId)
  const order = await prisma.order.findFirst({
    where: {tableId},
  })
  invariant(order, 'No se encontró la orden')

  const selectedUsers = formData.getAll('selectedUsers')

  const total = Number(
    selectedUsers.reduce((acc, item: any) => {
      return acc + parseFloat(item)
    }, 0),
  )

  if (total <= 0) {
    return json({error: 'No se puede pagar $0'}, {status: 400})
  }
  const proceed = formData.get('_action') === 'proceed'
  const tipPercentage = formData.get('tipPercentage') as string
  const paymentMethod = formData.get('paymentMethod') as PaymentMethod

  const redirectTo = validateRedirect(request.redirect, `/table/${tableId}`)
  const userId = await getUserId(request)
  const tip = total * (Number(tipPercentage) / 100)

  const amountLeft = (await getAmountLeftToPay(tableId)) || 0
  const currency = await getCurrency(tableId)

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

    const stripe = formData.get('stripe') as string
    if (paymentMethod === 'card') {
      const stripeRedirectUrl = await getStripeSession(
        total * 100 + tip * 100,
        getDomainUrl(request),
        `${tableId}`,
        'eur',
        tip * 100,
        order.id,
        paymentMethod,
        userId,
        branchId,
      )
      return redirect(stripeRedirectUrl)
    }

    const userPrevPaidData = await prisma.user.findFirst({
      where: {id: userId},
      select: {paid: true, tip: true, total: true},
    })
    // const updateUser =
    await createPayment(paymentMethod, total, tip, order.id, userId, branchId)

    await prisma.user.update({
      where: {id: userId},
      data: {
        paid: Number(userPrevPaidData?.paid) + total,
        tip: Number(userPrevPaidData?.tip) + tip,
        total: Number(userPrevPaidData?.total) + total + tip,
      },
    })
    EVENTS.ISSUE_CHANGED(tableId)

    return redirect(redirectTo)
  }

  return json({total, tip, error})
}

interface User {
  id: number
  name: string
  cartItems: CartItem[]
}

export default function PerPerson() {
  const navigate = useNavigate()
  const data = useLiveLoader()
  const actionData = useActionData()

  const submit = useSubmit()

  function handleChange(event: React.FormEvent<HTMLFormElement>) {
    submit(event.currentTarget, {replace: true})
  }

  const [collapsedSections, setCollapsedSections] = useState({})

  const handleCollapse = (userId: string) => (e: Event) => {
    e.preventDefault()
    setCollapsedSections(prev => ({
      ...prev,
      [userId]: !prev[userId],
    }))
  }
  // useEffect(() => {
  //   if (data.userTotals) {
  //     const initialCollapsedSections = {}
  //     Object.keys(data.userTotals).forEach(userId => {
  //       initialCollapsedSections[userId] = true
  //     })
  //     setCollapsedSections(initialCollapsedSections)
  //   }
  // }, [data.userTotals])

  return (
    <Modal onClose={() => navigate('..')} title="Dividir por usuario">
      <H5 className="px-2 text-end">
        Selecciona a los usuarios que deseas pagar
      </H5>
      <Form method="POST" preventScrollReset onChange={handleChange}>
        {Object.values(data.userTotals).length > 0
          ? Object.values(data.userTotals).map(user => (
              <UserItemContainer
                key={user.user.id}
                {...{user, handleCollapse, collapsedSections, data}}
              />
            ))
          : null}
        <Payment
          total={actionData?.total}
          tip={actionData?.tip}
          tipsPercentages={data.tipsPercentages}
          paymentMethods={data.paymentMethods}
          currency={data.currency}
          error={actionData?.error}
        />
      </Form>
    </Modal>
  )
}

const UserItemContainer = ({
  user,
  handleCollapse,
  collapsedSections,
  data,
}: UserItemContainerProps) => (
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
            onClick={e => e.stopPropagation()} // Add this line
          />
        </FlexRow>
      </ItemContainer>
    </FlexRow>
    {collapsedSections[user.user.id] ? null : (
      <SectionContainer divider={true} className="rounded-t-none">
        {user.cartItems.map((item: CartItem) => (
          <CartItemComponent key={item.id} {...{item, data}} />
        ))}
      </SectionContainer>
    )}
  </div>
)

const CartItemComponent = ({item, data}: CartItemComponentProps) => (
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

interface UserWithTotal {
  user: {
    id: number
    name: string
  }
  cartItems: CartItem[]
  total: number
}

interface UserTotalsData {
  userTotals: Record<number, UserWithTotal>
  tableId: string
  tipsPercentages: number[]
  paymentMethods: string[]
  currency: string
}

interface PerPersonProps {
  data: UserTotalsData
}

interface UserItemContainerProps {
  user: UserWithTotal
  handleCollapse: (userId: string) => (e: Event) => void
  collapsedSections: Record<string, boolean>
  data: UserTotalsData
}

interface ActionData {
  total?: number
  tip?: number
  error?: string
}

interface PerPersonProps {
  data: UserTotalsData
  actionData: ActionData
}

interface CartItemComponentProps {
  item: CartItem
  data: UserTotalsData
}
