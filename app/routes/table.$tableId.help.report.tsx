import type {ActionArgs, LoaderArgs} from '@remix-run/node'
import {json} from '@remix-run/node'
import {
  Form,
  useLoaderData,
  useNavigate,
  useSearchParams,
  useSubmit,
} from '@remix-run/react'
import invariant from 'tiny-invariant'
import {Button, FlexRow, Modal, SendComments} from '~/components'
import {LinkButton} from '~/components/buttons/button'
import {prisma} from '~/db.server'
import {getTable} from '~/models/table.server'

export async function action({request, params}: ActionArgs) {
  const {tableId} = params
  invariant(tableId, 'tableId is required')
  const formData = await request.formData()
  const comments = formData.get('sendComments') as string

  if (comments) {
    //TODO create a new report with comments
  }

  const table = await getTable(tableId)
  const managers = await prisma.employee.findMany({
    where: {rol: 'manager', tables: {some: {id: tableId}}},
  })
  // console.dir(
  //   `CALL ~> Llaman al mesero ${managers} de la mesa ${table?.table_number}`,
  // )

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
  const submit = useSubmit()
  function handleChange(event: React.FormEvent<HTMLFormElement>) {
    submit(event.currentTarget, {replace: true})
  }
  const [searchParams] = useSearchParams()
  const by = searchParams.get('by')

  return (
    <Modal title="Reportar algún suceso" onClose={onClose}>
      <FlexRow justify="center">
        <LinkButton to="?by=waitress" size="small">
          Mesero
        </LinkButton>
        <LinkButton to="?by=dish" size="small">
          Platillo
        </LinkButton>
        <LinkButton to="?by=place" size="small">
          Lugar
        </LinkButton>
        <LinkButton to="?by=other" size="small">
          Otro
        </LinkButton>
      </FlexRow>
      <Form method="POST" onChange={handleChange}>
        {by === 'waitress' ? (
          <div>mesero</div>
        ) : by === 'dish' ? (
          <div>dish</div>
        ) : by === 'place' ? (
          <div>lugar</div>
        ) : by === 'other' ? (
          <div>otro</div>
        ) : (
          <div>Seleccione una opción para reportar algún suceso en la mesa</div>
        )}
        <SendComments />
      </Form>
    </Modal>
  )
}
