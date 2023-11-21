import { type ActionArgs, json, redirect } from '@remix-run/node'

import invariant from 'tiny-invariant'
import { prisma } from '~/db.server'
import { getSession, sessionStorage } from '~/session.server'

import { getBranchId } from '~/models/branch.server'
import { cleanUserData } from '~/models/user.server'

import { EVENTS } from '~/events'

import { getSearchParams } from '~/utils'

export const action = async ({ request, params }: ActionArgs) => {
  const formData = await request.formData()
  const redirectTo = (formData.get('redirectTo') as string) ?? '/thankyou'
  const { tableId } = params
  invariant(tableId, 'Mesa no encontrada!')
  const session = await getSession(request)
  const searchParams = getSearchParams({ request })
  const from = searchParams.get('from')
  const branchId = await getBranchId(tableId)

  if (from === 'admin') {
    await prisma.table.update({
      where: {
        id: tableId,
      },
      data: {
        users: { set: [] },
      },
    })
  }

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

  // Update each user to set `paid` to 0
  if (order) {
    if (order.users.length >= 1) {
      for (let user of order.users) {
        await cleanUserData(user.id)
      }
    }

    console.time('update table')
    await prisma.table.update({
      where: {
        id: tableId,
      },
      data: {
        users: { set: [] },
      },
    })
    console.timeEnd('update table')
    await prisma.order.update({
      where: {
        id: order.id,
      },
      data: {
        active: false,
        table: { disconnect: true },
        users: { set: [] },
        // paid: true,
      },
    })
    session.unset('cart')
    session.unset('tableId')
    // session.unset('tableSession')
    EVENTS.ISSUE_CHANGED(tableId, branchId)
    return redirect(from === 'admin' ? redirectTo : '/thankyou', {
      headers: { 'Set-Cookie': await sessionStorage.commitSession(session) },
    })
  } else {
    return redirect(redirectTo)
  }
}
// export async function loader({ request, params }: LoaderArgs) {
//   const { tableId } = params;
//   invariant(tableId, "Mesa no encontrada!");
//   const session = await getSession(request);

//   const order = await prisma.order.findFirst({
//     where: {
//       tableId,
//       active: true,
//     },
//     include: {
//       users: true,
//     },
//   });
//   // EVENTS.TABLE_CHANGED(tableId)
//   invariant(order, "Orden no existe");
//   // Update each user to set `paid` to 0
//   for (let user of order.users) {
//     await cleanUserData(user.id);
//   }
//   await prisma.table.update({
//     where: {
//       id: tableId,
//     },
//     data: {
//       users: { set: [] },
//     },
//   });
//   await prisma.order.update({
//     where: {
//       id: order.id,
//     },
//     data: {
//       active: false,
//       table: { disconnect: true },
//       users: { set: [] },
//     },
//   });
//   session.unset("cart");
//   // session.unset('tableSession')
//   return redirect("/thankyou", {
//     headers: { "Set-Cookie": await sessionStorage.commitSession(session) },
//   });
// }
