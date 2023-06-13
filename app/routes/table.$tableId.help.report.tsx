import type {CartItem} from '@prisma/client'
import {json, redirect} from '@remix-run/node'
import type {ActionArgs, LoaderArgs} from '@remix-run/node'
import {
  Form,
  useActionData,
  useFetcher,
  useLoaderData,
  useNavigate,
  useSearchParams,
  useSubmit,
} from '@remix-run/react'
import React from 'react'
import invariant from 'tiny-invariant'
import {
  Button,
  FlexRow,
  H1,
  H2,
  H5,
  ItemContainer,
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
        // const foodFeedback =
        await prisma.feedback.create({
          data: {
            report: subject,
            type: `${reportType}-${comments}`,
            tableId: tableId,
            userId: userId,
            cartItems: {connect: selected.map(id => ({id}))},
          },
        })
        break
      case 'waiter':
        // const waiterFeedback =
        await prisma.feedback.create({
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
        // const placeFeedback =
        await prisma.feedback.create({
          data: {
            report: subject,
            type: `${reportType}-${comments}`,
            tableId: tableId,
            userId: userId,
          },
        })
        break
      case 'other':
        // const otherFeedback =
        await prisma.feedback.create({
          data: {
            report: subject,
            type: `${reportType}-${comments}`,
            tableId: tableId,
            userId: userId,
          },
        })
        break
    }
    //COnnect if waiter then connect to a employee id, if dish then connect to a dish id

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

  const waiters = await prisma.employee.findMany({
    where: {role: 'waiter', tables: {some: {id: tableId}}},
  })

  const managers = await prisma.employee.findMany({
    where: {role: 'manager', tables: {some: {id: tableId}}},
  })

  return json({waiters, managers, cartItemsByUser})
}

export const FOOD_REPORT_SUBJECTS = {
  1: 'Sabor',
  2: 'Presentación',
  3: 'Demora',
}

const WAITER_REPORT_SUBJECTS = {
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

  let title = ''
  if (by === 'waiter') {
    title = 'Reportar a un mesero'
  } else if (by === 'food') {
    title = 'Reportar un platillo'
  } else if (by === 'place') {
    title = 'Reportar el lugar'
  } else if (by === 'other') {
    title = 'Reportar otro suceso'
  }
  return (
    <Modal
      title={by === 'No especificado' ? 'Reportar algún suceso' : title}
      onClose={onClose}
      goBack={by === 'No especificado' ? false : true}
    >
      {/* <Spacer spaceY="2" /> */}

      <Form
        method="POST"
        onChange={handleChange}
        className="flex w-full flex-col space-y-2 p-2"
      >
        {by === 'waiter' ? (
          <div className="space-y-2">
            {data.waiters.map((waiter: CartItem) => (
              <ItemContainer key={waiter.id}>
                <label htmlFor={waiter.id} className="text-xl">
                  {waiter.name}
                </label>
                <input
                  id={waiter.id}
                  type="checkbox"
                  name="selected"
                  value={waiter.id}
                  className="h-5 w-5"
                />
              </ItemContainer>
            ))}
            <Spacer spaceY="2" />
            <H2>Selecciona cual fue el problema</H2>
            {Object.entries(WAITER_REPORT_SUBJECTS).map(([key, value]) => (
              <LinkButton
                size="small"
                to={`?by=waiter&subject=${value}`}
                key={key}
                variant={subject === value ? 'primary' : 'secondary'}
                className="mx-1"
              >
                {value}
              </LinkButton>
            ))}
            <Spacer spaceY="2" />
            <Button
              name="_action"
              value="proceed"
              disabled={isSubmitting}
              className="w-full"
            >
              {submitButton}
            </Button>
          </div>
        ) : by === 'food' ? (
          <div className="space-y-2">
            {data.cartItemsByUser.map((cartItem: CartItem) => (
              <ItemContainer key={cartItem.id}>
                <label htmlFor={cartItem.id}>{cartItem.name}</label>
                <input
                  id={cartItem.id}
                  type="checkbox"
                  name="selected"
                  value={cartItem.id}
                  className="h-5 w-5"
                />
              </ItemContainer>
            ))}
            <Spacer spaceY="2" />

            <H1>Selecciona cual fue el problema</H1>
            {Object.entries(FOOD_REPORT_SUBJECTS).map(([key, value]) => (
              <LinkButton
                to={`?by=food&subject=${value}`}
                key={key}
                size="small"
                className="mx-1"
                variant={subject === value ? 'primary' : 'secondary'}
              >
                {value}
              </LinkButton>
            ))}
            <Spacer spaceY="2" />
            <Button
              name="_action"
              value="proceed"
              disabled={isSubmitting}
              className="w-full"
            >
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
                size="small"
                className="mx-1"
                variant={subject === value ? 'primary' : 'secondary'}
              >
                {value}
              </LinkButton>
            ))}
            <Spacer spaceY="2" />
            <Button
              name="_action"
              value="proceed"
              disabled={isSubmitting}
              className="w-full"
            >
              {submitButton}
            </Button>
          </div>
        ) : by === 'other' ? (
          <div className="space-y-2">
            <SendComments />
            <Button
              name="_action"
              value="proceed"
              disabled={isSubmitting}
              className="w-full"
            >
              {submitButton}
            </Button>
          </div>
        ) : (
          <div>
            {/* <H4>Seleccione una opción para reportar algún suceso en la mesa</H4> */}
            {/* <Spacer spaceY="2" /> */}
            <div className="flex flex-col space-y-2">
              <LinkButton to="?by=waiter" size="medium">
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
