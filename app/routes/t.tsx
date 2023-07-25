import type { Table } from '@prisma/client'
import type { LoaderArgs } from '@remix-run/node'

import { json } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'

import { Button } from '~/components/ui/button'
import { prisma } from '~/db.server'

export const loader = async ({ request }: LoaderArgs) => {
  const tables = await prisma.table.findMany({})
  return json({ tables })
}

export default function Tables() {
  const data = useLoaderData()
  return (
    <div>
      {data.tables.map((table: Table) => (
        <Button
          key={table.id}
          className="mr-4 rounded-md border border-red-400"
          asChild
        >
          <Link to={`/table/${table.id}`}> {table.table_number}</Link>
        </Button>
      ))}
    </div>
  )
}
