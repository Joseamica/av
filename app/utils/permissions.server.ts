import { json } from '@remix-run/node'

import { prisma } from '~/db.server'
import { getSession } from '~/session.server'

export async function requireUserWithPermission(name: string, request: Request) {
  const session = await getSession(request)
  const userId = session.get('userId')
  const adminId = session.get('adminId')
  const user = await prisma.user.findFirst({
    where: { id: userId, roles: { some: { permissions: { some: { name } } } } },
  })
  if (!user || !adminId) {
    throw json({ error: 'Unauthorized', requiredRole: name }, { status: 403 })
  }
  return { user, adminId }
}

export async function requireAdmin(request: Request) {
  return requireUserWithPermission('admin', request)
}
