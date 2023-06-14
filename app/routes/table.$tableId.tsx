import type {CartItem, Order, Table as TableProps, User} from '@prisma/client'
import type {ActionArgs, LoaderArgs} from '@remix-run/node'
import {json, redirect} from '@remix-run/node'
import {
  Form,
  Link,
  NavLink,
  Outlet,
  useLoaderData,
  useRevalidator,
  useSearchParams,
} from '@remix-run/react'
import clsx from 'clsx'
import {AnimatePresence, motion} from 'framer-motion'
import {useState} from 'react'
import invariant from 'tiny-invariant'
import {Button, LinkButton} from '~/components/buttons/button'
import {
  BillAmount,
  CartItemDetails,
  FlexRow,
  H3,
  H4,
  H5,
  Help,
  Modal,
  RestaurantInfoCard,
  SectionContainer,
  Spacer,
  UserButton,
} from '~/components/index'
import {prisma} from '~/db.server'
import {EVENTS} from '~/events'
import {getBranch} from '~/models/branch.server'
import {getMenu} from '~/models/menu.server'
import {getTable} from '~/models/table.server'
import {getPaidUsers, getUsersOnTable} from '~/models/user.server'
import {validateUserIntegration} from '~/models/validations.server'
import {getSession, logout, sessionStorage} from '~/session.server'
import {useLiveLoader} from '~/use-live-loader'
import {formatCurrency, getAmountLeftToPay, getCurrency} from '~/utils'
import {addHours, compareAsc, formatISO} from 'date-fns'

type LoaderData = {
  order: Order & {cartItems: CartItemDetailsProps[]; users: UserWithCart[]}
  table: TableProps
  total: number
  currency: string
  usersInTable: User[]
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

  const url = new URL(request.url)
  const pathname = url.pathname

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
    )
    const sessionId = session.get('sessionId')
    // console.log('sessionId', sessionId)
    const sessionExpiryTime = session.get('expiryTime')
    if (
      sessionExpiryTime &&
      compareAsc(new Date(sessionExpiryTime), new Date()) < 0
    ) {
      // If the session has expired, delete it
      // await prisma.session.delete({where: {id: sessionId}})
      await prisma.user.update({
        where: {id: userId},
        data: {
          orders: {disconnect: true},
          tables: {disconnect: true},
          sessions: {deleteMany: {}},
        },
      })
      throw await logout(request, pathname)
    }

    if (!sessionId) {
      throw new Error('No se encontró el ID de la sesión')
    }
    if (!userValidations) {
      return redirect(``)
    }
    // return json({user, tables}) // return json({success: true})
  }

  const order = await prisma.order.findFirst({
    where: {tableId, active: true},
    include: {
      cartItems: {include: {user: true}},
      users: {include: {cartItems: true}},
    },
  })

  // console.log('order', order)
  let paidUsers = null
  let amountLeft = null

  if (order) {
    paidUsers = await getPaidUsers(order.id)
    amountLeft = await getAmountLeftToPay(tableId)
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
  const session = await getSession(request)

  switch (_action) {
    case 'endOrder':
      EVENTS.ISSUE_CHANGED(tableId)
      console.log('ending order')
      const order = await prisma.order.findFirst({
        where: {
          tableId,
          active: true,
        },
        include: {
          users: true,
        },
      })
      // EVENTS.TABLE_CHANGED(tableId)
      invariant(order, 'Orden no existe')
      // Update each user to set `paid` to 0
      for (let user of order.users) {
        await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            tip: 0,
            paid: 0,
            total: 0,
            cartItems: {set: []},
            // tableId: null,
            // tables: {disconnect: true},
          },
        })
      }
      await prisma.table.update({
        where: {
          id: tableId,
        },
        data: {
          users: {set: []},
        },
      })
      await prisma.order.update({
        where: {
          id: order.id,
        },
        data: {
          active: false,
          table: {disconnect: true},
          users: {set: []},
        },
      })
      session.unset('cart')
      return redirect('/thankyou', {
        headers: {'Set-Cookie': await sessionStorage.commitSession(session)},
      })
  }

  return json({success: true})
}

interface UserWithCart extends User {
  cartItems: CartItemDetailsProps[]
}

interface CartItemDetailsProps extends CartItem {
  user: User[]
}

