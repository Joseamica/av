import type {Table} from '@prisma/client'
import type {LoaderArgs} from '@remix-run/node'
import {json} from '@remix-run/node'
import {Link, Outlet, useLoaderData} from '@remix-run/react'
import {prisma} from '~/db.server'

export async function loader({request, params}: LoaderArgs) {
  const tables = await prisma.table.findMany({})
  return json({tables})
}

export default function TableIndex() {
  const data = useLoaderData()
  return (
    <div>
      {data.tables.map((table: Table) => (
        <Link
          key={table.id}
          to={`/table/${table.id}`}
          className="bg-blue-200 p-2"
        >
          {table.table_number}
        </Link>
      ))}
    </div>
  )
}
