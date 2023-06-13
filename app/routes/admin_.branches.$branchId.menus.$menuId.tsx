import type {Menu, Table, User} from '@prisma/client'
import {json} from '@remix-run/node'
import type {LoaderArgs} from '@remix-run/node'
import React from 'react'
import {useLoaderData} from '@remix-run/react'
import {H1, LinkButton, Spacer} from '~/components'
import {prisma} from '~/db.server'

export async function loader({request, params}: LoaderArgs) {
  const {branchId, menuId} = params
  const menu = await prisma.menu.findUnique({where: {id: menuId}})
  return json({menu})
}

export default function AdminMenuId() {
  const data = useLoaderData()
  return (
    <div>
      <H1>{data.menu.name}</H1>
      <Spacer spaceY="2" />

      {/* {data.menus.map((menu: Menu) => (
        <LinkButton size="small" key={menu.id} to={menu.id}>
          {menu.name}
        </LinkButton>
      ))} */}
    </div>
  )
}
