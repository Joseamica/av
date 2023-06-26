import type {Employee} from '@prisma/client'
import type {ActionArgs, LoaderArgs} from '@remix-run/node'
import {redirect} from '@remix-run/node'
import {json} from '@remix-run/node'
import {Form, useLoaderData, useNavigate} from '@remix-run/react'
import invariant from 'tiny-invariant'
import {Button, FlexRow, ItemContainer, Modal} from '~/components'
import {prisma} from '~/db.server'
import {getTable} from '~/models/table.server'
import {validateRedirect} from '~/redirect.server'
import {SendWhatsApp} from '~/twilio.server'

export async function action({request, params}: ActionArgs) {
  const {tableId} = params
  invariant(tableId, 'tableId is required')
  const formData = await request.formData()
  const waiters = formData.getAll('waiters') || []
  const redirectTo = validateRedirect(request.redirect, `..`)

  const table = await getTable(tableId)

  if (waiters.length > 0) {
    const waitersNumbers = await prisma.employee
      .findMany({
        where: {
          id: {in: waiters},
          NOT: {phone: null},
          tables: {some: {id: tableId}},
        },
      })
      .then(waiters => waiters.map(waiter => waiter.phone))

    if (waitersNumbers.length > 0) {
      SendWhatsApp(
        '14155238886',
        waitersNumbers,
        `Te llaman de la mesa ${table?.table_number}`,
      )
    }
  }

  // console.dir(
  //   `CALL ~> Llaman al mesero ${waiters} de la mesa ${table?.table_number}`,
  // )

  return redirect(redirectTo)
}

export async function loader({request, params}: LoaderArgs) {
  const {tableId} = params
  invariant(tableId, 'tableId is required')
  const waiters = await prisma.employee.findMany({
    where: {role: 'waiter', tables: {some: {id: tableId}}},
  })

  return json({waiters})
}

export default function Help() {
  const data = useLoaderData()
  const navigate = useNavigate()

  const onClose = () => {
    navigate('..')
  }

  return (
    <Modal title="Llama al mesero" onClose={onClose}>
      <Form method="POST" className="space-y-2 p-2">
        {data.waiters?.map((waiter: Employee) => (
          <ItemContainer key={waiter.id} className="flex flex-row">
            <FlexRow className="space-x-4">
              <label className="text-xl" htmlFor={waiter.id}>
                {waiter.name}
              </label>
              <span className="rounded-full bg-button-primary px-2 text-sm text-white ring ring-button-outline">
                {waiter.role ? 'Mesero' : ''}
              </span>
            </FlexRow>
            <input
              type="checkbox"
              name="waiters"
              id={waiter.id}
              value={waiter.id}
            />
          </ItemContainer>
        ))}
        {data.waiters?.length === 0 && (
          <p className="text-center">Esta mesa no tiene meseros asignados</p>
        )}
        {/* <Spacer spaceY="2" /> */}
        <Button className="w-full">Llamar al mesero</Button>
      </Form>
    </Modal>
  )
}
