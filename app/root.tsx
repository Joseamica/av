import {cssBundleHref} from '@remix-run/css-bundle'
import type {LinksFunction} from '@remix-run/node'
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useNavigation,
  useRouteError,
} from '@remix-run/react'
// * STYLES
import tailwindStylesheetUrl from '~/styles/tailwind.css'
// * CUSTOM COMPONENTS
import appStylesheetUrl from './styles/app.css'
import {useSpinDelay} from 'spin-delay'
import Error from './components/util/error'

export const links: LinksFunction = () => [
  {
    rel: 'preload',
    as: 'font',
    href: '/fonts/Matter-Medium.woff2',
    type: 'font/woff2',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'preload',
    as: 'font',
    href: '/fonts/Matter-Regular.woff2',
    type: 'font/woff2',
    crossOrigin: 'anonymous',
  },
  {rel: 'stylesheet', href: tailwindStylesheetUrl},
  {rel: 'stylesheet', href: appStylesheetUrl},
  ...(cssBundleHref ? [{rel: 'stylesheet', href: cssBundleHref}] : []),
]

function Document({
  title,
  children,
}: {
  title?: string
  children: React.ReactNode
}) {
  const navigation = useNavigation()

  const showLoader = useSpinDelay(Boolean(navigation.state !== 'idle'), {
    delay: 0,
    minDuration: 500,
  })
  return (
    <html lang="en" className="h-screen">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>{title}</title>
        <Meta />
        <Links />
      </head>
      <body className="hide-scrollbar no-scrollbar  mx-auto h-full max-w-md bg-[#F3F4F6] px-2 pt-16">
        {/* {showLoader && (
        <div className="fixed left-0 top-0 z-[9999] flex h-full w-full items-center justify-center bg-black bg-opacity-90">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-blue-500" />
        </div>
      )} */}
        <div id="modal-root" />
        {children}
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}

export default function App() {
  return (
    <Document>
      <Outlet />
    </Document>
  )
}

export function ErrorBoundary() {
  const error = useRouteError()

  // when true, this is what used to go to `CatchBoundary`
  if (isRouteErrorResponse(error)) {
    return (
      <div>
        <h1>Oops</h1>
        <p>Status: {error.status}</p>
        <p>{error.data.message}</p>
        <Error title={error.data.message}>
          <h1>Uh oh ...</h1>
          <p>Something went wrong.</p>
        </Error>
      </div>
    )
  }

  // Don't forget to typecheck with your own logic.
  // Any value can be thrown, not just errors!
  let errorMessage = 'Unknown error'
  // if (isDefinitelyAnError(error)) {
  //   errorMessage = error.message;
  // }

  return (
    <div>
      <Error title={errorMessage}>
        <h1>Uh oh ...</h1>
        <p>Something went wrong.</p>
      </Error>
    </div>
  )
}
