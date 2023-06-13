import type {Menu, Table, User} from '@prisma/client'
import {json} from '@remix-run/node'
import type {LoaderArgs} from '@remix-run/node'
import React from 'react'
import {useLoaderData} from '@remix-run/react'
import {H1, LinkButton, Spacer} from '~/components'
import {prisma} from '~/db.server'

export async function loader({request, params}: LoaderArgs) {
  const {branchId} = params
  const menus = await prisma.menu.findMany({where: {branchId}})
  return json({menus})
}

export default function AdminTables() {
  const data = useLoaderData()
  return (
    <div>
      <H1>Menus</H1>
      <Spacer spaceY="2" />
      {data.menus.map((menu: Menu) => (
        <LinkButton size="small" key={menu.id} to={menu.id}>
          {menu.name}
        </LinkButton>
      ))}
    </div>
  )
}
