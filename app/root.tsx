import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useNavigation,
  useParams,
  useRouteError,
} from '@remix-run/react'

import { cssBundleHref } from '@remix-run/css-bundle'
import type { LinksFunction } from '@remix-run/node'
import { type ErrorResponse } from '@remix-run/router'

// * CUSTOM COMPONENTS
import { useSpinDelay } from 'spin-delay'

import appStylesheetUrl from './styles/app.css'
import fontStylestylesheetUrl from './styles/font.css'
// * STYLES
import tailwindStylesheetUrl from './styles/tailwind.css'
import { getErrorMessage } from './utils/misc'

export const links: LinksFunction = () =>
  [
    // {
    //   rel: 'preload',
    //   as: 'font',
    //   href: '/fonts/Matter-Medium.woff2',
    //   type: 'font/woff2',
    //   crossOrigin: 'anonymous',
    // },
    { rel: 'preload', href: fontStylestylesheetUrl, as: 'style' },
    { rel: 'preload', href: appStylesheetUrl, as: 'style' },
    cssBundleHref ? { rel: 'preload', href: cssBundleHref, as: 'style' } : null,

    // {
    //   rel: 'preload',
    //   as: 'font',
    //   href: '/fonts/Matter-Regular.woff2',
    //   type: 'font/woff2',
    //   crossOrigin: 'anonymous',
    // },
    { rel: 'stylesheet', href: tailwindStylesheetUrl },
    { rel: 'stylesheet', href: appStylesheetUrl },
    { rel: 'stylesheet', href: fontStylestylesheetUrl },

    ...(cssBundleHref ? [{ rel: 'stylesheet', href: cssBundleHref }] : []),
  ].filter(Boolean)

function Document({ title, children }: { title?: string; children: React.ReactNode }) {
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
        {/* {title && <title>{title}</title>} */}
        <Meta />
        <Links />
      </head>
      <body className=" bg-[#F3F4F6] ">
        {/* {showLoader && (
        <div className="fixed left-0 top-0 z-[9999] flex h-full w-full items-center justify-center bg-black bg-opacity-90">
          <div className="w-16 h-16 border-4 border-blue-500 rounded-full animate-spin" />
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
    <Document title="Avoqado">
      <Outlet />
    </Document>
  )
}

type StatusHandler = (info: { error: ErrorResponse; params: Record<string, string | undefined> }) => JSX.Element | null

export function GeneralErrorBoundary({
  defaultStatusHandler = ({ error }) => (
    <p>
      {error.status} {error.data}
    </p>
  ),
  statusHandlers,
  unexpectedErrorHandler = error => <p>{getErrorMessage(error)}</p>,
}: {
  defaultStatusHandler?: StatusHandler
  statusHandlers?: Record<number, StatusHandler>
  unexpectedErrorHandler?: (error: unknown) => JSX.Element | null
}) {
  const error = useRouteError()
  const params = useParams()

  if (typeof document !== 'undefined') {
    console.error(error)
  }

  return (
    <div className="container flex items-center justify-center p-20 mx-auto text-h2">
      {isRouteErrorResponse(error)
        ? (statusHandlers?.[error.status] ?? defaultStatusHandler)({
            error,
            params,
          })
        : unexpectedErrorHandler(error)}
    </div>
  )
}
