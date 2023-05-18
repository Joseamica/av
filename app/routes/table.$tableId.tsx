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
    // If user is not in table, then connect
    const isUserInTable = await prisma.user
      .findFirst({where: {id: userId, tableId}})
      .then(user => (user ? true : false))
    if (!isUserInTable) {
      console.log(`🔌 Connecting '${username}' to the table`)
      // await prisma.table.update({
      //   where: {
      //     id: tableId,
      //   },
      //   data: {
      //     users: {
      //       connect: {
      //         id: userId,
      //       },
      //     },
      //   },
      // })
      await prisma.user.update({
        where: {id: userId},
        data: {
          tableId: tableId,
        },
      })
      console.log(`✅ Connected '${username}' to the table`)
    }

    //If user is not in order, then connect
    const order = await prisma.order.findFirst({
      where: {tableId, active: true},
    })

    const isUserInOrder = await prisma.user
      .findFirst({
        where: {id: userId, orderId: order?.id},
      })
      .then(user => (user ? true : false))

    if (!isUserInOrder) {
      console.log(`🔌 Connecting '${username}' to the order`)
      await prisma.order.update({
        where: {tableId},
        data: {users: {connect: {id: userId}}},
      })
      console.log(`✅ Connected '${username}' to the order`)
    }
    return json({success: true}) // return json({success: true})
  } else {
    return json({success: true})
  }
}

export default function TableIndex() {
  // const revalidator = useRevalidator()
  // useEffect(() => {
  //   revalidator.revalidate()
  // }, [])

  return (
    <div>
      <Outlet />
    </div>
  )
}
