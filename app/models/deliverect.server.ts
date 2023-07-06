import {prisma} from '~/db.server'
import {getUser, getUserId} from '~/session.server'
// export async function getOrAssignDvctToken(request: Request) {
//   const clientId = process.env.DELIVERECT_CLIENT_ID
//   const secret = process.env.DELIVERECT_SECRET

//   const url = 'https://api.staging.deliverect.com/oauth/token'
//   const options = {
//     method: 'POST',
//     headers: {accept: 'application/json', 'content-type': 'application/json'},
//     body: JSON.stringify({
//       audience: 'https://api.staging.deliverect.com',
//       grant_type: 'token',
//       client_id: clientId,
//       client_secret: secret,
//     }),
//   }

//   try {
//     const response = await fetch(url, options)
//     const data = await response.json()
//     await setToken(request, data.access_token)
//     return data
//   } catch (err) {
//     console.error('error:' + err)
//     return null // Or throw an error, or return some other value indicating the request failed.
//   }
// }

export async function getDvctAccounts(token) {
  const accountsUrl = 'https://api.staging.deliverect.com/accounts'
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      authorization: 'Bearer ' + token,
    },
  }

  try {
    const response = await fetch(accountsUrl, options)
    const data = await response.json()
    return data
  } catch (error) {
    console.error('error:' + error)
    return null // Or throw an error, or return some other value indicating the request failed.
  }
}

export async function isTokenExpired() {
  const deliverect = await prisma.deliverect.findFirst({})
  const dvctExpiration = deliverect?.deliverectExpiration
  const dvctToken = deliverect?.deliverectToken
  const currentTime = Math.floor(Date.now() / 1000) // Get the current time in Unix timestamp
  const isTokenExpired =
    deliverect && dvctExpiration <= currentTime ? true : false
  return isTokenExpired
}
