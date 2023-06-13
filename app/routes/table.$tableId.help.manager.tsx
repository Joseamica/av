import type {Employee, User} from '@prisma/client'
import {ActionArgs, LoaderArgs, redirect} from '@remix-run/node'
import {json} from '@remix-run/node'
import {Form, useLoaderData, useNavigate} from '@remix-run/react'
import invariant from 'tiny-invariant'
import {Button, FlexRow, H2, H3, ItemContainer, Modal} from '~/components'
import {prisma} from '~/db.server'
import {getTable} from '~/models/table.server'
import {validateRedirect} from '~/redirect.server'
import {sendWhatsapp} from '~/twilio.server'

export async function action({request, params}: ActionArgs) {
  const {tableId} = params
  invariant(tableId, 'tableId is required')
  const formData = await request.formData()
  const managersId = formData.getAll('managers') as [string]
  const redirectTo = validateRedirect(request.redirect, `..`)

  const table = await getTable(tableId)

  const managers = await prisma.employee
    .findMany({
      where: {id: {in: managersId}, NOT: {phone: null}},
    })
    .then(managers => managers.map(manager => manager.phone))

  console.log('managers', managers)
  const sendNotification = sendWhatsapp(
    '14155238886',
    managers,
    `Llamada de la mesa ${table?.table_number} test`,
  )

  // const sendNotification = sendWhatsapp()

  return redirect(redirectTo)
}

export async function loader({request, params}: LoaderArgs) {
  const {tableId} = params
  invariant(tableId, 'tableId is required')
  const managers = await prisma.employee.findMany({
    where: {role: 'manager', tables: {some: {id: tableId}}},
  })

  return json({managers})
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
              <span className="rounded-full bg-button-primary px-2  text-sm text-white ring ring-button-outline">
                {manager.role ? 'Gerente' : ''}
              </span>
            </FlexRow>
            <input
              type="checkbox"
              name="managers"
              id={manager.id}
              value={manager.id}
            />
          </ItemContainer>
        ))}
        {/* <Spacer spaceY="2" /> */}
        <Button className="w-full">Llamar al gerente</Button>
      </Form>
    </Modal>
  )
}
