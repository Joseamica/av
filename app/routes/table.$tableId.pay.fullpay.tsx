import type {ActionArgs, LoaderArgs} from '@remix-run/node'
import {json, redirect} from '@remix-run/node'
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
  useSubmit,
} from '@remix-run/react'
import invariant from 'tiny-invariant'
import {BillAmount, Payment} from '~/components'
import {Modal} from '~/components/modal'
import {prisma} from '~/db.server'
import {
  getBranchId,
  getPaymentMethods,
  getTipsPercentages,
} from '~/models/branch.server'
import {getMenu} from '~/models/menu.server'
import {getOrder} from '~/models/order.server'
import {getPaidUsers} from '~/models/user.server'
import {validateRedirect} from '~/redirect.server'
import {getUserId} from '~/session.server'
import {getAmountLeftToPay, getCurrency} from '~/utils'
import type {Order, User} from '@prisma/client'

type LoaderData = {
  amountLeft: number
  total: number
  tableId: string
  paidUsers: any
  currency: string
  tipsPercentages: number[]
  paymentMethods: string[]
  userId: string
}

export async function loader({request, params}: LoaderArgs) {
  const {tableId} = params
  invariant(tableId, 'No se encontró mesa')
  const amountLeft = await getAmountLeftToPay(tableId)
  const order = await getOrder(tableId)
  const total = order?.total
  const userId = await getUserId(request)

  const branchId = await getBranchId(tableId)
  const tipsPercentages = await getTipsPercentages(tableId)
  const paymentMethods = await getPaymentMethods(tableId)

  // console.log('order', order)
  let paidUsers = null

  if (order) {
    paidUsers = await getPaidUsers(order.id)
  }

  const currency = await getCurrency(tableId)

  // const currency = getCurrency(menu?.currency)

  const data = {
    amountLeft,
    total,
    tableId,
    paidUsers,
    currency,
    tipsPercentages,
    paymentMethods,
    userId,
  }

  return json(data)
}

export async function action({request, params}: ActionArgs) {
  const formData = await request.formData()

  const {tableId} = params
  invariant(tableId, 'tableId no encontrado')

  const order = await getOrder(tableId)
  invariant(order, 'No se encontró la orden')

  const redirectTo = validateRedirect(request.redirect, `/table/${tableId}`)

  const userId = await getUserId(request)
  const proceed = formData.get('_action') === 'proceed'
  const tipPercentage = formData.get('tipPercentage') as string

  const userPrevPaid = await prisma.user.findFirst({
    where: {id: userId},
    select: {paid: true},
  })

  const amountLeft = await getAmountLeftToPay(tableId)
  const total = Number(amountLeft) + Number(userPrevPaid?.paid)
  //FIX this \/
  //@ts-expect-error
  const tip = amountLeft * Number(tipPercentage / 100)

  if (proceed) {
    const updateTotal = await prisma.order.update({
      where: {tableId: tableId},
      data: {
        paid: true,
        users: {
          update: {
            where: {id: userId},
            data: {
              paid: total,
              tip: tip,

              total: tip + total,
            },
          },
        },
      },
    })

    return redirect(redirectTo)
  }

  return json({tip, total})
}

export default function FullPay() {
  const data = useLoaderData<LoaderData>()
  const actionData = useActionData()
  const navigate = useNavigate()
  const submit = useSubmit()
  function handleChange(event: React.FormEvent<HTMLFormElement>) {
    submit(event.currentTarget, {replace: true})
  }

  return (
    <Modal
      onClose={() => navigate('..')}
      fullScreen={true}
      title="Pagar cuenta completa"
    >
      <BillAmount

      // isPaying={isPaying}
      />
      <Form method="POST" preventScrollReset onChange={handleChange}>
        <Payment
          total={data.amountLeft}
          tip={actionData?.tip}
          tipsPercentages={data.tipsPercentages}
          paymentMethods={data.paymentMethods}
          currency={data.currency}
        />
      </Form>
    </Modal>
  )
}
