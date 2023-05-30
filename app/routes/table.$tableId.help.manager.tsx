import type {Employee, User} from '@prisma/client'
import {ActionArgs, LoaderArgs, redirect} from '@remix-run/node'
import {json} from '@remix-run/node'
import {Form, useLoaderData, useNavigate} from '@remix-run/react'
import invariant from 'tiny-invariant'
import {Button, FlexRow, H2, H3, ItemContainer, Modal} from '~/components'
import {prisma} from '~/db.server'
import {getTable} from '~/models/table.server'
import {validateRedirect} from '~/redirect.server'

export async function action({request, params}: ActionArgs) {
  const {tableId} = params
  invariant(tableId, 'tableId is required')
  const formData = await request.formData()
  const managers = formData.getAll('managers')
  const redirectTo = validateRedirect(request.redirect, `..`)

  const table = await getTable(tableId)

  console.dir(
    `CALL ~> Llaman al gerente ${managers} de la mesa ${table?.table_number}`,
  )

  return redirect(redirectTo)
}

export async function loader({request, params}: LoaderArgs) {
  const {tableId} = params
  invariant(tableId, 'tableId is required')
  const managers = await prisma.employee.findMany({
    where: {rol: 'manager', tables: {some: {id: tableId}}},
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
                {manager.rol ? 'Gerente' : ''}
              </span>
            </FlexRow>
            <input
              type="checkbox"
              name="managers"
              id={manager.id}
              value={manager.name}
            />
          </ItemContainer>
        ))}
        {/* <Spacer spaceY="2" /> */}
        <Button className="w-full">Llamar al mesero</Button>
      </Form>
    </Modal>
  )
}
