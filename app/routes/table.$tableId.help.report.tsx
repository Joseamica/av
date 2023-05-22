import {CartItem} from '@prisma/client'
import {ActionArgs, LoaderArgs, json, redirect} from '@remix-run/node'
import {
  Form,
  useActionData,
  useFetcher,
  useLoaderData,
  useNavigate,
  useSearchParams,
  useSubmit,
} from '@remix-run/react'
import React, {useState} from 'react'
import invariant from 'tiny-invariant'
import {
  Button,
  FlexRow,
  H1,
  H5,
  Modal,
  SendComments,
  Spacer,
} from '~/components'
import {LinkButton} from '~/components/buttons/button'
import {prisma} from '~/db.server'
import {validateRedirect} from '~/redirect.server'
import {getUserId} from '~/session.server'

export async function action({request, params}: ActionArgs) {
  const {tableId} = params
  invariant(tableId, 'tableId is required')
  const formData = await request.formData()
  const redirectTo = validateRedirect(request.redirect, `/table/${tableId}`)

  const userId = await getUserId(request)

  const comments = formData.get('sendComments') as string
  const subject = formData.get('subject') as string
  const reportType = formData.get('reportType') as string
  const proceed = formData.get('_action') === 'proceed'

  const selected = formData.getAll('selected') as string[]

  if (
    selected.length === 0 &&
    reportType !== 'other' &&
    reportType !== 'place'
  ) {
    return json(
      {error: 'Debes seleccionar al menos un elemento para reportar'},
      {status: 400},
    )
  }

  if (!subject && reportType !== 'other') {
    return json(
      {error: 'Debes seleccionar cual fue el problema'},
      {status: 400},
    )
  }

  if (subject && reportType && proceed) {
    switch (reportType) {
      case 'food':
        const foodFeedback = await prisma.feedback.create({
          data: {
            report: subject,
            type: `${reportType}-${comments}`,
            tableId: tableId,
            userId: userId,
            cartItems: {connect: selected.map(id => ({id}))},
          },
        })
        break
      case 'waitress':
        const waitressFeedback = await prisma.feedback.create({
          data: {
            report: subject,
            type: `${reportType}-${comments}`,
            tableId: tableId,
            userId: userId,
            employees: {connect: selected.map(id => ({id}))},
          },
        })
        break
      case 'place':
        const placeFeedback = await prisma.feedback.create({
          data: {
            report: subject,
            type: `${reportType}-${comments}`,
            tableId: tableId,
            userId: userId,
          },
        })
        break
      case 'other':
        const otherFeedback = await prisma.feedback.create({
          data: {
            report: subject,
            type: `${reportType}-${comments}`,
            tableId: tableId,
            userId: userId,
          },
        })
        break
    }
    //COnnect if waitress then connect to a employee id, if dish then connect to a dish id

    return redirect(redirectTo)
  }

  return json({subject, comments})
}

export async function loader({request, params}: LoaderArgs) {
  const {tableId} = params
  invariant(tableId, 'tableId is required')
  const userId = await getUserId(request)

  const cartItemsByUser = await prisma.cartItem.findMany({
    where: {user: {some: {id: userId}}},
  })

  const waitresses = await prisma.employee.findMany({
    where: {rol: 'waitress', tables: {some: {id: tableId}}},
  })

  const managers = await prisma.employee.findMany({
    where: {rol: 'manager', tables: {some: {id: tableId}}},
  })

  return json({waitresses, managers, cartItemsByUser})
}

const FOOD_REPORT_SUBJECTS = {
  1: 'Sabor',
  2: 'Presentación',
  3: 'Demora',
}

const WAITRESS_REPORT_SUBJECTS = {
  1: 'Servicio',
  2: 'Actitud',
  3: 'Demora',
}

const PLACE_REPORT_SUBJECTS = {
  1: 'Limpieza',
  2: 'Atención',
  3: 'Ruido',
}

