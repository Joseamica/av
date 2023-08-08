import { useActionData, useFetcher, useLoaderData, useLocation, useNavigate, useSearchParams } from '@remix-run/react'

import type { ActionArgs, LoaderArgs } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'

import invariant from 'tiny-invariant'
import { prisma } from '~/db.server'
import { validateRedirect } from '~/redirect.server'
import { getSession, getUserId } from '~/session.server'

import { getUrl } from '~/utils'

import { Button, FlexRow, H1, H5, Modal, SendComments, Spacer } from '~/components'
import { ReportFood } from '~/components/help/report-food'
import { ReportWaiter } from '~/components/help/report-waiter'
import { LinkButton } from '~/components/ui/buttons/button'

export async function action({ request, params }: ActionArgs) {
  const { tableId } = params
  invariant(tableId, 'tableId is required')
  const formData = await request.formData()
  const redirectTo = validateRedirect(request.redirect, `/table/${tableId}`)
  const session = await getSession(request)
  const userId = await getUserId(session)

  const comments = formData.get('sendComments') as string
  const subject = formData.get('subject') as string
  const reportType = formData.get('reportType') as string
  const proceed = formData.get('_action') === 'proceed'

  const selected = formData.getAll('selected') as string[]

  if (selected.length === 0 && reportType !== 'other' && reportType !== 'place') {
    return json({ error: 'Debes seleccionar al menos un elemento para reportar' }, { status: 400 })
  }

  if (!subject && reportType !== 'other') {
    return json({ error: 'Debes seleccionar cual fue el problema' }, { status: 400 })
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
            cartItems: { connect: selected.map(id => ({ id })) },
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
            employees: { connect: selected.map(id => ({ id })) },
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

  return json({ subject, comments })
}

export async function loader({ request, params }: LoaderArgs) {
  const { tableId } = params
  invariant(tableId, 'tableId is required')
  const session = await getSession(request)
  const userId = await getUserId(session)

  const cartItemsByUser = await prisma.cartItem.findMany({
    where: { user: { some: { id: userId } } },
  })

  const waiters = await prisma.employee.findMany({
    where: { role: 'waiter', tables: { some: { id: tableId } } },
  })

  const managers = await prisma.employee.findMany({
    where: { role: 'manager', tables: { some: { id: tableId } } },
  })

  return json({ waiters, managers, cartItemsByUser })
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
  const fetcher = useFetcher()

  let isSubmitting = fetcher.state !== 'idle'
  const submitButton = isSubmitting ? 'Enviando...' : 'Enviar reporte'

  const [searchParams] = useSearchParams()
  const by = searchParams.get('by') || 'No especificado'
  const subject = searchParams.get('subject') || undefined

  return (
    <HelpContainer fetcher={fetcher}>
      {by === 'waiter' ? (
        <ReportWaiter subjects={WAITER_REPORT_SUBJECTS} waiters={data.waiters} submitButton={submitButton} isSubmitting={isSubmitting} subject={subject} />
      ) : by === 'food' ? (
        <ReportFood cartItemsByUser={data.cartItemsByUser} isSubmitting={isSubmitting} subject={subject} subjects={FOOD_REPORT_SUBJECTS} submitButton={submitButton} />
      ) : by === 'place' ? (
        <div className="space-y-2">
          <FlexRow>
            <H1>Selecciona cual fue el problema</H1>
          </FlexRow>
          {Object.entries(PLACE_REPORT_SUBJECTS).map(([key, value]) => (
            <LinkButton to={`?by=place&subject=${value}`} key={key} size="small" className="mx-1" variant={subject === value ? 'primary' : 'secondary'}>
              {value}
            </LinkButton>
          ))}
          <Spacer spaceY="2" />
          <Button name="_action" value="proceed" disabled={isSubmitting} className="w-full">
            {submitButton}
          </Button>
        </div>
      ) : by === 'other' ? (
        <div className="space-y-2">
          <SendComments />
          <Button name="_action" value="proceed" disabled={isSubmitting} className="w-full">
            {submitButton}
          </Button>
        </div>
      ) : (
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
      )}
      <H5 variant="error">{actionData?.error}</H5>
      {/* <SendComments /> */}

      <input type="hidden" name="reportType" value={by} />
      <input type="hidden" name="subject" value={subject || ''} />
    </HelpContainer>
  )
}

function HelpContainer({ children, fetcher }) {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const by = searchParams.get('by') || 'No especificado'

  const pathname = useLocation().pathname
  const mainPath = getUrl('main', pathname)

  const onClose = () => {
    // searchParams.delete('by')
    // setSearchParams(searchParams)
    navigate(mainPath)
  }

  let title = ''
  switch (by) {
    case 'waiter':
      title = 'Reportar a un mesero'
      break
    case 'food':
      title = 'Reportar un platillo'
      break
    case 'place':
      title = 'Reportar el lugar'
      break
    case 'other':
      title = 'Reportar otro suceso'
      break
    case 'No especificado':
      title = 'Reportar algún suceso'
      break
  }

  const active = 'flex bg-day-principal h-12 w-1/4 justify-center items-center text-white text-lg  font-medium  shrink-0'
  const inactive = 'flex  h-12 w-1/4 justify-center items-center text-button-textNotSelected text-sm   border-l shrink-0'

  return (
    <Modal title={by === 'No especificado' ? 'Reportar algún suceso' : title} onClose={onClose} goBack={by === 'No especificado' ? false : true} justify="start">
      {/* <div className=" justify-between flex flex-row  h-14 items-center button text-zinc-400 p-2 bg-white">
        <Link to={`?by=food`} className={by === 'food' ? active : inactive}>
          Platillo
        </Link>
        <Link to={`?by=waiter`} className={by === 'waiter' ? active : inactive}>
          Mes
        </Link>
        <Link to={`?by=place`} className={by === 'place' ? active : inactive}>
          Lugar
        </Link>
        <Link to={`?by=other`} className={by === 'other' ? active : inactive}>
          Otro
        </Link>
      </div> */}
      <fetcher.Form method="POST" className="flex flex-col justify-center px-2 pb-2">
        <p className="text-center items-center w-max self-center justify-center bg-button-textNotSelected text-white rounded-full px-2 py-1">
          Los reportes son totalmente anónimos
        </p>
        <Spacer spaceY="1" />
        {children}

        {/* <H5 variant="error">{actionData?.error}</H5> */}
      </fetcher.Form>
    </Modal>
  )
}
