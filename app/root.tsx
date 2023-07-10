import {cssBundleHref} from '@remix-run/css-bundle'
import type {LinksFunction} from '@remix-run/node'
import {Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration, useNavigation} from '@remix-run/react'
// * STYLES
import tailwindStylesheetUrl from '~/styles/tailwind.css'
// * CUSTOM COMPONENTS
import appStylesheetUrl from './styles/app.css'
import {useSpinDelay} from 'spin-delay'

export const links: LinksFunction = () => [
  {rel: 'stylesheet', href: tailwindStylesheetUrl},
  {rel: 'stylesheet', href: appStylesheetUrl},
  ...(cssBundleHref ? [{rel: 'stylesheet', href: cssBundleHref}] : []),
]

export default function App() {
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
        <Meta />
        <Links />
      </head>
      <body className="hide-scrollbar no-scrollbar  mx-auto h-full max-w-md bg-[#F3F4F6] px-2 pt-16">
        {showLoader && (
          <div className="fixed left-0 top-0 z-[9999] flex h-full w-full items-center justify-center bg-black bg-opacity-90">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-blue-500" />
          </div>
        )}
        {/* <RemixSseProvider> */}
        <div id="modal-root" />

        <Outlet />
        {/* </RemixSseProvider> */}
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}
