import {json} from '@remix-run/node'
import type {LoaderArgs} from '@remix-run/node'
import cuid from 'cuid'

import {prisma} from '~/db.server'
import {getTableIdFromUrl} from '~/utils'

export async function loader({request, params}: LoaderArgs) {
  const {locationId} = params

  const token = await prisma.deliverect
    .findFirst({})
    .then(res => res?.deliverectToken)
  const pathname = new URL(request.url).pathname
  const tableId = getTableIdFromUrl(pathname)

  const url = `${process.env.DELIVERECT_API_URL}/tables/${locationId}`
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      authorization: 'Bearer ' + token,
    },
  }
  try {
    const response = await fetch(url, options)
    const data = await response.json()
    console.log('data', data)
    const tableData = data.tables

    for (const table of tableData) {
      const tableNumber = Number(table.id.replace(/\D/g, ''))

      await prisma.table.upsert({
        where: {id: table.id},
        update: {
          table_number: tableNumber,
          floorId: table.floorId,
          seats: table.seats,
          locationId: locationId,
          branchId: locationId,
        },
        create: {
          id: cuid(),
          // id: table.id,
          table_number: tableNumber,
          floorId: table.floorId,
          seats: table.seats,
          locationId: locationId,
          order_in_progress: false,
          branchId: locationId,
        },
      })
    }

    // return redirect(`/table/${tableId}`, {status: 303})
  } catch (err) {
    console.error('error:' + err)
    return json({tokenAssign: false}) // Or throw an error, or return some other value indicating the request failed.
  }
}
//
