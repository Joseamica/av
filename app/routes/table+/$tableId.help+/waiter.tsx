import { Form, useLoaderData, useNavigate } from '@remix-run/react'

import type { ActionArgs, LoaderArgs } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'

import type { Employee } from '@prisma/client'
import invariant from 'tiny-invariant'
import { prisma } from '~/db.server'
import { validateRedirect } from '~/redirect.server'
import { getSession } from '~/session.server'
import { sendWaNotification } from '~/twilio.server'

import { getTable } from '~/models/table.server'

import { Button, FlexRow, ItemContainer, Modal } from '~/components'

export async function action({ request, params }: ActionArgs) {
  const { tableId } = params
  invariant(tableId, 'tableId is required')
  const session = await getSession(request)
  const userId = session.get('userId')

  const formData = await request.formData()

  const phones = formData.getAll('phones') as [string]
  const ids = formData.getAll('ids') as [string]
  const names = formData.getAll('names') as [string]

  const redirectTo = validateRedirect(request.redirect, `..`)
  const username = session.get('username')
  const table = await getTable(tableId)
  console.log(`Llaman al mesero ${names} ${table?.number}`)

  sendWaNotification({ to: phones, body: `Llamada de la mesa ${table?.number}` })

  await prisma.notification.create({
    data: {
      message: `El usuario ${username} de la mesa ${table?.number} llama al mesero`,
      type: 'informative',
      method: 'push',
      status: 'received',
      branchId: table?.branchId,
      employees: {
        connect: ids.map(id => ({ id })),
      },
      tableId,
      userId,
    },
  })
  return redirect(redirectTo)
}

export async function loader({ request, params }: LoaderArgs) {
  const { tableId } = params
  invariant(tableId, 'tableId is required')
  const waiters = await prisma.employee.findMany({
    where: { role: 'waiter', tables: { some: { id: tableId } } },
  })

  return json({ waiters })
}

export default function Help() {
  const data = useLoaderData()
  const navigate = useNavigate()

  const onClose = () => {
    navigate('..')
  }

  return (
    <Modal title="Llama al mesero" onClose={onClose}>
      <Form method="POST" className="p-2 space-y-2">
        {data.waiters?.map((waiter: Employee) => (
          <ItemContainer key={waiter.id} className="flex flex-row items-center space-x-2">
            <FlexRow className="items-center space-x-4">
              <img className="w-10 h-10 rounded-full" src={waiter.image} alt={waiter.name} />
              <label className="text-base" htmlFor={waiter.id}>
                {waiter.name}
              </label>
              <span className="px-2 text-sm text-white rounded-full bg-button-primary ring ring-button-outline">
                {waiter.role ? 'Mesero' : ''}
              </span>
            </FlexRow>
            <input type="checkbox" name="phones" id={waiter.id} value={waiter.phone} />
            <input type="hidden" name="ids" id={waiter.id} value={waiter.id} />
            <input type="hidden" name="names" id={waiter.name} value={waiter.name} />{' '}
          </ItemContainer>
        ))}
        {data.waiters?.length === 0 && <p className="text-center">Esta mesa no tiene meseros asignados</p>}
        {/* <Spacer spaceY="2" /> */}
        <Button className="w-full">Llamar al mesero</Button>
      </Form>
    </Modal>
  )
}
