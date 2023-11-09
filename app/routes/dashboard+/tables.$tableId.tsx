import { Link, Outlet, useLoaderData, useNavigate, useParams, useSearchParams } from '@remix-run/react'
import React from 'react'
import { FaCheck, FaClock, FaCreditCard, FaDollarSign, FaRegCreditCard, FaTimesCircle, FaUsers } from 'react-icons/fa'
import { IoCard, IoFastFoodOutline, IoList, IoPerson, IoShieldCheckmarkOutline } from 'react-icons/io5'

import { type ActionArgs, type LoaderArgs, json } from '@remix-run/node'

import clsx from 'clsx'
import { truncate } from 'fs'
import { prisma } from '~/db.server'

import { formatCurrency, getCurrency } from '~/utils'

import { ChevronDownIcon, FlexRow, H3, Modal, Spacer } from '~/components'
import { NavMenu } from '~/components/dashboard/navmenu'
import { SearchBar } from '~/components/dashboard/searchbar'
import { SwitchDashboard } from '~/components/dashboard/switch'

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

  const payments = await prisma.payments.findMany({
    where: {
      order: {
        tableId: tableId,
      },
    },
  })

  const currency = await getCurrency(tableId)

  return json({ table, payments, currency })
}
export async function action({ request, params }: ActionArgs) {
  const formData = await request.formData()
  return json({ success: true })
}

