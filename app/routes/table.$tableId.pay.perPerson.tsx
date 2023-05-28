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
import {useState} from 'react'
import invariant from 'tiny-invariant'
import {
  FlexRow,
  H2,
  H4,
  H5,
  ItemContainer,
  Payment,
  SectionContainer,
} from '~/components'
import {Modal} from '~/components/modal'
import {prisma} from '~/db.server'
import {getPaymentMethods, getTipsPercentages} from '~/models/branch.server'
import {validateRedirect} from '~/redirect.server'
import {getUserId} from '~/session.server'
import {formatCurrency, getAmountLeftToPay, getCurrency} from '~/utils'

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
        }`,
      )
    }
    const userPrevPaidData = await prisma.user.findFirst({
      where: {id: userId},
      select: {paid: true, tip: true, total: true},
    })
    // const updateUser =
    await prisma.user.update({
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

interface User {
  id: number
  name: string
  cartItems: CartItem[]
}

export default function PerPerson() {
  const navigate = useNavigate()
  const data = useLoaderData()
  const actionData = useActionData()

  const submit = useSubmit()

  function handleChange(event: React.FormEvent<HTMLFormElement>) {
    submit(event.currentTarget, {replace: true})
  }

  const [collapse, setCollapse] = useState(false)
  const handleCollapse = (e: any) => {
    e.preventDefault()
    setCollapse(!collapse)
  }
  console.log('collapse', collapse)

  return (
    <Modal
      onClose={() => navigate('..')}
      // fullScreen={true}
      title="Dividir por usuario"
    >
      {/* <H1>Per Dish</H1> */}
      <Form
        method="POST"
        preventScrollReset
        onChange={handleChange}
        // action={`../pay/action`}
      >
        {Object.keys(data.userTotals).map(userId => {
          const user = data.userTotals[userId]
          return (
            <div className="space-y-2 p-2" key={userId}>
              <FlexRow justify="between">
                <ItemContainer
                  showCollapse={true}
                  handleCollapse={handleCollapse}
                >
                  {/* <label htmlFor="selectedUsers">{user.user.name}</label> */}
                  <H4>{user.user.name}</H4>
                  <FlexRow>
                    <H2>{formatCurrency(data.currency, user.total)}</H2>
                    <input
                      type="checkbox"
                      name="selectedUsers"
                      value={user.total}
                    />
                  </FlexRow>
                </ItemContainer>
                {/* Detalles */}
              </FlexRow>
              <SectionContainer divider={true}>
                {user.cartItems.map((item: CartItem) => {
                  return (
                    <FlexRow key={item.id} className="p-2" justify="between">
                      <H5>{item.quantity}</H5>
                      <H5>{item.name}</H5>
                      <FlexRow>
                        <H4>{formatCurrency(data.currency, item.price)}</H4>
                        <H4>
                          c/u:
                          {/* @ts-expect-error */}
                          {formatCurrency(data.currency, item.itemTotal)}
                        </H4>
                      </FlexRow>
                    </FlexRow>
                  )
                })}
              </SectionContainer>
            </div>
          )
        })}

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
