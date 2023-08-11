import { useLoaderData } from '@remix-run/react'

import { type LoaderArgs, json } from '@remix-run/node'

import type { Table } from '@prisma/client'
import { prisma } from '~/db.server'

import { LinkButton } from '~/components'

export const loader = async ({ request }: LoaderArgs) => {
  const tables = await prisma.table.findMany({})
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
