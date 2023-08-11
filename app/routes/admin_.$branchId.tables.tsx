import { useFetcher, useLoaderData, useRouteLoaderData, useSearchParams } from '@remix-run/react'

import { type ActionArgs, type LoaderArgs, json } from '@remix-run/node'

import type { Table } from '@prisma/client'
import { prisma } from '~/db.server'

import { getExistingTable } from '~/models/admin/table/table.server'
import { getTable } from '~/models/table.server'

import { getSearchParams } from '~/utils'

import { Button, H1, Spacer } from '~/components'
import Container from '~/components/admin/ui/container'
import { QueryDialog } from '~/components/admin/ui/dialogs/dialog'
import { Field } from '~/components/admin/ui/forms'
import HeaderSection from '~/components/admin/ui/header-section'
import Item from '~/components/admin/ui/item'

export const handle = { active: 'Tables' }

function isValidNumber(number: number) {
  return number > 0 && !isNaN(number)
}

function isValidSeats(seats: number) {
  console.log('seats', seats)
  return seats > 0 && !isNaN(seats)
}

function isExistingTable(existingTable: Table | null) {
  return existingTable === null
}
export function validateCreateTables(input: any, existingTable: Table | null) {
  let validationErrors = {} as any

  if (!isValidNumber(Number(input.number))) {
    validationErrors.number = 'El numero de mesa debe ser mayor o igual 0'
  }

  if (!isValidSeats(input.seats)) {
    validationErrors.seats = 'El numero de asientos debe ser mayor a 0'
  }

  if (!isExistingTable(existingTable)) {
    validationErrors.number = 'El numero de mesa ya existe'
  }

  if (Object.keys(validationErrors).length > 0) {
    throw validationErrors
  }
}

export async function loader({ request, params }: LoaderArgs) {
  const searchParams = getSearchParams({ request })
  const data = Object.fromEntries(searchParams)

  const tableId = data.access
  if (tableId) {
    const table = await prisma.table.findFirst({
      where: { id: tableId },
      include: { employees: true, feedbacks: true, order: true, users: true },
    })

    return json({ table })
  }

  return json({ table: null })
}

export async function action({ request, params }: ActionArgs) {
  const { branchId } = params
  const formData = await request.formData()
  const data = Object.fromEntries(formData.entries())

  const existingTable = await getExistingTable(String(data.number), branchId)

  try {
    validateCreateTables(data, existingTable)
  } catch (error) {
    console.log('error', error)
    return error
  }

  await prisma.table.create({
    data: {
      number: Number(data.number),
      seats: Number(data.seats),
      branchId,
    },
  })
  return json({ success: true })
}

type RouteLoaderData = {
  branch: any // Replace with the correct type for 'admin'
}

export default function Name() {
  const data = useLoaderData()
  console.log('data', data)
  const { branch } = useRouteLoaderData('routes/admin_.$branchId') as RouteLoaderData
  const fetcher = useFetcher()
  const [searchParams, setSearchParams] = useSearchParams()
  const errors = fetcher.data
  const isSubmitting = fetcher.state !== 'idle'
  const access = searchParams.get('access')

  if (access) {
    return (
      <div>
        <HeaderSection backPath="" title="Tables" breadcrumb={access} />
        <Item title="Users" itemToMap={data.table.users} params={['name', 'tip', 'paid', 'total']} />
        <Item title="Employees" itemToMap={data.table.employees} params={['name', 'role']} />
        <Item title="Feedbacks" itemToMap={data.table.feedbacks} params={['name', 'role']} />
        <Item title="Order" itemToMap={data.table.order} params={['id', 'paid', 'paidDate', 'active']} />
      </div>
    )
  }

  return (
    <div>
      <QueryDialog title="Edit Table" description="Edit the following fields" query="editTable">
        {/* TODO contenido edit table */}{' '}
        <QueryDialog title="Edit Table" description="Edit the following fields" query="editTable">
          {/* TODO contenido edit table */}
        </QueryDialog>
      </QueryDialog>

      <QueryDialog description="Edit the following fields" query="tableId">
        {/* TODO contenido access table */}
      </QueryDialog>

      <QueryDialog title="Add Table" description="Add the following fields" query="addTable">
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
          <Button size="medium" type="submit" variant="secondary">
            {isSubmitting ? 'Adding tables...' : 'Add table'}
          </Button>
        </fetcher.Form>
      </QueryDialog>

      <HeaderSection addQuery="?addTable=true" backPath=".." title="Tables" />
      <Spacer size="sm" />
      <div className="flex flex-wrap gap-2 ">
        {branch.tables.map((table: Table) => (
          <Container editQuery="?editTable=true" name={table.number} accessQuery={`?access=${table.id}`} key={table.id} />
        ))}
      </div>
    </div>
  )
}
