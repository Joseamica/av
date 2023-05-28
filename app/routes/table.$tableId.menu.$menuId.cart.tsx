import type {CartItem, Order, User} from '@prisma/client'
import {json, redirect} from '@remix-run/node'
import {
  useFetcher,
  useLoaderData,
  useNavigate,
  useParams,
} from '@remix-run/react'
import type {ActionArgs, LoaderArgs} from '@remix-run/server-runtime'
import React from 'react'
import invariant from 'tiny-invariant'
import {Button, FlexRow, Modal} from '~/components'
import {prisma} from '~/db.server'
import {getBranch, getBranchId} from '~/models/branch.server'
import {getCartItems} from '~/models/cart.server'
import {getOrderTotal} from '~/models/order.server'
import {validateRedirect} from '~/redirect.server'
import {getSession, sessionStorage, updateCartItem} from '~/session.server'
import {formatCurrency, getCurrency} from '~/utils'

// type MenuCategory = {
//   id: string
//   name: string
//   menuId: string
//   menuItems: MenuItem[]
// }

export async function loader({request, params}: LoaderArgs) {
  const {tableId, menuId} = params
  invariant(tableId, 'No se encontró la mesa')

  const branch = await getBranch(tableId)
  invariant(branch, 'No se encontró la sucursal')

  invariant(menuId, 'No existe el ID del menu')

  const url = new URL(request.url)
  const dishId = url.searchParams.get('dishId') || ''

  const dish = await prisma.menuItem.findFirst({
    where: {id: dishId},
  })

  const session = await getSession(request)

  const categories = await prisma.menuCategory.findMany({
    where: {menuId},
    include: {
      menuItems: true,
    },
  })
  //Find users on table that are not the current user,
  //this is to show users to share dishes with and you don't appear
  const usersOnTable = await prisma.user.findMany({
    where: {tableId, id: {not: session.get('userId')}},
  })

  const cart = JSON.parse(session.get('cart') || '[]') as CartItem[]

  const cartItems = await getCartItems(cart)
  const currency = await getCurrency(tableId)

  return json({categories, cartItems, usersOnTable, dish, currency})
}

export async function action({request, params}: ActionArgs) {
  const {tableId} = params
  invariant(tableId, 'No se encontró la mesa')

  const branchId = await getBranchId(tableId)
  invariant(branchId, 'No se encontró la sucursal')

  const formData = await request.formData()
  const shareDish = formData.getAll('shareDish')
  const variantId = formData.get('variantId') as string
  const _action = formData.get('_action') as string

  const redirectTo = validateRedirect(request.redirect, `/table/${tableId}`)

  const session = await getSession(request)
  let cart = JSON.parse(session.get('cart') || '[]')
  const quantityStr = cart.find(
    (item: {variantId: string}) => item.variantId === variantId,
  )?.quantity
  const userId = session.get('userId')

  const cartItems = await getCartItems(cart)

  let cartItemsTotal =
    cartItems.reduce((acc, item) => {
      return acc + Number(item.price) * item.quantity
    }, 0) || 0

  switch (_action) {
    case 'increaseQuantity':
      if (!variantId || !quantityStr) {
        break
      }
      cart = updateCartItem(cart, variantId, quantityStr + 1)
      session.set('cart', JSON.stringify(cart))
      break
    case 'decreaseQuantity':
      if (!variantId || !quantityStr) {
        break
      }
      cart = updateCartItem(cart, variantId, quantityStr - 1)
      session.set('cart', JSON.stringify(cart))
      break
    case 'submitCart':
      let order:
        | (Order & {
            users?: User[]
          })
        | null = await prisma.order.findFirst({
        where: {
          branchId: branchId,
          tableId: tableId,
        },
        include: {
          users: {
            where: {id: userId},
          },
        },
      })
      if (!order) {
        order = await prisma.order.create({
          data: {
            branchId: branchId,
            tableId: tableId,
            creationDate: new Date(),
            orderedDate: new Date(),
            active: true,
            paid: false,
            total: cartItemsTotal,
            users: {
              connect: {
                id: userId,
              },
            },
          },
        })
        cartItemsTotal = 0
      } else {
        const orderTotal = (await getOrderTotal(order.id)) || {total: 0}
        await prisma.order.update({
          where: {id: order.id},
          data: {
            total: Number(orderTotal.total) + Number(cartItemsTotal),
          },
        })
        // Connect user if not connected
        if (!order.users?.some((user: User) => user.id === userId)) {
          await prisma.order.update({
            where: {id: order.id},
            data: {
              users: {
                connect: {
                  id: userId,
                },
              },
            },
          })
        }
      }

      // const createCartItems =
      await Promise.all(
        cartItems.map(item =>
          prisma.cartItem.create({
            data: {
              image: item.image,
              quantity: Number(item.quantity),
              price: Number(item.price),
              name: item.name,
              menuItemId: item.id,
              modifier: {
                connect: item.modifiers.map(modifier => ({id: modifier.id})),
              },

              //if shareDish is not empty, connect the users to the cartItem
              user: {
                connect:
                  shareDish.length > 0
                    ? [{id: userId}, ...shareDish.map(id => ({id: id}))]
                    : {id: userId},
              } as any,
              activeOnOrder: true,
              orderId: order?.id,
              // make sure to include other necessary fields here
            },
          }),
        ),
      )

      session.unset('cart')
      return redirect(redirectTo, {
        headers: {'Set-Cookie': await sessionStorage.commitSession(session)},
      })
  }

  return redirect('', {
    headers: {'Set-Cookie': await sessionStorage.commitSession(session)},
  })
}

export default function Menu() {
  const data = useLoaderData()
  const [item, setItem] = React.useState('')
  const fetcher = useFetcher()
  const params = useParams()
  // const cart = searchParams.get('cart')
  const navigate = useNavigate()

  const onClose = () => {
    navigate(`/table/${params.tableId}/menu/${params.menuId}`)
  }

  React.useEffect(() => {
    if (data.cartItems?.length === 0) {
      onClose()
    }
  }, [data.cartItems, navigate, params])

  let isSubmitting =
    fetcher.state === 'submitting' || fetcher.state === 'loading'

  return (
    <Modal onClose={onClose} fullScreen={true} title="Carrito">
      <fetcher.Form method="POST" preventScrollReset>
        {data.cartItems?.map((items: CartItem, index: number) => {
          return (
            <div
              key={index}
              className="flex flex-row items-center justify-between space-x-2 "
            >
              <input type="hidden" name="variantId" value={item} />
              <FlexRow>
                <p>{items.name}</p>
                <p>{formatCurrency(data.currency, items.price)}</p>
              </FlexRow>
              <FlexRow>
                <Button
                  size="small"
                  name="_action"
                  value="decreaseQuantity"
                  onClick={() => setItem(items.id)}
                >
                  -
                </Button>
                <p>{items.quantity}</p>
                <Button
                  size="small"
                  name="_action"
                  value="increaseQuantity"
                  onClick={() => setItem(items.id)}
                >
                  +
                </Button>
              </FlexRow>
            </div>
          )
        })}
        <Button
          name="_action"
          value="submitCart"
          type="submit"
          disabled={isSubmitting || data.cartItems?.length === 0}
        >
          {isSubmitting ? 'Agregando platillos...' : 'Completar orden'}
          {data.cartItems
            ?.map((items: CartItem) => {
              return items.quantity
            })
            .reduce((acc: number, item: number) => {
              return acc + item
            }, 0)}
        </Button>
      </fetcher.Form>
    </Modal>
  )
}
