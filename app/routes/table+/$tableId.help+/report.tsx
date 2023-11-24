import { useFetcher, useLoaderData, useLocation, useNavigate } from '@remix-run/react'
import { useEffect, useState } from 'react'

import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'

import invariant from 'tiny-invariant'
import { prisma } from '~/db.server'
import { validateRedirect } from '~/redirect.server'
import { getSession, getUserId, sessionStorage } from '~/session.server'

import { getBranchId } from '~/models/branch.server'
import { createFeedBack } from '~/models/feedback.server'

import { getUrl } from '~/utils'

import { Button, H4, Modal, Spacer } from '~/components'
import { ReportFood } from '~/components/help/report-food'
import { ReportIntroButtons } from '~/components/help/report-intro-buttons'
import { ReportOther } from '~/components/help/report-other'
import { ReportPlace } from '~/components/help/report-place'
import { ReportWaiter } from '~/components/help/report-waiter'
import { Tab } from '~/components/help/ui/report-tab-buttons'

export async function action({ request, params }: ActionFunctionArgs) {
  const { tableId } = params
  invariant(tableId, 'tableId is required')
  const formData = await request.formData()
  const redirectTo = validateRedirect(request.redirect, `/table/${tableId}`)
  const session = await getSession(request)
  const userId = await getUserId(session)
  const username = session.get('username')
  const tableNumber = (await prisma.table.findUnique({ where: { id: tableId } })).number

  const branchId = await getBranchId(tableId)

  const type = formData.get('type') as string
  const reports = formData.get('reports') as string
  const comments = formData.get('sendComments') as string
  const selected = formData.getAll('selected') as string[]
  const proceed = formData.get('_action') === 'proceed'

  if (reports === '' && type !== 'other') {
    //TODO return error {type: 'reports', message:'msg'} para que se muestre bonito en frontend
    return json({ error: 'Debes seleccionar cual fue el problema' }, { status: 400 })
  }

  if (type && proceed) {
    switch (type) {
      case 'waiter':
        await prisma.notification.create({
          data: {
            type: 'informative',
            type_temp: 'FEEDBACK',

            table: { connect: { id: tableId } },
            user: { connect: { id: userId } },
            employees: { connect: selected.map(id => ({ id })) },
            message: `Usuario ${username} de la mesa ${tableNumber} quiere reportar a un mesero`,
            status: 'received',
            branch: {
              connect: {
                id: branchId,
              },
            },
          },
        })

        await createFeedBack(type, reports, comments, tableId, userId, selected, 'employees')
        break
      case 'food':
        await createFeedBack(type, reports, comments, tableId, userId, selected, 'cartItems')
        break
      case 'place':
        await createFeedBack(type, reports, comments, tableId, userId)
        break
      case 'other':
        if (comments === '') {
          return json({ error: 'Debes escribir que fue lo que sucedió' }, { status: 400 })
        }
        await createFeedBack(type, 'no-report', comments, tableId, userId)
        break
    }
    //COnnect if waiter then connect to a employee id, if dish then connect to a dish id
    session.flash('notification', 'Gracias, revisaremos su reporte a la brevedad')
    return redirect(redirectTo, { headers: { 'Set-Cookie': await sessionStorage.commitSession(session) } })
  }

  return json({ success: false })
}

export async function loader({ request, params }: LoaderFunctionArgs) {
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
  { label: 'Mesero', query: 'waiter' },
  { label: 'Platillo', query: 'food' },
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
  const [selected, setSelected] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null) // Error state

  const toggleSelected = value => {
    // Check if the value is already in the reports array
    if (selected.includes(value)) {
      // If it is, remove it
      setSelected(selected.filter(s => s !== value))
    } else {
      // If it's not, add it
      setSelected([...selected, value])
    }
  }

  let isSubmitting = fetcher.state !== 'idle'

  const pathname = useLocation().pathname
  const mainPath = getUrl('main', pathname)

  const onClose = () => {
    navigate(mainPath, { preventScrollReset: true })
  }

  const modalTitle = REPORT_TITLES[activeTab] || 'Reportar algún suceso'
  const disableButton =
    isSubmitting || activeTab === 'No especificado' || ((activeTab === 'food' || activeTab === 'waiter') && selected.length === 0)

  // Clear error when active tab changes
  useEffect(() => {
    setError(null)
  }, [activeTab])

  // Set error when fetcher's data changes
  useEffect(() => {
    if (fetcher.data?.error) {
      setError(fetcher.data.error)
    }
  }, [fetcher.data])

  const tabContainer = ' divide-x justify-between flex flex-row items-center text-zinc-400 border border-black rounded-xl'
  const modalFullScreen = (activeTab === 'waiter' && data.waiters.length >= 5) || (activeTab === 'food' && data.cartItemsByUser.length >= 5)

  return (
    <Modal
      title={activeTab === 'No especificado' ? 'Reportar algún suceso' : modalTitle}
      onClose={onClose}
      // goBack={activeTab === 'No especificado' ? false : true}
      justify="start"
      fullScreen={modalFullScreen}
    >
      <fetcher.Form method="POST" className="flex flex-col justify-center p-2 ">
        {/* <p className="items-center self-center justify-center px-2 py-1 text-center text-white rounded-full w-max bg-button-textNotSelected">
          Los reportes son totalmente anónimos
        </p> */}

        {activeTab !== 'No especificado' && (
          <>
            <H4>Tipo de reporte</H4>
            <Spacer spaceY="1" />
            <div className={tabContainer}>
              {TABS.map((tab, index) => (
                <Tab
                  key={tab.query}
                  label={tab.label}
                  query={tab.query}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  isFirst={index === 0}
                  isLast={index === TABS.length - 1}
                />
              ))}
            </div>
          </>
        )}

        {activeTab === 'waiter' ? (
          <ReportWaiter waiters={data.waiters} subjects={WAITER_REPORT_SUBJECTS} toggleSelected={toggleSelected} error={error} />
        ) : activeTab === 'food' ? (
          <ReportFood
            cartItemsByUser={data.cartItemsByUser}
            subjects={FOOD_REPORT_SUBJECTS}
            toggleSelected={toggleSelected}
            error={error}
          />
        ) : activeTab === 'place' ? (
          <ReportPlace subjects={PLACE_REPORT_SUBJECTS} error={error} />
        ) : activeTab === 'other' ? (
          <ReportOther error={error} />
        ) : (
          <ReportIntroButtons setActiveTab={setActiveTab} />
        )}

        <Spacer spaceY="1" />

        <H4 variant="error" className="items-center self-center justify-center w-full text-center">
          {error}
        </H4>

        <Spacer spaceY="1" />

        {activeTab !== 'No especificado' && (
          <Button name="_action" value="proceed" disabled={disableButton} className="sticky bottom-0 w-full">
            {isSubmitting ? 'Enviando...' : 'Enviar reporte'}
          </Button>
        )}

        <input type="hidden" name="type" value={activeTab} />
      </fetcher.Form>
    </Modal>
  )
}
