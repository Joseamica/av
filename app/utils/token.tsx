import {json} from '@remix-run/node'
import {prisma} from '~/db.server'

export async function isDvctTokenExpired() {
  const dvct = await prisma.deliverect.findFirst({})
  const dvctExpiration = dvct.deliverectExpiration
  const dvctToken = dvct.deliverectToken

  console.log('dvctToken', dvctToken)

  const currentTime = Math.floor(Date.now() / 1000) // Get the current time in Unix timestamp

  if (!dvctToken || !dvctExpiration) {
    return true
  }

  const isTokenExpired = dvct && dvctExpiration <= currentTime ? true : false

  return isTokenExpired
}

export async function getToken() {
  const clientId = process.env.DELIVERECT_CLIENT_ID
  const secret = process.env.DELIVERECT_SECRET

  const deliverect = await prisma.deliverect.findFirst({})
  //NOTE - commented because on seed always deliverect gets created on db
  // invariant(deliverect, 'deliverect not found')

  const url = `${process.env.DELIVERECT_API_URL}/oauth/token`

  const options = {
    method: 'POST',
    headers: {accept: 'application/json', 'content-type': 'application/json'},
    body: JSON.stringify({
      audience: process.env.DELIVERECT_API_URL,
      grant_type: 'token',
      client_id: clientId,
      client_secret: secret,
    }),
  }

  try {
    const isTokenExpired = await isDvctTokenExpired()
    if (isTokenExpired) {
      const response = await fetch(url, options)
      const token = await response.json()

      // ANCHOR UPDATING DB WITH THE NEW TOKEN
      await prisma.deliverect.upsert({
        where: {id: deliverect.id},
        update: {
          deliverectToken: token.access_token,
          deliverectExpiration: token.expires_at,
        },
        create: {
          deliverectToken: token.access_token,
          deliverectExpiration: token.expires_at,
        },
      })

      return json(token)
    } else {
      const token = await prisma.deliverect.findFirst({})
      return json(token)
    }
  } catch (err) {
    console.error('error:' + err)
    return json({tokenAssign: false}) // Or throw an error, or return some other value indicating the request failed.
  }
}
