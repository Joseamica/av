import type {
  Branch,
  CartItem,
  Menu,
  Order,
  Table as TableProps,
  User,
} from '@prisma/client'
import {type ActionArgs, type LoaderArgs, json} from '@remix-run/node'
import {
  Form,
  isRouteErrorResponse,
  Outlet,
  useRouteError,
} from '@remix-run/react'
import {useState} from 'react'
// * UTILS, MODELS, DB, HOOKS
import {prisma} from '~/db.server'
import {EVENTS} from '~/events'
import {useSessionTimeout} from '~/hooks/use-session-timeout'
import {getBranch} from '~/models/branch.server'
import {getMenu} from '~/models/menu.server'
import {getTable} from '~/models/table.server'
import {
  cleanUserData,
  getPaidUsers,
  getUsersOnTable,
} from '~/models/user.server'
import {getSession, getUserDetails} from '~/session.server'
import {
  formatCurrency,
  getAmountLeftToPay,
  getCurrency,
  isOrderExpired,
} from '~/utils'
// * COMPONENTS
import {
  ChevronDownIcon,
  UserCircleIcon,
  UsersIcon,
} from '@heroicons/react/solid'
import clsx from 'clsx'
import {AnimatePresence, motion} from 'framer-motion'
import invariant from 'tiny-invariant'
import {useLiveLoader} from '~/use-live-loader'
// TODO React icons or heroicons ? :angry
import {IoFastFood} from 'react-icons/io5'
// * CUSTOM COMPONENTS
import {
  BillAmount,
  Button,
  CartItemDetails,
  FlexRow,
  H3,
  H5,
  H6,
  Help,
  SectionContainer,
  Spacer,
  SwitchButton,
} from '~/components/index'

import {RestaurantInfoCard} from '~/components/restaurant-info-card'
import {EmptyOrder} from '~/components/table/empty-order'
import {SinglePayButton} from '~/components/table/single-pay-button'
import {getOrder} from '~/models/order.server'

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
  error: string
}

