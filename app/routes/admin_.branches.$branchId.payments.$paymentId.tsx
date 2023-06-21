import {CartItem} from '@prisma/client'
import {ActionArgs, LoaderArgs, json} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'
import {CartItemDetails, H1, H2, H3, H4, ItemContainer} from '~/components'
import {prisma} from '~/db.server'

export async function loader({request, params}: LoaderArgs) {
  const {branchId, paymentId} = params
  const payments = await prisma.payments.findFirst({
    where: {id: paymentId},
    include: {user: true},
  })
  return json({payments})
}

export async function action({request, params}: ActionArgs) {
  const formData = await request.formData()
  return json({success: true})
}

export default function AdminOrderId() {
  const data = useLoaderData()
  return (
    <div>
      <H2>Payments Id: {data.payments.id}</H2>
      <H3>Method: {data.payments.method}</H3>
      <H4>Order: {data.payments.orderId}</H4>
      <H4>Amount: {data.payments.amount}</H4>
      <H4>Tip: {data.payments.tip}</H4>
      <H3>Total: {data.payments.total}</H3>
      <H3>User: {data.payments.user.name}</H3>
      <div></div>
    </div>
  )
}
