import {type ActionArgs, type LoaderArgs, json, redirect} from '@remix-run/node'
import invariant from 'tiny-invariant'
import {prisma} from '~/db.server'
import {validateRedirect} from '~/redirect.server'
import {getSession} from '~/session.server'
import {getTableIdFromUrl} from '~/utils'

export async function loader({request, params}: LoaderArgs) {
  const clientId = process.env.DELIVERECT_CLIENT_ID
  const secret = process.env.DELIVERECT_SECRET
  const searchParams = new URL(request.url).searchParams
  const redirectTo = searchParams.get('redirectTo')
  console.log('redirectTo', redirectTo)

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
    const response = await fetch(url, options)
    const data = await response.json()
    await prisma.deliverect.upsert({
      where: {id: deliverect.id},
      update: {
        deliverectToken: data.access_token,
        deliverectExpiration: data.expires_at,
      },
      create: {
        deliverectToken: data.access_token,
        deliverectExpiration: data.expires_at,
      },
    })

    return redirect(redirectTo, {status: 303})
  } catch (err) {
    console.error('error:' + err)
    return json({tokenAssign: false}) // Or throw an error, or return some other value indicating the request failed.
  }
}

// export async function action({request, params}: ActionArgs) {
//   const clientId = process.env.DELIVERECT_CLIENT_ID
//   const secret = process.env.DELIVERECT_SECRET
//   const session = await getSession(request)
//   const tableId = session.get('tableId')

//   const token = await getToken(request)
//   const table = await prisma.table.findFirst({
//     where: {id: tableId},
//     select: {deliverectToken: true},
//   })
//   const isDeliverectToken = table?.deliverectToken ? true : false

//   if (!token && !isDeliverectToken) {
//     const url = 'https://api.staging.deliverect.com/oauth/token'
//     const options = {
//       method: 'POST',
//       headers: {accept: 'application/json', 'content-type': 'application/json'},
//       body: JSON.stringify({
//         audience: 'https://api.staging.deliverect.com',
//         grant_type: 'token',
//         client_id: clientId,
//         client_secret: secret,
//       }),
//     }
//     try {
//       const response = await fetch(url, options)
//       const data = await response.json()

//       await setToken(session, data.access_token)
//       await prisma.table.update({
//         where: {id: tableId},
//         data: {deliverectToken: data.access_token},
//       })

//       return redirect(`/table/${tableId}`, {
//         headers: {
//           'Set-Cookie': await sessionStorage.commitSession(session, {
//             expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
//             maxAge: 1000 * 60 * 60 * 24,
//             secure: true,
//           }),
//         },
//       })
//     } catch (err) {
//       console.error('error:' + err)
//       return json({success: false}) // Or throw an error, or return some other value indicating the request failed.
//     }
//   }

//   return redirect(`/table/${tableId}`)
// }

export async function action({request, params}: ActionArgs) {
  const clientId = process.env.DELIVERECT_CLIENT_ID
  const secret = process.env.DELIVERECT_SECRET
  const session = await getSession(request)
  const tableId = session.get('tableId')

  const deliverect = await prisma.deliverect.findFirst({})

  invariant(deliverect, 'deliverect not found')
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
    const response = await fetch(url, options)
    const data = await response.json()
    await prisma.deliverect.update({
      where: {id: deliverect.id},
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
