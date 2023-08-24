import { useForm } from '@conform-to/react'
import { useActionData, useLoaderData, useRouteLoaderData, useSearchParams } from '@remix-run/react'

import { type ActionArgs, type LoaderArgs, json, redirect } from '@remix-run/node'

import { getFieldsetConstraint, parse } from '@conform-to/zod'
import type { Table } from '@prisma/client'
import { safeRedirect } from 'remix-utils'
import { z } from 'zod'

import { getTable, handleAddAction, handleDeleteAction, handleEditAction } from '~/models/admin/table/table.server'

import { getSearchParams } from '~/utils'

import { Spacer } from '~/components'
import { HeaderSection, HeaderWithButton } from '~/components/admin/headers'
import { AddTableDialog } from '~/components/admin/tables/dialogs/add'
import { EditTableDialog } from '~/components/admin/tables/dialogs/edit'
import { Container } from '~/components/admin/ui/container'
import Item from '~/components/admin/ui/item'

export const handle = { active: 'Tables' }

const ACTIONS = {
  ADD: 'add',
  EDIT: 'edit',
  DELETE: 'del',
}

const categoriesFormSchema = z.object({
  number: z.number().min(1).max(100),
  seats: z.number().min(1).max(100),
})

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

  const searchParams = getSearchParams({ request })
  const searchParamsValues = Object.fromEntries(searchParams)

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
  const actionData = useActionData<typeof action>()

  const [form, fields] = useForm({
    id: 'tables',
    constraint: getFieldsetConstraint(categoriesFormSchema),
    lastSubmission: actionData?.submission ?? data.submission,
    onValidate({ formData }) {
      return parse(formData, { schema: categoriesFormSchema })
    },
    shouldRevalidate: 'onBlur',
  })

  const { branch } = useRouteLoaderData('routes/admin_.$branchId') as RouteLoaderData
  const [searchParams] = useSearchParams()

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
      <EditTableDialog form={form} fields={fields} table={data.table} />

      <AddTableDialog form={form} fields={fields} table={data.table} />

      <HeaderWithButton queryKey="addItem" queryValue="true" buttonLabel="Add" />
      <Spacer size="sm" />
      <div className="flex flex-wrap gap-2 ">
        {branch.tables.map((table: Table) => (
          <Container editQuery={`?editItem=${table.id}`} name={table.number} itemIdQuery={`?itemId=${table.id}`} key={table.id} />
        ))}
      </div>
    </div>
  )
}
