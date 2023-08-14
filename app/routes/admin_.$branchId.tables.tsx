import { useFetcher, useLoaderData, useRouteLoaderData, useSearchParams } from '@remix-run/react'

import { type ActionArgs, type LoaderArgs, json, redirect } from '@remix-run/node'

import type { Table } from '@prisma/client'
import { safeRedirect } from 'remix-utils'

import { getTable, handleAddAction, handleDeleteAction, handleEditAction } from '~/models/admin/table/table.server'

import { getSearchParams } from '~/utils'

import { Button, Spacer } from '~/components'
import Container from '~/components/admin/ui/container'
import { QueryDialog } from '~/components/admin/ui/dialogs/dialog'
import { Field } from '~/components/admin/ui/forms'
import HeaderSection from '~/components/admin/ui/header-section'
import Item from '~/components/admin/ui/item'

export const handle = { active: 'Tables' }

const ACTIONS = {
  ADD: 'add',
  EDIT: 'edit',
  DELETE: 'del',
}

export async function loader({ request, params }: LoaderArgs) {
  const searchParams = getSearchParams({ request })
  const searchParamsData = Object.fromEntries(searchParams)

  const tableId = searchParamsData.itemId ?? searchParamsData.editItem

  if (tableId) {
    const table = await getTable(tableId, {
      users: true,
      order: true,
      employees: true,
      feedbacks: true,
    })

    return json({ table })
  }

  return json({ table: null })
}

export async function action({ request, params }: ActionArgs) {
  const { branchId } = params
  const formData = await request.formData()
  const formValues = Object.fromEntries(formData.entries())
  console.log('data', formValues)

  const searchParams = getSearchParams({ request })
  const searchParamsValues = Object.fromEntries(searchParams)
  console.log('searchParamsData', searchParamsValues)
  const tableId = searchParamsValues.itemId ?? searchParamsValues.editItem
  const redirectTo = safeRedirect(formData.get('redirectTo'), '')

  switch (formValues._action) {
    case ACTIONS.ADD:
      return handleAddAction(formValues, branchId, redirectTo)
    case ACTIONS.EDIT:
      return handleEditAction(tableId, formValues, redirectTo)
    case ACTIONS.DELETE:
      return handleDeleteAction(tableId, redirectTo)
    default:
      return redirect(redirectTo)
  }
}

type RouteLoaderData = {
  branch: any
}

export default function Tables() {
  const data = useLoaderData()

  const { branch } = useRouteLoaderData('routes/admin_.$branchId') as RouteLoaderData
  const fetcher = useFetcher()
  const [searchParams] = useSearchParams()
  const errors = fetcher.data
  const isSubmitting = fetcher.state !== 'idle'
  const itemId = searchParams.get('itemId')

  if (itemId) {
    return (
      <div>
        <HeaderSection backPath="" title="Tables" breadcrumb={itemId} />
        <Item title="Users" itemToMap={data.table.users} params={['name', 'tip', 'paid', 'total']} />
        <Item title="Employees" itemToMap={data.table.employees} params={['name', 'role']} />
        <Item title="Feedbacks" itemToMap={data.table.feedbacks} params={['name', 'role']} />
        <Item title="Order" itemToMap={data.table.order} params={['id', 'paid', 'paidDate', 'active']} />
      </div>
    )
  }

  return (
    <div>
      <QueryDialog title="Edit Table" description="Edit the following fields" query="editItem">
        <fetcher.Form method="POST">
          {/* TODO contenido add table */}
          <Field
            labelProps={{ htmlFor: 'number', children: 'Table Number' }}
            inputProps={{
              id: 'number',
              type: 'number',
              name: 'number',
              defaultValue: data.table?.number,
              required: true,
            }}
            errors={[errors?.number]}
          />
          <Field
            labelProps={{ htmlFor: 'seats', children: '# of Seats' }}
            inputProps={{
              id: 'seats',
              type: 'number',
              name: 'seats',
              defaultValue: data.table?.seats,
              required: true,
            }}
            errors={[errors?.seats]}
          />
          <Button size="medium" type="submit" variant="secondary" name="_action" value="edit">
            {isSubmitting ? 'Edit tables...' : 'Edit table'}
          </Button>
        </fetcher.Form>
      </QueryDialog>

      <QueryDialog title="Add Table" description="Add the following fields" query="addItem">
        <fetcher.Form method="POST">
          {/* TODO contenido add table */}
          <Field
            labelProps={{ htmlFor: 'number', children: 'Table Number' }}
            inputProps={{
              id: 'number',
              type: 'number',
              name: 'number',
              defaultValue: 'admin',
              required: true,
            }}
            errors={[errors?.number]}
          />
          <Field
            labelProps={{ htmlFor: 'seats', children: '# of Seats' }}
            inputProps={{
              id: 'seats',
              type: 'number',
              name: 'seats',
              defaultValue: 'admin',
              required: true,
            }}
            errors={[errors?.seats]}
          />
          <Button size="medium" type="submit" variant="secondary" name="_action" value="add">
            {isSubmitting ? 'Adding tables...' : 'Add table'}
          </Button>
        </fetcher.Form>
      </QueryDialog>

      <HeaderSection addQuery="?addItem=true" backPath=".." title="Tables" />
      <Spacer size="sm" />
      <div className="flex flex-wrap gap-2 ">
        {branch.tables.map((table: Table) => (
          <Container editQuery={`?editItem=${table.id}`} name={table.number} itemIdQuery={`?itemId=${table.id}`} key={table.id} />
        ))}
      </div>
    </div>
  )
}
