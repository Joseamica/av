import type {
  Branch,
  CartItem,
  Menu,
  Order,
  Table as TableProps,
  User,
} from '@prisma/client'
import type {ActionArgs, LoaderArgs} from '@remix-run/node'
import {json, redirect} from '@remix-run/node'
import {SwitchButton} from '../components/buttons/switch' // Assuming SwitchButton is in the same directory

import {
  ChevronDownIcon,
  UserCircleIcon,
  UsersIcon,
} from '@heroicons/react/solid'
import {Form, Link, Outlet, useLoaderData, useSubmit} from '@remix-run/react'
import clsx from 'clsx'
import {AnimatePresence, motion} from 'framer-motion'
import {useEffect, useState} from 'react'
import {IoFastFood} from 'react-icons/io5'
import invariant from 'tiny-invariant'
import {Button, LinkButton} from '~/components/buttons/button'
import {
  BillAmount,
  CartItemDetails,
  FlexRow,
  H3,
  H4,
  H5,
  H6,
  Help,
  RestaurantInfoCard,
  SectionContainer,
  Spacer,
  UserButton,
} from '~/components/index'
import {Modal as ModalPortal} from '~/components/modals'
import {prisma} from '~/db.server'
import {EVENTS} from '~/events'
import {useSessionTimeout} from '~/hooks/use-session-timeout'
import {getBranch} from '~/models/branch.server'
import {getMenu} from '~/models/menu.server'
import {getTable} from '~/models/table.server'
import {getPaidUsers, getUsersOnTable} from '~/models/user.server'
import {validateUserIntegration} from '~/models/validations.server'
import {getSession} from '~/session.server'
import {useLiveLoader} from '~/use-live-loader'
import {
  formatCurrency,
  getAmountLeftToPay,
  getCurrency,
  isOrderExpired,
} from '~/utils'

type LoaderData = {
  order: Order & any
  table: TableProps
  total: number
  currency: string
  usersInTable: User[]
  user: User
  branch: Branch
  menu: Menu
  amountLeft: number
  paidUsers: any
  userId: string
  isDeliverectToken: boolean
}

export async function loader({request, params}: LoaderArgs) {
  const {tableId} = params
  invariant(tableId, 'No se encontró el ID de la mesa')

  const branch = await getBranch(tableId)
  invariant(branch, 'No se encontró la sucursal')

  const [table, usersInTable] = await Promise.all([
    getTable(tableId),
    getUsersOnTable(tableId),
  ])

  // const url = new URL(request.url)
  // const pathname = url.pathname

  const session = await getSession(request)
  const userId = session.get('userId')
  const username = session.get('username')
  // const user = await prisma.user.findFirst({where: {id: userId}})
  // const tables = await prisma.table.findMany({
  //   where: {branchId: branch.id},
  // })

  if (userId && username) {
    const userValidations = await validateUserIntegration(
      userId,
      tableId,
      username,
      branch.id,
    )
    const sessionId = session.get('sessionId')
    // session.set('tableSession', tableId)

    // const expiryTime = formatISO(addHours(new Date(), 4))
    // session.set('expiryTime', expiryTime)
    // const sessionExpiryTime = session.get('expiryTime')

    // if (
    //   sessionExpiryTime &&
    //   compareAsc(new Date(sessionExpiryTime), new Date()) < 0
    // ) {
    //   // If the session has expired, delete it
    //   // await prisma.session.delete({where: {id: sessionId}})
    //   await prisma.user.update({
    //     where: {id: userId},
    //     data: {
    //       orders: {disconnect: true},
    //       tables: {disconnect: true},
    //       sessions: {deleteMany: {}},
    //     },
    //   })
    //   throw await logout(request, pathname)
    // }

    // if (!sessionId) {
    //   throw new Error('No se encontró el ID de la sesión')
    // }
    if (!userValidations) {
      throw new Error('No se encontró el usuario')
    }
    // return json({user, tables}) // return json({success: true})
  }

  const order = await prisma.order.findFirst({
    where: {tableId, active: true},
    include: {
      cartItems: {include: {user: true}},
      users: {include: {cartItems: true}},
      payments: true,
    },
  })

  let paidUsers = null
  let amountLeft = null
  let isExpired = null

  if (order) {
    paidUsers = await getPaidUsers(order.id)
    amountLeft = await getAmountLeftToPay(tableId)
    isExpired = isOrderExpired(order.paidDate)
  }

  const total = Number(order?.total)

  const menu = await getMenu(branch.id)

  let error = {}
  if (!menu) {
    error = {
      body: null,
      title: `${branch?.name} no cuenta con un menu abierto en este horario.`,
    }
  }

  const currency = await getCurrency(tableId)

  if (order && isExpired) {
    // todo  TAMBIEN USAR EXPIRACION EN MENUID Y CART (mejor en root)

    for (let user of order.users) {
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          tip: 0,
          paid: 0,
          total: 0,
          orders: {disconnect: true},
          cartItems: {set: []},

          // tableId: null,
          // tables: {disconnect: true},
        },
      })
    }
    await prisma.order.update({
      where: {id: order.id},
      data: {active: false, table: {disconnect: true}, users: {set: []}},
    })

    console.log('Order expired...')
  }

  return json({
    table,
    branch,
    menu,
    order,
    total,
    currency,
    amountLeft,
    paidUsers,
    error,
    usersInTable,
  })
}

