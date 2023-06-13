import type {Table} from '@prisma/client'
import {json} from '@remix-run/node'
import type {LoaderArgs} from '@remix-run/node'
import React from 'react'
import {useLoaderData} from '@remix-run/react'
import {H1, LinkButton} from '~/components'
import {prisma} from '~/db.server'

export async function loader({request, params}: LoaderArgs) {
  const {branchId, tableId} = params
  const table = await prisma.table.findUnique({where: {id: tableId}})
  return json({table})
}

export default function AdminTables() {
  const data = useLoaderData()
  return (
    <div>
      <H1>Table {data.table.table_number}</H1>
    </div>
  )
}
