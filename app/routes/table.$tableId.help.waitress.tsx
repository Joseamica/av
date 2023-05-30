import type {Employee} from '@prisma/client'
import {ActionArgs, LoaderArgs, redirect} from '@remix-run/node'
import {json} from '@remix-run/node'
import {Form, useLoaderData, useNavigate} from '@remix-run/react'
import invariant from 'tiny-invariant'
import {Button, FlexRow, ItemContainer, Modal} from '~/components'
import {prisma} from '~/db.server'
import {getTable} from '~/models/table.server'
import {validateRedirect} from '~/redirect.server'

export async function action({request, params}: ActionArgs) {
  const {tableId} = params
  invariant(tableId, 'tableId is required')
  const formData = await request.formData()
  const waitresses = formData.getAll('waitresses')
  const redirectTo = validateRedirect(request.redirect, `..`)

  const table = await getTable(tableId)
  // const waitresses = await prisma.employee.findMany({
  //   where: {id: data.,rol: 'waitress', tables: {some: {id: tableId}}},
  // })
  console.dir(
    `CALL ~> Llaman al mesero ${waitresses} de la mesa ${table?.table_number}`,
  )

  return redirect(redirectTo)
}

export async function loader({request, params}: LoaderArgs) {
  const {tableId} = params
  invariant(tableId, 'tableId is required')
  const waitresses = await prisma.employee.findMany({
    where: {rol: 'waitress', tables: {some: {id: tableId}}},
  })

  return json({waitresses})
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
        {data.waitresses?.map((waitress: Employee) => (
          <ItemContainer key={waitress.id} className="flex flex-row">
            <FlexRow className="space-x-4">
              <label className="text-xl" htmlFor={waitress.id}>
                {waitress.name}
              </label>
              <span className="rounded-full bg-button-primary px-2  text-sm text-white ring ring-button-outline">
                {waitress.rol ? 'Mesero' : ''}
              </span>
            </FlexRow>
            <input
              type="checkbox"
              name="waitresses"
              id={waitress.id}
              value={waitress.name}
            />
          </ItemContainer>
        ))}
        {/* <Spacer spaceY="2" /> */}
        <Button className="w-full">Llamar al mesero</Button>
      </Form>
    </Modal>
  )
}
