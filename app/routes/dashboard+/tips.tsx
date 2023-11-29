import { useLoaderData, useNavigate, useParams, useSearchParams } from '@remix-run/react'
import { useState } from 'react'

import { type LoaderArgs, json } from '@remix-run/node'

import { prisma } from '~/db.server'
import { getSession } from '~/session.server'

import { getSearchParams } from '~/utils'

import { FlexRow, H2, H3, H4, Modal, Spacer } from '~/components'

export async function loader({ request }: LoaderArgs) {
  const session = await getSession(request)
  const branchId = session.get('branchId')
  const searchParams = getSearchParams({ request })

  const date = searchParams.get('date') || new Date().toISOString().split('T')[0]

  const startDate = new Date(date)
  startDate.setUTCHours(0, 0, 0, 0) // Adjusting for UTC time

  // Set end date to the end of the day
  const endDate = new Date(startDate)
  endDate.setUTCHours(23, 59, 59, 999) //

  let whereClause = {
    branchId: branchId,
    status: 'accepted',
  } as any

  if (date !== '') {
    whereClause['createdAt'] = {
      gte: startDate,
      lte: endDate,
    }
  }

  const payments = await prisma.payments.findMany({
    where: whereClause,
  })

  const tips = payments.reduce((acc, curr) => acc + Number(curr.tip), 0)

  const totalPayments = payments.reduce((acc, curr) => acc + Number(curr.amount), 0)
  return json({ tips, selectedDate: date, totalPayments, payments })
}

export default function Tips() {
  const { tips, selectedDate, totalPayments, payments } = useLoaderData()
  const [searchParams, setSearchParams] = useSearchParams()
  const [date, setDate] = useState(selectedDate)
  const navigate = useNavigate()
  const handleDateChange = event => {
    setDate(event.target.value)
    searchParams.set('date', event.target.value)
    setSearchParams(searchParams)
  }

  const handleShowAllTips = () => {
    searchParams.set('date', '')
    setSearchParams(searchParams)
  }

  const formattedDate = new Date(date).toLocaleDateString('es-MX')

  return (
    <Modal onClose={() => navigate(`/dashboard`)} title="Propinas">
      <div className="p-4">
        <FlexRow>
          <input
            type="date"
            value={date}
            onChange={handleDateChange}
            className="flex flex-row items-center self-start px-4 py-2 border-2 rounded-full bg-white "
          />
          <button
            onClick={handleShowAllTips}
            className="flex flex-row items-center text-center justify-center  px-4 py-2 border-2 rounded-full bg-componentBg dark:bg-DARK_0 bg-white"
          >
            Mostrar datos históricos
          </button>
        </FlexRow>
        <Spacer />
        <hr />
        <Spacer />
        <div className="w-full bg-white rounded-lg border p-2">
          {searchParams.get('date') === '' ? (
            <FlexRow justify="between">
              <H3 className="py-2">Datos Históricos: </H3>
              <H3>{payments.length > 1 ? `${payments.length} pagos` : `${payments.length} pago`} </H3>
            </FlexRow>
          ) : (
            <FlexRow justify="between">
              <H3 className="py-2">Datos al día: </H3>
              <H3>{formattedDate}</H3>
            </FlexRow>
          )}
          <Spacer spaceY="1" />
          <hr />
          <Spacer spaceY="1" />
          <FlexRow justify="between">
            <H4>{searchParams.get('date') === '' ? 'Total de pedidos:' : 'Total de pedidos del día:'}</H4>
            <H4 boldVariant="bold">${totalPayments}</H4>
          </FlexRow>
          <Spacer spaceY="2" />
          <FlexRow justify="between">
            <H4>{searchParams.get('date') === '' ? 'Total de propinas' : 'Total de propinas del día'}:</H4>
            <H4 boldVariant="bold">${tips}</H4>{' '}
          </FlexRow>
        </div>
      </div>
    </Modal>
  )
}
