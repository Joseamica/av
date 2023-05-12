//ORDER

import type {Order, User} from '@prisma/client'
import {prisma} from '~/db.server'

export async function isUserInOrder(orderId: Order['id'], userId: User['id']) {
  //   const validateIfUserIsInOrder = await prisma.order
  //     .findFirst({
  //       where: {id: orderId},
  //       select: {users: true},
  //     })
  //     .users()

  const validateIfUserIsInOrder = await prisma.user.findFirst({
    where: {id: userId, orderId},
  })

  if (!validateIfUserIsInOrder) {
    console.log('🔌 User is not in order, adding user to order')
    return prisma.user.update({
      where: {id: userId},
      data: {
        orderId,
      },
    })
  }
  return validateIfUserIsInOrder
}
