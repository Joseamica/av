import { Link, useLoaderData, useSearchParams } from '@remix-run/react'

import type { LoaderArgs } from '@remix-run/node'
import { json } from '@remix-run/node'

import type { CartItem } from '@prisma/client'
import invariant from 'tiny-invariant'
import { prisma } from '~/db.server'

import { formatCurrency, getCurrency } from '~/utils'

import { Button, FlexRow, H1, H2, H3, H4, SectionContainer, Spacer } from '~/components'

export const handle = { backButton: true }

export async function loader({ params, request }: LoaderArgs) {
  const { branchId, tableId, userId } = params
  invariant(tableId, 'No existe ninguna mesa con este id')

  invariant(userId, 'No hay ningun userId')
  const user = await prisma.user.findFirst({
    where: { id: userId },
    include: { orders: { select: { table: { include: { order: true } } } } },
  })
  const orderId = await prisma.user.findFirst({
    where: { id: userId },
    select: { orderId: true },
  })
  const getUsersTotalPaid = await prisma.user.aggregate({
    where: { orderId: orderId?.orderId },
    _sum: { paid: true, tip: true },
  })
  const totalPaid = getUsersTotalPaid._sum.paid
  const totalTip = getUsersTotalPaid._sum.tip

  const cartItems = await prisma.cartItem.findMany({
    where: { user: { some: { id: userId } } },
    include: { menuItem: true },
  })

  const currency = await getCurrency(tableId)
  return json({
    user,
    userId,
    totalPaid,
    branchId,
    tableId,
    cartItems,
    currency,
    totalTip,
  })
}

export default function User() {
  const data = useLoaderData()
  const [searchParams] = useSearchParams()
  const changeName = searchParams.get('changeName')

  return (
    <SectionContainer className="">
      <img src="" alt="profile_pic" className="h-20 w-20 rounded-full" />
      <div className="flex flex-col items-center justify-center space-y-2">
        <H1>{data.user.name}</H1>
        <Link to="?changeName=true" className="rounded-full border border-gray_light px-2 py-1 text-xs">
          Cambiar nombre
        </Link>
        {changeName ? (
          <FlexRow>
            <input name="name" placeholder="Escribe el nombre..." className="h-10 rounded-full border pl-2 text-sm " />
            <Button size="small">Cambiar</Button>
          </FlexRow>
        ) : null}
      </div>
      <Spacer spaceY="2" />
      <div>
        <H2>Tus platillos ordenados</H2>
        <Spacer spaceY="1" />
        <hr />
        <Spacer spaceY="1" />
        <div className="space-y-2">
          {data.cartItems.map((item: CartItem, index: number) => {
            return (
              <FlexRow
                className="w-full justify-between"
                key={item.id}
                // unActive={item.paid ? true : false}
                // showCollapse={true}
              >
                <FlexRow>
                  <H4>{item.quantity}</H4>
                  <H3>{item.name}</H3>
                </FlexRow>
                <FlexRow>
                  <H4>{formatCurrency(data.currency, item.price)}</H4>
                  {/* {item.paid ? (
                    <H6 className="rounded-full p-1 text-success">{`Pagado ${item.paidBy}`}</H6>
                  ) : (
                    <input
                      type="checkbox"
                      name={`item-${item.id}`}
                      className="h-5 w-5"
                    />
                  )}
                  <input
                    type="hidden"
                    name={`price-${item.id}`}
                    value={item.price}
                  /> */}
                </FlexRow>
              </FlexRow>
            )
          })}
        </div>
        <Spacer spaceY="2" />
        <H2>Pagos</H2>
        <Spacer spaceY="1" />
        <hr />
        <Spacer spaceY="1" />
        <div>
          <FlexRow justify="between">
            <H4>Propina:</H4>
            <H2 boldVariant="semibold">{formatCurrency(data.currency, data.totalTip)}</H2>
          </FlexRow>
          <FlexRow justify="between">
            <H4>Total: </H4>
            <H2 boldVariant="semibold">{formatCurrency(data.currency, data.totalPaid)}</H2>
          </FlexRow>
        </div>
      </div>
    </SectionContainer>
  )
}
