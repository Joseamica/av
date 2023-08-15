import { useLoaderData } from '@remix-run/react'

import { type LoaderArgs, json, redirect } from '@remix-run/node'

import type { Table } from '@prisma/client'
import { prisma } from '~/db.server'
import { getSession } from '~/session.server'

import { LinkButton } from '~/components'

export const loader = async ({ request }: LoaderArgs) => {
  const tables = await prisma.table.findMany({})
  const session = await getSession(request)
  const username = session.get('username')
  const pathname = new URL(request.url).pathname

  if (!username) {
    return redirect(`/auth/setDetails?redirectTo=${pathname}`)
  }
  return json({ tables })
}

export default function Tables() {
  const data = useLoaderData()
  return (
    <div>
      {data.tables.map((table: Table) => (
        <LinkButton size="small" key={table.id} to={`/table/${table.id}`}>
          {table.number}
        </LinkButton>
      ))}
    </div>
  )
}
