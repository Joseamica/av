import { useLoaderData } from '@remix-run/react'

import { type LoaderFunctionArgs, json, redirect } from '@remix-run/node'

import type { Table } from '@prisma/client'
import { prisma } from '~/db.server'
import { getSession } from '~/session.server'

import { LinkButton } from '~/components'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const tables = await prisma.table.findMany({
    include: {
      branch: true,
    },
  })
  const session = await getSession(request)
  const username = session.get('username')
  const pathname = new URL(request.url).pathname

  // if (!username) {
  //   return redirect(`/auth/setDetails?redirectTo=${pathname}`)
  // }
  return json({ tables })
}

export default function Tables() {
  const data = useLoaderData()
  return (
    <div>
      {data.tables.map((table: Table) => (
        <LinkButton
          size="small"
          key={table.id}
          to={`/table/${table.id}`}
          custom={table.branch.name.startsWith('Madre') ? 'bg-blue-200' : ''}
          variant={table.branch.name.startsWith('Madre') ? 'custom' : 'primary'}
        >
          <div className="flex flex-col items-center space-y-2">
            <span>{table.number}</span>
            <span className="text-xs">{table.branch.name.substring(0, 15)}</span>
          </div>
        </LinkButton>
      ))}
    </div>
  )
}
