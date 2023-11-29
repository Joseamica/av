import { Form, Link, useLoaderData, useNavigate, useParams } from '@remix-run/react'
import { useState } from 'react'
import { FaCheckCircle, FaClock, FaMoneyBill } from 'react-icons/fa'
import { IoCard, IoList } from 'react-icons/io5'

import { type ActionArgs, type LoaderArgs, json, redirect } from '@remix-run/node'

import clsx from 'clsx'
import { prisma } from '~/db.server'
import { getSession } from '~/session.server'

import { formatCurrency, getCurrency } from '~/utils'

import { FlexRow, H5, H6 } from '~/components'
import { NavMenu } from '~/components/dashboard/navmenu'
import { SubModal } from '~/components/modal'

export async function loader({ request, params }: LoaderArgs) {
  const session = await getSession(request)
  const employeeId = session.get('employeeId')
  const order = await prisma.order.findFirst({
    where: { id: params.orderId, active: false },
    include: {
      cartItems: { include: { productModifiers: true, product: { include: { category: true } } } },
      payments: {
        include: {
          user: true,
        },
      },
      table: { include: { employees: true } },
    },
  })

  const currency = await getCurrency(params.tableId)
  const manager = order.table?.employees.find(employee => employee.id === employeeId && employee.role === 'manager')
  const isManager = manager ? true : false
  return json({ order, currency, isManager })
}
export async function action({ request, params }: ActionArgs) {
  const formData = await request.formData()
  return json({ success: true })
}

export default function Name() {
  const data = useLoaderData()
  const params = useParams()
  const navigate = useNavigate()
  const totalProductQuantity: number = data.order?.cartItems?.reduce((acc: number, item: { quantity: number }) => acc + item.quantity, 0)
  const [activeNavMenu, setActiveNavMenu] = useState('Orden')
  const orderTotal = data.order?.total

  return (
    <SubModal
      onClose={() => navigate(`/dashboard/tables/${params.tableId}?activeNavMenu="Ordenes Pasadas"`)}
      title={data.order.total}
      fullScreen={true}
    >
      <div className="h-full overflow-hidden overscroll-y-contain">
        <NavMenu
          activeNavMenu={activeNavMenu}
          setActiveNavMenu={setActiveNavMenu}
          categories={['Orden', 'Pagos']}
          notify={data.order.payments.find(payment => payment.status === 'pending') ? true : false}
        />
        {data.order && activeNavMenu === 'Orden' ? (
          <>
            {' '}
            <OrderDetails
              currency={data.currency}
              totalProductQuantity={totalProductQuantity}
              orderTotal={orderTotal}
              cartItems={data.order?.cartItems.length > 0 ? data.order?.cartItems : ''}
              isManager={data.isManager}
            />
            {!data.order ? (
              <H5 variant="secondary" className="p-4">
                Esta orden no cuenta con productos
              </H5>
            ) : null}
          </>
        ) : null}
        {activeNavMenu === 'Pagos' ? (
          <>
            {data.order?.payments.map(payment => {
              return (
                <div key={payment.id}>
                  <Payment
                    to={payment.id}
                    name={payment.user?.name ? payment.user.name : 'Mesero'}
                    createdAt={payment.createdAt}
                    method={payment.method}
                    tip={payment.tip}
                    total={payment.total}
                    currency={data.currency}
                    status={payment.status}
                    amount={payment.amount}
                  />
                </div>
              )
            })}
            {data.order?.payments.length === 0 ? (
              <H5 variant="secondary" className="p-4">
                Esta orden no cuenta con pagos activos
              </H5>
            ) : null}
          </>
        ) : null}
      </div>
    </SubModal>
  )
}