export default function Table() {
  // const data = useLoaderData()
  const [searchParams] = useSearchParams()

  const [collapse, setCollapse] = useState(false)
  const handleCollapse = () => {
    setCollapse(!collapse)
  }
  // const data = useLoaderData()e
  const data = useLiveLoader<LoaderData>()
  // console.log('data', data)
  const filter = searchParams.get('filter')
  const userId = searchParams.get('userId')
  const toggleLink = filter === 'perUser' ? 'filter=perUser' : ''

  if (data.total > 0) {
    return (
      <motion.main>
        <RestaurantInfoCard />
        <Spacer spaceY="2">
          <h3 className="text-secondaryTextDark flex shrink-0 justify-center text-sm">
            {`Mesa ${data.table.table_number}`}
          </h3>
        </Spacer>
        {/* <h1>TODO: SESSIONS EXPIRATION & STRIPE INTEGRATION & WHATSAPP MSG</h1> */}
        <Help />
        <BillAmount />
        <Spacer spaceY="2" />
        <div className="flex flex-row justify-between space-x-1">
          {/* TODO UI */}
          <Link
            preventScrollReset
            to="."
            className={clsx(
              `w-full rounded-l-full border-2 px-3 py-1  text-center text-sm  shadow-md`,
              {
                'border-2 border-button-outline bg-button-primary text-white':
                  filter !== 'perUser',
              },
            )}
          >
            Ver orden por platillos
          </Link>
          <Link
            to="?filter=perUser"
            className={clsx(
              `w-full rounded-r-full border-2 px-3 py-1  text-center text-sm shadow-md`,
              {
                'border-2 border-button-outline bg-button-primary text-white shadow-md':
                  filter === 'perUser',
              },
            )}
            preventScrollReset
          >
            Ver orden por usuarios
          </Link>
        </div>
        <Spacer spaceY="2" />
        {filter === 'perUser' ? (
          <motion.div className="space-y-2">
            {data.order.users.map((user: UserWithCart) => {
              return (
                <SectionContainer key={user.id}>
                  <FlexRow justify="between" className="rounded-xl">
                    <Spacer spaceY="2">
                      <H3>{user.name}</H3>
                      <H5>
                        {Number(user.paid) > 0
                          ? `Pagado: $${Number(user.paid)}`
                          : 'No ha pagado'}
                      </H5>
                    </Spacer>
                    <NavLink
                      preventScrollReset
                      to={
                        userId === user.id
                          ? `?${toggleLink}`
                          : `?${toggleLink}&userId=${user.id}`
                      }
                      className="flex items-center justify-center rounded-full bg-button-primary px-2 py-1 text-white"
                    >
                      Detalles
                    </NavLink>
                  </FlexRow>
                  <hr />
                  {userId === user.id && (
                    <motion.div
                      id="userDetails"
                      initial={{height: 0, opacity: 0}}
                      animate={{height: 'auto', opacity: 1}}
                      exit={{height: 0, opacity: 0}}
                      transition={{
                        height: {
                          duration: 0.8,
                          ease: [0.04, 0.62, 0.23, 0.98],
                        },
                        opacity: {
                          duration: 0.2,
                          ease: [0.04, 0.62, 0.23, 0.98],
                        },
                      }}
                    >
                      {user.cartItems.length > 0 ? (
                        <div>
                          {user.cartItems.map(
                            (cartItem: CartItemDetailsProps) => {
                              return (
                                <CartItemDetails
                                  key={cartItem.id}
                                  cartItem={cartItem}
                                />
                              )
                            },
                          )}
                        </div>
                      ) : (
                        <H5 variant="secondary">
                          Usuario no cuenta con platillos ordenados
                        </H5>
                      )}
                    </motion.div>
                  )}

                  <hr />
                  <div className="flex justify-between py-2">
                    <H5>{user.cartItems?.length || 0} platillos</H5>
                    <H5>
                      {formatCurrency(
                        data.currency,
                        user.cartItems.reduce(
                          (sum, item) => sum + item.price,
                          0,
                        ),
                      )}
                    </H5>
                  </div>
                </SectionContainer>
              )
            })}
          </motion.div>
        ) : (
          <SectionContainer
            divider={true}
            showCollapse={data.order.cartItems.length > 4 ? true : false}
            collapse={collapse}
            collapseTitle={
              collapse ? 'Ver más platillos' : 'Ver menos platillos '
            }
            handleCollapse={handleCollapse}
          >
            {!collapse ? (
              <AnimatePresence initial={false}>
                {data.order.cartItems.map(cartItem => {
                  return (
                    <CartItemDetails cartItem={cartItem} key={cartItem.id} />
                  )
                })}
              </AnimatePresence>
            ) : (
              <AnimatePresence>
                {data.order.cartItems.slice(0, 4).map(cartItem => {
                  return (
                    <CartItemDetails cartItem={cartItem} key={cartItem.id} />
                  )
                })}
              </AnimatePresence>
            )}
          </SectionContainer>
        )}
        <Spacer spaceY="2" />
        <PayButtons />
        <Outlet />
      </motion.main>
    )
  } else {
    return (
      <div>
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
            {`Mesa ${data.table.table_number}`}
          </h3>
        </Spacer>
        <SectionContainer className="dark:bg-DARK_1 dark:bg-night-bg_principal dark:text-night-text_principal flex flex-col justify-start rounded-lg bg-day-bg_principal p-2 drop-shadow-md dark:drop-shadow-none">
          <p className="text-DARK_3">Usuarios en la mesa</p>
          <Spacer spaceY="2">
            <hr className="dark:border-DARK_OUTLINE border-LIGHT_DIVIDER" />
          </Spacer>
          {data.usersInTable?.map((user, index: number) => (
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
      </div>
    )
  }
}

function PayButtons() {
  const data = useLoaderData()
  const [showSplit, setShowSplit] = useState(false)
  const revalidator = useRevalidator()

  const handleValidate = () => {
    revalidator.revalidate()
  }

  if (data.amountLeft > 0) {
    return (
      <div className="flex flex-col">
        <Button
          onClick={() => setShowSplit(true)}
          variant="primary"
          size="large"
        >
          Dividir Cuenta
        </Button>
        <Spacer spaceY="1" />
        <LinkButton to="pay/fullpay">Pagar la cuenta completa</LinkButton>
        <Spacer spaceY="2" />
        {showSplit && (
          <Modal onClose={() => setShowSplit(false)} title="Dividir cuenta">
            <div className="flex flex-col space-y-2 p-2">
              <LinkButton to="pay/perDish">Pagar por platillo</LinkButton>
              <LinkButton to="pay/perPerson">Pagar por usuario</LinkButton>
              <LinkButton to="pay/equalParts">
                Pagar en partes iguales
              </LinkButton>
              <LinkButton to="pay/custom">Pagar monto personalizado</LinkButton>
            </div>
          </Modal>
        )}
      </div>
    )
  } else {
    return (
      <Form method="POST">
        <Button
          name="_action"
          value="endOrder"
          onClick={handleValidate}
          fullWith={true}
        >
          Terminar orden
        </Button>
      </Form>
    )
  }
}
