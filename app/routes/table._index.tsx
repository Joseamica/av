import type {LoaderArgs} from '@remix-run/node'
import {json} from '@remix-run/node'
import {Outlet} from '@remix-run/react'

export async function loader({request, params}: LoaderArgs) {
  console.log('hola from table.tsx')
  return json({success: 'hola'})
}

export default function TableIndex() {
  return (
    <div>
      {/* <p>hola</p> */}
      "hola" de table.tsx
      {/* <Outlet /> */}
    </div>
  )
}