function OrderDetails({ currency, totalProductQuantity, orderTotal, cartItems, isManager }) {
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
        <div className="px-3 py-1 space-y-2 divide-y">
          {cartItems.length > 0 &&
            cartItems?.map(cartItem => {
              const modifiersTotal = cartItem?.productModifiers.reduce((acc, item) => acc + item.quantity * item.extraPrice, 0)
              // const productTotal = cartItem?.quantity * cartItem?.price

              return (
                <div key={cartItem?.id} className="py-3 ">
                  <FlexRow justify="between">
                    <FlexRow>
                      <span>{cartItem?.quantity}</span>
                      <FlexRow>
                        <span>{cartItem?.name}</span>
                        <H6 variant="secondary">({cartItem?.product?.category.name})</H6>
                      </FlexRow>
                    </FlexRow>

                    <FlexRow>
                      <span>{formatCurrency(currency, cartItem?.price - modifiersTotal)}</span>
                      <span>
                        {isManager ? (
                          <Form method="POST">
                            <button className="flex items-center justify-center w-5 h-5 text-white border rounded-full bg-warning">
                              x
                            </button>
                            <input type="hidden" name="id" value={cartItem.id} />
                          </Form>
                        ) : null}
                      </span>
                    </FlexRow>
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
                  <H5 variant="secondary">{cartItem?.comments}</H5>
                </div>
              )
            })}
        </div>
      </div>
    </div>
  )
}

export function Payment({
  to,
  name,
  createdAt,
  method,
  tip,
  total,
  currency,
  status,
  amount,
}: {
  to: string
  name: string
  createdAt: string
  method: string
  tip: number
  total: number
  currency: string
  status?: string
  amount?: number
}) {
  switch (method) {
    case 'cash':
      method = 'Efectivo'
      break
    case 'card':
      method = 'Tarjeta (stripe)'
      break
    case 'terminal':
      method = 'Terminal'
      break
    case 'check':
      method = 'Cheque'
      break
    case 'other':
      method = 'Otro'
      break
    default:
      break
  }
  const hour = new Date(createdAt).getHours()
  const minutes = new Date(createdAt).getMinutes()
  const createdAtDate = `${hour}:${minutes}`
  return (
    <div className="flex flex-row space-x-2">
      <div className={clsx('flex flex-col items-center justify-center w-10 rounded-lg', {})}>
        <p className="text-xl my-[1px]">
          {status === 'accepted' ? <FaCheckCircle className="w-4 h-4 fill-green-600" /> : <FaClock className="fill-yellow-500" />}
        </p>
        <H6 variant="secondary">{createdAtDate}</H6>
        <H6>{name}</H6>
      </div>

      <Link to={to} className="relative flex items-center justify-between w-full space-x-4" preventScrollReset>
        <div className="flex justify-around w-full border rounded-lg">
          <div className="flex flex-row items-center w-full h-full bg-white divide-x divide-gray-300 rounded-lg ">
            <PaymentContainer
              title="Método"
              value={method}
              icon={<IoList className="bg-[#548AF7] rounded-sm p-1 fill-white text-white" />}
            />
            <PaymentContainer
              title="Monto"
              value={amount ? formatCurrency(currency, amount || 0) : null}
              icon={<FaMoneyBill className="p-1 bg-indigo-500 rounded-sm fill-white" />}
            />
            <PaymentContainer
              title="Propina"
              value={tip ? formatCurrency(currency, tip || 0) : null}
              icon={<IoList className="bg-[#40b47e] rounded-sm p-1 fill-white text-white" />}
            />
            <PaymentContainer
              title="Total"
              value={total ? formatCurrency(currency, total || 0) : null}
              icon={<IoCard className="bg-[#548AF7] rounded-sm p-1 fill-white" />}
            />
          </div>
        </div>
        {/* <div className=" right-2">
          <IoShieldCheckmarkOutline />
        </div> */}
      </Link>
    </div>
  )
}

export function PaymentContainer({ title, value, icon }: { title: string; value: string | number; icon: JSX.Element }) {
  return (
    <div className="flex flex-col w-full px-3 py-2 space-y-1 max-w">
      <div />
      <div className="flex flex-row items-center space-x-1 ">
        {icon}
        <span className="text-xs font-medium">{title}</span>
      </div>
      <p className="text-sm font-bold">{value ? value : '-'}</p>
    </div>
  )
}
