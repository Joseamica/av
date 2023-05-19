import type {Employee, User} from '@prisma/client'
import type {ActionArgs, LoaderArgs} from '@remix-run/node'
import {json} from '@remix-run/node'
import {Form, useLoaderData, useNavigate} from '@remix-run/react'
import invariant from 'tiny-invariant'
import {Button, FlexRow, H2, H3, Modal} from '~/components'
import {prisma} from '~/db.server'
import {getTable} from '~/models/table.server'

export async function action({request, params}: ActionArgs) {
  const {tableId} = params
  invariant(tableId, 'tableId is required')
  const formData = await request.formData()
  const table = await getTable(tableId)
  const waitresses = await prisma.employee.findMany({
    where: {rol: 'waitress', tables: {some: {id: tableId}}},
  })
  console.dir(
    `CALL ~> Llaman al mesero ${waitresses} de la mesa ${table?.table_number}`,
  )

  return json({success: true})
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
      <Form method="POST">
        {data.waitresses?.map((waitress: Employee) => (
          <FlexRow key={waitress.id}>
            <H2>{waitress.name}</H2>
            <H3>{waitress.rol}</H3>
          </FlexRow>
        ))}
        <Button>Llamar al mesero</Button>
      </Form>
    </Modal>
  )
}
