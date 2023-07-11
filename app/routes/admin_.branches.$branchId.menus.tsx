import type {Menu} from '@prisma/client'
import type {LoaderArgs} from '@remix-run/node'
import {json} from '@remix-run/node'
import {Link, useLoaderData} from '@remix-run/react'
import {FlexRow, H1, LinkButton, Spacer} from '~/components'
import {prisma} from '~/db.server'

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
