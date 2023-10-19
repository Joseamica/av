import { Link, Outlet, useFetcher, useLoaderData, useParams, useRouteLoaderData, useSearchParams } from '@remix-run/react'

import { type ActionArgs, type LoaderArgs, json, redirect } from '@remix-run/node'

import { parse } from '@conform-to/zod'
import bcrypt from 'bcryptjs'
import clsx from 'clsx'
import { namedAction } from 'remix-utils'
import { z } from 'zod'
import { prisma } from '~/db.server'
import { useLiveLoader } from '~/use-live-loader'

import { Button, DeleteIcon, FlexRow, H2, H6 } from '~/components'
import { HeaderWithButton } from '~/components/admin/headers'

export const handle = { active: 'Notifications' }

const notificationsSchema = z.object({
  id: z.string(),
  name: z.string().nonempty('Name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().nonempty('Password is required'),
  image: z.string().url(),
  phone: z.string().nonempty('Phone is required'),
  role: z.enum(['manager', 'waiter']),
})

export async function loader({ request, params }: LoaderArgs) {
  const { branchId } = params
  const notifications = await prisma.notification.findMany({
    where: {
      branchId,
      status: {
        in: ['pending', 'rejected', 'received'],
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      table: true,
      user: true,
      employees: true,
    },
  })

  return json({ notifications })
}

export default function Notifications() {
  const data = useLiveLoader()

  const fetcher = useFetcher()

  const params = useParams()

  const isSubmitting = fetcher.state !== 'idle'
  return (
    <main>
      <HeaderWithButton queryKey="addItem" queryValue="true" buttonLabel="Add" />
      <fetcher.Form method="POST" action="/admin/deleteItem?mode=deleteAll" name="DELETE">
        <Button variant="danger" disabled={isSubmitting}>
          Delete all
        </Button>
        <input type="hidden" name="id" value={params.branchId} />
        <input type="hidden" name="model" value="notifications" />
        <input type="hidden" name="redirect" value={`/admin/${params.branchId}/notifications`} />
      </fetcher.Form>
      <div className="flex flex-wrap gap-2 p-4">
        {data.notifications.map(notification => {
          return (
            // <Square
            //   itemId={notification.id}
            //   name={
            //     <>
            //       <H5 boldVariant="bold">{notification.id}</H5>
            //     </>
            //   }
            //   to={notification.id}
            //   key={notification.id}
            // />
            <div key={notification.id}>
              {notification.type !== 'informative' && (
                <>
                  <Link
                    to={notification.id}
                    className={clsx('flex flex-col items-center justify-center p-2 border rounded-xl', {
                      'border-red-500 bg-red-200': notification.status === 'rejected',
                      // 'border-green-500': notification.status === 'accepted',
                      'border-yellow-500 bg-yellow-200': notification.status === 'pending',
                    })}
                  >
                    <span> {notification.type?.toUpperCase()}</span>
                    <span>User: {notification.user?.name}</span>
                    <span>Table: {notification.table?.number}</span>
                    {notification.total && <span>Total: {notification.total}</span>}
                    {notification.employees.length > 0 && <span>To: {notification.employees.map(employee => employee.name)}</span>}
                    <span className="font-bold">Status: {notification.status}</span>
                  </Link>
                  <fetcher.Form method="POST" action="/admin/deleteItem" name="DELETE">
                    <button disabled={isSubmitting}>Delete</button>
                    <input type="hidden" name="id" value={notification.id} />
                    <input type="hidden" name="model" value="notifications" />
                    <input type="hidden" name="redirect" value={`/admin/${params.branchId}/notifications`} />
                  </fetcher.Form>
                </>
              )}
            </div>
          )
        })}
      </div>
      <H2>Informative:</H2>

      <div className="space-y-2">
        {data.notifications.map((notification: { id: string; type: string; message: string }) => {
          const date = new Date(notification.createdAt)

          const hours = date.getUTCHours()
          const minutes = date.getUTCMinutes()
          const seconds = date.getUTCSeconds()
          return (
            <div
              key={notification.id}
              className={clsx('font-semibold', {
                'bg-purple-300 rounded-xl': notification.message.includes('Modificadores'),
                'bg-green-300 rounded-xl': notification.message.includes('pagar'),
                'border-4 border-black rounded-xl': notification.message.includes('llama al mesero'),
              })}
            >
              {notification.type === 'informative' && (
                <FlexRow className="border rounded-xl px-2 py-1" justify="between">
                  <H6>{`${hours}:${minutes}:${seconds}`}</H6>
                  <H6>{colorNumbers(notification.message)}</H6>
                  <fetcher.Form method="POST" action="/admin/deleteItem" name="DELETE">
                    <button disabled={isSubmitting} className="p-1 text-white border rounded-full bg-warning">
                      <DeleteIcon className="fill-white" />
                    </button>
                    <input type="hidden" name="id" value={notification.id} />
                    <input type="hidden" name="model" value="notifications" />
                    <input type="hidden" name="redirect" value={`/admin/${params.branchId}/notifications`} />
                  </fetcher.Form>
                </FlexRow>
              )}
            </div>
          )
        })}
      </div>
      {/* 
      <QueryDialog title="Add Employee" description="Add to the fields you want to add" query={'addItem'}>
        <fetcher.Form method="POST" {...form.props} action="?/create">
          <EmployeeForm
            intent="add"
            employees={data.notifications}
            editSubItemId={addItem}
            isSubmitting={isSubmitting}
            fields={fields}
            addingData={{ data: branch.menus, keys: ['name'] }}
          />
          <input type="hidden" value={addItem ? addItem : ''} {...conform.input(fields.id)} />
        </fetcher.Form>
      </QueryDialog>
      <QueryDialog title="Edit Employee" description="Modify the fields you want to edit" query={'editItem'}>
        <fetcher.Form method="POST" {...form.props} action="?/update">
          <EmployeeForm
            intent="edit"
            employees={data.notifications}
            editSubItemId={editItem}
            isSubmitting={isSubmitting}
            fields={fields}
            addingData={{ data: branch.orders, keys: ['id'] }}
          />
          <input type="hidden" value={editItem ? editItem : ''} {...conform.input(fields.id)} />
        </fetcher.Form>
      </QueryDialog>

      <QueryDialog title="Delete Employee" description="Are you sure that you want to delete this item?" query={'deleteItem'}>
        <fetcher.Form method="POST" action="/admin/deleteItem" name="DELETE">
          <Button type="submit" disabled={isSubmitting} size="small" variant="danger">
            Delete
          </Button>
          <input type="hidden" name="id" value={deleteItem ? deleteItem : ''} />
          <input type="hidden" name="model" value="notifications" />
          <input type="hidden" name="redirect" value={`/admin/${branchId}/notifications`} />

          <ErrorList errors={[...form.errors]} id={form.errorId} />
        </fetcher.Form>
      </QueryDialog> */}
      <Outlet />
    </main>
  )
}

const colorNumbers = text => {
  const chars = text.split('')
  let isNumber = false
  let currentNumber = ''
  const parts = []

  chars.forEach((char, index) => {
    if (!isNaN(char) && char !== ' ') {
      isNumber = true
      currentNumber += char
    } else {
      if (isNumber) {
        parts.push(
          <span key={index} className="text-blue-500">
            {currentNumber}
          </span>,
        )
        currentNumber = ''
        isNumber = false
      }
      parts.push(char)
    }
  })

  // Catch the last number, if there is one
  if (isNumber) {
    parts.push(
      <span key={chars.length} style={{ color: 'red' }}>
        {currentNumber}
      </span>,
    )
  }

  return parts
}
