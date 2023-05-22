import {cssBundleHref} from '@remix-run/css-bundle'
import {ActionArgs, LinksFunction, LoaderArgs, isSession} from '@remix-run/node'
import {json, redirect} from '@remix-run/node'
import {
  Form,
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useFetcher,
  useLoaderData,
  useMatches,
  useRevalidator,
  useLocation,
} from '@remix-run/react'

import type {Table} from '@prisma/client'
import {
  getSession,
  getUserId,
  getUsername,
  sessionStorage,
} from '~/session.server'
import tailwindStylesheetUrl from '~/styles/tailwind.css'
import {prisma} from './db.server'
import {findOrCreateUser} from './models/user.server'
import {validateRedirect} from './redirect.server'
import {EVENTS} from './events'
import invariant from 'tiny-invariant'
import {useEventSource} from 'remix-utils'
import {useEffect} from 'react'
import {Header} from './components'

export const links: LinksFunction = () => [
  {rel: 'stylesheet', href: tailwindStylesheetUrl},
  ...(cssBundleHref ? [{rel: 'stylesheet', href: cssBundleHref}] : []),
]

export const loader = async ({request}: LoaderArgs) => {
  const userId = await getUserId(request)

  const session = await getSession(request)
  session.set('userId', userId)

  const username = await getUsername(request)

  //Verify if user is on the database or create
  const user = await findOrCreateUser(userId, username)

  const url = new URL(request.url)
  const pathname = url.pathname

  return json(
    {username, pathname, user},
    {headers: {'Set-Cookie': await sessionStorage.commitSession(session)}},
  )
}

export const action = async ({request, params}: ActionArgs) => {
  let [body, session] = await Promise.all([request.text(), getSession(request)])
  let formData = new URLSearchParams(body)

  const name = formData.get('name') as string
  const url = formData.get('url') as string

  let redirectTo = validateRedirect(formData.get('redirect'), url)

  const userId = session.get('userId')

  if (name) {
    console.log('✅ Creating user with name:', name)
    await prisma.user.create({
      data: {
        id: userId,
        name: name,
      },
    })
    session.set('username', name)
    console.log('url', url)

    return redirect(redirectTo, {
      headers: {'Set-Cookie': await sessionStorage.commitSession(session)},
    })
  }

  return null
}

export default function App() {
  const data = useLoaderData()
  const fetcher = useFetcher()
  const revalidator = useRevalidator()
  const handleValidate = () => {
    // revalidator.revalidate()
  }
  //TODO MAKE FETCHERS FOR EACH ACTION
  if (!data.username) {
    return (
      <Form method="post">
        <h1>Tu Nombre por favor</h1>
        <input type="text" name="name" />
        <input type="hidden" name="url" value={data.pathname} />
        <button onClick={handleValidate}>submit</button>
      </Form>
    )
  }
  return (
    <html lang="en" className="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="h-full dark:bg-blue-950">
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}

// function useRealtimeIssuesRevalidation() {
//   const eventName = useLocation().pathname

//   const data = useEventSource(`/events${eventName}`)
//   const {revalidate} = useRevalidator()
//   useEffect(() => {
//     console.dir('useRealtimeIssuesRevalidation -> data')
//     revalidate()
//   }, [data, revalidate])}
