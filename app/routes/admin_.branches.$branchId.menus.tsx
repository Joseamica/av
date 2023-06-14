import type {Menu, Table, User} from '@prisma/client'
import {json} from '@remix-run/node'
import type {LoaderArgs} from '@remix-run/node'
import React from 'react'
import {Link, Outlet, useLoaderData, useMatches} from '@remix-run/react'
import {FlexRow, H1, LinkButton, Spacer} from '~/components'
import {prisma} from '~/db.server'
import {IoChevronBack} from 'react-icons/io5'

export async function loader({request, params}: LoaderArgs) {
  const {branchId} = params
  const menus = await prisma.menu.findMany({where: {branchId}})
  return json({menus})
}

export const handle = {
  breadcrumb: () => <Link to="..">Menus</Link>,
}

export default function AdminTables() {
  const data = useLoaderData()

  return (
    <div>
      <FlexRow>
        <H1>Menus</H1>
        <LinkButton size="small" to={``}>
          Agregar
        </LinkButton>
      </FlexRow>
      <Spacer spaceY="2" />

      <Spacer spaceY="2" />
      {data.menus.map((menu: Menu) => (
        <LinkButton size="small" key={menu.id} to={menu.id}>
          {menu.name}
        </LinkButton>
      ))}
    </div>
  )
}
