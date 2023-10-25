import { useLoaderData, useNavigate } from '@remix-run/react'

import { type ActionArgs, type LoaderArgs, json, redirect } from '@remix-run/node'

import { prisma } from '~/db.server'

import { SubModal } from '~/components/modal'

export async function loader({ request, params }: LoaderArgs) {
  const { orderId } = params
  const payments = await prisma.payments.findMany({
    where: {
      orderId: orderId,
      status: 'accepted',
    },
  })
  return json({ payments })
}
export async function action({ request, params }: ActionArgs) {
  const formData = await request.formData()
  return json({ success: true })
}

export default function OrderPayments() {
  const data = useLoaderData()
  const navigate = useNavigate()
  return (
    <SubModal onClose={() => navigate(-1)} title="Payments">
      {data.payments.map(payment => {
        return <div key={payment.id}>{payment.amount}</div>
      })}
    </SubModal>
  )
}
