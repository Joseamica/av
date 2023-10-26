import { Link, Outlet, useLoaderData, useNavigate } from '@remix-run/react'
import React from 'react'
import { FaCreditCard, FaDollarSign, FaRegCreditCard, FaUsers } from 'react-icons/fa'
import { IoFastFoodOutline } from 'react-icons/io5'

import { type ActionArgs, type LoaderArgs, json } from '@remix-run/node'

import clsx from 'clsx'
import { truncate } from 'fs'
import { prisma } from '~/db.server'

import { formatCurrency, getCurrency } from '~/utils'

import { ChevronDownIcon, FlexRow, H3, Modal, Spacer } from '~/components'
import { NavMenu } from '~/components/dashboard/navmenu'

export async function loader({ request, params }: LoaderArgs) {
  const { tableId } = params
  const table = await prisma.table.findUnique({
    where: {
      id: tableId,
    },
    include: {
      users: true,
      feedbacks: true,
      notifications: true,
      order: {
        include: {
          cartItems: { include: { productModifiers: true } },
          payments: { where: { status: 'pending' } },
        },
      },
    },
  })

  const currency = await getCurrency(tableId)

  return json({ table, currency })
}
export async function action({ request, params }: ActionArgs) {
  const formData = await request.formData()
  return json({ success: true })
}

export default function Name() {
  const data = useLoaderData()
  const navigate = useNavigate()

  const [activeNavMenu, setActiveNavMenu] = React.useState<string>('Orden')

  const totalProductQuantity: number = data.table.order.cartItems.reduce(
    (acc: number, item: { quantity: number }) => acc + item.quantity,
    0,
  )

  const orderTotal = data.table.order.cartItems.reduce(
    (acc: number, item: { quantity: number; price: number }) => acc + item.quantity * item.price,
    0,
  )

  return (
    <Modal fullScreen={true} title={`Mesa ${data.table.number}`} onClose={() => navigate(-1)}>
      <div className="h-full">
        <NavMenu activeNavMenu={activeNavMenu} setActiveNavMenu={setActiveNavMenu} categories={['Orden', 'Clientes', 'Pagos']} />
        {activeNavMenu === 'Orden' ? (
          <OrderDetails
            currency={data.currency}
            totalProductQuantity={totalProductQuantity}
            orderTotal={orderTotal}
            cartItems={data.table.order?.cartItems}
          />
        ) : null}
      </div>
    </Modal>
  )
}

function OrderDetails({ currency, totalProductQuantity, orderTotal, cartItems }) {
  return (
    <div className="p-3">
      <div className="bg-white rounded-lg px-[10px]">
        <FlexRow justify="between" className="text-[18px] font-semibold p-3">
          <span>
            {totalProductQuantity} {totalProductQuantity > 1 ? 'Productos' : 'Producto'}
          </span>
          <span>{formatCurrency(currency, orderTotal)}</span>
        </FlexRow>
        <hr />
        <div className="space-y-2 divide-y px-3 py-1">
          {cartItems?.map(cartItem => {
            const modifiersTotal = cartItem.productModifiers.reduce((acc, item) => acc + item.quantity * item.extraPrice, 0)
            // const productTotal = cartItem.quantity * cartItem.price
            return (
              <div key={cartItem.id} className="py-3 ">
                <FlexRow justify="between">
                  <FlexRow>
                    <span>{cartItem.quantity}</span>
                    <span>{cartItem.name}</span>
                  </FlexRow>
                  <span>{formatCurrency(currency, cartItem.price - modifiersTotal)}</span>
                </FlexRow>
                <div className="pl-[15px]">
                  {cartItem.productModifiers.map(pm => {
                    return (
                      <div key={pm.id} className="text-xs">
                        <FlexRow justify="between">
                          <FlexRow>
                            <span>{pm.quantity}</span>
                            <span>{pm.name}</span>
                          </FlexRow>
                          <span>{formatCurrency(currency, pm.extraPrice)}</span>
                        </FlexRow>
                      </div>
                    )
                  })}
                </div>
                {/* <Spacer className="h-1" />
            <FlexRow justify="between">
              <span></span>
              <span className="font-bold">{formatCurrency(currency, productTotal)}</span>
            </FlexRow> */}
                {/* <span className="self-end">{productTotal}</span> */}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
