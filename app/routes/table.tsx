import { Link, Outlet, isRouteErrorResponse, useLoaderData, useRouteError } from '@remix-run/react'

import type { ActionArgs, LoaderArgs, V2_MetaFunction } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'

// * UTILS, DB, EVENTS
import { prisma } from '~/db.server'
import { validateRedirect } from '~/redirect.server'
import { getSession, getUserId, getUsername, sessionStorage } from '~/session.server'

import { getBranchId } from '~/models/branch.server'
import { findOrCreateUser } from '~/models/user.server'

import { EVENTS } from '~/events'

import { getSearchParams, getTableIdFromUrl } from '~/utils'

// * COMPONENTS
// * CUSTOM COMPONENTS
import { HeaderV2, Notification, UserForm } from '~/components'

const SESSION_EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 30 //30 days

export const meta: V2_MetaFunction = () => {
  return [
    { title: 'Table' },
    {
      property: 'og:title',
      content: 'Very cool app',
    },
    {
      name: 'description',
      content: 'This app is the best',
    },
  ]
}

//ANCHOR LOADER
export const loader = async ({ request }: LoaderArgs) => {
  const session = await getSession(request)
  // const sessionId = session.get('sessionId')
  // if (!sessionId) {
  //   console.log('No sessionID ❌error expected')
  //   redirect('/logout')
  // }
  // invariant(sessionId, 'Session ID is required Error in table.tsx line 47')
  const userId = await getUserId(session)
  const employeeId = session.get('employeeId')

  if (employeeId) {
    return redirect('/dashboard')
  }
  let user = null
  //NOTE - This is to validate if the user is scanning from QR
  const url = new URL(request.url)
  const pathname = url.pathname
  const tableId = getTableIdFromUrl(pathname)

  const username = await getUsername(session)

  const searchParams = getSearchParams({ request })

  if (!username) {
    searchParams.set('redirectTo', `${pathname}`)
  }
  const user_color = session.get('user_color')

  // NOTE - Verify if user is on the database or create
  if (username) {
    user = await findOrCreateUser(userId, username, user_color)
  }

  if (!tableId) {
    throw new Error('Procura acceder por medio del código QR, u obtener el link con el id de la mesa.')
  }
  //NOTE - This is to validate if the token is expired
  //TODO Habilitar cuando usemos deliverect
  // const isDvctTokenExpired = await getIsDvctTokenExpired()
  // if (isDvctTokenExpired) {
  //   return redirect(`/api/dvct/oauth/token?redirectTo=${pathname}`)
  // }

  const notification = session.get('notification')

  return json({ username, pathname, user, notification }, { headers: { 'Set-Cookie': await sessionStorage.commitSession(session) } })
}

//ANCHOR ACTION
export const action = async ({ request, params }: ActionArgs) => {
  let [body, session] = await Promise.all([request.text(), getSession(request)])
  let formData = new URLSearchParams(body)

  const name = formData.get('name') as string
  const color = formData.get('color') as string
  const url = formData.get('url') as string
  const proceed = formData.get('_action') === 'proceed'

  let redirectTo = validateRedirect(formData.get('redirect'), url)
  const tableId = getTableIdFromUrl(url)
  const branchId = await getBranchId(tableId)

  const searchParams = new URLSearchParams(request.url)

  if (!name) {
    return redirect(redirectTo + '?error=Debes ingresar un nombre...')
  }

  if (name && proceed) {
    console.time(`✅ Creating session and user with name... ${name}`)
    searchParams.set('error', '')
    const isOrderActive = await prisma.order.findFirst({
      where: { active: true, tableId: tableId },
    })

    const createdUser = await prisma.user.create({
      data: {
        name: name,
        color: color ? color : '#000000',
        tableId: tableId ? tableId : null,
        orderId: isOrderActive ? isOrderActive.id : null,
        branchId,
        // role: 'user',
        sessions: {
          create: {
            expirationDate: new Date(Date.now() + SESSION_EXPIRATION_TIME),
          },
        },
      },
      include: { sessions: true },
    })
    console.log('\x1b[44m%s\x1b[0m', 'table.tsx line:125 ✅Created user from setName prompt')
    if (createdUser) {
      const sessionId = createdUser.sessions.find(session => session.id)?.id
      sessionId && session.set('sessionId', sessionId)
      console.log(createdUser)

      session.set('username', name)
      session.set('user_color', color)
      session.set('userId', createdUser.id)
      session.unset('employeeId')
    }

    // Set expiry time 4 hours from now
    // const expiryTime = formatISO(addHours(new Date(), 4))
    // session.set('expiryTime', expiryTime)
    if (tableId) {
      const table = await prisma.table.findUnique({
        where: {
          id: tableId,
        },
      })
      console.log('Table number' + table?.number)
      const branchId = await getBranchId(tableId)
      await prisma.notification.create({
        data: {
          message: `El usuario ${name} se ha unido a la mesa ${table?.number}`,
          tableId: tableId,
          branchId,
          status: 'received',
          userId: createdUser.id,
          type: 'informative',
        },
      })
      console.log('\x1b[44m%s\x1b[0m', 'table.tsx line:147 SSE TRIGGER because tableId exists and user entered name')
      EVENTS.ISSUE_CHANGED(tableId)
      session.set('tableId', tableId)
    }

    // session.set('tutorial', true)
    console.timeEnd(`✅ Creating session and user with name... ${name}`)

    return redirect(redirectTo, {
      headers: { 'Set-Cookie': await sessionStorage.commitSession(session) },
    })
  }

  return null
}

export default function TableLayoutPath() {
  const data = useLoaderData()

  if (!data.username) {
    return <UserForm />
  }

  return (
    <div className="hide-scrollbar no-scrollbar  mx-auto h-full max-w-md bg-[#F3F4F6] px-2 pt-16">
      <HeaderV2 user={data.user} />
      <Notification message={data.notification} />
      <Outlet />
    </div>
  )
}

export const ErrorBoundary = () => {
  const error = useRouteError() as Error

  if (isRouteErrorResponse(error)) {
    return (
      <main className="bg-night-600">
        <p>No information</p>
        <p>Status: {error.status}</p>
        <p>{error?.data}</p>
      </main>
    )
  }

  return (
    <main className="text-white bg-night-500">
      <h1>Rayos y centellas!</h1>
      <p>{error?.message}</p>
      <button className="text-white bg-warning">
        Back to <Link to={'/table'}> safety! </Link>
      </button>
    </main>
  )
}
