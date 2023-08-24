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
  const phones = formData.getAll('managers') as [string]
  const redirectTo = validateRedirect(request.redirect, `..`)

  const table = await getTable(tableId)

  SendWhatsApp('14155238886', phones, `Llamada de la mesa ${table?.number} test`)
  await prisma.notifications.create({
    data: {
      message: `Llamada de la mesa ${table?.number}`,
      method: 'whatsapp',
      status: 'pending',
    },
  })

  return redirect(redirectTo)
}

export async function loader({ request, params }: LoaderArgs) {
  const { tableId } = params
  invariant(tableId, 'tableId is required')
  const managers = await prisma.user.findMany({
    where: { role: 'manager' },
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
      <Form method="POST" className="p-2 space-y-2">
        {data.managers?.map((manager: Employee) => (
          <ItemContainer key={manager.id} className="flex flex-row">
            <FlexRow className="items-center space-x-4">
              <img className="w-10 h-10 rounded-full" src={manager.image} alt={manager.name} />
              <label className="text-xl" htmlFor={manager.id}>
                {manager.name}
              </label>
              <span className="px-2 text-sm text-white rounded-full bg-button-primary ring ring-button-outline">
                {manager.role ? 'Gerente' : ''}
              </span>
            </FlexRow>
            <input type="checkbox" name="managers" id={manager.id} value={manager.phone} />
          </ItemContainer>
        ))}
        {data.managers?.length === 0 && <p className="text-center">Esta mesa no tiene gerentes asignados</p>}
        <Button className="w-full">Llamar al gerente</Button>
      </Form>
    </Modal>
  )
}
