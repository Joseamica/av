import { CheckCircledIcon, ClockIcon } from '@radix-ui/react-icons'
import { Form, Link, Outlet, useLoaderData, useNavigate, useParams, useSearchParams } from '@remix-run/react'
import React from 'react'
import { FaCheck, FaCheckCircle, FaClock, FaMoneyBill, FaRegClock } from 'react-icons/fa'
import { IoCard, IoCardOutline, IoList, IoPerson, IoShieldCheckmarkOutline } from 'react-icons/io5'

import { type ActionFunctionArgs, type LoaderFunctionArgs, json } from '@remix-run/node'

import clsx from 'clsx'
import { prisma } from '~/db.server'
import { getSession } from '~/session.server'
import { useLiveLoader } from '~/use-live-loader'

import { EVENTS } from '~/events'

import { formatCurrency, getCurrency } from '~/utils'

import { Button, FlexRow, H4, H5, H6, LinkButton, Modal, Spacer } from '~/components'
import { NavMenu } from '~/components/dashboard/navmenu'
import { SearchBar } from '~/components/dashboard/searchbar'
import { SwitchDashboard } from '~/components/dashboard/switch'
import { SubModal } from '~/components/modal'

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { tableId } = params
  const session = await getSession(request)
  const employeeId = session.get('employeeId')
  const table = await prisma.table.findUnique({
    where: {
      id: tableId,
    },
    include: {
      users: true,
      feedbacks: true,
      employees: true,
      notifications: true,
      order: {
        include: {
          cartItems: { include: { productModifiers: true, product: { include: { category: true } } } },
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
    include: { user: true },
  })

  const inactiveOrders = await prisma.order.findMany({
    where: {
      tableNumber: table?.number,
      active: false,
    },
    include: {
      cartItems: { include: { productModifiers: true } },
      payments: { where: { status: 'accepted' } },
    },
  })

  const currency = await getCurrency(tableId)

  const manager = table?.employees.find(employee => employee.id === employeeId && employee.role === 'manager')
  const isManager = manager ? true : false

  return json({ table, payments, currency, isManager, inactiveOrders })
}
export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData()
  const id = formData.get('id') as string
  const amount = formData.get('amount') as string
  const tip = formData.get('tip') as string
  const method = formData.get('method') as string
  const deleteItem = formData.get('deleteItem') as string

  if (deleteItem === 'user') {
    await prisma.table.update({
      where: {
        id: params.tableId,
      },
      data: {
        users: {
          disconnect: {
            id: id,
          },
        },
      },
    })
    EVENTS.ISSUE_CHANGED(params.tableId)
    return json({ success: true })
  }

  if (amount) {
    const payment = await prisma.payments.create({
      data: {
        total: Number(amount) + Number(tip),
        method: method as any,
        tip: Number(tip),
        status: 'accepted',
        amount: Number(amount),
        order: {
          connect: {
            tableId: params.tableId,
          },
        },
      },
    })
    await prisma.order.update({
      where: {
        tableId: params.tableId,
      },
      data: {
        total: Number(amount),
      },
    })
    EVENTS.ISSUE_CHANGED(params.tableId)
    return json({ success: true })
  }

  const cartItem = await prisma.cartItem.findUnique({
    where: {
      id: id,
    },
  })
  await prisma.cartItem.delete({
    where: {
      id: id,
    },
  })
  const order = await prisma.order.findUnique({
    where: {
      id: cartItem?.orderId,
    },
  })
  await prisma.order.update({
    where: {
      id: cartItem?.orderId,
    },
    data: {
      total: Number(order?.total) - Number(cartItem?.price),
    },
  })
  EVENTS.ISSUE_CHANGED(params.tableId)
  return json({ success: true })
}

export default function TableId() {
  const data = useLiveLoader<any>()
  const navigate = useNavigate()
  const [search, setSearch] = React.useState<string>('')
  const params = useParams()
  //ANCHOR SEARCH PARAMS
  const [searchParams] = useSearchParams()
  const IsSearchParamActiveMenu = searchParams.get('activeNavMenu')
  // ANCHOR STATES
  const [activeNavMenu, setActiveNavMenu] = React.useState<string>(IsSearchParamActiveMenu || 'Orden Activa')
  const [showAcceptedPayments, setShowAcceptedPayments] = React.useState<boolean>(false)
  const [totalPaymentsQuantity, setTotalPaymentsQuantity] = React.useState<number>(0)
  const [showAddPayment, setShowAddPayment] = React.useState(false)

  const totalProductQuantity: number = data.table.order?.cartItems?.reduce(
    (acc: number, item: { quantity: number }) => acc + item.quantity,
    0,
  )

  const orderTotal = data.table.order?.cartItems?.reduce(
    (acc: number, item: { quantity: number; price: number }) => acc + item.quantity * item.price,
    0,
  )

  const paidTotal = data.payments.filter(payment => payment.status === 'accepted').reduce((acc, item) => acc + Number(item.total), 0)

  React.useEffect(() => {
    const filteredPayments = data.payments.filter(
      payment => payment.id.includes(search) || payment.total.toString().includes(search) || payment.tip.toString().includes(search),
    )
    setTotalPaymentsQuantity(filteredPayments.length)
  }, [search, data.payments])

  return (
    <Modal fullScreen={true} title={`Mesa ${data.table.number}`} onClose={() => navigate(`/dashboard/tables`)}>
      <div className="h-full bg-dashb-bg ">
        <NavMenu
          activeNavMenu={activeNavMenu}
          setActiveNavMenu={setActiveNavMenu}
          categories={['Orden Activa', 'Pagos', 'Ordenes Pasadas', 'Usuarios']}
          notify={data.payments.find(payment => payment.status === 'pending') ? true : false}
        />
        {data.table.order && activeNavMenu !== 'Ordenes Pasadas' ? (
          <div className="flex flex-col p-3 my-1 space-y-1 bg-white rounded-lg">
            <FlexRow justify="between">
              <FlexRow>
                <IoCardOutline />
                <H5>Total pagado: </H5>
              </FlexRow>
              <H4 boldVariant="semibold">{formatCurrency(data.currency, paidTotal)}</H4>
            </FlexRow>
            <hr />
            <FlexRow justify="between">
              <FlexRow>
                <FaRegClock />
                <H5>Queda por pagar: </H5>
              </FlexRow>
              <H4 boldVariant="semibold">{formatCurrency(data.currency, orderTotal - paidTotal)}</H4>
            </FlexRow>
          </div>
        ) : null}
        {activeNavMenu.includes('Activa') ? (
          <>
            {data.table.order ? (
              <OrderDetails
                currency={data.currency}
                totalProductQuantity={totalProductQuantity}
                orderTotal={orderTotal}
                cartItems={data.table.order?.cartItems.length > 0 ? data.table.order?.cartItems : ''}
                isManager={data.isManager}
              />
            ) : (
              <H5 variant="secondary" className="p-4">
                Esta mesa no cuenta con una orden activa
              </H5>
            )}
          </>
        ) : null}
        {activeNavMenu === 'Pagos' ? (
          <div>
            <SearchBar placeholder={'Buscar por id, propina o total'} setSearch={setSearch} />
            <Spacer spaceY="2" />
            <p className="text-[18px] font-semibold px-4">
              {totalPaymentsQuantity} {totalPaymentsQuantity > 1 ? 'Pagos' : 'Pago'}
            </p>

            <Spacer spaceY="2" />

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
                            status={payment.status}
                            amount={payment.amount}
                          />
                        </div>
                      )
                    })}
                </>
              ) : null}
              <>
                {data.payments.map(payment => {
                  return (
                    <div key={payment.id}>
                      <Payment
                        to={payment.id}
                        name={payment.user.name.slice(-3).toUpperCase()}
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
              </>
            </div>
          </div>
        ) : null}
        {activeNavMenu === 'Ordenes Pasadas' ? (
          <div>
            <SearchBar placeholder={'Buscar por id, propina o total'} setSearch={setSearch} />

            {!search ? (
              data.inactiveOrders.map(inactiveOrder => {
                const day = new Date(inactiveOrder.createdAt).getDate() // Use getDate() instead of getDay()
                const month = new Date(inactiveOrder.createdAt).getMonth() + 1 // Add 1 since getMonth() returns 0-11
                const year = new Date(inactiveOrder.createdAt).getFullYear().toString().slice(-2)
                const createdAtDate = `${day}/${month}/${year}`
                const tip = inactiveOrder.payments.reduce((acc, item) => acc + Number(item.tip), 0)
                const total = inactiveOrder.payments.reduce((acc, item) => acc + Number(item.total), 0)

                return (
                  <div key={inactiveOrder.id}>
                    <div className="relative flex items-center justify-between w-full space-x-4">
                      <div className="flex justify-around w-full border rounded-lg">
                        <div className="flex items-center justify-center w-16 rounded-lg bg-dashb-bg">
                          <p className="text-xl">{inactiveOrder.id.slice(-3).toUpperCase()}</p>
                        </div>
                        <div className="flex flex-row items-center w-full h-full bg-white divide-x divide-gray-300 rounded-lg ">
                          <OrderContainer
                            title="Fecha"
                            value={createdAtDate}
                            icon={<IoPerson className="p-1 bg-indigo-500 rounded-sm fill-white" />}
                          />
                          <OrderContainer
                            title="Propina"
                            value={tip ? formatCurrency('$', tip || 0) : null}
                            icon={<IoList className="bg-[#548AF7] rounded-sm p-1 fill-white text-white" />}
                          />
                          <OrderContainer
                            title="Pagado"
                            value={total ? formatCurrency('$', total || 0) : null}
                            icon={<IoList className="bg-[#40b47e] rounded-sm p-1 fill-white text-white" />}
                          />
                          <OrderContainer
                            title="Total"
                            value={inactiveOrder.total ? formatCurrency('$', inactiveOrder.total || 0) : null}
                            icon={<IoCard className="bg-[#548AF7] rounded-sm p-1 fill-white" />}
                          />
                        </div>
                      </div>
                      <div className=" right-2">
                        <IoShieldCheckmarkOutline />
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              <>
                {data.inactiveOrders
                  .filter(
                    inactive =>
                      inactive.id.includes(search) ||
                      inactive.total?.toString().includes(search) ||
                      inactive.tip?.toString().includes(search),
                  )
                  .map(inactiveOrder => {
                    const day = new Date(inactiveOrder.createdAt).getDay()
                    const month = new Date(inactiveOrder.createdAt).getMonth() + 1
                    const year = new Date(inactiveOrder.createdAt).getFullYear().toString().slice(-2)
                    const createdAtDate = `${day}/${month}/${year}`
                    const tip = inactiveOrder.payments.reduce((acc, item) => acc + Number(item.tip), 0)
                    const total = inactiveOrder.payments.reduce((acc, item) => acc + Number(item.total), 0)
                    return (
                      <div key={inactiveOrder.id}>
                        <div className="relative flex items-center justify-between w-full space-x-4">
                          <div className="flex justify-around w-full border rounded-lg">
                            <div className="flex items-center justify-center w-16 rounded-lg bg-dashb-bg">
                              <p className="text-xl">{inactiveOrder.id.slice(-3).toUpperCase()}</p>
                            </div>
                            <div className="flex flex-row items-center w-full h-full bg-white divide-x divide-gray-300 rounded-lg ">
                              <OrderContainer
                                title="Fecha"
                                value={createdAtDate}
                                icon={<IoPerson className="p-1 bg-indigo-500 rounded-sm fill-white" />}
                              />
                              <OrderContainer
                                title="Propina"
                                value={tip ? formatCurrency('$', tip || 0) : null}
                                icon={<IoList className="bg-[#548AF7] rounded-sm p-1 fill-white text-white" />}
                              />
                              <OrderContainer
                                title="Pagado"
                                value={total ? formatCurrency('$', total || 0) : null}
                                icon={<IoList className="bg-[#40b47e] rounded-sm p-1 fill-white text-white" />}
                              />
                              <OrderContainer
                                title="Total"
                                value={inactiveOrder.total ? formatCurrency('$', inactiveOrder.total || 0) : null}
                                icon={<IoCard className="bg-[#548AF7] rounded-sm p-1 fill-white" />}
                              />
                            </div>
                          </div>
                          <div className=" right-2">
                            <IoShieldCheckmarkOutline />
                          </div>
                        </div>
                      </div>
                    )
                  })}
              </>
            )}
          </div>
        ) : null}
        {activeNavMenu === 'Usuarios' ? (
          <div>
            {data.table.users.map(user => {
              return (
                <div key={user.id} className="flex flex-row items-center justify-between w-full px-4 py-2 space-x-4 bg-white rounded-lg">
                  <div className="flex flex-row items-center space-x-2">
                    <div className="flex items-center justify-center w-10 h-10 bg-dashb-bg rounded-lg">
                      <p className="text-xl">{user.name.slice(0, 1).toUpperCase()}</p>
                    </div>
                    <div className="flex flex-col">
                      <p className="text-sm font-semibold">{user.name}</p>
                      <p className="text-xs font-medium">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-row items-center space-x-2">
                    <span>
                      {data.isManager ? (
                        <Form method="POST">
                          <button className=" flex justify-center items-center h-5 w-5 border rounded-full bg-warning text-white">x</button>
                          <input type="hidden" name="id" value={user.id} />
                          <input type="hidden" name="deleteItem" value="user" />
                        </Form>
                      ) : null}
                    </span>
                    {/* <div className="flex flex-col">
                      <p className="text-sm font-semibold">Orden {user.orderNumber}</p>
                      <p className="text-xs font-medium">{user.orderName}</p>
                    </div> */}
                  </div>
                </div>
              )
            })}
          </div>
        ) : null}
        <div className=" sticky bottom-0 flex justify-center w-full pt-10 space-x-2">
          <LinkButton to={`/dashboard/actions/${params.tableId}`} className="" size="small">
            + Productos
          </LinkButton>
          <Button
            className=""
            size="small"
            custom="border-green-700 border-2 text-white"
            variant="custom"
            onClick={() => setShowAddPayment(true)}
          >
            <span className="text-green-800 font-bold"> + Pagos</span>
          </Button>
          <Form method="post" action={`/table/${params.tableId}/processes/endOrder?from=admin`}>
            <Button variant="danger" className="" size="small">
              Cerrar Mesa
            </Button>
            <input type="hidden" name="redirectTo" value={`/dashboard/tables`} />
          </Form>
        </div>
      </div>
      <Outlet />
      {showAddPayment ? <AddPaymentModal setShowAddPayment={setShowAddPayment} showAddPayment={showAddPayment} /> : null}
    </Modal>
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
                            <button className=" flex justify-center items-center h-5 w-5 border rounded-full bg-warning text-white">
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
          {status === 'accepted' ? <FaCheckCircle className="fill-green-600 h-4 w-4" /> : <FaClock className="fill-yellow-500" />}
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

export function OrderContainer({ title, value, icon }: { title: string; value: string | number; icon: JSX.Element }) {
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

export function AddPaymentModal({ showAddPayment, setShowAddPayment }) {
  return (
    <SubModal onClose={() => setShowAddPayment(false)} title="Agregar Pago">
      <Form method="POST" className="flex flex-col space-y-2" onSubmit={() => setShowAddPayment(false)}>
        <select name="method" className="flex flex-row items-center w-full px-4 py-2 bg-componentBg dark:bg-DARK_0 ">
          <option value="cash">Efectivo</option>
          <option value="card">Tarjeta</option>
        </select>
        <div className="flex flex-row items-center w-full px-4 py-2 bg-componentBg dark:bg-DARK_0 ">
          <label htmlFor="custom" className={clsx('bg-componentBg dark:bg-DARK_0 dark:text-mainTextDark text-6xl text-[#9CA3AF]')}>
            $
          </label>
          <input
            type="number"
            name="amount"
            min="10"
            id="custom"
            inputMode="decimal"
            className={clsx(
              `dark:bg-DARK-0 flex h-20 w-full bg-transparent text-6xl placeholder:p-2 placeholder:text-6xl focus:outline-none focus:ring-0`,
              // {
              //   'animate-pulse placeholder:text-warning': actionData?.amountToPay,
              // },
            )}
            placeholder="0.00"
          />
        </div>
        <Button>Agregar</Button>
      </Form>
    </SubModal>
  )
}
