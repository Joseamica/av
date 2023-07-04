import {ActionArgs, LoaderArgs, json, redirect} from '@remix-run/node'
import {getOrAssignDvctToken} from '~/models/deliverect.server'
import {getSession, getToken, sessionStorage, setToken} from '~/session.server'

export async function loader({request, params}: LoaderArgs) {
  const rawData = await request.text()
  const token = await getToken(request)
  console.log('token', token)
  // Parse the raw data to JSON
  //   const data = JSON.parse(rawData)
  //   console.log(data)

  return json({success: true})
}

export async function action({request, params}: ActionArgs) {
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
    const session = await getSession(request)
    await setToken(session, data.access_token)
    return redirect('/', {
      headers: {
        'Set-Cookie': await sessionStorage.commitSession(session, {
          expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
          maxAge: 1000 * 60 * 60 * 24,
          secure: true,
        }),
      },
    })
  } catch (err) {
    console.error('error:' + err)
    return json({success: false}) // Or throw an error, or return some other value indicating the request failed.
  }
}
