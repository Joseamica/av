import { json } from '@remix-run/node'

import { prisma } from '~/db.server'
import { getSession } from '~/session.server'

export async function requireUserWithPermission(names: string[], request: Request) {
  const session = await getSession(request)
  const userId = session.get('userId')

  if (!userId) {
    throw json({ error: 'Unauthorized', required: 'UserId' }, { status: 403 })
  }

  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      roles: {
        some: {
          permissions: {
            some: {
              name: {
                in: names, // Check if the name exists in the names array
              },
            },
          },
        },
      },
    },
    include: {
      roles: {
        include: {
          permissions: true,
        },
      },
    },
  })

  if (!user) {
    throw json({ error: 'Unauthorized', requiredRole: names.join(' or ') }, { status: 403 })
  }
  return user
}

export async function requireAdmin(request: Request) {
  return requireUserWithPermission(['admin', 'moderator'], request)
}
