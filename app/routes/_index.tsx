import {json, redirect} from '@remix-run/node'
import type {LoaderArgs} from '@remix-run/node'
import React from 'react'
import {prisma} from '~/db.server'
import {getSession} from '~/session.server'

export async function loader({request, params}: LoaderArgs) {
  const session = await getSession(request)
  const tableSession = session.get('tableSession')
  if (tableSession) {
    return redirect(`/table/${tableSession}`)
  }

  return json({success: true})
}

export default function _index() {
  return <div></div>
}
