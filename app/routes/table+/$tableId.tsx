import { Outlet, isRouteErrorResponse, useFetcher, useRouteError, useSearchParams, useSubmit } from '@remix-run/react'
import { useEffect, useState } from 'react'
import { FaStar } from 'react-icons/fa'
import { IoHappy, IoHappyOutline } from 'react-icons/io5'

import { type ActionArgs, type LoaderArgs, json } from '@remix-run/node'

import type { Branch, Menu, Order, Table as TableProps, User } from '@prisma/client'
// * COMPONENTS
import { motion } from 'framer-motion'
import invariant from 'tiny-invariant'
// * UTILS, MODELS, DB, HOOKS
import { prisma } from '~/db.server'
import { useSessionTimeout } from '~/hooks/use-session-timeout'
import { getSession, getUserDetails } from '~/session.server'
import { useLiveLoader } from '~/use-live-loader'

import { getBranch, getBranchId } from '~/models/branch.server'
import { getMenu } from '~/models/menu.server'
import { getTable } from '~/models/table.server'
import { getUsersOnTable } from '~/models/user.server'

import { EVENTS } from '~/events'

import { getAmountLeftToPay, getCurrency, isOrderExpired } from '~/utils'

import { FeedbackButton } from '~/components/feedback'
import { HelpWithoutOrder } from '~/components/help'
// Hook para manejar la inactividad del usuario
// TODO React icons or heroicons ? :angry
// * CUSTOM COMPONENTS
import {
  BillAmount,
  Button,
  EmptyOrder,
  FilterOrderView,
  FilterUserView,
  FlexRow,
  H2,
  H4,
  Modal,
  SinglePayButton,
  Spacer,
} from '~/components/index'
import { RestaurantInfoCardV2 } from '~/components/restaurant-info-card'

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
  orderExpired: boolean
}

export async function loader({ request, params }: LoaderArgs) {
  const session = await getSession(request)
  const user = await getUserDetails(session)

  const { tableId } = params
  invariant(tableId, 'No se encontró el ID de la mesa')

  const branch = await getBranch(tableId)
  invariant(branch, 'No se encontró la sucursal')

  const table = await getTable(tableId)

  //TESTING - FUNCTION TO GET ORDER DYNAMICALLY

  const order = await prisma.order.findFirst({
    where: { tableId, active: true },
    include: {
      cartItems: { include: { user: true } },
      users: { include: { cartItems: true } },
      payments: { where: { status: 'accepted' } },
    },
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
        console.time(`🔌 Connected '${user.username}' to the table`)

        await prisma.user.update({
          where: { id: user.userId },
          data: {
            tableId: tableId,
            branchId: branch.id,
            color: user.user_color ? user.user_color : '#000',
          },
        })
        EVENTS.ISSUE_CHANGED(tableId)
        console.timeEnd(`🔌 Connected '${user.username}' to the table`)
      } catch (error) {
        console.log('%cerror table.$tableId.tsx line:361 ', 'color: red; display: block; width: 100%;', error)
        throw new Error(`No se pudo conectar al usuario con la mesa ${error}`)
      }
    }

    const isUserInOrder = await prisma.user.findFirst({
      where: {
        id: user.userId,
        orderId: order?.id,
      },
    })

    // * TODO por qué lo de la isUserInOrder
    if (!isUserInOrder && order) {
      try {
        console.time(`🔌 Connected '${user.username}' to the order`)
        await prisma.order.update({
          where: { id: order?.id },
          data: {
            users: { connect: { id: user.userId } },
            tableNumber: table.number,
          },
        })
        EVENTS.ISSUE_CHANGED(tableId)
        console.timeEnd(`🔌 Connected '${user.username}' to the order`)
      } catch (error) {
        console.log('%cerror table.$tableId.tsx line:361 ', 'color: red; display: block; width: 100%;', error)
        throw new Error(`No se pudo conectar al usuario con la orden ${error}`)
      }
    }
  }

  //NOTE - This needs to be after user connections to fetch in the right order
  const usersInTable = await getUsersOnTable(tableId)

  let paidUsers = null
  let amountLeft = null
  let orderExpired = null

  if (order) {
    paidUsers = await prisma.payments.findMany({
      where: { orderId: order.id, status: 'accepted' },
      include: {
        user: true,
        // {
        //   where: {
        //     paid: {
        //       not: null,
        //       //BEFORE gt: -1
        //       gt: 0,
        //     },
        //   },
        // },
      },
    })

    amountLeft = await getAmountLeftToPay(tableId)
    orderExpired = isOrderExpired(order.paidDate, 2)
  }

  const error = !menu ? `${branch?.name} no cuenta con un menu abierto en este horario.` : null

  const currency = await getCurrency(tableId)

  const pendingPayment = await prisma.payments.findFirst({
    where: {
      status: 'pending',
      userId: user.userId,
    },
  })

  let paymentNotification = session.get('paymentNotification')
  if (!pendingPayment) {
    session.set('paymentNotification', false)
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
    orderExpired,
    paymentNotification,
    userId: user.userId,
    user: user,
  })
}

