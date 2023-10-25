import { Link, Outlet, useLoaderData, useNavigate } from '@remix-run/react'
import React from 'react'
import { FaCreditCard, FaDollarSign, FaRegCreditCard, FaUsers } from 'react-icons/fa'
import { IoFastFoodOutline } from 'react-icons/io5'

import { type ActionArgs, type LoaderArgs, json } from '@remix-run/node'

import clsx from 'clsx'
import { prisma } from '~/db.server'

import { formatCurrency, getCurrency } from '~/utils'

import { ChevronDownIcon, FlexRow, H3, Modal, Spacer } from '~/components'

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
  const [show, setShow] = React.useState({ products: true })

  const onHandleShow = (name: string) => {
    setShow(prevState => ({
      ...prevState,
      [name]: !prevState[name],
    }))
  }

  return (
    <>
      <Modal fullScreen={true} title={`Mesa ${data.table?.number}`} onClose={() => navigate('/dashboard/tables')}>
        <div className="h-full bg-white">
          <div className="bg-[#F7F8FA] p-4 space-y-5">
            {/* <FlexRow justify="between">
              <FlexRow>
                <IoFastFoodOutline className="fill-black rounded-full h-5 w-5" />
                <span>Platillos</span>
              </FlexRow>
              <p>{data.table.order?.cartItems.length}</p>
            </FlexRow>
            <FlexRow justify="between">
              <FlexRow>
                <FaUsers className="rounded-full h-5 w-5" />
                <span>Clientes</span>
              </FlexRow>
              <span>{data.table.users?.length}</span>
            </FlexRow>
            <FlexRow justify="between">
              <FlexRow>
                <FaRegCreditCard className="  h-5 w-5 " />
                <span>Pagos</span>
              </FlexRow>
              <span>{data.table.order?.payments?.length}</span>
            </FlexRow> */}
            <FlexRow justify="between">
              <FlexRow>
                <FaDollarSign className=" rounded-full h-4 w-4 " />
                <span className="text-sm">Total de orden</span>
              </FlexRow>
              <span className="text-sm">{formatCurrency(data.currency, data.table.order?.total)}</span>
            </FlexRow>
          </div>

          {/* <hr /> */}
          <div className="p-4 ">
            <FlexRow justify="between">
              <FlexRow>
                <IoFastFoodOutline className="fill-black rounded-full h-5 w-5" />
                <span>Productos</span>
                {/* <span className="text-xs">({data.table.order.cartItems.reduce((acc, item) => acc + item.price, 0)})</span> */}
              </FlexRow>
              <FlexRow>
                <p>{data.table.order?.cartItems.length}</p>
                <button onClick={() => onHandleShow('products')}>
                  {show.name === 'products' ? (
                    <ChevronDownIcon className="border rounded-full bg-white rotate-180" />
                  ) : (
                    <ChevronDownIcon className="border rounded-full bg-white transform " />
                  )}
                </button>
              </FlexRow>
            </FlexRow>
          </div>
          <hr />
          {/* <Spacer spaceY="1" /> */}
          {show['products'] && (
            <div>
              <div>
                {data.table.order?.cartItems.map(cartItem => {
                  const totalPriceModifiers = cartItem.productModifiers.reduce((acc, pm) => Number(acc) + Number(pm.extraPrice), 0)
                  return (
                    <div key={cartItem.id} className="px-4 py-1">
                      <div className="flex flex-row justify-between items-center ">
                        <div className="flex flex-row items-center space-x-2">
                          <p>{cartItem.quantity}</p>
                          <div>
                            <p>{cartItem.name}</p>
                            <p>{cartItem.description}</p>
                          </div>
                        </div>
                        <div className="flex flex-row items-center space-x-2">
                          <p>{formatCurrency(data.currency, Number(cartItem.price) - Number(totalPriceModifiers))}</p>
                        </div>
                      </div>
                      <div className="pl-4 py-1">
                        {cartItem.productModifiers.map(pm => {
                          return (
                            <div key={pm.id} className="text-xs flex space-x-2 justify-between py-1">
                              <FlexRow>
                                <p>{pm.quantity}</p>
                                <p>{pm.name}</p>
                              </FlexRow>
                              <p>{formatCurrency(data.currency, pm.extraPrice)}</p>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          <div className="p-4 ">
            <FlexRow justify="between">
              <FlexRow>
                <FaUsers className="rounded-full h-5 w-5" />
                <span>Clientes</span>
              </FlexRow>
              <FlexRow>
                <p>{data.table.users?.length}</p>
                <button onClick={() => onHandleShow('clients')}>
                  {show.name === 'clients' ? (
                    <ChevronDownIcon className="border rounded-full bg-white rotate-180" />
                  ) : (
                    <ChevronDownIcon className="border rounded-full bg-white transform " />
                  )}
                </button>
              </FlexRow>
            </FlexRow>
          </div>
          {show['clients'] && (
            <div className="p-4">
              {data.table.users.map(user => {
                return (
                  <div key={user.id} className="flex flex-row space-x-2 items-center justify-between">
                    {/* <div className={`h-4 w-4 rounded-full bg-[${user.color}] `} /> */}
                    <p>{user.name}</p>
                    <FlexRow>
                      {/* <p>{formatCurrency(data.currency, user.total)}</p> */}
                      <p>ToDo</p>
                    </FlexRow>
                  </div>
                )
              })}
            </div>
          )}
          {/* <div className="p-4 bg-[#F7F8FA]">
            <FlexRow justify="between">
              <FlexRow>
                <FaDollarSign className=" rounded-full h-5 w-5 " />
                <span>Pagos</span>
              </FlexRow>
              <span>{data.table.order?.payments?.length}</span>
            </FlexRow>
          </div> */}
        </div>
        <div className="px-4 sticky bottom-0 pb-5 bg-white flex justify-center">
          <Link to="payments?status=pending" className={clsx(' relative border rounded-xl px-4 py-2', {})}>
            {data.table.order?.payments?.length > 0 && (
              <div className=" rounded-full absolute -top-1 -right-1 h-3 w-3 bg-red-600 animate-pulse" />
            )}
            <span>Pagos ( {data.table.order?.payments?.length} )</span>
          </Link>
        </div>
      </Modal>
      <Outlet />
    </>
  )
}
