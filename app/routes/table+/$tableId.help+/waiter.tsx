import { Form, useLoaderData, useNavigate } from '@remix-run/react'
import { useState } from 'react'
import { FaCheck } from 'react-icons/fa'
import { IoCheckbox, IoCheckmark } from 'react-icons/io5'

import type { ActionArgs, LoaderArgs } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'

import type { Employee } from '@prisma/client'
import invariant from 'tiny-invariant'
import { prisma } from '~/db.server'
import { validateRedirect } from '~/redirect.server'
import { getSession } from '~/session.server'
import { sendWaNotification } from '~/twilio.server'

import { getTable } from '~/models/table.server'

import { EVENTS } from '~/events'

import { Button, FlexRow, ItemContainer, Modal, Spacer } from '~/components'

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
      type_temp: 'CALL',
      message: `El usuario ${username} de la mesa ${table?.number} llama al mesero`,
      type: 'informative',
      method: 'push',
      status: 'pending',
      branchId: table?.branchId,
      employees: {
        connect: ids.map(id => ({ id })),
      },
      tableId,
      userId,
    },
  })
  EVENTS.ISSUE_CHANGED()
  return redirect(redirectTo)
}

export async function loader({ request, params }: LoaderArgs) {
  const { tableId } = params
  invariant(tableId, 'tableId is required')
  const waiters = await prisma.employee.findMany({
    where: { role: 'waiter', tables: { some: { id: tableId } }, active: true },
  })

  return json({ waiters })
}

export default function Help() {
  const data = useLoaderData()
  const navigate = useNavigate()
  const [selectedWaiters, setSelectedWaiters] = useState({})
  const handleCheckboxChange = waiterId => {
    setSelectedWaiters(prev => ({ ...prev, [waiterId]: !prev[waiterId] }))
  }
  const onClose = () => {
    navigate('..', { preventScrollReset: true })
  }

  return (
    <Modal title="Llama al mesero" onClose={onClose}>
      <Form method="POST" className="p-2 space-y-2">
        {data.waiters?.map((waiter: Employee) => (
          <ItemContainer key={waiter.id} className="flex flex-row items-center space-x-2 bg-white ">
            <FlexRow className="items-center space-x-4">
              {/* <img className="w-10 h-10 rounded-full" src={waiter.image} alt={waiter.name} /> */}
              <label className="text-base font-semibold" htmlFor={waiter.id}>
                {waiter.name}
              </label>
              <span className="border rounded-full px-3  bg-[#F7FAFC]">{waiter.role ? 'Mesero' : ''}</span>
            </FlexRow>
            <input
              type="checkbox"
              name="phones"
              id={`checkbox-${waiter.id}`}
              value={waiter.phone}
              className="sr-only"
              onChange={() => handleCheckboxChange(waiter.id)}
              checked={selectedWaiters[waiter.id] || false}
            />
            <label htmlFor={`checkbox-${waiter.id}`} className="flex items-center cursor-pointer">
              <div
                className={`w-7 h-7 border border-gray-400 rounded-full flex justify-center items-center ${
                  selectedWaiters[waiter.id] ? 'bg-button-primary' : ''
                }`}
              >
                {selectedWaiters[waiter.id] ? <IoCheckmark className="fill-white text-white" /> : null}
              </div>
            </label>
            <input type="hidden" name="ids" id={waiter.id} value={waiter.id} />
            <input type="hidden" name="names" id={waiter.name} value={waiter.name} />{' '}
          </ItemContainer>
        ))}
        {data.waiters?.length === 0 && <p className="text-center">Esta mesa no tiene meseros asignados</p>}

        <Button className="w-full" size="medium">
          Llamar al mesero
        </Button>
      </Form>
    </Modal>
  )
}
