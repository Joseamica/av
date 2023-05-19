import React from 'react'
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
  useSubmit,
} from '@remix-run/react'
import {Modal} from '~/components/modal'
import invariant from 'tiny-invariant'
import {redirect} from '@remix-run/node'
import type {ActionArgs, LoaderArgs} from '@remix-run/node'
import {json} from '@remix-run/node'
import {prisma} from '~/db.server'
import {FlexRow, H1, H2, H3, H5, H6, Payment} from '~/components'
import type {CartItem} from '@prisma/client'
import {validateRedirect} from '~/redirect.server'
import {getUserId} from '~/session.server'
import {getUsername} from '~/session.server'

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

  if (proceed) {
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

  return json({total, tip})
}

export async function loader({request, params}: LoaderArgs) {
  const {tableId} = params
  invariant(tableId, 'No se encontró mesa')

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

  return json({cartItems, paidCartItems, unpaidCartItems})
}

export default function PerDish() {
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
      title="Dividir por platillo"
    >
      <Form method="POST" preventScrollReset onChange={handleChange}>
        <div className="space-y-2">
          {data.cartItems?.map((item: CartItem) => {
            return (
              <FlexRow
                key={item.id}
                justify="between"
                className="px-4 py-2 rounded-full bg-night-400"
              >
                <FlexRow>
                  <H5>{item.quantity}</H5>
                  <H1>{item.name}</H1>
                </FlexRow>

                <FlexRow>
                  <H2>${item.price}</H2>
                  {item.paid ? (
                    <H6 className="p-1 text-green-500 rounded-full bg-night-300">{`Pagado por ${item.paidBy}`}</H6>
                  ) : (
                    <input type="checkbox" name={`item-${item.id}`} />
                  )}
                  <input
                    type="hidden"
                    name={`price-${item.id}`}
                    value={item.price}
                  />
                </FlexRow>
                {/* <label htmlFor={`user-${item.id}`}>Usuario</label>
                  <select id={`user-${item.id}`} name={`user-${item.id}`}>
                    <option value="1">Usuario 1</option>
                    <option value="2">Usuario 2</option>
                    <option value="3">Usuario 3</option>
                    <option value="4">Usuario 4</option>
                  </select> */}
              </FlexRow>
            )
          })}
        </div>
        {actionData?.error}
        <Payment total={actionData?.total} tip={actionData?.tip} />
      </Form>
    </Modal>
  )
}
