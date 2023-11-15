import { Form, Link, Outlet, useLoaderData, useNavigate, useParams, useSearchParams } from '@remix-run/react'
import React from 'react'
import { FaCheck, FaClock, FaRegClock } from 'react-icons/fa'
import { IoCard, IoCardOutline, IoList, IoPerson } from 'react-icons/io5'

import { type ActionArgs, type LoaderArgs, json } from '@remix-run/node'

import { prisma } from '~/db.server'
import { getSession } from '~/session.server'
import { useLiveLoader } from '~/use-live-loader'

import { EVENTS } from '~/events'

import { formatCurrency, getCurrency } from '~/utils'

import { Button, FlexRow, H4, H5, LinkButton, Modal, Spacer } from '~/components'
import { NavMenu } from '~/components/dashboard/navmenu'
import { SearchBar } from '~/components/dashboard/searchbar'
import { SwitchDashboard } from '~/components/dashboard/switch'

export async function loader({ request, params }: LoaderArgs) {
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

  const manager = table?.employees.find(employee => employee.id === employeeId && employee.role === 'manager')
  const isManager = manager ? true : false

  return json({ table, payments, currency, isManager })
}
export async function action({ request, params }: ActionArgs) {
  const formData = await request.formData()
  const id = formData.get('id') as string
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

  const paidTotal = data.payments.filter(payment => payment.status === 'accepted').reduce((acc, item) => acc + Number(item.total), 0)

  React.useEffect(() => {
    const filteredPayments = data.payments.filter(
      payment => payment.id.includes(search) || payment.total.toString().includes(search) || payment.tip.toString().includes(search),
    )
    setTotalPaymentsQuantity(filteredPayments.length)
  }, [search, data.payments])

  return (
    <Modal fullScreen={true} title={`Mesa ${data.table.number}`} onClose={() => navigate(`/dashboard/tables`)}>
      <div className="h-full">
        <NavMenu
          activeNavMenu={activeNavMenu}
          setActiveNavMenu={setActiveNavMenu}
          categories={['Orden', 'Pagos']}
          notify={data.payments.find(payment => payment.status === 'pending') ? true : false}
        />
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
        {activeNavMenu === 'Orden' ? (
          <OrderDetails
            currency={data.currency}
            totalProductQuantity={totalProductQuantity}
            orderTotal={orderTotal}
            cartItems={data.table.order?.cartItems ? data.table.order?.cartItems : ''}
            isManager={data.isManager}
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

              <>
                {showAcceptedPayments ? (
                  <>
                    <div className="flex justify-end">
                      <div className="flex flex-row items-center px-1 space-x-2 text-lg font-bold rounded-lg">
                        <span>Aceptados</span>
                        <FaCheck className="w-5 h-5 text-white rounded-lg bg-success" />
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
                      <div className="flex flex-row items-center px-1 space-x-2 text-lg font-bold rounded-lg">
                        <span>Pendientes</span>
                        <FaClock className="w-5 h-5 " />
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
            </div>
          </div>
        ) : null}
        <div className="fixed flex justify-center w-full bottom-10 space-x-2">
          <LinkButton to={`/dashboard/actions/${params.tableId}`} className="" size="small">
            Agregar productos
          </LinkButton>
          <Form method="post" action={`/table/${params.tableId}/processes/endOrder?from=admin`}>
            <Button variant="danger" className="" size="small">
              Cerrar Mesa
            </Button>
            <input type="hidden" name="redirectTo" value={`/dashboard/tables`} />
          </Form>
        </div>
      </div>
      <Outlet />
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
                      <span>{cartItem?.name}</span>
                    </FlexRow>

                    <FlexRow>
                      <span>{formatCurrency(currency, cartItem?.price - modifiersTotal)}</span>
                      <span>
                        {isManager ? (
                          <Form method="POST">
                            <Button size="small" variant="danger">
                              Eliminar
                            </Button>
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
                              <span>1{pm.quantity}</span>
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
      <Link to={to} className="relative flex items-center justify-between w-full space-x-4" preventScrollReset>
        <div className="flex justify-around w-full border rounded-lg">
          <div className="flex items-center justify-center w-20 rounded-lg bg-dashb-bg">
            <p className="text-xl">{name}</p>
          </div>
          <div className="flex flex-row items-center w-full h-full bg-white divide-x divide-gray-300 rounded-lg ">
            <PaymentContainer title="Hora" value={createdAtDate} icon={<IoPerson className="p-1 bg-indigo-500 rounded-sm fill-white" />} />
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
    <div className="flex flex-col w-full px-3 py-2 space-y-1">
      <div />
      <div className="flex flex-row items-center space-x-1 ">
        {icon}
        <span className="text-xs font-medium">{title}</span>
      </div>
      <p className="text-sm font-bold">{value ? value : '-'}</p>
    </div>
  )
}
