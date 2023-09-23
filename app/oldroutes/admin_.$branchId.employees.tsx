import { conform, useForm } from '@conform-to/react'
import { useFetcher, useLoaderData, useParams, useRouteLoaderData, useSearchParams } from '@remix-run/react'

import { type ActionArgs, type LoaderArgs, json, redirect } from '@remix-run/node'

import { getFieldsetConstraint, parse } from '@conform-to/zod'
import bcrypt from 'bcryptjs'
import { namedAction } from 'remix-utils'
import { z } from 'zod'
import { prisma } from '~/db.server'

import { getSearchParams } from '~/utils'
import { passwordSchema } from '~/utils/user-validation'

import { Button, H5 } from '~/components'
import { EmployeeForm } from '~/components/admin/employees/employee-form'
import { HeaderWithButton } from '~/components/admin/headers'
import { QueryDialog, ScrollableQueryDialog } from '~/components/admin/ui/dialogs/dialog'
import { ErrorList } from '~/components/admin/ui/forms'
import { Square } from '~/components/admin/ui/square'

export const handle = { active: 'Employees' }

const employeesShema = z.object({
  id: z.string(),
  name: z.string().nonempty('Name is required'),
  email: z.string().email('Invalid email'),
  password: passwordSchema.optional(),
  image: z.string().url(),
  phone: z.string().nonempty('Phone is required'),
  role: z.enum(['manager', 'waiter']),
  selectItems: z.array(z.string()).nonempty('You must select at least one table'),
})

export async function loader({ request, params }: LoaderArgs) {
  const { branchId } = params
  const employees = await prisma.employee.findMany({
    where: {
      branchId,
    },
    include: {
      password: true,
      tables: true,
    },
    orderBy: {
      role: 'asc',
    },
  })

  return json({ employees })
}

export async function action({ request, params }: ActionArgs) {
  const formData = await request.formData()
  const searchParams = getSearchParams({ request })
  const submission = await parse(formData, {
    schema: () => {
      return employeesShema.superRefine(async (data, ctx) => {
        if (!searchParams.has('/update')) {
          const existingEmployee = await prisma.employee.findUnique({
            where: { email: data.email },
            select: { id: true },
          })
          if (existingEmployee) {
            ctx.addIssue({
              path: ['email'],
              code: z.ZodIssueCode.custom,
              message: 'A employee already exists with this email',
            })
            return
          }
        }
      })
    },
    async: true,
  })
  console.log('submission', submission)

  if (submission.intent !== 'submit') {
    return json({ status: 'idle', submission } as const)
  }
  if (!submission.value) {
    return json(
      {
        status: 'error',
        submission,
      } as const,
      { status: 400 },
    )
  }

  return namedAction(request, {
    async create() {
      const hashedPassword = await bcrypt.hash(submission.value?.password, 10)

      await prisma.employee.create({
        data: {
          name: submission.value.name,
          role: submission.value.role,
          email: submission.value.email,

          password: {
            create: {
              hash: hashedPassword,
            },
          },
          tables: {
            connect: submission.value.selectItems.map(id => ({ id })),
          },
          phone: submission.value.phone.trim().replace(/[^\d]/g, ''),
          image: submission.value.image,
          branchId: params.branchId,
        },
      })
      return redirect('')
    },
    async update() {
      await prisma.employee.update({
        where: { id: submission.value.id },
        data: {
          name: submission.value.name,
          role: submission.value.role,
          email: submission.value.email,
          tables: {
            connect: submission.value.selectItems.map(id => ({ id })),
          },
          phone: submission.value.phone.trim().replace(/[^\d]/g, ''),
          image: submission.value.image,
          branchId: params.branchId,
        },
      })
      return redirect('')
    },
  })
}

export default function Employees() {
  const data = useLoaderData()
  const { branch } = useRouteLoaderData('routes/admin_.$branchId') as any
  const { branchId } = useParams()

  const fetcher = useFetcher()
  const isSubmitting = fetcher.state !== 'idle'
  const [searchParams] = useSearchParams()

  const [form, fields] = useForm({
    id: 'employees',
    constraint: getFieldsetConstraint(employeesShema),
    lastSubmission: fetcher.data?.submission,

    onValidate({ formData }) {
      return parse(formData, { schema: employeesShema })
    },
    shouldRevalidate: 'onBlur',
  })

  const addItem = searchParams.get('addItem')
  const editItem = searchParams.get('editItem')
  const deleteItem = searchParams.get('deleteItem')

  return (
    <main>
      <HeaderWithButton queryKey="addItem" queryValue="true" buttonLabel="Add" />
      <div className="flex flex-wrap gap-2 p-4">
        {data.employees.map(employee => (
          <Square
            itemId={employee.id}
            name={
              <>
                <H5 boldVariant="bold">{employee.name}</H5>
                <H5>{employee.role}</H5>
              </>
            }
            to={employee.id}
            key={employee.id}
          />
        ))}
      </div>
      <ScrollableQueryDialog title="Add Employee" description="Add to the fields you want to add" query={'addItem'}>
        <fetcher.Form method="POST" {...form.props} action="?/create">
          <EmployeeForm
            intent="add"
            employees={data.employees}
            editSubItemId={addItem}
            isSubmitting={isSubmitting}
            fields={fields}
            addingData={{ data: branch.tables, keys: ['number'] }}
          />
          <input type="hidden" value={addItem ? addItem : ''} {...conform.input(fields.id)} />
        </fetcher.Form>
      </ScrollableQueryDialog>
      <ScrollableQueryDialog title="Edit Employee" description="Modify the fields you want to edit" query={'editItem'}>
        <fetcher.Form method="POST" {...form.props} action="?/update">
          <EmployeeForm
            intent="edit"
            employees={data.employees}
            editSubItemId={editItem}
            isSubmitting={isSubmitting}
            fields={fields}
            addingData={{ data: branch.tables, keys: ['number'] }}
          />
          <input type="hidden" value={editItem ? editItem : ''} {...conform.input(fields.id)} />
        </fetcher.Form>
      </ScrollableQueryDialog>

      <QueryDialog title="Delete Employee" description="Are you sure that you want to delete this item?" query={'deleteItem'}>
        <fetcher.Form method="POST" action="/admin/deleteItem" name="DELETE">
          <Button type="submit" disabled={isSubmitting} size="small" variant="danger">
            Delete
          </Button>
          <input type="hidden" name="id" value={deleteItem ? deleteItem : ''} />
          <input type="hidden" name="model" value="employees" />
          <input type="hidden" name="redirect" value={`/admin/${branchId}/employees`} />

          <ErrorList errors={[...form.errors]} id={form.errorId} />
        </fetcher.Form>
      </QueryDialog>
    </main>
  )
}
