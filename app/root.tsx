import {cssBundleHref} from '@remix-run/css-bundle'
import type {ActionArgs, LinksFunction, LoaderArgs} from '@remix-run/node'
import {json, redirect} from '@remix-run/node'

import {
  Form,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useActionData,
  useLoaderData,
  useLocation,
  useMatches,
  useSearchParams,
  useSubmit,
} from '@remix-run/react'

import {addHours, formatISO} from 'date-fns'
import {
  getSession,
  getUserId,
  getUsername,
  sessionStorage,
} from '~/session.server'
import tailwindStylesheetUrl from '~/styles/tailwind.css'
import {Button, FlexRow, H4, Header, Spacer} from './components'
import {prisma} from './db.server'
import {findOrCreateUser} from './models/user.server'
import {validateRedirect} from './redirect.server'
import appStylesheetUrl from './styles/app.css'
import {Modal} from './components/modals'
import React, {useState} from 'react'
import {getRandomColor} from './utils'
import {get} from 'http'

export const links: LinksFunction = () => [
  {rel: 'stylesheet', href: tailwindStylesheetUrl},
  {rel: 'stylesheet', href: appStylesheetUrl},
  ...(cssBundleHref ? [{rel: 'stylesheet', href: cssBundleHref}] : []),
]

export const loader = async ({request}: LoaderArgs) => {
  const userId = await getUserId(request)

  const session = await getSession(request)
  session.set('userId', userId)

  //ADMIN PURPOSES
  const isAdmin = await prisma.user.findFirst({
    where: {
      id: userId,
      role: 'admin',
    },
  })

  const username = await getUsername(request)

  //Verify if user is on the database or create
  const user = await findOrCreateUser(userId, username)

  const url = new URL(request.url)
  const pathname = url.pathname
  let segments = pathname.split('/')
  let tableIndex = segments.indexOf('table')
  let tableId = segments[tableIndex + 1]

  if (!session.has('tableId') && tableId) {
    session.set('tableId', tableId)
    console.log('✅ assigning tableId to session...')
  }

  return json(
    {username, pathname, user, isAdmin},
    {headers: {'Set-Cookie': await sessionStorage.commitSession(session)}},
  )
}
const SESSION_EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 30

export const action = async ({request, params}: ActionArgs) => {
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
      headers: {'Set-Cookie': await sessionStorage.commitSession(session)},
    })
  }

  return null
}

export default function App() {
  const data = useLoaderData()

  if (!data.username) {
    return <UserForm />
  }
  return (
    <html lang="en" className="h-screen">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="hide-scrollbar no-scrollbar relative mx-auto h-full max-w-md bg-[#F3F4F6] px-2 pt-16">
        {/* <RemixSseProvider> */}
        <div id="modal-root" />
        <Header user={data.user} isAdmin={data.isAdmin} />

        <Outlet />
        {/* </RemixSseProvider> */}
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}

function UserForm() {
  const data = useLoaderData()
  const [searchParams] = useSearchParams()
  const error = searchParams.get('error')

  const errorClass = error ? 'animate-pulse placeholder:text-warning' : ''

  return (
    <html lang="en" className="h-screen">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="hide-scrollbar no-scrollbar relative mx-auto h-full max-w-md bg-[#F3F4F6] px-2 pt-16">
        <div id="modal-root" />
        <Modal
          handleClose={() => null}
          title="Registro de usuario"
          isOpen={true}
        >
          <FormContent
            errorClass={errorClass}
            error={error || ''}
            pathname={data.pathname}
          />
        </Modal>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}

function FormContent({
  errorClass,
  error,
  pathname,
}: {
  errorClass: string
  error?: string
  pathname: string
}) {
  const [name, setName] = useState('')

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.currentTarget.value)
  }

  const handleError = !name && error && error

  const randomColor = getRandomColor()

  return (
    <Form
      method="post"
      className="space-y-2 bg-day-bg_principal"
      // onChange={handleChange}
    >
      <div
        className={`flex w-full flex-row items-center bg-button-notSelected px-4 py-2 ${
          !name && errorClass
        } ${handleError && 'border-2 border-warning'}`}
      >
        <input
          type="text"
          name="name"
          autoCapitalize="words"
          id="name"
          value={name}
          autoFocus={true}
          className={`flex h-20 w-full bg-transparent text-6xl placeholder:p-2 placeholder:text-6xl focus:outline-none focus:ring-0 ${
            !name && errorClass
          } `}
          placeholder="Nombre"
          onChange={e => handleChange(e)}
        />
      </div>
      {!name && error && (
        <H4 variant="error" className="pl-6">
          {error}
        </H4>
      )}

      <input type="hidden" name="url" value={pathname} />

      <div className="flex flex-col items-start justify-start p-4">
        <FlexRow>
          <label htmlFor="color" className="pl-4 text-3xl">
            Escoge tu color:
          </label>
          <div className="transparent h-10 w-10 overflow-hidden">
            <input
              type="color"
              name="color"
              id="color"
              defaultValue={randomColor}
              className="h-full w-full"
            />
          </div>
        </FlexRow>
        <Spacer spaceY="4" />
        <Button fullWith={true} name="_action" value="proceed">
          Continuar a la mesa
        </Button>
      </div>
    </Form>
  )
}
