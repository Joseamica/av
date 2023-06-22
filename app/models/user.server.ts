import type {Order, Password, Table, User} from '@prisma/client'
import bcrypt from 'bcryptjs'

import {prisma} from '~/db.server'

export type {User} from '@prisma/client'

export async function getUserById(id: User['id']) {
  return prisma.user.findUnique({where: {id}})
}

export async function getUserByEmail(email: User['email']) {
  return prisma.user.findUnique({where: {email}})
}

export async function createUser(email: User['email'], password: string) {
  const hashedPassword = await bcrypt.hash(password, 10)

  return prisma.user.create({
    data: {
      email,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  })
}

export async function deleteUserByEmail(email: User['email']) {
  return prisma.user.delete({where: {email}})
}

export async function verifyLogin(
  email: User['email'],
  password: Password['hash'],
) {
  const userWithPassword = await prisma.user.findUnique({
    where: {email},
    include: {
      password: true,
    },
  })

  if (!userWithPassword || !userWithPassword.password) {
    return null
  }

  const isValid = await bcrypt.compare(password, userWithPassword.password.hash)

  if (!isValid) {
    return null
  }

  const {password: _password, ...userWithoutPassword} = userWithPassword

  return userWithoutPassword
}

export async function findOrCreateUser(userId: User['id'], username: string) {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
    },
  })

  if (!user && username) {
    console.log('✅ Creating user with name:', username)
    return prisma.user.create({
      data: {
        id: userId,
        name: username,
      },
    })
  }

  return user
}

export function getPaidUsers(orderId: Order['id']) {
  return prisma.user.findMany({
    where: {
      orderId,
      // tip: {
      //   not: null,
      //   gt: -1,
      // },
      paid: {
        not: null,
        //BEFORE gt: -1
        gt: 0,
      },
    },
    select: {
      id: true,
      name: true,
      color: true,
      paid: true,
      tip: true,
      total: true,
      payments: {where: {orderId}},
    },
  })
}

export function getUsersOnTable(tableId: Table['id']) {
  return prisma.user.findMany({
    where: {
      tableId: tableId,
    },
  })
}
