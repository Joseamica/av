import type {ActionArgs, LoaderArgs} from '@remix-run/node'
import {json, redirect} from '@remix-run/node'
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
  useSearchParams,
  useSubmit,
} from '@remix-run/react'
import {AnimatePresence, motion} from 'framer-motion'
import React from 'react'
import invariant from 'tiny-invariant'
import {
  BillAmount,
  Button,
  H1,
  H5,
  Payment,
  QuantityManagerButton,
  Spacer,
} from '~/components'
import {Modal} from '~/components/modal'
import {prisma} from '~/db.server'
import {
  getBranchId,
  getPaymentMethods,
  getTipsPercentages,
} from '~/models/branch.server'
import {getMenu} from '~/models/menu.server'
import {getPaidUsers} from '~/models/user.server'
import {validateRedirect} from '~/redirect.server'
import {getUserId} from '~/session.server'
import {getAmountLeftToPay, getCurrency} from '~/utils'

export async function action({request, params}: ActionArgs) {
  const {tableId} = params
  invariant(tableId, 'No se encontró mesa')
  const formData = await request.formData()

  const redirectTo = validateRedirect(request.redirect, `/table/${tableId}`)

  const proceed = formData.get('_action') === 'proceed'

  const order = await prisma.order.findFirst({
    where: {tableId},
  })
  invariant(order, 'No se encontró la orden, o aun no ha sido creada.')

  const url = new URL(request.url)
  const searchParams = new URLSearchParams(url.search)
  const tip = Number(searchParams.get('tip')) as number

  //WHEN SUBMIT
  if (proceed) {
    const amountLeft = (await getAmountLeftToPay(tableId)) || 0
    const userId = await getUserId(request)
    const userPrevPaidData = await prisma.user.findFirst({
      where: {id: userId},
      select: {paid: true, tip: true, total: true},
    })
    const updateUser = await prisma.user.update({
      where: {id: userId},
      data: {
        paid: Number(userPrevPaidData?.paid) + Number(amountLeft),
        tip: Number(userPrevPaidData?.tip) + tip,
        total: Number(userPrevPaidData?.total) + Number(amountLeft) + tip,
      },
    })
    return redirect(redirectTo)
  }

  return json({success: true})
}

export async function loader({request, params}: LoaderArgs) {
  const {tableId} = params
  invariant(tableId, 'No se encontró mesa')

  const order = await prisma.order.findFirst({
    where: {tableId},
  })
  invariant(order, 'No se encontró la orden, o aun no ha sido creada.')
  const tipsPercentages = await getTipsPercentages(tableId)
  const paymentMethods = await getPaymentMethods(tableId)
  const cartItems = await prisma.cartItem.findMany({
    // FIX
    where: {orderId: order.id, activeOnOrder: true},
    include: {menuItem: true, user: true},
  })
  const userId = await getUserId(request)
  const amountLeft = await getAmountLeftToPay(tableId)
  const branchId = await getBranchId(tableId)
  const currency = await getMenu(branchId)
    .then(menu => {
      if (menu) {
        return menu.currency
      }
    })
    .then(getCurrency)

  let paidUsers = null
  if (order) {
    paidUsers = await getPaidUsers(order.id)
  }
  const total = await prisma.order
    .aggregate({
      where: {id: order.id},
      _sum: {total: true},
    })
    .then(res => res._sum.total)

  return json({
    cartItems,
    total,
    tipsPercentages,
    paymentMethods,
    amountLeft,
    paidUsers,
    userId,
    currency,
  })
}

export default function EqualParts() {
  const navigate = useNavigate()
  const data = useLoaderData()

  const [searchParams] = useSearchParams()
  const tip = Number(searchParams.get('tip')) as number
  const total = Number(searchParams.get('total')) as number

  const submit = useSubmit()
  function handleChange(event: React.FormEvent<HTMLFormElement>) {
    submit(event.currentTarget, {replace: true})
  }

  return (
    <Modal
      onClose={() => navigate('..')}
      fullScreen={true}
      title="Estás siendo super generoso"
    >
      <Form method="POST" preventScrollReset onChange={handleChange}>
        <BillAmount
          total={data.total}
          currency={data.currency}
          amountLeft={data.amountLeft}
          usersPaid={data.paidUsers}
          userId={data.userId}
          // isPaying={isPaying}
        />
        <H1>Quieres pagar {total}</H1>
        <Spacer spaceY="2" />

        <div>
          <H1>Total: ${Number(data.amountLeft).toFixed(1)}</H1>
          <H1>Propina: ${tip.toFixed(1)}</H1>
        </div>
        <Button name="_action" value="proceed">
          Submit
        </Button>
      </Form>
    </Modal>
  )
}
