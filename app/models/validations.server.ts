//ORDER

import type {Order, Table, User} from '@prisma/client'
import {json} from '@remix-run/node'
import {prisma} from '~/db.server'

export async function validateUserIntegration(
  userId: User['id'],
  tableId: Table['id'],
  username: string,
) {
  // If user is not in table, then connect
  const isUserInTable = await prisma.user
    .findFirst({where: {id: userId, tableId}})
    .then(user => (user ? true : false))
  if (!isUserInTable) {
    console.log(`🔌 Connecting '${username}' to the table`)

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
}
