import type { LoaderArgs, ActionArgs } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import {
  Outlet,
  useLoaderData,
  useRouteError,
  isRouteErrorResponse,
  Link,
} from '@remix-run/react'
// * UTILS, DB
import {
  getSession,
  getUserId,
  getUsername,
  sessionStorage,
} from '~/session.server'
import { findOrCreateUser } from '~/models/user.server'
import { prisma } from '~/db.server'
import { validateRedirect } from '~/redirect.server'
// * COMPONENTS
import { addHours, formatISO } from 'date-fns'
// * CUSTOM COMPONENTS
import { Header, UserForm } from '~/components'

const SESSION_EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 30

export default function TableLayoutPath() {
  const data = useLoaderData()

  if (!data.username) {
    return <UserForm />
  }

  return (
    <>
      <Header user={data.user} isAdmin={data.isAdmin} />
      <Outlet></Outlet>
    </>
  )
}

export const loader = async ({ request }: LoaderArgs) => {
  const session = await getSession(request)
  // const userId = await getUserId(session)
  // const username = await getUsername(session)
  const userId = session.get('userId')
  const username = session.get('username')
  let user = null

  //ADMIN PURPOSES
  const isAdmin = await prisma.user.findFirst({
    where: {
      id: userId,
      role: 'admin',
    },
  })

  // * Verify if user is on the database or create
  // * Que onda con usern name ._.)
  if (username) {
    user = await findOrCreateUser(userId, username)
  }

  const url = new URL(request.url)
  const pathname = url.pathname

  return json(
    { username, pathname, user, isAdmin },
    { headers: { 'Set-Cookie': await sessionStorage.commitSession(session) } },
  )
}

export const action = async ({ request, params }: ActionArgs) => {
  let [body, session] = await Promise.all([request.text(), getSession(request)])
  let formData = new URLSearchParams(body)

  const name = formData.get('name') as string
  const color = formData.get('color') as string
  const url = formData.get('url') as string
  const proceed = formData.get('_action') === 'proceed'

  let redirectTo = validateRedirect(formData.get('redirect'), url)

  const userId = session.get('userId')
  const searchParams = new URLSearchParams(request.url)

  if (!name) {
    return redirect(redirectTo + '?error=Debes ingresar un nombre...')
  }

  if (name && proceed) {
    console.time(`✅ Creating session and user with name... ${name}`)
    searchParams.set('error', '')
    const sessionId = await prisma.session.create({
      data: {
        expirationDate: new Date(Date.now() + SESSION_EXPIRATION_TIME),
        user: {
          create: {
            id: userId,
            name: name,
            color: color ? color : '#000000',
          },
        },
      },
      // select: {id: !0, expirationDate: !0},
    })
    session.set('sessionId', sessionId.id)

    // Set expiry time 4 hours from now
    const expiryTime = formatISO(addHours(new Date(), 4))
    session.set('expiryTime', expiryTime)
    session.set('username', name)

    console.timeEnd(`✅ Creating session and user with name... ${name}`)
    return redirect(redirectTo, {
      headers: { 'Set-Cookie': await sessionStorage.commitSession(session) },
    })
  }

  return null
}

// TEST ERROR BONDARY
export const ErrorBoundary = () => {
  const error = useRouteError()

  if (isRouteErrorResponse(error)) {
    return (
      <main>
        <p>No information</p>
        <p>Status: {error.status}</p>
        <p>{error?.data.message}</p>
      </main>
    )
  }

  return (
    <main className="error">
      <h1>An error ocurred in new note :c!</h1>
      <p>{error?.message}</p>
      <button className="bg-red-500 text-black">
        Back to <Link to={'/table'}> safety! </Link>
      </button>
    </main>
  )
}
