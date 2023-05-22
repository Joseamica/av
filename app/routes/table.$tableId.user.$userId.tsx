import type {LoaderArgs} from '@remix-run/node'
import {json} from '@remix-run/node'
import React from 'react'
import invariant from 'tiny-invariant'

export async function loader({request, params}: LoaderArgs) {
  const {tableId, userId} = params
  invariant(tableId, 'tableId no encontrado')
  return json({success: true})
}

export default function UserProfile() {
  return <div>UserProfile</div>
}
