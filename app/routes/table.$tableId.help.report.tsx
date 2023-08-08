import { useActionData, useFetcher, useLoaderData, useLocation, useNavigate, useSearchParams } from '@remix-run/react'
import { useState } from 'react'

import type { ActionArgs, LoaderArgs } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'

import invariant from 'tiny-invariant'
import { prisma } from '~/db.server'
import { validateRedirect } from '~/redirect.server'
import { getSession, getUserId } from '~/session.server'

import { createFeedBack } from '~/models/feedback.server'

import { getUrl } from '~/utils'

import { Button, H5, Modal, Spacer } from '~/components'
import { ReportFood } from '~/components/help/report-food'
import { ReportIntroButtons } from '~/components/help/report-intro-buttons'
import { ReportOther } from '~/components/help/report-other'
import { ReportPlace } from '~/components/help/report-place'
import { ReportWaiter } from '~/components/help/report-waiter'
import { Tab } from '~/components/help/ui/report-tab-buttons'

export async function action({ request, params }: ActionArgs) {
  const { tableId } = params
  invariant(tableId, 'tableId is required')
  const formData = await request.formData()
  const redirectTo = validateRedirect(request.redirect, `/table/${tableId}`)
  const session = await getSession(request)
  const userId = await getUserId(session)

  const data = Object.fromEntries(formData.entries())
  console.log('data', data)

  const comments = formData.get('sendComments') as string
  const subject = formData.get('subject') as string
  const type = formData.get('type') as string
  const proceed = formData.get('_action') === 'proceed'

  const selected = formData.getAll('selected') as string[]

  if (selected.length === 0 && type !== 'other' && type !== 'place') {
    return json({ error: 'Debes seleccionar al menos un elemento para reportar' }, { status: 400 })
  }

  if (subject.length === 0 && type !== 'other') {
    return json({ error: 'Debes seleccionar cual fue el problema' }, { status: 400 })
  }

  if (subject.length > 0 && type && proceed) {
    switch (type) {
      case 'food':
        await createFeedBack(subject, type, comments, tableId, userId, selected, 'cartItems')
        break
      case 'waiter':
        await createFeedBack(subject, type, comments, tableId, userId, selected, 'employees')
        break
      case 'place':
        await createFeedBack(subject, type, comments, tableId, userId)
        break
      case 'other':
        await createFeedBack(subject, type, comments, tableId, userId)
        break
    }
    //COnnect if waiter then connect to a employee id, if dish then connect to a dish id

    return redirect(redirectTo)
  }

  return json({ subject, comments, selected })
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

const TABS = [
  { label: 'Platillo', query: 'food' },
  { label: 'Mesero', query: 'waiter' },
  { label: 'Lugar', query: 'place' },
  { label: 'Otro', query: 'other' },
]

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

const REPORT_TITLES = {
  waiter: 'Reportar a un mesero',
  food: 'Reportar un platillo',
  place: 'Reportar el lugar',
  other: 'Reportar otro suceso',
  'No especificado': 'Reportar algún suceso',
}

export default function Report() {
  const data = useLoaderData()
  const fetcher = useFetcher()

  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('No especificado')

  let isSubmitting = fetcher.state !== 'idle'

  const pathname = useLocation().pathname
  const mainPath = getUrl('main', pathname)

  const onClose = () => {
    navigate(mainPath)
  }

  const title = REPORT_TITLES[activeTab] || 'Reportar algún suceso'
  const disableButton = isSubmitting || activeTab === 'No especificado'
  const error = fetcher.data?.error

  const container = 'justify-between flex flex-row h-14 items-center text-zinc-400 p-2 bg-white shadow-md rounded-lg'
  const fullScreen = (activeTab === 'waiter' && data.waiters.length >= 5) || (activeTab === 'food' && data.cartItemsByUser.length >= 5)
  return (
    <Modal
      title={activeTab === 'No especificado' ? 'Reportar algún suceso' : title}
      onClose={onClose}
      // goBack={activeTab === 'No especificado' ? false : true}
      justify="start"
      fullScreen={fullScreen}
    >
      {activeTab !== 'No especificado' && (
        <div className={container}>
          {TABS.map(tab => (
            <Tab key={tab.query} label={tab.label} query={tab.query} activeTab={activeTab} setActiveTab={setActiveTab} />
          ))}
        </div>
      )}

      <fetcher.Form method="POST" className="flex flex-col justify-center px-2 pb-2">
        {/* <p className="text-center items-center w-max self-center justify-center bg-button-textNotSelected text-white rounded-full px-2 py-1">
          Los reportes son totalmente anónimos
        </p> */}
        <Spacer spaceY="1" />
        {activeTab === 'waiter' ? (
          <ReportWaiter subjects={WAITER_REPORT_SUBJECTS} waiters={data.waiters} />
        ) : activeTab === 'food' ? (
          <ReportFood cartItemsByUser={data.cartItemsByUser} subjects={FOOD_REPORT_SUBJECTS} />
        ) : activeTab === 'place' ? (
          <ReportPlace subjects={PLACE_REPORT_SUBJECTS} />
        ) : activeTab === 'other' ? (
          <ReportOther />
        ) : (
          <ReportIntroButtons setActiveTab={setActiveTab} />
        )}
        <H5 variant="error">{error}</H5>

        {activeTab !== 'No especificado' && (
          <Button name="_action" value="proceed" disabled={disableButton} className="w-full sticky bottom-0">
            {isSubmitting ? 'Enviando...' : 'Enviar reporte'}
          </Button>
        )}

        <input type="hidden" name="type" value={activeTab} />
      </fetcher.Form>
    </Modal>
  )
}