//payment ACTION
export async function action({request, params}: ActionArgs) {
  const {tableId} = params
  invariant(tableId, 'Mesa no encontrada!')
  const formData = await request.formData()
  const _action = formData.get('_action') as string

  switch (_action) {
    case 'endOrder':
      // EVENTS.ISSUE_CHANGED(tableId)
      EVENTS.ISSUE_CHANGED(tableId, 'endOrder')
  }

  return json({success: true})
}

export default function Table() {
  // const data = useLoaderData()
  useSessionTimeout()

  // const data = useLiveLoader<LoaderData>()
  const data = useLoaderData<LoaderData>()

  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [filterPerUser, setFilterPerUser] = useState(false)

  const handleToggleUser = (userId: string) => {
    setSelectedUsers((prevSelected: string[]) =>
      prevSelected.includes(userId)
        ? prevSelected.filter(id => id !== userId)
        : [...prevSelected, userId],
    )
  }

  const [collapse, setCollapse] = useState(false)
  const handleCollapse = () => {
    setCollapse(!collapse)
  }

  const handleToggle = () => {
    setFilterPerUser(!filterPerUser)
  }
  const [showPaymentOptions, setShowPaymentOptions] = useState(false)

  if (data.total > 0) {
    return (
      <motion.main className="no-scrollbar">
        <div className="fixed inset-x-0 top-0 z-50 w-full bg-button-successBg text-success"></div>
        <RestaurantInfoCard />
        <Spacer spaceY="4" />
        <h3 className="text-secondaryTextDark flex shrink-0 justify-center text-sm">
          {`Mesa ${data.table.table_number}`}
        </h3>
        <Spacer spaceY="2" />
        <Help />
        <Form method="POST" action="/oauth/token">
          <button>Assign Token</button>
        </Form>
        <Form method="GET" action="/oauth/token">
          <button>Get Token</button>
        </Form>
        <Form method="POST" action="/api/createOrder">
          <button>createOrder</button>
        </Form>

        <BillAmount
          amountLeft={data.amountLeft}
          currency={data.currency}
          paidUsers={data.paidUsers}
          total={data.total}
          userId={data.userId}
        />
        <Spacer spaceY="2" />
        {/* SWITCH BUTTON */}
        <div className="flex  w-full justify-end">
          <SwitchButton
            state={filterPerUser}
            setToggle={handleToggle}
            leftIcon={<IoFastFood className="h-4 w-4" />}
            rightIcon={<UsersIcon className="h-4 w-4" />}
            leftText="Ver por orden"
            rightText="Ver por usuario"
            stretch
          />
        </div>
        {/* <Spacer spaceY="1" /> */}
        <Spacer className="py-[2px]" />
        {/* FIX */}
        {filterPerUser ? (
          <AnimatePresence>
            <div className="space-y-2">
              {data.order?.users.map((user: any) => {
                const userPaid = Number(user.paid)
                return (
                  <SectionContainer key={user.id} as="div">
                    <FlexRow justify="between" className="rounded-xl px-1 ">
                      <Spacer spaceY="2">
                        <FlexRow className="items-center space-x-2">
                          <UserCircleIcon
                            fill={user.color || '#000'}
                            className=" min-h-10 min-w-10 h-8 w-8"
                          />
                          <div className="flex flex-col">
                            <H3>{user.name}</H3>
                            <H6>
                              {Number(user.paid) > 0
                                ? `Pagado: ${formatCurrency(
                                    data.currency,
                                    userPaid,
                                  )}`
                                : 'No ha pagado'}
                            </H6>
                            <FlexRow>
                              <H6>
                                {user.cartItems?.length === 1
                                  ? `${user.cartItems?.length} platillo ordenado`
                                  : `${user.cartItems?.length} platillos ordenado` ||
                                    0}
                              </H6>
                              <H6>
                                (
                                {formatCurrency(
                                  data.currency,
                                  user.cartItems.reduce(
                                    (sum, item) => sum + item.price,
                                    0,
                                  ),
                                )}
                                )
                              </H6>
                            </FlexRow>
                          </div>
                        </FlexRow>
                      </Spacer>
                      <button
                        onClick={() => handleToggleUser(user.id)}
                        className={clsx(
                          'flex items-center justify-center rounded-lg  border border-button-outline px-1   py-1 text-xs',
                          {
                            'bg-button-primary text-white':
                              selectedUsers.includes(user.id),
                          },
                        )}
                      >
                        Detalles
                        <ChevronDownIcon className={clsx('h-3 w-3 ', {})} />
                      </button>
                    </FlexRow>
                    <AnimatePresence>
                      {selectedUsers.includes(user.id) && (
                        <motion.div
                          className="flex flex-col"
                          key={user.id}
                          initial={{opacity: 0, height: '0'}}
                          animate={{opacity: 1, height: 'auto'}}
                          exit={{opacity: 0, height: '0'}}
                          transition={{
                            opacity: {
                              duration: 0.2,
                              ease: [0.04, 0.62, 0.23, 0.98],
                            },
                            height: {duration: 0.4},
                          }}
                        >
                          <hr />
                          {user.cartItems.length > 0 ? (
                            <motion.div>
                              {user.cartItems.map((cartItem: any) => (
                                <CartItemDetails
                                  key={cartItem.id}
                                  cartItem={cartItem}
                                />
                              ))}
                            </motion.div>
                          ) : (
                            <Spacer spaceY="2" className="px-2">
                              <H6 variant="secondary">
                                Usuario no cuenta con platillos ordenados
                              </H6>
                            </Spacer>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* <hr /> */}
                  </SectionContainer>
                )
              })}
            </div>
          </AnimatePresence>
        ) : (
          <SectionContainer
            divider={true}
            showCollapse={data.order?.cartItems.length > 4 ? true : false}
            collapse={collapse}
            collapseTitle={
              collapse ? (
                <H5>Ver más platillos</H5>
              ) : (
                <H5>Ver menos platillos</H5>
              )
            }
            handleCollapse={handleCollapse}
          >
            <AnimatePresence initial={false}>
              {(collapse
                ? data.order?.cartItems.slice(0, 4)
                : data.order?.cartItems
              ).map((cartItem: CartItem) => {
                return (
                  <motion.div
                    className="flex flex-col"
                    key={cartItem.id}
                    initial={{opacity: 0, height: '0'}}
                    animate={{opacity: 1, height: 'auto'}}
                    exit={{opacity: 0, height: '0'}}
                    transition={{
                      opacity: {
                        duration: 0.2,
                        ease: [0.04, 0.62, 0.23, 0.98],
                      },
                      height: {duration: 0.4},
                    }}
                  >
                    <CartItemDetails cartItem={cartItem} />
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </SectionContainer>
        )}
        <Spacer spaceY="2" />
        {/* {data.order.cartItems.length > 7 ? (
          <SinglePayButton
            showPaymentOptions={showPaymentOptions}
            setShowPaymentOptions={setShowPaymentOptions}
          />
        ) : (
          <PayButtons />
        )} */}
        {data.amountLeft > 0 ? (
          <SinglePayButton
            showPaymentOptions={showPaymentOptions}
            setShowPaymentOptions={setShowPaymentOptions}
          />
        ) : (
          <Form method="POST">
            <Button
              name="_action"
              value="endOrder"
              // onClick={handleValidate}
              fullWith={true}
            >
              Terminar orden
            </Button>
          </Form>
        )}

        <Outlet />
      </motion.main>
    )
  } else {
    return (
      <EmptyOrder
        tableNumber={data.table.table_number}
        usersInTable={data.usersInTable}
      />
    )
  }
}

function EmptyOrder({
  tableNumber,
  usersInTable,
}: {
  tableNumber: number
  usersInTable: User[]
}) {
  return (
    <main>
      <RestaurantInfoCard />
      {/* <div className="flex items-center justify-center w-10 h-10 rounded-full shadow-sm dark:bg-secondaryDark dark:bg-night-bg_principal bg-day-bg_principal ">
      <ChevronDoubleUpIcon className="w-5 h-5 motion-safe:animate-bounce" />
    </div>*/}
      <Spacer spaceY="2" />
      <H5 className="flex w-full justify-center ">
        Aún no existe una orden con platillos.
      </H5>
      <Spacer spaceY="3">
        <h3 className="text-secondaryTextDark flex shrink-0 justify-center pr-2 text-sm">
          {`Mesa ${tableNumber}`}
        </h3>
      </Spacer>
      <SectionContainer className="dark:bg-DARK_1 dark:bg-night-bg_principal dark:text-night-text_principal flex flex-col justify-start rounded-lg bg-day-bg_principal p-2 drop-shadow-md dark:drop-shadow-none">
        <p className="text-DARK_3">Usuarios en la mesa</p>
        <Spacer spaceY="2">
          <hr className="dark:border-DARK_OUTLINE border-LIGHT_DIVIDER" />
        </Spacer>
        {usersInTable?.map((user, index: number) => (
          <FlexRow
            className="w-full items-center justify-between space-x-2 space-y-2"
            key={user.id}
          >
            <FlexRow className="items-center space-x-2">
              <UserButton userColor={user?.color} path={`user/${user?.id}`} />
              {user?.name ? <H4>{user.name}</H4> : <H4>Desconectado</H4>}
            </FlexRow>
            <div>
              <Link
                preventScrollReset
                to={`user/${user?.id}`}
                className="dark:bg-buttonBgDark bg-componentBg flex flex-row items-center justify-center rounded-full px-2 py-1 "
              >
                Detalles
              </Link>
            </div>
          </FlexRow>
        ))}
      </SectionContainer>
    </main>
  )
}

function SinglePayButton({
  showPaymentOptions,
  setShowPaymentOptions,
}: {
  showPaymentOptions: boolean
  setShowPaymentOptions: (value: boolean) => void
}) {
  return (
    <div className="sticky bottom-2">
      <Button
        size="medium"
        variant="primary"
        fullWith={true}
        className="sticky"
        onClick={() => setShowPaymentOptions(true)}
      >
        Pagar o dividir la cuenta
      </Button>
      <ModalPortal
        title="Pagar o dividir la cuenta"
        isOpen={showPaymentOptions}
        handleClose={() => setShowPaymentOptions(false)}
      >
        <div className="bg-white px-2 pt-4">
          <PayButtons setShowPaymentOptions={setShowPaymentOptions} />
        </div>
      </ModalPortal>
    </div>
  )
}

function PayButtons({
  setShowPaymentOptions,
}: {
  setShowPaymentOptions?: (value: boolean) => void
}) {
  const data = useLoaderData()
  const [showSplit, setShowSplit] = useState(false)
  // const revalidator = useRevalidator()

  // const handleValidate = () => {
  //   revalidator.revalidate()
  // }

  const handleFullPay = () => {
    if (setShowPaymentOptions) setShowPaymentOptions(false)
  }

  const handleSplitPay = () => {
    if (setShowPaymentOptions) {
      setShowSplit(false)
      setShowPaymentOptions(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <Button
        onClick={() => {
          setShowSplit(true)
        }}
        variant="primary"
        size="large"
      >
        Dividir cuenta
      </Button>
      <Spacer spaceY="1" />
      <LinkButton to="pay/fullpay" onClick={handleFullPay}>
        Pagar la cuenta completa
      </LinkButton>
      <Spacer spaceY="2" />
      <ModalPortal
        isOpen={showSplit}
        handleClose={() => setShowSplit(false)}
        title="Dividir cuenta"
      >
        <div className="flex flex-col space-y-2 bg-white p-2">
          <LinkButton to="pay/perDish" onClick={handleSplitPay}>
            Pagar por platillo
          </LinkButton>
          <LinkButton to="pay/perPerson" onClick={handleSplitPay}>
            Pagar por usuario
          </LinkButton>
          <LinkButton to="pay/equalParts" onClick={handleSplitPay}>
            Pagar en partes iguales
          </LinkButton>
          <LinkButton to="pay/custom" onClick={handleSplitPay}>
            Pagar monto personalizado
          </LinkButton>
        </div>
      </ModalPortal>
    </div>
  )
}
