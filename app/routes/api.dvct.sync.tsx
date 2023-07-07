import {type ActionArgs, redirect} from '@remix-run/server-runtime'
import {json} from 'express'
import invariant from 'tiny-invariant'
import {prisma} from '~/db.server'
import {getSession} from '~/session.server'

export async function loader({request, params}: ActionArgs) {
  const clientId = process.env.DELIVERECT_CLIENT_ID
  const secret = process.env.DELIVERECT_SECRET
  const session = await getSession(request)
  const tableId = session.get('tableId')

  const deliverect = await prisma.deliverect.findFirst({})
  if (!deliverect) {
    await prisma.deliverect.create({
      data: {
        deliverectExpiration: null,
        deliverectToken: null,
      },
    })
  }
  invariant(deliverect, 'deliverect not found')

  const url = 'https://api.staging.deliverect.com/oauth/token'
  const options = {
    method: 'POST',
    headers: {accept: 'application/json', 'content-type': 'application/json'},
    body: JSON.stringify({
      audience: 'https://api.staging.deliverect.com',
      grant_type: 'token',
      client_id: clientId,
      client_secret: secret,
    }),
  }
  try {
    const response = await fetch(url, options)
    const data = await response.json()

    await prisma.deliverect.update({
      where: {id: deliverect?.id},
      data: {
        deliverectToken: data.access_token,
        deliverectExpiration: data.expires_at,
      },
    })

    return redirect(`/table/${tableId}`, {status: 303})
  } catch (err) {
    console.error('error:' + err)
    return json({tokenAssign: false}) // Or throw an error, or return some other value indicating the request failed.
  }
}
