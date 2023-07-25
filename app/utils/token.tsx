import type { Session } from '@remix-run/node'
import { prisma } from '~/db.server'

export async function authenticate(session: Session) {
  if (typeof window === 'undefined') {
    const token = prisma.deliverect.findFirst({})
    console.log('token server', token)
    return token
  } else {
    let token = window.sessionStorage.getItem('token')
    token ?? (await fetch('www.localhost:3000/api/dvct/token'))
    console.log('token browser', token)
    return token
  }
}