export default function Report() {
  const data = useLoaderData()
  const actionData = useActionData()
  const navigate = useNavigate()
  const fetcher = useFetcher()
  const [select, setSelect] = useState({})

  let isSubmitting =
    fetcher.state === 'submitting' || fetcher.state === 'loading'
  const submitButton = isSubmitting ? 'Enviando...' : 'Enviar reporte'

  const onClose = () => {
    navigate('..')
  }
  const submit = useSubmit()
  function handleChange(event: React.FormEvent<HTMLFormElement>) {
    submit(event.currentTarget, {replace: true})
  }

  const [searchParams] = useSearchParams()
  const by = searchParams.get('by') || 'No especificado'
  const subject = searchParams.get('subject') || undefined

  return (
    <Modal
      title={by === 'No especificado' ? 'Reportar algún suceso' : by}
      onClose={onClose}
      goBack={by === 'No especificado' ? false : true}
    >
      <Spacer spaceY="2" />

      <Form
        method="POST"
        onChange={handleChange}
        className="flex w-full flex-col space-y-2"
      >
        {by === 'waitress' ? (
          <div className="space-y-2">
            {data.waitresses.map((waitress: CartItem) => (
              <div key={waitress.id}>
                <label htmlFor={waitress.id}>
                  {waitress.name}
                  <input
                    id={waitress.id}
                    type="checkbox"
                    name="selected"
                    value={waitress.id}
                  />
                </label>
              </div>
            ))}
            <H1>Selecciona cual fue el problema</H1>
            {Object.entries(WAITRESS_REPORT_SUBJECTS).map(([key, value]) => (
              <LinkButton
                to={`?by=waitress&subject=${value}`}
                key={key}
                variant={subject === value ? 'primary' : 'secondary'}
              >
                {value}
              </LinkButton>
            ))}
            <Button name="_action" value="proceed" disabled={isSubmitting}>
              {submitButton}
            </Button>
          </div>
        ) : by === 'food' ? (
          <div className="space-y-2">
            {data.cartItemsByUser.map((cartItem: CartItem) => (
              <div key={cartItem.id}>
                <label htmlFor={cartItem.id}>
                  {cartItem.name}
                  <input
                    id={cartItem.id}
                    type="checkbox"
                    name="selected"
                    value={cartItem.id}
                  />
                </label>
              </div>
            ))}
            <H1>Selecciona cual fue el problema</H1>
            {Object.entries(FOOD_REPORT_SUBJECTS).map(([key, value]) => (
              <LinkButton
                to={`?by=food&subject=${value}`}
                key={key}
                variant={subject === value ? 'primary' : 'secondary'}
              >
                {value}
              </LinkButton>
            ))}
            <Button name="_action" value="proceed" disabled={isSubmitting}>
              {submitButton}
            </Button>
          </div>
        ) : by === 'place' ? (
          <div className="space-y-2">
            <FlexRow>
              <H1>Selecciona cual fue el problema</H1>
            </FlexRow>
            {Object.entries(PLACE_REPORT_SUBJECTS).map(([key, value]) => (
              <LinkButton
                to={`?by=place&subject=${value}`}
                key={key}
                variant={subject === value ? 'primary' : 'secondary'}
              >
                {value}
              </LinkButton>
            ))}
            <Button name="_action" value="proceed" disabled={isSubmitting}>
              {submitButton}
            </Button>
          </div>
        ) : by === 'other' ? (
          <div className="space-y-2">
            <SendComments />
            <Button name="_action" value="proceed" disabled={isSubmitting}>
              {submitButton}
            </Button>
          </div>
        ) : (
          <div>
            <div className="flex flex-col space-y-2">
              <LinkButton to="?by=waitress" size="medium">
                Mesero
              </LinkButton>
              <LinkButton to="?by=food" size="medium">
                Platillo
              </LinkButton>
              <LinkButton to="?by=place" size="medium">
                Lugar
              </LinkButton>
              <LinkButton to="?by=other" size="medium">
                Otro
              </LinkButton>
            </div>
            Seleccione una opción para reportar algún suceso en la mesa
          </div>
        )}
        <H5 variant="error">{actionData?.error}</H5>
        {/* <SendComments /> */}

        <input type="hidden" name="reportType" value={by} />
        <input type="hidden" name="subject" value={subject || ''} />
      </Form>
    </Modal>
  )
}
