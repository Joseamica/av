import { Link, Outlet, useLoaderData, useNavigate } from '@remix-run/react'

import { type ActionArgs, type LoaderArgs, json } from '@remix-run/node'

import { prisma } from '~/db.server'

import { formatCurrency } from '~/utils'

import { FlexRow, H3, LinkButton, Modal, Spacer } from '~/components'
import { SubModal } from '~/components/modal'

export const handle = {
  sub: true,
}

export async function loader({ request, params }: LoaderArgs) {
  const { orderId } = params
  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
    },
    include: {
      cartItems: { include: { productModifiers: true } },
      table: true,
      users: true,
      payments: { where: { status: 'accepted' } },
    },
  })
  return json({ order })
}
export async function action({ request, params }: ActionArgs) {
  const formData = await request.formData()
  return json({ success: true })
}

export default function OrderId() {
  const data = useLoaderData()
  const navigate = useNavigate()
  const order_total = data.order.cartItems.reduce((acc, cartItem) => Number(acc) + Number(cartItem.price), 0)
  return (
    <Modal onClose={() => navigate(-1)} title={data.order.id.slice(-7).toUpperCase()} fullScreen={true}>
      <div className="flex flex-col h-full justify-between bg-white">
        <div className="flex flex-col   ">
          <div className="flex flex-col py-2 px-4 ">
            <FlexRow justify="between" className="py-1">
              <p className="text-xs">Clientes</p>
              <div className="text-xs flex flex-col text-center">
                {data.order.users.map(user => {
                  return <p key={user.id}>{user.name}</p>
                })}
              </div>
            </FlexRow>
            <FlexRow justify="between" className="py-1">
              <p className="text-xs">Mesa</p>
              <p className="text-xs">{data.order.tableNumber}</p>
            </FlexRow>
            <FlexRow justify="between" className="py-1">
              <p className="text-xs">Hora</p>
              <p className="text-xs">
                {new Date(data.order.createdAt).getHours()}:{new Date(data.order.createdAt).getMinutes()}
              </p>
            </FlexRow>
            <FlexRow justify="between" className="py-1">
              <p className="text-xs">Propina</p>
              <p className="text-xs">{formatCurrency('$', data.order.tip ? data.order.tip : 0)}</p>
            </FlexRow>
            <FlexRow justify="between" className="py-1">
              <p className="text-xs">Total</p>
              <p className="text-xs">{formatCurrency('$', data.order.total ? data.order.total : 0)}</p>
            </FlexRow>
          </div>
          <div className="divide-y">
            <Spacer size="md" />
            <FlexRow justify="between" className="py-2 px-4 font-bold">
              <p>{data.order.cartItems?.length} productos</p>
              {/* <p>{data.order.cartItems.filter}</p> */}
              <p className="">{formatCurrency('$', order_total)}</p>
            </FlexRow>
            <div className="px-4">
              {data.order.cartItems.map(cartItem => {
                return (
                  <div key={cartItem.id} className="flex flex-col">
                    <FlexRow justify="between" key={cartItem.id} className="py-2 ">
                      <span>{cartItem.name}</span>
                      <span>{formatCurrency('$', cartItem.price)}</span>
                    </FlexRow>
                    <div>
                      {cartItem?.productModifiers?.map(pm => {
                        return (
                          <div key={pm.id} className="pl-5">
                            <FlexRow justify="between">
                              <FlexRow>
                                <span className="text-xs">{pm.quantity}</span>
                                <span className="text-xs">{pm.name}</span>
                              </FlexRow>
                              <span className="text-xs">{formatCurrency('$', pm.extraPrice)}</span>
                            </FlexRow>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
        <div className="px-4 sticky bottom-0 pb-5 bg-white flex justify-center">
          {data.order.payments.length > 0 && (
            <Link to="payments" className="border rounded-xl px-4 py-2">
              Payments
            </Link>
          )}
        </div>
      </div>

      <Outlet />
    </Modal>
  )
}
