import {redirect, type LoaderArgs} from '@remix-run/node'
import invariant from 'tiny-invariant'
import {prisma} from '~/db.server'
import {cleanUserData} from '~/models/user.server'
import {getSession, sessionStorage} from '~/session.server'

// export const action = async ({request, params}: ActionArgs) => {
//   const {tableId} = params
//   invariant(tableId, 'No se encontró mesa')
//   EVENTS.ISSUE_CHANGED(tableId, 'endOrder')
//   return json({success: true})
// }
export async function loader({request, params}: LoaderArgs) {
  const {tableId} = params
  invariant(tableId, 'Mesa no encontrada!')
  const session = await getSession(request)

  const order = await prisma.order.findFirst({
    where: {
      tableId,
      active: true,
    },
    include: {
      users: true,
    },
  })
  // EVENTS.TABLE_CHANGED(tableId)
  invariant(order, 'Orden no existe')
  // Update each user to set `paid` to 0
  for (let user of order.users) {
    await cleanUserData(user.id)
  }
  await prisma.table.update({
    where: {
      id: tableId,
    },
    data: {
      users: {set: []},
    },
  })
  await prisma.order.update({
    where: {
      id: order.id,
    },
    data: {
      active: false,
      table: {disconnect: true},
      users: {set: []},
    },
  })
  session.unset('cart')
  // session.unset('tableSession')
  return redirect('/thankyou', {
    headers: {'Set-Cookie': await sessionStorage.commitSession(session)},
  })
}
