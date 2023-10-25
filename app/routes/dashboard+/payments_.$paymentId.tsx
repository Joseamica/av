import { useLoaderData } from '@remix-run/react'

import { type ActionArgs, type LoaderArgs, json, redirect } from '@remix-run/node'

import { prisma } from '~/db.server'

export async function loader({ request, params }: LoaderArgs) {
  const { paymentId } = params
  const payment = await prisma.payments.findUnique({
    where: {
      id: paymentId,
      status: 'accepted',
    },
  })
  return json({ success: true })
}
export async function action({ request, params }: ActionArgs) {
  const formData = await request.formData()
  return json({ success: true })
}

export default function Name() {
  const data = useLoaderData()
  return <div>Name</div>
}
