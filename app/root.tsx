import {cssBundleHref} from '@remix-run/css-bundle'
import {
  ActionArgs,
  LinksFunction,
  LoaderArgs,
  json,
  redirect,
} from '@remix-run/node'
import {
  Form,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useFetcher,
  useLoaderData,
  useRevalidator,
} from '@remix-run/react'

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
import appStylesheetUrl from './styles/app.css'

export const links: LinksFunction = () => [
  {rel: 'stylesheet', href: tailwindStylesheetUrl},
  {rel: 'stylesheet', href: appStylesheetUrl},
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
    {username, pathname},
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
    <html lang="en" className="mx-auto h-screen max-w-lg px-2 ">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="hide-scrollbar  h-full ">
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
