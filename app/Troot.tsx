import {cssBundleHref} from '@remix-run/css-bundle'
import type {LinksFunction, LoaderArgs} from '@remix-run/node'
import {json} from '@remix-run/node'

import {
  Form,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useSearchParams,
  useSubmit,
} from '@remix-run/react'

import React, {useState} from 'react'
import {getSession, getUserId, getUsername, sessionStorage} from '~/session.server'
import tailwindStylesheetUrl from '~/styles/tailwind.css'
import {Button, FlexRow, H4, Header, Spacer} from './components'
import {Modal} from './components/modals'
import {prisma} from './db.server'
import {getDvctAccounts} from './models/deliverect.server'
import {findOrCreateUser} from './models/user.server'
import appStylesheetUrl from './styles/app.css'
import {getRandomColor, getTableIdFromUrl} from './utils'

export const links: LinksFunction = () => [
  {rel: 'stylesheet', href: tailwindStylesheetUrl},
  {rel: 'stylesheet', href: appStylesheetUrl},
  ...(cssBundleHref ? [{rel: 'stylesheet', href: cssBundleHref}] : []),
]

export const loader = async ({request}: LoaderArgs) => {
  const userId = await getUserId(request)
  const session = await getSession(request)
  const url = new URL(request.url)
  const pathname = url.pathname
  const tableId = getTableIdFromUrl(pathname)

  //NOTE: if session doesnt have userId, set it
  if (!session.has('userId')) {
    session.set('userId', userId)
  }

  if (!session.has('tableId') && tableId) {
    session.set('tableId', tableId)
    console.log('✅ assigning tableId to session...')
  } else if (session.has('tableId')) {
    console.log('user already has tableId on session', session.get('tableId'))
  } else {
    console.log('❌ no tableId on session...')
  }

  //DVCT TOKEN
  const deliverect = await prisma.deliverect.findFirst({})
  const dvctExpiration = deliverect?.deliverectExpiration
  const dvctToken = deliverect?.deliverectToken
  const currentTime = Math.floor(Date.now() / 1000) // Get the current time in Unix timestamp
  const isTokenExpired = deliverect && dvctExpiration <= currentTime ? true : false

  //ACCOUNTS (RESTAURANTS)
  if (!isTokenExpired) {
    const accounts = await getDvctAccounts(dvctToken)
  }

  const username = await getUsername(request)
  const user = await findOrCreateUser(userId, username)
  const isAdmin = await prisma.user.findFirst({
    where: {
      id: userId,
      role: 'admin',
    },
  })

  return json(
    {username, pathname, user, isAdmin, isTokenExpired},
    {headers: {'Set-Cookie': await sessionStorage.commitSession(session)}},
  )
}

export default function App() {
  const data = useLoaderData()
  const submit = useSubmit()

  const [searchParams] = useSearchParams()
  const error = searchParams.get('error')

  const errorClass = error ? 'animate-pulse placeholder:text-warning' : ''

  React.useEffect(() => {
    if (data.isTokenExpired) {
      console.log('❌token expired')
      submit(null, {
        method: 'POST',
        action: '/api/dvct/oauth/token',
        replace: true,
      })
    }
  }, [submit, data.isTokenExpired])

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
        {data.username && <Header user={data.user} isAdmin={data.isAdmin} />}
        {!data.username && (
          <Modal handleClose={() => null} title="Registro de usuario" isOpen={true}>
            <FormContent errorClass={errorClass} error={error || ''} pathname={data.pathname} />
          </Modal>
        )}
        <Outlet />

        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}

export function formatRestaurant(dvctLocation) {
  return {
    id: dvctLocation._id,
    name: dvctLocation.name,
    updated: dvctLocation._updated,
    storeTimezone: dvctLocation.storeTimezone,
  }
}
// function UserForm() {
//   const data = useLoaderData()
//   const [searchParams] = useSearchParams()
//   const error = searchParams.get('error')

//   const errorClass = error ? 'animate-pulse placeholder:text-warning' : ''

//   return (
//     <html lang="en" className="h-screen">
//       <head>
//         <meta charSet="utf-8" />
//         <meta name="viewport" content="width=device-width,initial-scale=1" />
//         <Meta />
//         <Links />
//       </head>
//       <body className="hide-scrollbar no-scrollbar relative mx-auto h-full max-w-md bg-[#F3F4F6] px-2 pt-16">
//         <div id="modal-root" />
//         <Modal
//           handleClose={() => null}
//           title="Registro de usuario"
//           isOpen={true}
//         >
//           <FormContent
//             errorClass={errorClass}
//             error={error || ''}
//             pathname={data.pathname}
//           />
//         </Modal>
//         <Outlet />
//         <ScrollRestoration />
//         <Scripts />
//         <LiveReload />
//       </body>
//     </html>
//   )
// }

function FormContent({errorClass, error, pathname}: {errorClass: string; error?: string; pathname: string}) {
  const [name, setName] = useState('')
  console.log('name', name.length)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.currentTarget.value)
  }

  const handleError = !name && error && error

  const randomColor = getRandomColor()

  return (
    <Form
      method="POST"
      action={'/actions/setUser'}
      className="space-y-2 bg-day-bg_principal"
      // onChange={handleChange}
    >
      <div
        className={`flex w-full flex-row items-center bg-button-notSelected px-4 py-2 ${!name && errorClass} ${
          handleError && 'border-2 border-warning'
        }`}
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

      <input type="hidden" name="pathname" value={pathname} />

      <div className="flex flex-col items-start justify-start p-4">
        <FlexRow>
          <label htmlFor="color" className="pl-4 text-3xl">
            Escoge tu color:
          </label>
          <div className="transparent h-10 w-10 overflow-hidden">
            <input type="color" name="color" id="color" defaultValue={randomColor} className="h-full w-full" />
          </div>
        </FlexRow>
        <Spacer spaceY="4" />
        <Button fullWith={true}>Continuar a la mesa</Button>
      </div>
    </Form>
  )
}