export async function action({ request, params }: ActionArgs) {
  const { tableId } = params
  invariant(tableId, 'Mesa no encontrada!')
  const formData = await request.formData()
  const _action = formData.get('_action') as string
  const branchId = await getBranchId(tableId)

  switch (_action) {
    case 'endOrder':
      // EVENTS.ISSUE_CHANGED(tableId)
      EVENTS.ISSUE_CHANGED(tableId, branchId, 'endOrder')
  }

  return json({ success: true })
}

export default function Table() {
  const data = useLiveLoader<LoaderData>()
  const submit = useSubmit()
  const fetcher = useFetcher()
  const [searchParams] = useSearchParams()
  const showFeedbackModal = searchParams.get('feedback') === 'true'

  const [isInactive, setIsInactive] = useState(false)
  const [closeOrder, setCloseOrder] = useState(false)

  const [modalVisible, setModalVisible] = useState(false)
  let inactivityTimer
  let orderCloseTimer

  const handleActivity = () => {
    clearTimeout(inactivityTimer)
    clearTimeout(orderCloseTimer)
    setIsInactive(false)
    setCloseOrder(false)
    inactivityTimer = setTimeout(() => {
      setIsInactive(true)
    }, 180000) // 3 minutos = 180000 milisegundos

    orderCloseTimer = setTimeout(() => {
      // Logic to close the order
      setCloseOrder(true)
      // Example: setModalVisible(true);
    }, 3600000) // 5 minutes = 300000 milliseconds
  }

  useEffect(() => {
    // Eventos que reiniciarán el temporizador
    window.addEventListener('mousemove', handleActivity)
    window.addEventListener('keydown', handleActivity)
    window.addEventListener('scroll', handleActivity)
    window.addEventListener('touchstart', handleActivity)

    // Iniciar el temporizador por primera vez
    handleActivity()

    // Limpieza al desmontar el componente
    return () => {
      clearTimeout(inactivityTimer)
      clearTimeout(orderCloseTimer)
      window.removeEventListener('mousemove', handleActivity)
      window.removeEventListener('keydown', handleActivity)
      window.removeEventListener('scroll', handleActivity)
      window.removeEventListener('touchstart', handleActivity)
    }
  }, [])

  useEffect(() => {
    // Controlar la visibilidad del modal en base al estado de inactividad
    if (isInactive) {
      setModalVisible(true)
    }
  }, [isInactive])

  //NOTE - Se obtiene del useDataLoader si la orden esta expirada, si si, se envia el request para terminar la orden
  //TESTING
  //FIXME El problema es que si un usuario se une a la mesa, y la orden ya esta expirada, lo va a redirigir a la thankyou page, y el problema es que si es un usuario nuevo, no podra acceder
  //SOLUTIONS - Hacer que cuando el usuario cree el primer platillo, se cree una nueva orden, y redirija a order/$orderID
  useEffect(() => {
    if (data.orderExpired) {
      submit('', { method: 'POST', action: 'processes/endOrder' })
    }
  }, [submit, data.orderExpired])

  useEffect(() => {
    if (closeOrder) {
      submit('', { method: 'POST', action: 'processes/endOrder' })
    }
  }, [closeOrder, submit])

  useSessionTimeout()

  const isSubmitting = fetcher.state !== 'idle'

  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [filterPerUser, setFilterPerUser] = useState<boolean>(false)
  const [collapse, setCollapse] = useState<boolean>(false)
  const [showPaymentOptions, setShowPaymentOptions] = useState<boolean>(false)

  const handleToggleUser = (userId: string) => {
    setSelectedUsers((prevSelected: string[]) =>
      prevSelected.includes(userId) ? prevSelected.filter(id => id !== userId) : [...prevSelected, userId],
    )
  }

  const handleCollapse = () => {
    setCollapse(!collapse)
  }

  const handleToggle = () => {
    setFilterPerUser(!filterPerUser)
  }

  if (data.order) {
    return (
      <motion.main className="h-full pb-4 no-scrollbar">
        {/* {data.paymentNotification && <p>hola</p>} */}
        {/* <Help /> */}

        <RestaurantInfoCardV2 branch={data.branch} menu={data.menu} error={data.error} tableNumber={data.table.number} user={data.user} />
        {/* <Spacer spaceY="2" />
        <h3 className="flex justify-center text-sm text-secondaryTextDark shrink-0">{`Mesa ${data.table.number}`}</h3>*/}
        <Spacer spaceY="2" />
        <BillAmount
          amountLeft={data.amountLeft}
          currency={data.currency}
          paidUsers={data.paidUsers}
          total={data.total}
          userId={data.userId}
        />
        <Spacer spaceY="2" />
        {/* NOTE: SWITCH BUTTON */}
        {/* <div className="flex justify-end w-full">
          <SwitchButton
            state={filterPerUser}
            setToggle={handleToggle}
            leftIcon={<OrderIcon className="w-4 h-4" />}
            rightIcon={<UsersIcon className="w-4 h-4" />}
            leftText="Ver por orden"
            rightText="Ver por usuario"
            stretch
            height="medium"
            allCornersRounded={false}
          />
        </div> */}
        {/* NOTE: FILTER */}
        {filterPerUser ? (
          <FilterUserView order={data.order} currency={data.currency} handleToggleUser={handleToggleUser} selectedUsers={selectedUsers} />
        ) : (
          <FilterOrderView order={data.order} collapse={collapse} handleCollapse={handleCollapse} />
        )}
        <Spacer spaceY="2" />
        {data.amountLeft > 0 ? (
          <SinglePayButton showPaymentOptions={showPaymentOptions} setShowPaymentOptions={setShowPaymentOptions} />
        ) : (
          <fetcher.Form method="POST">
            <Button name="_action" value="endOrder" disabled={isSubmitting} fullWith={true}>
              {isSubmitting ? 'Terminando orden...' : 'Terminar orden'}
            </Button>
          </fetcher.Form>
        )}
        {/* <div className="flex justify-center w-full py-2">
          <p className="text-xs">
            Pay securely with <span className="font-bold">Avoqado</span>
          </p>
        </div> */}
        {modalVisible && <ActionsModal setModalVisible={setModalVisible} />}
        <FeedbackButton />
        {/* {showFeedbackModal && <FeedbackModal branch={data.branch} />} */}
        <Outlet />
      </motion.main>
    )
  } else {
    return (
      <EmptyOrder
        branch={data.branch}
        menu={data.menu}
        error={data.error}
        tableNumber={data.table.number}
        usersInTable={data.usersInTable}
        isOrderActive={data.order?.active}
        exclude="report"
        user={data.user}
      />
    )
  }
}

