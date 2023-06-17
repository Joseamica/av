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
  useLoaderData,
} from '@remix-run/react'

import {addHours, formatISO} from 'date-fns'
import {
  getSession,
  getUserId,
  getUsername,
  sessionStorage,
} from '~/session.server'
import tailwindStylesheetUrl from '~/styles/tailwind.css'
import {Button, FlexRow, Header, Spacer} from './components'
import {prisma} from './db.server'
import {findOrCreateUser} from './models/user.server'
import {validateRedirect} from './redirect.server'
import appStylesheetUrl from './styles/app.css'
import {Modal} from './components/modals'

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

  let redirectTo = validateRedirect(formData.get('redirect'), url)

  const userId = session.get('userId')

  if (name) {
    console.time(`✅ Creating session and user with name... ${name}`)
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

  //TODO MAKE FETCHERS FOR EACH ACTION
  if (!data.username) {
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
          {/* <Header user={data.user} isAdmin={data.isAdmin} /> */}
          <Modal
            handleClose={() => null}
            title="Registro de usuario"
            isOpen={true}
          >
            <Form method="post" className="space-y-2 bg-day-bg_principal p-4">
              <FlexRow>
                <label htmlFor="name">Nombre:</label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  className="rounded-xl ring ring-button-outline"
                />
              </FlexRow>
              <input type="hidden" name="url" value={data.pathname} />
              <FlexRow>
                <label htmlFor="color">Color</label>
                <input
                  type="color"
                  name="color"
                  id="color"
                  className="rounded-full"
                />
              </FlexRow>
              <Spacer spaceY="2" />
              <Button fullWith={true}>Continuar a la mesa</Button>
            </Form>
          </Modal>
          <Outlet />
          {/* </RemixSseProvider> */}
          <ScrollRestoration />
          <Scripts />
          <LiveReload />
        </body>
      </html>
    )
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

// function useRealtimeIssuesRevalidation() {
//   const eventName = useLocation().pathname

//   const data = useEventSource(`/events${eventName}`)
//   const {revalidate} = useRevalidator()
//   React.useEffect(() => {
//     console.dir('useRealtimeIssuesRevalidation -> data')
//     revalidate()
//   }, [data, revalidate])
// }
