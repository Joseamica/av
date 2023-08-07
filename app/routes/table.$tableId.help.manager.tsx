import { Form, useLoaderData, useNavigate } from '@remix-run/react'

import { type ActionArgs, type LoaderArgs, json, redirect } from '@remix-run/node'

import type { Employee } from '@prisma/client'
import invariant from 'tiny-invariant'
import { prisma } from '~/db.server'
import { validateRedirect } from '~/redirect.server'
import { SendWhatsApp } from '~/twilio.server'

import { getTable } from '~/models/table.server'

import { Button, FlexRow, ItemContainer, Modal } from '~/components'

export async function action({ request, params }: ActionArgs) {
  const { tableId } = params
  invariant(tableId, 'tableId is required')
  const formData = await request.formData()
  const managersId = formData.getAll('managers') as [string]
  const redirectTo = validateRedirect(request.redirect, `..`)

  const table = await getTable(tableId)

  const managers = await prisma.employee
    .findMany({
      where: { id: { in: managersId }, NOT: { phone: null } },
    })
    .then(managers => managers.map(manager => manager.phone))

  const sendNotification = SendWhatsApp('14155238886', managers, `Llamada de la mesa ${table?.table_number} test`)

  // const sendNotification = sendWhatsapp()

  return redirect(redirectTo)
}

export async function loader({ request, params }: LoaderArgs) {
  const { tableId } = params
  invariant(tableId, 'tableId is required')
  const managers = await prisma.employee.findMany({
    where: { role: 'manager', tables: { some: { id: tableId } } },
  })

  return json({ managers })
}

export default function Help() {
  const data = useLoaderData()
  const navigate = useNavigate()

  const onClose = () => {
    navigate('..')
  }

  return (
    <Modal title="Llama al Gerente" onClose={onClose}>
      <Form method="POST" className="space-y-2 p-2">
        {data.managers?.map((manager: Employee) => (
          <ItemContainer key={manager.id} className="flex flex-row">
            <FlexRow className="space-x-4">
              <label className="text-xl" htmlFor={manager.id}>
                {manager.name}
              </label>
              <span className="rounded-full bg-button-primary px-2 text-sm text-white ring ring-button-outline">{manager.role ? 'Gerente' : ''}</span>
            </FlexRow>
            <input type="checkbox" name="managers" id={manager.id} value={manager.id} />
          </ItemContainer>
        ))}
        {data.managers?.length === 0 && <p className="text-center">Esta mesa no tiene gerentes asignados</p>}
        <Button className="w-full">Llamar al gerente</Button>
      </Form>
    </Modal>
  )
}
