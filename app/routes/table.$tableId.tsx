import {json} from '@remix-run/node'
import {Outlet} from '@remix-run/react'
import type {DataFunctionArgs} from '@remix-run/server-runtime'
import invariant from 'tiny-invariant'
import {prisma} from '~/db.server'
import {getBranch} from '~/models/branch.server'
import {getSession} from '~/session.server'

export async function loader({request, params}: DataFunctionArgs) {
  const {tableId} = params
  invariant(tableId, 'No se encontró el ID de la mesa')
  const branch = await getBranch(tableId)
  invariant(branch, 'No se encontró la sucursal')

  const session = await getSession(request)
  const userId = session.get('userId')
  const username = session.get('username')

  if (userId && username) {
    const updateTable = await prisma.table.update({
      where: {
        id: tableId,
      },
      data: {
        users: {
          connect: {
            id: userId,
          },
        },
      },
    })
    return json({updateTable})
  } else {
    return json({success: true})
  }
}

export default function TableIndex() {
  return (
    <div>
      <Outlet />
    </div>
  )
}
