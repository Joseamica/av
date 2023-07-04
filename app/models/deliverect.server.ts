import {prisma} from '~/db.server'
import {getUser, getUserId, setToken} from '~/session.server'
export async function getOrAssignDvctToken(request: Request) {
  const clientId = process.env.DELIVERECT_CLIENT_ID
  const secret = process.env.DELIVERECT_SECRET

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
    await setToken(request, data.access_token)
    return data
  } catch (err) {
    console.error('error:' + err)
    return null // Or throw an error, or return some other value indicating the request failed.
  }
}