export default function TableId() {
  const data = useLoaderData()
  const navigate = useNavigate()
  const [search, setSearch] = React.useState<string>('')
  const params = useParams()

  //ANCHOR SEARCH PARAMS
  const [searchParams] = useSearchParams()
  const IsSearchParamActiveMenu = searchParams.get('activeNavMenu')

  // ANCHOR STATES
  const [activeNavMenu, setActiveNavMenu] = React.useState<string>(IsSearchParamActiveMenu || 'Orden')
  const [showAcceptedPayments, setShowAcceptedPayments] = React.useState<boolean>(false)
  const [totalPaymentsQuantity, setTotalPaymentsQuantity] = React.useState<number>(0)

  const totalProductQuantity: number = data.table.order.cartItems?.reduce(
    (acc: number, item: { quantity: number }) => acc + item.quantity,
    0,
  )

  const orderTotal = data.table.order.cartItems?.reduce(
    (acc: number, item: { quantity: number; price: number }) => acc + item.quantity * item.price,
    0,
  )

  React.useEffect(() => {
    const filteredPayments = data.payments.filter(
      payment => payment.id.includes(search) || payment.total.toString().includes(search) || payment.tip.toString().includes(search),
    )
    setTotalPaymentsQuantity(filteredPayments.length)
  }, [search, data.payments])

  return (
    <Modal fullScreen={true} title={`Mesa ${data.table.number}`} onClose={() => navigate(`/dashboard/tables`)}>
      <div className="h-full">
        <NavMenu activeNavMenu={activeNavMenu} setActiveNavMenu={setActiveNavMenu} categories={['Orden', 'Pagos']} />
        {activeNavMenu === 'Orden' ? (
          <OrderDetails
            currency={data.currency}
            totalProductQuantity={totalProductQuantity}
            orderTotal={orderTotal}
            cartItems={data.table.order?.cartItems ? data.table.order?.cartItems : ''}
          />
        ) : null}
        {activeNavMenu === 'Pagos' ? (
          <div>
            <SearchBar placeholder={'Buscar por id, propina o total'} setSearch={setSearch} />

            <Spacer spaceY="2" />
            <div className="justify-between flex items-center py-2 px-[15px] bg-white ">
              {!search ? (
                <>
                  <span className="text-[18px] font-semibold">
                    {totalPaymentsQuantity} {totalPaymentsQuantity !== 1 ? 'Pagos' : 'Pago'}
                  </span>
                  <SwitchDashboard showAcceptedPayments={showAcceptedPayments} setShowAcceptedPayments={setShowAcceptedPayments} />
                </>
              ) : (
                <span className="text-[18px] font-semibold">
                  {totalPaymentsQuantity} {totalPaymentsQuantity > 1 ? 'Pagos' : 'Pago'}
                </span>
              )}
            </div>
            <hr />
            <Spacer spaceY="3" />

            <div className="px-[10px] space-y-1">
              {search ? (
                <>
                  {data.payments
                    .filter(
                      payment =>
                        payment.id.includes(search) || payment.total.toString().includes(search) || payment.tip.toString().includes(search),
                    )
                    .map(payment => {
                      return (
                        <div key={payment.id}>
                          <Payment
                            to={payment.id}
                            name={payment.id.slice(-3).toUpperCase()}
                            createdAt={payment.createdAt}
                            method={payment.method}
                            tip={payment.tip}
                            total={payment.total}
                            currency={data.currency}
                          />
                        </div>
                      )
                    })}
                </>
              ) : null}
              {!search ? (
                <>
                  {showAcceptedPayments ? (
                    <>
                      <div className="flex justify-end">
                        <div className="text-lg font-bold rounded-lg flex flex-row space-x-2 items-center  px-1">
                          <span>Aceptados</span>
                          <FaCheck className="bg-success rounded-lg text-white h-5 w-5" />
                        </div>
                      </div>
                      {data.payments
                        .filter(payment => payment.status === 'accepted')
                        .map(payment => {
                          return (
                            <div key={payment.id}>
                              <Payment
                                to={payment.id}
                                name={payment.id.slice(-3).toUpperCase()}
                                createdAt={payment.createdAt}
                                method={payment.method}
                                tip={payment.tip}
                                total={payment.total}
                                currency={data.currency}
                              />
                            </div>
                          )
                        })}
                    </>
                  ) : (
                    <>
                      <div className="flex justify-end">
                        <div className="text-lg font-bold rounded-lg flex flex-row space-x-2 items-center  px-1">
                          <span>Pendientes</span>
                          <FaClock className=" h-5 w-5" />
                        </div>
                      </div>
                      {data.payments
                        .filter(payment => payment.status === 'pending')
                        .map(payment => {
                          return (
                            <div key={payment.id}>
                              <Payment
                                to={payment.id}
                                name={payment.id.slice(-3).toUpperCase()}
                                createdAt={payment.createdAt}
                                method={payment.method}
                                tip={payment.tip}
                                total={payment.total}
                                currency={data.currency}
                              />
                            </div>
                          )
                        })}
                    </>
                  )}
                </>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
      <Outlet />
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
          {cartItems.length > 0 &&
            cartItems?.map(cartItem => {
              const modifiersTotal = cartItem?.productModifiers.reduce((acc, item) => acc + item.quantity * item.extraPrice, 0)
              // const productTotal = cartItem?.quantity * cartItem?.price
              return (
                <div key={cartItem?.id} className="py-3 ">
                  <FlexRow justify="between">
                    <FlexRow>
                      <span>{cartItem?.quantity}</span>
                      <span>{cartItem?.name}</span>
                    </FlexRow>
                    <span>{formatCurrency(currency, cartItem?.price - modifiersTotal)}</span>
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

export function Payment({
  to,
  name,
  createdAt,
  method,
  tip,
  total,
  currency,
}: {
  to: string
  name: string
  createdAt: string
  method: string
  tip: number
  total: number

  currency: string
}) {
  switch (method) {
    case 'cash':
      method = 'Efectivo'
      break
    case 'card':
      method = 'Tarjeta'
      break
    case 'transfer':
      method = 'Transferencia'
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
    <div>
      <Link to={to} className="w-full  relative flex items-center justify-between space-x-4" preventScrollReset>
        <div className="border rounded-lg flex justify-around w-full">
          <div className="flex justify-center items-center w-20 bg-dashb-bg  rounded-lg">
            <p className="text-xl">{name}</p>
          </div>
          <div className="flex flex-row  divide-x divide-gray-300 items-center w-full h-full  bg-white rounded-lg  ">
            <PaymentContainer title="Hora" value={createdAtDate} icon={<IoPerson className="bg-indigo-500 rounded-sm p-1 fill-white" />} />
            <PaymentContainer
              title="Método"
              value={method}
              icon={<IoList className="bg-[#548AF7] rounded-sm p-1 fill-white text-white" />}
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
    <div className="flex flex-col space-y-1  px-3 py-2 w-full">
      <div />
      <div className="flex flex-row space-x-1 items-center ">
        {icon}
        <span className="text-xs font-medium">{title}</span>
      </div>
      <p className="text-sm font-bold">{value ? value : '-'}</p>
    </div>
  )
}
