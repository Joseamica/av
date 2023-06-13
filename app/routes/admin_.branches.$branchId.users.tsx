import type {Table, User} from '@prisma/client'
import {json} from '@remix-run/node'
import type {LoaderArgs} from '@remix-run/node'
import React from 'react'
import {useLoaderData} from '@remix-run/react'
import {H1, LinkButton} from '~/components'
import {prisma} from '~/db.server'

export async function loader({request, params}: LoaderArgs) {
  const {branchId} = params
  const users = await prisma.table.findMany({where: {branchId}})
  return json({users})
}

export default function AdminTables() {
  const data = useLoaderData()
  return (
    <div>
      <H1 className="w-full justify-end">Users</H1>
      {data.users.map((user: User) => (
        <LinkButton size="small" key={user.id} to={user.id}>
          {user.name}
        </LinkButton>
      ))}
    </div>
  )
}
