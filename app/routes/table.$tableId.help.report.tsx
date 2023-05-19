import type {ActionArgs, LoaderArgs} from '@remix-run/node'
import {json} from '@remix-run/node'
import {Form, useLoaderData, useNavigate} from '@remix-run/react'
import invariant from 'tiny-invariant'
import {Button, Modal} from '~/components'
import {prisma} from '~/db.server'
import {getTable} from '~/models/table.server'

export async function action({request, params}: ActionArgs) {
  const {tableId} = params
  invariant(tableId, 'tableId is required')
  const formData = await request.formData()
  const table = await getTable(tableId)
  const managers = await prisma.employee.findMany({
    where: {rol: 'manager', tables: {some: {id: tableId}}},
  })
  console.dir(
    `CALL ~> Llaman al mesero ${managers} de la mesa ${table?.table_number}`,
  )

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

export default function Report() {
  const data = useLoaderData()
  const navigate = useNavigate()

  const onClose = () => {
    navigate('..')
  }

  return (
    <Modal title="Llama al mesero" onClose={onClose}>
      <Form method="POST">
        <Button>Llamar al mesero</Button>
      </Form>
    </Modal>
  )
}