export function useInactivityTimeout(timeout = 180000) {
  // 180000ms = 3 minutos
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    let timer

    const events = ['mousemove', 'touchstart', 'keydown']

    const resetTimer = () => {
      clearTimeout(timer)
      setIsActive(true)
      timer = setTimeout(() => setIsActive(false), timeout)
    }

    // Agregar listeners para eventos de actividad
    events.forEach(event => {
      window.addEventListener(event, resetTimer)
    })

    // Configurar el timer por primera vez
    resetTimer()

    // Limpiar listeners y timer en el desmontaje
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, resetTimer)
      })
      clearTimeout(timer)
    }
  }, [timeout])

  return isActive
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
        <p>{(error as { message: string }).message}</p>
        <img
          src="https://media1.giphy.com/media/EFXGvbDPhLoWs/giphy.gif?cid=ecf05e47e4j9c0wtau2ep4e46x7dk654cz4c2370l34t9kwc&ep=v1_gifs_search&rid=giphy.gif&ct=g"
          alt="error page"
        />
      </main>
    )
  }
}

export function ActionsModal({ setModalVisible }) {
  return (
    <Modal onClose={() => setModalVisible(false)} title="Interactúa con el restaurante">
      <div className="flex flex-col p-4 space-y-4">
        <HelpWithoutOrder />
        <Button size="medium" onClick={() => setModalVisible(false)}>
          Regresar a la mesa
        </Button>
      </div>
    </Modal>
  )
}

export function FeedbackModal({ branch }) {
  const [stars, setStars] = useState(0)
  const [foodStars, setFoodStars] = useState(0)
  const [searchParams, setSearchParams] = useSearchParams()
  const onHandleClose = () => {
    searchParams.delete('feedback')
    setSearchParams(searchParams)
  }

  return (
    <Modal onClose={onHandleClose} title="Feedback" fullScreen={stars > 0}>
      <motion.div className={`flex flex-col items-center p-4 space-y-4 bg-white ${stars > 0 && 'h-full'}`}>
        <div className="flex items-center justify-center w-24 h-24 bg-white border-4 rounded-full shadow-sm">
          <img className="object-cover max-w-full" src={branch.logo ? branch.logo : 'https://i.ibb.co/7tBbLkT/avocado.png'} alt="src" />
        </div>
        <H2 className="text-center w-52">Comparta su experiencia con {branch.name}</H2>
        <div className="flex flex-row items-center justify-center p-5 bg-white">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              onClick={() => {
                setStars(i + 1)
              }}
            >
              <FaStar className={`${stars > 0 ? 'h-14 w-14' : 'h-8 w-8'} ${i + 1 <= stars ? 'fill-yellow-500' : 'fill-gray-400'}`} />
            </div>
          ))}
        </div>
        {stars > 0 && (
          <div className="text-center">
            <H2>Evalúa..</H2>
            <FlexRow>
              <H4>Comida y bebidas</H4>
              <div className="flex flex-row items-center justify-center p-4 bg-white">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      setFoodStars(i + 1)
                    }}
                  >
                    <IoHappy
                      className={`h-8 w-8 ${
                        i + 1 <= foodStars ? 'fill-yellow-500' : foodStars >= 1 && foodStars <= 3 ? 'fill-red-400' : 'fill-gray-400'
                      }`}
                    />
                  </div>
                ))}
              </div>
            </FlexRow>
          </div>
        )}
      </motion.div>
    </Modal>
  )
}
