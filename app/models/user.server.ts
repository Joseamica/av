import type { Order, Password, Table, User } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { prisma } from '~/db.server'

export type { User } from '@prisma/client'

export async function getUserById(id: User['id']) {
  return prisma.user.findUnique({ where: { id } })
}

export async function getUserByEmail(email: User['email']) {
  return prisma.user.findUnique({ where: { email } })
}

export async function createUser(username: User['name'], email: User['email'], password: string, color: string) {
  const hashedPassword = await bcrypt.hash(password, 10)

  return prisma.user.create({
    data: {
      email,
      name: username,
      color,
      // role: 'user',
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  })
}

export async function deleteUserByEmail(email: User['email']) {
  return prisma.user.delete({ where: { email } })
}

export async function verifyLogin(email: User['email'], password: Password['hash']) {
  const userWithPassword = await prisma.user.findUnique({
    where: { email },
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

  const { password: _password, ...userWithoutPassword } = userWithPassword

  return userWithoutPassword
}

export async function findOrCreateUser(userId: User['id'], username: string, user_color?: string) {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
    },
  })

  if (!user && username) {
    console.log('✅ Creating from findOrCreateUser func -> user with name:', username)
    return prisma.user.create({
      data: {
        id: userId,
        name: username,
        color: user_color,
      },
    })
  }

  return user
}

export async function getPaidUsers(orderId: Order['id']) {
  const users = await prisma.user.findMany({
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
      payments: { where: { orderId, status: 'accepted' } },
    },
  })
  return users.length > 0 ? users : null
}

export async function getUsersOnTable(tableId: Table['id']) {
  const users = await prisma.user.findMany({
    where: {
      tableId: tableId,
      roles: {
        none: {
          OR: [
            {
              name: 'admin',
            },
            {
              name: 'moderator',
            },
          ],
        },
      },
    },
  })

  return users.length > 0 ? users : null
}

export async function assignUserNewPayments(userId: User['id'], amount: number, tip: number) {
  const userPrevPaidData = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      total: true,
      tip: true,
      paid: true,
    },
  })

  return prisma.user.update({
    where: { id: userId },
    data: {
      paid: Number(userPrevPaidData?.paid) + amount,
      tip: Number(userPrevPaidData?.tip) + tip,
      total: Number(userPrevPaidData?.total) + amount + tip,
    },
  })
}

export function cleanUserData(userId: string) {
  return prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      tip: 0,
      paid: 0,
      total: 0,
      orders: { disconnect: true },
      cartItems: { set: [] },

      // tableId: null,
      // tables: {disconnect: true},
    },
  })
}
