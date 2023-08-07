import { Form, Outlet, isRouteErrorResponse, useFetcher, useRouteError, useSubmit } from '@remix-run/react'
import { useEffect, useState } from 'react'

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

import { getBranch } from '~/models/branch.server'
import { getMenu } from '~/models/menu.server'
import { getOrder } from '~/models/order.server'
import { getTable } from '~/models/table.server'
import { getPaidUsers, getUsersOnTable } from '~/models/user.server'

import { EVENTS } from '~/events'

import { getAmountLeftToPay, getCurrency, isOrderExpired } from '~/utils'

// TODO React icons or heroicons ? :angry
// * CUSTOM COMPONENTS
import {
  BillAmount,
  Button,
  EmptyOrder,
  FilterOrderView,
  FilterUserView,
  Help,
  OrderIcon,
  RestaurantInfoCard,
  SinglePayButton,
  Spacer,
  SwitchButton,
  UsersIcon,
} from '~/components/index'

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

export default function Table() {
  const data = useLiveLoader<LoaderData>()
  const submit = useSubmit()
  const fetcher = useFetcher()

  //NOTE - Se obtiene del useDataLoader si la orden esta expirada, si si, se envia el request para terminar la orden
  //TESTING
  //FIXME El problema es que si un usuario se une a la mesa, y la orden ya esta expirada, lo va a redirigir a la thankyou page, y el problema es que si es un usuario nuevo, no podra acceder
  //SOLUTIONS - Hacer que cuando el usuario cree el primer platillo, se cree una nueva orden, y redirija a order/$orderID
  useEffect(() => {
    if (data.orderExpired) {
      submit('', { method: 'POST', action: 'processes/endOrder' })
    }
  }, [submit, data.orderExpired])

  useSessionTimeout()

  const isSubmitting = fetcher.state !== 'idle'

  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [filterPerUser, setFilterPerUser] = useState<boolean>(false)
  const [collapse, setCollapse] = useState<boolean>(false)
  const [showPaymentOptions, setShowPaymentOptions] = useState<boolean>(false)

  const handleToggleUser = (userId: string) => {
    setSelectedUsers((prevSelected: string[]) => (prevSelected.includes(userId) ? prevSelected.filter(id => id !== userId) : [...prevSelected, userId]))
  }

  const handleCollapse = () => {
    setCollapse(!collapse)
  }

  const handleToggle = () => {
    setFilterPerUser(!filterPerUser)
  }

  if (data.order) {
    return (
      <motion.main className="no-scrollbar">
        <RestaurantInfoCard branch={data.branch} menu={data.menu} error={data.error} />
        <Spacer spaceY="4" />
        <h3 className="text-secondaryTextDark flex shrink-0 justify-center text-sm">{`Mesa ${data.table.table_number}`}</h3>
        <Spacer spaceY="2" />
        <Help />
        <BillAmount amountLeft={data.amountLeft} currency={data.currency} paidUsers={data.paidUsers} total={data.total} userId={data.userId} />
        <Spacer spaceY="2" />
        {/* NOTE: SWITCH BUTTON */}
        <div className="flex w-full justify-end">
          <SwitchButton
            state={filterPerUser}
            setToggle={handleToggle}
            leftIcon={<OrderIcon className="h-4 w-4" />}
            rightIcon={<UsersIcon className="h-4 w-4" />}
            leftText="Ver por orden"
            rightText="Ver por usuario"
            stretch
            height="medium"
            allCornersRounded={false}
          />
        </div>
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

export async function loader({ request, params }: LoaderArgs) {
  const session = await getSession(request)
  const user = await getUserDetails(session)

  const { tableId } = params
  invariant(tableId, 'No se encontró el ID de la mesa')

  const branch = await getBranch(tableId)
  invariant(branch, 'No se encontró la sucursal')

  const table = await getTable(tableId)

  //TESTING - FUNCTION TO GET ORDER DYNAMICALLY
  const order = await getOrder(tableId, {
    cartItems: { include: { user: true } },
    users: { include: { cartItems: true } },
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
      where: { id: user.userId, orderId: order?.id },
    })

    // * TODO por qué lo de la isUserInOrder
    if (!isUserInOrder && order) {
      try {
        console.time(`🔌 Connected '${user.username}' to the order`)
        await prisma.order.update({
          where: { id: order?.id },
          data: {
            users: { connect: { id: user.userId } },
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
    paidUsers = await getPaidUsers(order.id)
    amountLeft = await getAmountLeftToPay(tableId)
    orderExpired = isOrderExpired(order.paidDate, 2)
  }

  const error = !menu ? `${branch?.name} no cuenta con un menu abierto en este horario.` : null

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
    orderExpired,
  })
}

export async function action({ request, params }: ActionArgs) {
  const { tableId } = params
  invariant(tableId, 'Mesa no encontrada!')
  const formData = await request.formData()
  const _action = formData.get('_action') as string

  switch (_action) {
    case 'endOrder':
      // EVENTS.ISSUE_CHANGED(tableId)
      EVENTS.ISSUE_CHANGED(tableId, 'endOrder')
  }

  return json({ success: true })
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
