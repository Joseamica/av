import React from 'react'

import { type LoaderArgs, json } from '@remix-run/node'

export async function loader({ request, params }: LoaderArgs) {
  return json({ success: true })
}

export default function AdminId() {
  return <div>AdminId</div>
}
