import {json, redirect} from '@remix-run/node'
import type {LoaderArgs} from '@remix-run/node'
import {Links, Meta, Scripts} from '@remix-run/react'
import React from 'react'
import {prisma} from '~/db.server'
import {getSession} from '~/session.server'
import {isRouteErrorResponse, useRouteError} from '@remix-run/react'

export async function loader({request, params}: LoaderArgs) {
  const session = await getSession(request)
  const sessionTableId = session.get('sessionTableId') || null

  if (sessionTableId) {
    return redirect(`/table/${sessionTableId}`)
  }
  // else {
  //   throw new Error('No sessionTableId')
  // }

  return json({success: true})
}

export default function _index() {
  return <div>INDEX</div>
}

export function ErrorBoundary() {
  const error = useRouteError()

  if (isRouteErrorResponse(error)) {
    return (
      <div>
        <h1>
          {error.status} {error.statusText}
        </h1>
        <p>{error.data}</p>
      </div>
    )
  } else if (error instanceof Error) {
    return (
      <div>
        <h1>Error</h1>
        <p>{error.message}</p>
        <p>The stack trace is:</p>
        <pre>{error.stack}</pre>
      </div>
    )
  } else {
    return <h1>Unknown Error</h1>
  }
}