export default function Table() {
  // const data = useLoaderData()
  useSessionTimeout()

  const data = useLiveLoader<LoaderData>()

  // const data = useLiveLoader<LoaderData>()

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

  if (data.order) {
    return (
      <motion.main className="no-scrollbar">
        <div className="fixed inset-x-0 top-0 z-50 w-full bg-button-successBg text-success"></div>
        <RestaurantInfoCard
          branch={data.branch}
          menu={data.menu}
          error={data.error}
        />
        <Spacer spaceY="4" />
        <h3 className="text-secondaryTextDark flex shrink-0 justify-center text-sm">
          {`Mesa ${data.table.table_number}`}
        </h3>
        <Spacer spaceY="2" />
        <Help />
        {/* <Form method="POST" action="/oauth/token">
          <button>Assign Token</button>
        </Form>
        <Form method="GET" action="/oauth/token">
          <button>Get Token</button>
        </Form>
        <Form method="POST" action="/api/createOrder">
          <button>createOrder</button>
        </Form> */}

        <BillAmount
          amountLeft={data.amountLeft}
          currency={data.currency}
          paidUsers={data.paidUsers}
          total={data.total}
          userId={data.userId}
        />
        <Spacer spaceY="2" />

        {/* NOTE: SWITCH BUTTON */}
        <div className="flex w-full justify-end">
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
              {data.order.users &&
                data.order.users.map((user: any) => {
                  const userPaid = Number(user.paid)
                  return (
                    <SectionContainer key={user.id} as="div">
                      <FlexRow justify="between" className="rounded-xl px-1 ">
                        <Spacer spaceY="2">
                          <FlexRow className="items-center space-x-2">
                            <UserCircleIcon
                              fill={user.color || '#000'}
                              className="min-h-10 min-w-10 h-8 w-8"
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
                            initial={{
                              opacity: 0,
                              height: '0',
                            }}
                            animate={{
                              opacity: 1,
                              height: 'auto',
                            }}
                            exit={{
                              opacity: 0,
                              height: '0',
                            }}
                            transition={{
                              opacity: {
                                duration: 0.2,
                                ease: [0.04, 0.62, 0.23, 0.98],
                              },
                              height: {
                                duration: 0.4,
                              },
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
                    initial={{
                      opacity: 0,
                      height: '0',
                    }}
                    animate={{
                      opacity: 1,
                      height: 'auto',
                    }}
                    exit={{
                      opacity: 0,
                      height: '0',
                    }}
                    transition={{
                      opacity: {
                        duration: 0.2,
                        ease: [0.04, 0.62, 0.23, 0.98],
                      },
                      height: {
                        duration: 0.4,
                      },
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
        branch={data.branch}
        menu={data.menu}
        error={data.error}
        tableNumber={data.table.table_number}
        usersInTable={data.usersInTable}
        isOrderActive={data.order?.active}
      />
    )
  }
}

export async function loader({request, params}: LoaderArgs) {
  const session = await getSession(request)
  const user = await getUserDetails(session)

  const {tableId} = params
  invariant(tableId, 'No se encontró el ID de la mesa')

  const branch = await getBranch(tableId)
  invariant(branch, 'No se encontró la sucursal')

  const table = await getTable(tableId)

  const order = await getOrder(tableId, {
    cartItems: {include: {user: true}},
    users: {include: {cartItems: true}},
    payments: true,
  })

  const total = Number(order?.total)
  const menu = await getMenu(branch.id)

  //NOTE - USER CONNECT TO TABLE AND ORDER
  if (user.userId && user.username) {
    // TODO CREATE MODEL
    const isUserInTable = await prisma.user.findFirst({
      where: {
        id: user.userId, // user.userId is the id of the user you want to check
        tableId: tableId, // tableId is the id of the table you want to check
      },
    })

    if (!isUserInTable) {
      try {
        console.log(`🔌 Connecting '${user.username}' to the table`)

        await prisma.user.update({
          where: {id: user.userId},
          data: {
            tableId: tableId,
            branchId: branch.id,
            color: user.user_color ? user.user_color : '#000',
          },
        })
        EVENTS.ISSUE_CHANGED(tableId)
        console.log(`✅ Connected '${user.username}' to the table`)
      } catch (error) {
        console.log(
          '%cerror table.$tableId.tsx line:361 ',
          'color: red; display: block; width: 100%;',
          error,
        )
        throw new Error(`No se pudo conectar al usuario con la mesa ${error}`)
      }
    }

    const isUserInOrder = await prisma.user.findFirst({
      where: {id: user.userId, orderId: order?.id},
    })

    // * TODO por qué lo de la isUserInOrder
    if (!isUserInOrder && order) {
      try {
        console.log(`🔌 Connecting '${user.username}' to the order`)
        await prisma.order.update({
          where: {id: order?.id},
          data: {
            users: {connect: {id: user.userId}},
          },
        })
        EVENTS.ISSUE_CHANGED(tableId)
        console.log(`✅ Connected '${user.username}' to the order`)
      } catch (error) {
        console.log(
          '%cerror table.$tableId.tsx line:361 ',
          'color: red; display: block; width: 100%;',
          error,
        )
        throw new Error(`No se pudo conectar al usuario con la orden ${error}`)
      }
    }
  }

  const usersInTable = await getUsersOnTable(tableId)

  let paidUsers = null
  let amountLeft = null
  let isExpired = null

  if (order) {
    paidUsers = await getPaidUsers(order.id)
    amountLeft = await getAmountLeftToPay(tableId)
    isExpired = isOrderExpired(order.paidDate, 2)
  }

  const error = !menu
    ? `${branch?.name} no cuenta con un menu abierto en este horario.`
    : null

  const currency = await getCurrency(tableId)

  if (order && isExpired) {
    // FIXME  TAMBIÉN USAR EXPIRACIÓN EN las rutas MenuId Y CART (mejor en root)

    for (let user of order.users) {
      await cleanUserData(user.id)
    }
    await prisma.order.update({
      where: {id: order.id},
      data: {
        active: false,
        table: {disconnect: true},
        users: {set: []},
      },
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

export const ErrorBoundary = () => {
  const error = useRouteError()

  console.log('****error***', error)
  console.log('isRouteErrorResponse', isRouteErrorResponse(error))

  if (isRouteErrorResponse(error)) {
    return (
      <main>
        <p>No information</p>
        <img
          src="https://media1.giphy.com/media/EFXGvbDPhLoWs/giphy.gif?cid=ecf05e47e4j9c0wtau2ep4e46x7dk654cz4c2370l34t9kwc&ep=v1_gifs_search&rid=giphy.gif&ct=g"
          alt="error page"
        />
        <p>Status: {error.status}</p>
        <p>{error?.data.message}</p>
      </main>
    )
  } else {
    return (
      <main>
        <p>{(error as {message: string}).message}</p>
        <img
          src="https://media1.giphy.com/media/EFXGvbDPhLoWs/giphy.gif?cid=ecf05e47e4j9c0wtau2ep4e46x7dk654cz4c2370l34t9kwc&ep=v1_gifs_search&rid=giphy.gif&ct=g"
          alt="error page"
        />
      </main>
    )
  }
}
