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
import invariant from 'tiny-invariant'
import {Button, FlexRow, H2, H5, Payment} from '~/components'
import {Modal} from '~/components/modal'
import {prisma} from '~/db.server'
import {validateRedirect} from '~/redirect.server'
import {getUserId} from '~/session.server'

export async function loader({request, params}: LoaderArgs) {
  const {tableId} = params
  invariant(tableId, 'No se encontró mesa')

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

  return json({userTotals, tableId})
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

  if (proceed) {
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

  return json({total, tip})
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

  return (
    <Modal
      onClose={() => navigate('..')}
      fullScreen={true}
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
            <div key={userId}>
              <FlexRow className="justify-between px-4 py-2 rounded-full bg-night-400">
                <label htmlFor="selectedUsers">{user.user.name}</label>
                <FlexRow>
                  <H2>${user.total}</H2>
                  <input
                    type="checkbox"
                    name="selectedUsers"
                    value={user.total}
                    className="text-blue-600 bg-gray-100 border-gray-300 rounded h-7 w-7 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
                  />
                </FlexRow>
              </FlexRow>

              <ul className="divide-y-[1px] rounded-xl p-4 dark:bg-night-700">
                {user.cartItems.map((item: CartItem) => {
                  return (
                    <FlexRow key={item.id}>
                      <li>{item.name}</li>
                      <li>${item.price}</li>
                      <li>Precio compartido: {item.itemTotal}</li>
                    </FlexRow>
                  )
                })}
              </ul>
            </div>
          )
        })}
        <H5>{actionData?.error}</H5>

        <Payment total={actionData?.total || 0} tip={actionData?.tip} />
      </Form>
    </Modal>
  )
}
