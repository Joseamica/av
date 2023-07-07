import { cssBundleHref } from "@remix-run/css-bundle";
import type { LinksFunction } from "@remix-run/node";
import {
  Form,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
// * STYLES
import tailwindStylesheetUrl from "~/styles/tailwind.css";
// * CUSTOM COMPONENTS
import appStylesheetUrl from "./styles/app.css";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: tailwindStylesheetUrl },
  { rel: "stylesheet", href: appStylesheetUrl },
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
];

export default function App() {
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

        <Outlet />
        {/* </RemixSseProvider> */}
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
