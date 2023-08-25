import { conform, useForm } from '@conform-to/react'
import { useFetcher, useParams, useRouteLoaderData, useSearchParams } from '@remix-run/react'

import { type ActionArgs, json, redirect } from '@remix-run/node'

import { getFieldsetConstraint, parse } from '@conform-to/zod'
import bcrypt from 'bcryptjs'
import { namedAction } from 'remix-utils'
import { z } from 'zod'
import { prisma } from '~/db.server'

import { Button, H5 } from '~/components'
import { EmployeeForm } from '~/components/admin/employees/employee-form'
import { HeaderWithButton } from '~/components/admin/headers'
import { QueryDialog } from '~/components/admin/ui/dialogs/dialog'
import { ErrorList } from '~/components/admin/ui/forms'
import { Square } from '~/components/admin/ui/square'
import { UserForm } from '~/components/admin/users/user-form'

export const handle = { active: 'Users' }

const employeesShema = z.object({
  id: z.string(),
  name: z.string().nonempty('Name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().nonempty('Password is required'),
  color: z.string(),
  paid: z.number().min(0, 'Paid must be greater than 0'),
  tip: z.number().min(0, 'Tip must be greater than 0'),
  role: z.enum(['manager', 'waiter']),
})

export async function action({ request, params }: ActionArgs) {
  const formData = await request.formData()

  const submission = parse(formData, {
    schema: employeesShema,
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
  const oldMenuIds = (await prisma.availabilities.findMany({
    where: {
      id: submission.value.id,
    },
    select: {
      menuId: true,
    },
  })) as any
  const hashedPassword = await bcrypt.hash(submission.value.password, 10)

  return namedAction(request, {
    async create() {
      // for (const item of submission.value.selectItems) {
      //   console.log('item', item)
      //   await prisma.availabilities.create({
      //     data: {
      //       dayOfWeek: submission.value.dayOfWeek,
      //       startTime: submission.value.startTime,
      //       endTime: submission.value.endTime,
      //       menuId: item,
      //     },
      //   })
      // }
      await prisma.user.create({
        data: {
          name: submission.value.name,
          email: submission.value.email,
          password: {
            connectOrCreate: {
              where: {
                userId: submission.value.id,
              },
              create: {
                hash: hashedPassword,
              },
            },
          },
          color: submission.value.color,
          paid: submission.value.paid,
          tip: submission.value.tip,
          role: submission.value.role,
          branchId: params.branchId,
        },
      })
      return redirect('')
    },
    async update() {
      const newMenuIds = submission.value.selectItems

      const toConnect = newMenuIds.filter(item => !oldMenuIds.includes(item))
      const toDisconnect = oldMenuIds.filter(item => !newMenuIds.includes(item))
      for (const item of toConnect) {
        await prisma.availabilities.update({
          where: { id: submission.value.id },
          data: {
            dayOfWeek: submission.value.dayOfWeek,
            startTime: submission.value.startTime,
            endTime: submission.value.endTime,
            menuId: item,
          },
        })
      }

      // Handle disconnecting
      for (const item of toDisconnect) {
        await prisma.availabilities.update({
          where: { id: submission.value.id },
          data: {
            menuId: null,
          },
        })
      }
      return redirect('')
    },
  })
}

export default function Availabilities() {
  const { branch } = useRouteLoaderData('routes/admin_.$branchId') as any
  const { branchId } = useParams()

  const fetcher = useFetcher()
  const isSubmitting = fetcher.state !== 'idle'
  const [searchParams] = useSearchParams()

  const [form, fields] = useForm({
    id: 'users',
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
        {branch.employees.map(employee => (
          <Square
            itemId={employee.id}
            name={
              <>
                <H5 boldVariant="bold">{employee.name}</H5>
              </>
            }
            to={employee.id}
            key={employee.id}
          />
        ))}
      </div>
      <QueryDialog title="Add Employee" description="Add to the fields you want to add" query={'addItem'}>
        <fetcher.Form method="POST" {...form.props} action="?/create">
          <EmployeeForm
            intent="add"
            employees={branch.employees}
            editSubItemId={addItem}
            isSubmitting={isSubmitting}
            fields={fields}
            addingData={{ data: branch.menus, keys: ['name'] }}
          />
          <input type="hidden" value={addItem ? addItem : ''} {...conform.input(fields.id)} />
        </fetcher.Form>
      </QueryDialog>
      <QueryDialog title="Edit Employee" description="Modify the fields you want to edit" query={'editItem'}>
        <fetcher.Form method="POST" {...form.props} action="?/update">
          <EmployeeForm
            intent="edit"
            employees={branch.employees}
            editSubItemId={editItem}
            isSubmitting={isSubmitting}
            fields={fields}
            addingData={{ data: branch.orders, keys: ['id'] }}
          />
          <input type="hidden" value={editItem ? editItem : ''} {...conform.input(fields.id)} />
        </fetcher.Form>
      </QueryDialog>

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
