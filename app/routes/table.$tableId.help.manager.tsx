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
  // const managers = await prisma.employee.findMany({
  //   where: {rol: 'manager', tables: {some: {id: tableId}}},
  // })
  console.dir(`CALL ~> Llaman al gerente de la mesa ${table?.table_number}`)

  return json({success: true})
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
    <Modal title="Llama al gerente" onClose={onClose}>
      <Form method="POST">
        {data.managers?.map((manager: Employee) => (
          <FlexRow key={manager.id}>
            <H2>{manager.name}</H2>
            <H3>{manager.rol}</H3>
          </FlexRow>
        ))}
        <Button>Llamar al gerente</Button>
      </Form>
    </Modal>
  )
}
