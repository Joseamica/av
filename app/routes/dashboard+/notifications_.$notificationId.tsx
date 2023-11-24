import { useLoaderData } from '@remix-run/react'

import { type ActionFunctionArgs, type LoaderFunctionArgs, json, redirect } from '@remix-run/node'

import { prisma } from '~/db.server'

export const handle = {
  sub: true,
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { notificationId } = params
  const notification = await prisma.notification.findUnique({
    where: {
      id: notificationId,
    },
  })
  return json({ notification })
}
export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData()
  return json({ success: true })
}

export default function Name() {
  const data = useLoaderData()
  return (
    <div>
      <p>{data.notification.type}</p>
      <p>{data.notification.message}</p>
    </div>
  )
}
