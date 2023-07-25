import type { ActionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import invariant from 'tiny-invariant'
import { prisma } from '~/db.server'

export async function loader({ request, params }: ActionArgs) {
  const clientId = process.env.DELIVERECT_CLIENT_ID
  const secret = process.env.DELIVERECT_SECRET

  /**
   * Esto no deberia ser nulo nunca ya que se crea desde el seed.
   */
  const deliverect = await prisma.deliverect.findFirst({})
  invariant(deliverect, 'deliverect not found')

  const url = `${process.env.DELIVERECT_API_URL}/oauth/token`
  const options = {
    method: 'POST',
    headers: { accept: 'application/json', 'content-type': 'application/json' },
    body: JSON.stringify({
      audience: process.env.DELIVERECT_API_URL,
      grant_type: 'token',
      client_id: clientId,
      client_secret: secret,
    }),
  }

  try {
    const response = await fetch(url, options)
    const data = await response.json()

    await prisma.deliverect.update({
      where: { id: deliverect.id },
      data: {
        deliverectToken: data.access_token,
        deliverectExpiration: data.expires_at,
      },
    })

    return json({ token: data })
  } catch (err) {
    console.error('error:' + err)
    return json({ tokenAssign: false }) // Or throw an error, or return some other value indicating the request failed.
  }
}
