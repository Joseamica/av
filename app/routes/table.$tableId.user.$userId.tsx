import {UserCircleIcon} from '@heroicons/react/solid'
import {json} from '@remix-run/node'
import type {LoaderArgs} from '@remix-run/node'
import {Link, useLoaderData} from '@remix-run/react'
import {motion} from 'framer-motion'
import {Fragment} from 'react'
import invariant from 'tiny-invariant'
import {FlexRow, H1, H3, H4, SectionContainer, Spacer} from '~/components'
import {prisma} from '~/db.server'

export async function loader({params, request}: LoaderArgs) {
  const {branchId, tableId, userId} = params

  invariant(userId, 'No hay ningun userId')
  const user = await prisma.user.findFirst({
    where: {id: userId},
    include: {orders: {select: {table: {include: {order: true}}}}},
  })
  const orderId = await prisma.user.findFirst({
    where: {id: userId},
    select: {orderId: true},
  })
  const getUsersTotalPaid = await prisma.user.aggregate({
    where: {orderId: orderId?.orderId},
    _sum: {paid: true},
  })
  const totalPaid = getUsersTotalPaid._sum.paid

  const cartItems = await prisma.cartItem.findMany({
    where: {user: {some: {id: userId}}},
    include: {menuItem: true},
  })

  return json({user, userId, totalPaid, branchId, tableId, cartItems})
}

export default function User() {
  const data = useLoaderData()

  return (
    <SectionContainer className="p-2">
      <Spacer spaceY="2" />
      {/* <UserIcon fill={data.user?.color} className="w-10 h-10" /> */}
      <div className="flex w-full flex-col items-center justify-center ">
        <UserCircleIcon
          className={`h-20 w-20 animate-pulse`}
          style={{color: data.user?.color}}
        />
        <H1> {data.user.name}</H1>
        <Spacer spaceY="2" />

        <H4 className="dark:bg-mainDark flex w-full justify-center rounded-t-lg bg-white p-2 shadow-lg dark:shadow-none">
          Platillos ordenados
        </H4>
        <div className="dark:bg-secondaryDark flex w-full flex-col justify-start rounded-b-xl bg-white p-2">
          {data.cartItems.length > 0 ? (
            data.cartItems.map(item => (
              <motion.div key={item.id} className="w-full">
                <div className=" flex flex-col rounded-lg py-1 " key={item.id}>
                  <FlexRow
                    className="dark:bg-DARK_1 w-full items-center justify-between rounded-lg bg-white px-4 py-2 shadow-md dark:shadow-none"
                    key={item.id}
                  >
                    <FlexRow className="items-center justify-center space-x-4">
                      <p className="max-w-5 text-mainTextColor bg-componentBg dark:bg-secondaryDark flex h-7 w-5 items-center justify-center rounded-md text-sm font-normal">
                        {item.quantity}
                      </p>
                      <img
                        src={item.menuItem.image}
                        alt=""
                        className="dark:bg-secondaryDark h-10 w-10 rounded-lg "
                      />
                      <H4>{item.menuItem.name}</H4>
                    </FlexRow>
                    <FlexRow className="items-center space-x-2 ">
                      {item.quantity > 1 && (
                        <H4 className="text-sm text-gray-500">
                          ${item.menuItem.price}
                        </H4>
                      )}
                      <h3>${item.menuItem.price * item.quantity}</h3>
                    </FlexRow>
                  </FlexRow>
                </div>
              </motion.div>
            ))
          ) : (
            <H3 variant="secondary" className="pl-2">
              aun no ha ordenado nada
            </H3>
          )}
        </div>

        {/* <FlexRow className="flex flex-row justify-center w-full p-2 text-white rounded-t-lg bg-principal dark:bg-mainDark">
          <H4>Tu identificador</H4>
        </FlexRow> */}
        {/* <AnimatePresence>
          <motion.div
            className="flex flex-col items-center justify-center w-full h-56 rounded-b-lg animate-pulse"
            style={{ background: data.user?.color }}
          >
            <p>{data.user.name}</p>
            <div className="p-2 bg-white rounded-full ring-2 ring-principal dark:bg-mainDark">
              <p>{data.user?.color.toUpperCase().replace("#", "N:")}</p>
            </div>
          </motion.div>
        </AnimatePresence> */}
      </div>
      <Spacer spaceY="2" />
      <div className="dark:bg-secondaryDark rounded-t-lg bg-white">
        <H4 className="dark:bg-mainDark flex justify-center rounded-t-lg bg-white p-2 shadow-lg dark:shadow-none">
          Mesa {data.user?.orders.table.table_number}
        </H4>
        <div className="flex flex-col space-y-2 p-2">
          {data.user?.paid >= 0 ? (
            <FlexRow
              justify="between"
              className="dark:bg-mainDark rounded-lg bg-white px-4 py-2 shadow-lg dark:shadow-none "
            >
              <H4>Pagado</H4>
              <H4>
                ${!data.user?.paid ? '0' : Number(data.user.paid).toFixed(2)}
              </H4>
            </FlexRow>
          ) : null}
          {data.user?.tip >= 0 ? (
            <FlexRow
              justify="between"
              className="dark:bg-mainDark rounded-lg bg-white px-4 py-2 shadow-lg dark:shadow-none "
            >
              <H4>Propina</H4>
              <H4>
                ${!data.user?.tip ? '0' : Number(data.user.tip).toFixed(2)}
              </H4>
            </FlexRow>
          ) : null}
          {data.user?.total >= 0 ? (
            <FlexRow
              justify="between"
              className="dark:bg-mainDark rounded-lg bg-white px-4 py-2 shadow-lg dark:shadow-none "
            >
              <H4>Total</H4>
              <H4>
                ${!data.user?.total ? '0' : Number(data.user.total).toFixed(2)}
              </H4>
            </FlexRow>
          ) : null}
        </div>
      </div>
      <FlexRow
        justify="between"
        className="dark:bg-mainDark rounded-b-lg bg-white p-4 drop-shadow-lg dark:drop-shadow-none"
      >
        <H3>Queda por pagar</H3>
        <H3>
          $
          {Number(data.user?.orders.table.order.total - data.totalPaid).toFixed(
            2,
          )}
        </H3>
      </FlexRow>
      <Spacer spaceY="4" />
      <Link
        to={`/branch/${data.branchId}/table/${data.tableId}`}
        className="bg-principal dark:bg-buttonBgDark flex w-full justify-center rounded-full p-4 text-white"
        prefetch="intent"
      >
        Volver a la cuenta
      </Link>
    </SectionContainer>
  )
}
