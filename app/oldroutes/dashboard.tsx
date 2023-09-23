import { Form, Link, Outlet, useLoaderData, useSearchParams } from '@remix-run/react'

import { type ActionArgs, type LoaderArgs, json, redirect } from '@remix-run/node'

import clsx from 'clsx'
import { prisma } from '~/db.server'
import { getSession } from '~/session.server'

export async function loader({ request, params }: LoaderArgs) {
  const session = await getSession(request)
  const employeeId = session.get('employeeId')

  if (!employeeId) return redirect('/login')

  const notifications = await prisma.notification.findMany({
    where: {
      employees: {
        some: {
          id: employeeId,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
  return json({ notifications })
}
export async function action({ request, params }: ActionArgs) {
  const formData = await request.formData()
  return json({ success: true })
}

export default function Name() {
  const data = useLoaderData()
  const [searchParams] = useSearchParams()

  return (
    <div>
      <Form action="/logout" method="POST">
        <button type="submit">Logout</button>
      </Form>
      {data.notifications.map(notification => {
        return (
          <Link
            key={notification.id}
            to={`notification/${notification.id}`}
            className={clsx('flex flex-row items-center justify-center w-40 h-40 p-4 border-2 border-gray-200 rounded-lg', {
              'bg-gray-100': notification.status === 'pending',
              'bg-yellow-100': notification.status === 'received',
              'bg-green-100 border-green-200': notification.status === 'accepted',
              'bg-red-100': notification.status === 'rejected',
            })}
          >
            {notification.type}
            {notification.tables?.number}
          </Link>
        )
      })}
      <Outlet />
    </div>
  )
}
