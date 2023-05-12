import {cssBundleHref} from '@remix-run/css-bundle'
import type {ActionArgs, LinksFunction, LoaderArgs} from '@remix-run/node'
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
  useLoaderData,
  useMatches,
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

export const links: LinksFunction = () => [
  {rel: 'stylesheet', href: tailwindStylesheetUrl},
  ...(cssBundleHref ? [{rel: 'stylesheet', href: cssBundleHref}] : []),
]

export const loader = async ({request}: LoaderArgs) => {
  const userId = await getUserId(request)

  const session = await getSession(request)
  session.set('userId', userId)

  const username = await getUsername(request)

  //Verifiy if user is on the database or create
  const user = await findOrCreateUser(userId, username)

  const tables = await prisma.table.findMany({})

  const url = new URL(request.url)
  const pathname = url.pathname

  return json(
    {username, tables, pathname},
    {headers: {'Set-Cookie': await sessionStorage.commitSession(session)}},
  )
}

export const action = async ({request}: ActionArgs) => {
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
    return redirect(redirectTo, {
      headers: {'Set-Cookie': await sessionStorage.commitSession(session)},
    })
  }

  return null
}

export default function App() {
  const data = useLoaderData()

  if (!data.username) {
    return (
      <Form method="post">
        <h1>Tu Nombre por favor</h1>
        <input type="text" name="name" />
        <input type="hidden" name="url" value={data.pathname} />
        <button>submit</button>
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
      <body className="h-full">
        <p className="text-3xl">Bienvenido {data.username}</p>
        {data.tables.map((table: Table) => (
          <Link
            key={table.id}
            to={`/table/${table.id}`}
            className="bg-blue-200 p-2"
          >
            {table.table_number}
          </Link>
        ))}
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}
