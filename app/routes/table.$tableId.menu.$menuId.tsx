import type {CartItem, MenuItem, Order, User} from '@prisma/client'
import {json, redirect} from '@remix-run/node'
import {Form, useLoaderData, useSubmit} from '@remix-run/react'
import type {ActionArgs, LoaderArgs} from '@remix-run/server-runtime'
import {useState} from 'react'
import invariant from 'tiny-invariant'
import {prisma} from '~/db.server'
import {getBranch, getBranchId} from '~/models/branch.server'
import {getCartItems} from '~/models/cart.server'
import {getOrderTotal} from '~/models/order.server'
import {validateRedirect} from '~/redirect.server'
import {addToCart, getSession, sessionStorage} from '~/session.server'

type MenuCategory = {
  id: string
  name: string
  menuId: string
  menuItems: MenuItem[]
}

export async function loader({request, params}: LoaderArgs) {
  const {tableId, menuId} = params
  invariant(tableId, 'No se encontró la mesa')

  const branch = await getBranch(tableId)
  invariant(branch, 'No se encontró la sucursal')

  invariant(menuId, 'No existe el ID del menu')

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

  return json({categories, cartItems, usersOnTable})
}

export async function action({request, params}: ActionArgs) {
  const {tableId} = params
  invariant(tableId, 'No se encontró la mesa')

  const branchId = await getBranchId(tableId)
  invariant(branchId, 'No se encontró la sucursal')

  const formData = await request.formData()
  const submittedItemId = formData.get('submittedItemId') as string
  const submitCart = formData.get('submitCart') as string
  const shareDish = formData.getAll('shareDish')

  const redirectTo = validateRedirect(request.redirect, `/table/${tableId}`)

  const session = await getSession(request)
  let cart = JSON.parse(session.get('cart') || '[]')

  const userId = session.get('userId')

  const cartItems = await getCartItems(cart)
  let cartItemsTotal =
    cartItems.reduce((acc, item) => {
      return acc + Number(item.price) * item.quantity
    }, 0) || 0

  if (submittedItemId) {
    addToCart(cart, submittedItemId, 1)
    session.set('cart', JSON.stringify(cart))
  }

  if (submitCart) {
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

    const createCartItems = await Promise.all(
      cartItems.map(item =>
        prisma.cartItem.create({
          data: {
            quantity: Number(item.quantity),
            price: Number(item.price),
            name: item.name,
            menuItemId: item.id,
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

  return (
    <Form className="space-y-2 bg-blue-200" method="POST" preventScrollReset>
      {data.categories.map((categories: MenuCategory) => {
        const dishes = categories.menuItems
        return (
          <div key={categories.id}>
            <h1 className="bg-night-300">{categories.name}</h1>

            <div className="space-y-3 divide-y-2 rounded-xl bg-night-200">
              {dishes.map((dish: MenuItem) => {
                return (
                  <div key={dish.id} className="p-2 ">
                    <h2>{dish.name}</h2>
                    <p>{dish.description}</p>
                    <p>{dish.price?.toString()}</p>
                    <div>
                      <p>share?</p>
                      {data.usersOnTable.map((user: User) => {
                        return (
                          <div key={user.id}>
                            <input
                              type="checkbox"
                              name="shareDish"
                              value={user.id}
                              className="h-7 w-7"
                            />
                            <label htmlFor="share">{user.name}</label>
                          </div>
                        )
                      })}
                    </div>
                    {/* FIX */}
                    <button
                      className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700"
                      name="submittedItemId"
                      value={dish.id}
                    >
                      Agregar {dish.name}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
      <div>
        {data.cartItems?.map((items: CartItem, index: number) => {
          return (
            <div
              key={index}
              className="flex flex-row items-center space-x-2 bg-purple-400"
            >
              <p>{items.quantity}</p>
              <p>{items.name}</p>
              <p>${items.price}</p>
            </div>
          )
        })}
        <p className="bg-yellow-600">
          TODO: hacer que cuando pones agregar platillos si cuente la quantity,
          y ahi lo agregue a la base de datos
        </p>

        <button
          className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700"
          name="submitCart"
          value="submitCart"
          type="submit"
        >
          Agregar platillos
          {data.cartItems
            ?.map((items: CartItem) => {
              return items.quantity
            })
            .reduce((acc: number, item: number) => {
              return acc + item
            }, 0)}
        </button>
      </div>
    </Form>
  )
}
