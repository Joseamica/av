import { useRouteLoaderData } from '@remix-run/react'

import { type ActionArgs, json } from '@remix-run/node'

import type { Table } from '@prisma/client'

import { Spacer } from '~/components'
import Container from '~/components/admin/ui/container'
import { QueryDialog } from '~/components/admin/ui/dialogs/dialog'
import HeaderSection from '~/components/admin/ui/header-section'

export const handle = { active: 'Tables' }
export async function action({ request, params }: ActionArgs) {
  const formData = await request.formData()
  return json({ success: true })
}

type RouteLoaderData = {
  admin: any // Replace with the correct type for 'admin'
}

export default function Name() {
  const { admin } = useRouteLoaderData('routes/admin_.branch') as RouteLoaderData

  return (
    <div className="p-4">
      <QueryDialog title="Edit Table" description="Edit the following fields" query="editTable">
        {/* TODO contenido edit table */}
      </QueryDialog>

      <QueryDialog title="Add Table" description="Add the following fields" query="addTable">
        {/* TODO contenido add table */}
      </QueryDialog>

      <HeaderSection addQuery="?addTable=true" backPath=".." title="Tables" />
      <Spacer size="sm" />
      <div className="flex flex-wrap gap-2 ">
        {admin.tables.map((table: Table) => (
          <Container editQuery="?editTable=true" name={table.table_number} accessQuery={`?tableId=${table.id}`} key={table.id} />
        ))}
      </div>
    </div>
  )
}
